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
