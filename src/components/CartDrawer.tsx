import { useState } from 'react'
import { useCart } from '../context/useCart'
import { createCheckoutSession } from '../lib/checkout'
import { CloseIcon } from './icons'

export function CartDrawer() {
  const { lines, isOpen, close, updateQuantity, removeLine, totalEuros, totalItems } = useCart()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')

  if (!isOpen) return null

  const handleCheckout = async () => {
    setIsCheckingOut(true)
    setCheckoutError('')
    const result = await createCheckoutSession(lines)
    if (result.url) {
      window.location.href = result.url
      return
    }
    setCheckoutError(result.error ?? 'Une erreur est survenue.')
    setIsCheckingOut(false)
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Panier" className="fixed inset-0 z-100 flex justify-end">
      <div className="absolute inset-0 bg-black/70" onClick={close} />

      <div className="relative flex h-full w-full max-w-md flex-col bg-[var(--color-surface)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <p className="font-bold text-[var(--color-text)]">Panier ({totalItems})</p>
          <button
            type="button"
            onClick={close}
            aria-label="Fermer le panier"
            className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {lines.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">Votre panier est vide.</p>
          ) : (
            <ul className="space-y-4">
              {lines.map((line) => (
                <li key={line.key} className="flex gap-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border border-[var(--color-border)]">
                    <img src={line.image} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[var(--color-text)]">{line.name}</p>
                    {line.size && (
                      <p className="text-xs text-[var(--color-text-muted)]">Taille : {line.size}</p>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(line.key, line.quantity - 1)}
                        className="h-6 w-6 rounded border border-[var(--color-border)] text-xs text-[var(--color-text)]"
                        aria-label="Diminuer la quantité"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm text-[var(--color-text)]">{line.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(line.key, line.quantity + 1)}
                        className="h-6 w-6 rounded border border-[var(--color-border)] text-xs text-[var(--color-text)]"
                        aria-label="Augmenter la quantité"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => removeLine(line.key)}
                        className="ml-2 text-xs text-[var(--color-text-muted)] underline hover:text-[var(--color-primary)]"
                      >
                        Retirer
                      </button>
                    </div>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-[var(--color-text)]">
                    {(line.price * line.quantity).toFixed(2)} €
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-[var(--color-border)] px-5 py-4">
          <div className="mb-3 flex items-center justify-between text-sm font-semibold text-[var(--color-text)]">
            <span>Total</span>
            <span>{totalEuros.toFixed(2)} €</span>
          </div>
          {checkoutError && <p className="mb-2 text-xs text-[var(--color-primary)]">{checkoutError}</p>}
          <button
            type="button"
            onClick={handleCheckout}
            disabled={lines.length === 0 || isCheckingOut}
            className="w-full rounded-md bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
          >
            {isCheckingOut ? 'Redirection vers le paiement...' : 'Passer commande'}
          </button>
          <p className="mt-2 text-center text-[11px] text-[var(--color-text-muted)]">
            Paiement sécurisé par Stripe. Retrait sur place au festival.
          </p>
        </div>
      </div>
    </div>
  )
}
