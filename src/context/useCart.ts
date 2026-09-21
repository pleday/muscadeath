import { useContext } from 'react'
import { CartContext } from './cartContextInstance'

/** Kept in its own file (not CartContext.tsx) so Vite Fast Refresh works reliably. */
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
