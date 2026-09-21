// Supabase Edge Function: creates a Stripe Checkout Session for the cart
// received from the frontend, and returns its URL.
//
// Deploy with: supabase functions deploy create-checkout-session --no-verify-jwt
// Required secrets: STRIPE_SECRET_KEY, SITE_URL (see README.md).
import Stripe from 'npm:stripe@17'
import { corsHeaders } from '../_shared/cors.ts'

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
    const { items } = (await req.json()) as { items: CartItemInput[] }
    if (!Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: 'Panier vide.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2024-06-20',
    })

    const origin = req.headers.get('origin') ?? Deno.env.get('SITE_URL') ?? ''

    const line_items = items.map((item) => ({
      price_data: {
        currency: 'eur',
        product_data: { name: item.size ? `${item.name} (${item.size})` : item.name },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }))

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      success_url: `${origin}/commande/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/commande/annulee`,
    })

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
