import { useState } from 'react'
import { useCart } from '../context/useCart'
import { createCheckoutSession, createMockOrder } from '../lib/checkout'
import { isSupabaseConfigured } from '../lib/supabase'
import { CloseIcon } from './icons'

export function CartDrawer() {
  const { lines, isOpen, close, updateQuantity, removeLine, clear, totalEuros, totalItems } = useCart()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')
  const [pickupConfirmed, setPickupConfirmed] = useState(false)
  const [showMockForm, setShowMockForm] = useState(false)
  const [mockEmail, setMockEmail] = useState('')
  const [mockState, setMockState] = useState<'idle' | 'sending' | 'done'>('idle')
  const [mockError, setMockError] = useState('')

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

  const handleMockOrder = async () => {
    setMockState('sending')
    setMockError('')
    const result = await createMockOrder(lines, mockEmail)
    if (result.error) {
      setMockError(result.error)
      setMockState('idle')
      return
    }
    setMockState('done')
    clear()
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
          {mockState === 'done' ? (
            <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-background)] p-4 text-sm text-[var(--color-text)]">
              <p className="font-semibold text-[var(--color-primary)]">Commande test enregistrée !</p>
              <p className="mt-2 text-[var(--color-text-muted)]">
                Un email de confirmation a été envoyé à {mockEmail} (si l'envoi d'email est configuré). Retrouvez
                cette commande dans l'admin, onglet « Gestion des ventes ».
              </p>
            </div>
          ) : lines.length === 0 ? (
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

        {mockState !== 'done' && (
          <div className="border-t border-[var(--color-border)] px-5 py-4">
            <div className="mb-3 flex items-center justify-between text-sm font-semibold text-[var(--color-text)]">
              <span>Total</span>
              <span>{totalEuros.toFixed(2)} €</span>
            </div>

            <label className="mb-3 flex items-start gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-background)] p-3 text-xs text-[var(--color-text-muted)]">
              <input
                type="checkbox"
                checked={pickupConfirmed}
                onChange={(event) => setPickupConfirmed(event.target.checked)}
                className="mt-0.5"
              />
              <span>
                <strong className="text-[var(--color-text)]">Retrait sur place uniquement :</strong> les articles
                commandés ne sont pas expédiés, ils sont à récupérer au stand merchandising pendant les jours du
                festival.
              </span>
            </label>

            {checkoutError && <p className="mb-2 text-xs text-[var(--color-primary)]">{checkoutError}</p>}
            <button
              type="button"
              onClick={handleCheckout}
              disabled={lines.length === 0 || isCheckingOut || !pickupConfirmed}
              className="w-full rounded-md bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
            >
              {isCheckingOut ? 'Redirection vers le paiement...' : 'Passer commande'}
            </button>
            <p className="mt-2 text-center text-[11px] text-[var(--color-text-muted)]">
              Paiement sécurisé par Stripe.
            </p>

            {isSupabaseConfigured && (
              <div className="mt-4 border-t border-dashed border-[var(--color-border)] pt-3">
                {!showMockForm ? (
                  <button
                    type="button"
                    onClick={() => setShowMockForm(true)}
                    className="w-full text-center text-[11px] text-[var(--color-text-muted)] underline hover:text-[var(--color-primary)]"
                  >
                    Mode test : créer une commande sans paiement réel
                  </button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[11px] text-[var(--color-text-muted)]">
                      Commande fictive pour tester la gestion des ventes et l'email de confirmation, sans passer par
                      Stripe.
                    </p>
                    <input
                      type="email"
                      required
                      value={mockEmail}
                      onChange={(event) => setMockEmail(event.target.value)}
                      placeholder="email@exemple.fr"
                      className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                    />
                    {mockError && <p className="text-xs text-[var(--color-primary)]">{mockError}</p>}
                    <button
                      type="button"
                      onClick={handleMockOrder}
                      disabled={lines.length === 0 || !pickupConfirmed || !mockEmail || mockState === 'sending'}
                      className="w-full rounded-md border border-[var(--color-border)] px-4 py-2 text-xs font-semibold text-[var(--color-text)] transition-colors hover:border-[var(--color-primary)] disabled:opacity-50"
                    >
                      {mockState === 'sending' ? 'Création...' : 'Créer la commande test'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

