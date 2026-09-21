// Supabase Edge Function: Stripe webhook. Verifies the signature and stores
// completed orders in the `orders` table so the admin "Statistiques" tab can
// read them.
//
// Deploy with: supabase functions deploy stripe-webhook --no-verify-jwt
// Required secrets: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
// SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (see README.md).
// Configure the webhook endpoint URL in the Stripe dashboard to point here,
// listening to the "checkout.session.completed" event.
import { createClient } from 'npm:@supabase/supabase-js@2'
import Stripe from 'npm:stripe@17'

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
    apiVersion: '2024-06-20',
  })

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature ?? '',
      Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '',
    )
  } catch (error) {
    return new Response(`Webhook signature error: ${(error as Error).message}`, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { error } = await supabase.from('orders').insert({
      stripe_session_id: session.id,
      customer_email: session.customer_details?.email ?? null,
      amount_total: session.amount_total ?? 0,
      currency: session.currency ?? 'eur',
      items: lineItems.data.map((line) => ({
        description: line.description,
        quantity: line.quantity,
        amount_total: line.amount_total,
      })),
    })

    if (error && error.code !== '23505') {
      // 23505 = unique_violation on stripe_session_id: Stripe may retry the
      // same webhook event, safely ignore duplicates.
      return new Response(`Database error: ${error.message}`, { status: 500 })
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
