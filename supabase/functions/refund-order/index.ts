// Supabase Edge Function: refunds an order. Only callable by the signed-in
// admin (verified via their Supabase session JWT). Mock orders (created by
// mock-checkout) are refunded locally without contacting Stripe; real orders
// trigger an actual Stripe refund.
//
// Deploy with: supabase functions deploy refund-order --no-verify-jwt
// Required secrets: STRIPE_SECRET_KEY, SUPABASE_URL, SUPABASE_ANON_KEY,
// SUPABASE_SERVICE_ROLE_KEY (see README.md).
import { createClient } from 'npm:@supabase/supabase-js@2'
import Stripe from 'npm:stripe@17'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization') ?? ''
    const authedClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    )
    const { data: userData, error: userError } = await authedClient.auth.getUser()
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: 'Non autorisé.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { orderId } = (await req.json()) as { orderId: string }
    if (!orderId) {
      return new Response(JSON.stringify({ error: 'orderId manquant.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { data: order, error: fetchError } = await adminClient
      .from('orders')
      .select('id, stripe_session_id, payment_intent_id, status')
      .eq('id', orderId)
      .single()

    if (fetchError || !order) {
      return new Response(JSON.stringify({ error: "Commande introuvable." }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (order.status === 'refunded') {
      return new Response(JSON.stringify({ error: 'Commande déjà remboursée.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const isMockOrder = order.stripe_session_id.startsWith('mock_')
    if (!isMockOrder) {
      const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
        apiVersion: '2024-06-20',
      })
      let paymentIntentId = order.payment_intent_id as string | null
      if (!paymentIntentId) {
        const session = await stripe.checkout.sessions.retrieve(order.stripe_session_id)
        paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : null
      }
      if (!paymentIntentId) {
        return new Response(JSON.stringify({ error: 'Paiement introuvable chez Stripe.' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      await stripe.refunds.create({ payment_intent: paymentIntentId })
    }

    const { error: updateError } = await adminClient
      .from('orders')
      .update({ status: 'refunded' })
      .eq('id', orderId)

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
