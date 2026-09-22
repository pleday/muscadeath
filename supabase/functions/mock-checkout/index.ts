// Supabase Edge Function: creates a fake "paid" order directly (no real
// payment), so the sales management flow (admin: mark processed, refund,
// email) can be tested end-to-end before Stripe is fully wired/verified.
//
// Deploy with: supabase functions deploy mock-checkout --no-verify-jwt
// No secrets required beyond what Supabase auto-injects (SUPABASE_URL,
// SUPABASE_SERVICE_ROLE_KEY). See README.md for the optional RESEND_API_KEY.
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { sendOrderConfirmationEmail } from '../_shared/email.ts'

interface CartItemInput {
  name: string
  size: string
  price: number // euros
  quantity: number
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { items, email } = (await req.json()) as { items: CartItemInput[]; email: string }
    if (!Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: 'Panier vide.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: 'Adresse email invalide.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const orderItems = items.map((item) => ({
      description: item.size ? `${item.name} (${item.size})` : item.name,
      quantity: item.quantity,
      amount_total: Math.round(item.price * item.quantity * 100),
    }))
    const amountTotal = orderItems.reduce((sum, item) => sum + item.amount_total, 0)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const stripeSessionId = `mock_${crypto.randomUUID()}`

    const { error } = await supabase.from('orders').insert({
      stripe_session_id: stripeSessionId,
      customer_email: email,
      amount_total: amountTotal,
      currency: 'eur',
      items: orderItems,
      status: 'pending',
    })

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    await sendOrderConfirmationEmail({
      to: email,
      items: orderItems,
      amountTotalCents: amountTotal,
      currency: 'eur',
    })

    return new Response(JSON.stringify({ sessionId: stripeSessionId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
