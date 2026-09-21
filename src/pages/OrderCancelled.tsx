import { Link } from 'react-router-dom'

export function OrderCancelled() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] px-6 text-center">
      <div className="max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
        <h1
          style={{ fontFamily: 'var(--font-logo)' }}
          className="text-2xl tracking-wide text-[var(--color-primary)]"
        >
          Paiement annulé
        </h1>
        <p className="mt-4 text-sm text-[var(--color-text-muted)]">
          Votre commande n'a pas été payée. Votre panier a été conservé, vous pouvez réessayer
          quand vous le souhaitez.
        </p>
        <Link
          to="/#boutique"
          className="mt-6 inline-block rounded-md bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-dark)]"
        >
          Retour à la boutique
        </Link>
      </div>
    </div>
  )
}
