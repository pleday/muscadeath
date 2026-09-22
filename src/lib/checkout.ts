import type { CartLine } from '../context/cartContextInstance'
import { supabase } from './supabase'

/**
 * Creates a Stripe Checkout Session via the `create-checkout-session` Supabase
 * Edge Function and returns the URL to redirect the customer to.
 */
export async function createCheckoutSession(lines: CartLine[]): Promise<{ url?: string; error?: string }> {
  if (!supabase) {
    return { error: "Le paiement en ligne n'est pas configuré (voir le README, section Supabase / Stripe)." }
  }
  const { data, error } = await supabase.functions.invoke<{ url: string }>('create-checkout-session', {
    body: {
      items: lines.map((line) => ({
        name: line.name,
        size: line.size,
        price: line.price,
        quantity: line.quantity,
      })),
    },
  })
  if (error) return { error: error.message }
  if (!data?.url) return { error: 'Réponse invalide du serveur de paiement.' }
  return { url: data.url }
}

/**
 * Creates a fake "paid" order without any real payment, via the
 * `mock-checkout` Edge Function. Used to test the order/sales management flow
 * (admin panel, confirmation email) before Stripe is fully configured.
 */
export async function createMockOrder(lines: CartLine[], email: string): Promise<{ ok?: true; error?: string }> {
  if (!supabase) {
    return { error: "Supabase n'est pas configuré (voir le README)." }
  }
  const { data, error } = await supabase.functions.invoke<{ sessionId: string; error?: string }>('mock-checkout', {
    body: {
      email,
      items: lines.map((line) => ({
        name: line.name,
        size: line.size,
        price: line.price,
        quantity: line.quantity,
      })),
    },
  })
  if (error) return { error: error.message }
  if (data?.error) return { error: data.error }
  return { ok: true }
}

/**
 * Refunds an order via the `refund-order` Edge Function (admin-only, checked
 * server-side from the caller's Supabase session). Mock orders are refunded
 * locally; real orders trigger an actual Stripe refund.
 */
export async function refundOrder(orderId: string): Promise<{ ok?: true; error?: string }> {
  if (!supabase) {
    return { error: "Supabase n'est pas configuré (voir le README)." }
  }
  const { data, error } = await supabase.functions.invoke<{ ok?: true; error?: string }>('refund-order', {
    body: { orderId },
  })
  if (error) return { error: error.message }
  if (data?.error) return { error: data.error }
  return { ok: true }
}

