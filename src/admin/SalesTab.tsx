import { useEffect, useState } from 'react'
import { refundOrder } from '../lib/checkout'
import { supabase } from '../lib/supabase'

interface OrderItem {
  description: string
  quantity: number
  amount_total: number
}

type OrderStatus = 'pending' | 'processed' | 'refunded'

interface Order {
  id: string
  stripe_session_id: string
  customer_email: string | null
  amount_total: number
  currency: string
  items: OrderItem[]
  status: OrderStatus
  created_at: string
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'À traiter',
  processed: 'Traitée',
  refunded: 'Remboursée',
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: 'bg-amber-500/15 text-amber-500',
  processed: 'bg-emerald-500/15 text-emerald-500',
  refunded: 'bg-[var(--color-text-muted)]/15 text-[var(--color-text-muted)]',
}

/** Reads orders from Supabase (RLS: admin-only), lets the admin mark them as
 * processed/pending and start a refund (mock orders refund instantly, real
 * ones trigger an actual Stripe refund via the refund-order Edge Function). */
export function SalesTab() {
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    if (!supabase) return
    supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error: fetchError }) => {
        if (fetchError) {
          setError(fetchError.message)
          return
        }
        setOrders((data ?? []) as Order[])
      })
  }, [])

  if (!supabase) {
    return (
      <p className="text-sm text-[var(--color-text-muted)]">
        La gestion des ventes nécessite Supabase (voir le README, section boutique / paiement).
      </p>
    )
  }

  if (error) {
    return <p className="text-sm text-[var(--color-primary)]">Erreur : {error}</p>
  }

  if (!orders) {
    return <p className="text-sm text-[var(--color-text-muted)]">Chargement…</p>
  }

  const paidOrders = orders.filter((order) => order.status !== 'refunded')
  const totalRevenue = paidOrders.reduce((sum, order) => sum + order.amount_total, 0) / 100
  const orderCount = paidOrders.length
  const averageBasket = orderCount > 0 ? totalRevenue / orderCount : 0
  const pendingCount = orders.filter((order) => order.status === 'pending').length

  const setStatus = async (orderId: string, status: OrderStatus) => {
    if (!supabase) return
    setBusyId(orderId)
    setActionError('')
    const { error: updateError } = await supabase.from('orders').update({ status }).eq('id', orderId)
    if (updateError) {
      setActionError(updateError.message)
    } else {
      setOrders((current) => (current ?? []).map((order) => (order.id === orderId ? { ...order, status } : order)))
    }
    setBusyId(null)
  }

  const handleRefund = async (orderId: string) => {
    if (!window.confirm('Confirmer le remboursement de cette commande ?')) return
    setBusyId(orderId)
    setActionError('')
    const result = await refundOrder(orderId)
    if (result.error) {
      setActionError(result.error)
    } else {
      setOrders((current) =>
        (current ?? []).map((order) => (order.id === orderId ? { ...order, status: 'refunded' } : order)),
      )
    }
    setBusyId(null)
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-5 text-center">
          <p className="text-2xl font-extrabold text-[var(--color-primary)]">{totalRevenue.toFixed(2)} €</p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">Chiffre d'affaires (hors remboursées)</p>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-5 text-center">
          <p className="text-2xl font-extrabold text-[var(--color-primary)]">{orderCount}</p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">Commandes payées</p>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-5 text-center">
          <p className="text-2xl font-extrabold text-[var(--color-primary)]">{averageBasket.toFixed(2)} €</p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">Panier moyen</p>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-5 text-center">
          <p className="text-2xl font-extrabold text-amber-500">{pendingCount}</p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">À traiter</p>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold tracking-wide text-[var(--color-primary)] uppercase">
          Précommandes
        </h3>
        {actionError && <p className="mb-3 text-sm text-[var(--color-primary)]">Erreur : {actionError}</p>}
        {orders.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">Aucune commande pour le moment.</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-md border border-[var(--color-border)] bg-[var(--color-background)] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text)]">
                      {order.customer_email ?? '—'}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {new Date(order.created_at).toLocaleString('fr-FR')}
                      {order.stripe_session_id.startsWith('mock_') && ' · commande test (sans paiement réel)'}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[order.status]}`}>
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>

                <ul className="mt-3 space-y-1 text-sm text-[var(--color-text-muted)]">
                  {(order.items ?? []).map((item, index) => (
                    <li key={index}>
                      {item.quantity}× {item.description} — {(item.amount_total / 100).toFixed(2)} €
                    </li>
                  ))}
                </ul>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[var(--color-primary)]">
                    Total : {(order.amount_total / 100).toFixed(2)} €
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {order.status === 'pending' && (
                      <button
                        type="button"
                        disabled={busyId === order.id}
                        onClick={() => setStatus(order.id, 'processed')}
                        className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] transition-colors hover:border-[var(--color-primary)] disabled:opacity-50"
                      >
                        Marquer traitée
                      </button>
                    )}
                    {order.status === 'processed' && (
                      <button
                        type="button"
                        disabled={busyId === order.id}
                        onClick={() => setStatus(order.id, 'pending')}
                        className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] transition-colors hover:border-[var(--color-primary)] disabled:opacity-50"
                      >
                        Remettre à traiter
                      </button>
                    )}
                    {order.status !== 'refunded' && (
                      <button
                        type="button"
                        disabled={busyId === order.id}
                        onClick={() => handleRefund(order.id)}
                        className="rounded-md bg-[var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
                      >
                        Rembourser
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
