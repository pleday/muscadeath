import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { CartContext, type CartContextValue, type CartLine } from './cartContextInstance'

const CART_STORAGE_KEY = 'muscadeath_cart'

function loadCart(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CartLine[]) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(loadCart)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines))
  }, [lines])

  const addItem: CartContextValue['addItem'] = (item, size, quantity) => {
    const key = `${item.id}::${size}`
    setLines((prev) => {
      const existing = prev.find((line) => line.key === key)
      if (existing) {
        return prev.map((line) => (line.key === key ? { ...line, quantity: line.quantity + quantity } : line))
      }
      return [...prev, { key, id: item.id, name: item.name, price: item.price, image: item.image, size, quantity }]
    })
    setIsOpen(true)
  }

  const updateQuantity = (key: string, quantity: number) => {
    setLines((prev) =>
      quantity <= 0 ? prev.filter((line) => line.key !== key) : prev.map((line) => (line.key === key ? { ...line, quantity } : line)),
    )
  }

  const removeLine = (key: string) => setLines((prev) => prev.filter((line) => line.key !== key))
  const clear = () => setLines([])

  const totalItems = useMemo(() => lines.reduce((sum, line) => sum + line.quantity, 0), [lines])
  const totalEuros = useMemo(() => lines.reduce((sum, line) => sum + line.price * line.quantity, 0), [lines])

  const value = {
    lines,
    addItem,
    updateQuantity,
    removeLine,
    clear,
    totalItems,
    totalEuros,
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((v) => !v),
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
