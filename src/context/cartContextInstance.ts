import { createContext } from 'react'

export interface CartLine {
  key: string
  id: string
  name: string
  /** Price in euros. */
  price: number
  image: string
  size: string
  quantity: number
}

export interface CartContextValue {
  lines: CartLine[]
  addItem: (item: { id: string; name: string; price: number; image: string }, size: string, quantity: number) => void
  updateQuantity: (key: string, quantity: number) => void
  removeLine: (key: string) => void
  clear: () => void
  totalItems: number
  totalEuros: number
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

// Kept in its own file (no components here) so Vite Fast Refresh works reliably.
export const CartContext = createContext<CartContextValue | null>(null)
