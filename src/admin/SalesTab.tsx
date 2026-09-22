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
  const [isBulkBusy, setIsBulkBusy] = useState(false)
  const [actionError, setActionError] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const loadOrders = async () => {
    if (!supabase) return
    setIsRefreshing(true)
    const { data, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    if (fetchError) {
      setError(fetchError.message)
    } else {
      setError('')
      setOrders((data ?? []) as Order[])
    }
    setIsRefreshing(false)
  }

  useEffect(() => {
    loadOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  const pendingOrders = orders.filter((order) => order.status === 'pending')
  const pendingCount = pendingOrders.length

  const itemsToPrepare = new Map<string, number>()
  for (const order of pendingOrders) {
    for (const item of order.items ?? []) {
      itemsToPrepare.set(item.description, (itemsToPrepare.get(item.description) ?? 0) + item.quantity)
    }
  }
  const itemsToPrepareList = [...itemsToPrepare.entries()].sort((a, b) => b[1] - a[1])

  const periodOrders = orders.filter((order) => {
    const time = new Date(order.created_at).getTime()
    if (dateFrom && time < new Date(dateFrom).getTime()) return false
    if (dateTo && time > new Date(dateTo).getTime() + 24 * 60 * 60 * 1000 - 1) return false
    return true
  })
  const periodRevenue =
    periodOrders.filter((order) => order.status !== 'refunded').reduce((sum, order) => sum + order.amount_total, 0) /
    100

  const orderedInPeriod = new Map<string, number>()
  const processedInPeriod = new Map<string, number>()
  for (const order of periodOrders) {
    if (order.status === 'refunded') continue
    for (const item of order.items ?? []) {
      orderedInPeriod.set(item.description, (orderedInPeriod.get(item.description) ?? 0) + item.quantity)
      if (order.status === 'processed') {
        processedInPeriod.set(item.description, (processedInPeriod.get(item.description) ?? 0) + item.quantity)
      }
    }
  }
  const periodBreakdown = [...new Set([...orderedInPeriod.keys(), ...processedInPeriod.keys()])]
    .map((name) => ({
      name,
      ordered: orderedInPeriod.get(name) ?? 0,
      processed: processedInPeriod.get(name) ?? 0,
    }))
    .sort((a, b) => b.ordered - a.ordered)

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

  const toggleSelected = (orderId: string) => {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(orderId)) next.delete(orderId)
      else next.add(orderId)
      return next
    })
  }

  const toggleSelectAll = () => {
    setSelectedIds((current) => (current.size === orders.length ? new Set() : new Set(orders.map((o) => o.id))))
  }

  const bulkSetStatus = async (status: OrderStatus) => {
    if (!supabase) return
    const ids = orders.filter((o) => selectedIds.has(o.id) && o.status !== status && o.status !== 'refunded').map((o) => o.id)
    if (ids.length === 0) return
    setIsBulkBusy(true)
    setActionError('')
    const { error: updateError } = await supabase.from('orders').update({ status }).in('id', ids)
    if (updateError) {
      setActionError(updateError.message)
    } else {
      setOrders((current) => (current ?? []).map((o) => (ids.includes(o.id) ? { ...o, status } : o)))
      setSelectedIds(new Set())
    }
    setIsBulkBusy(false)
  }

  const bulkRefund = async () => {
    const ids = orders.filter((o) => selectedIds.has(o.id) && o.status !== 'refunded').map((o) => o.id)
    if (ids.length === 0) return
    if (!window.confirm(`Confirmer le remboursement de ${ids.length} commande(s) ?`)) return
    setIsBulkBusy(true)
    setActionError('')
    const errors: string[] = []
    for (const id of ids) {
      const result = await refundOrder(id)
      if (result.error) {
        errors.push(result.error)
      } else {
        setOrders((current) => (current ?? []).map((o) => (o.id === id ? { ...o, status: 'refunded' } : o)))
        setSelectedIds((current) => {
          const next = new Set(current)
          next.delete(id)
          return next
        })
      }
    }
    if (errors.length > 0) setActionError(errors.join(' · '))
    setIsBulkBusy(false)
  }

  const isBusy = busyId !== null || isBulkBusy

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-wide text-[var(--color-primary)] uppercase">Vue d'ensemble</h3>
        <button
          type="button"
          onClick={loadOrders}
          disabled={isRefreshing}
          className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] transition-colors hover:border-[var(--color-primary)] disabled:opacity-50"
        >
          {isRefreshing ? 'Actualisation…' : '↻ Rafraîchir'}
        </button>
      </div>

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

      {itemsToPrepareList.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-bold tracking-wide text-[var(--color-primary)] uppercase">
            Articles à préparer (commandes à traiter)
          </h3>
          <ul className="space-y-2">
            {itemsToPrepareList.map(([name, quantity]) => (
              <li
                key={name}
                className="flex items-center justify-between rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2 text-sm"
              >
                <span className="text-[var(--color-text)]">{name}</span>
                <span className="font-semibold text-amber-500">{quantity}×</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-bold tracking-wide text-[var(--color-primary)] uppercase">
            Statistiques par période
          </h3>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-muted)]">
            <label className="flex items-center gap-1.5">
              Du
              <input
                type="date"
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
                className="rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 py-1 text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
              />
            </label>
            <label className="flex items-center gap-1.5">
              Au
              <input
                type="date"
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
                className="rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 py-1 text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
              />
            </label>
            {(dateFrom || dateTo) && (
              <button
                type="button"
                onClick={() => {
                  setDateFrom('')
                  setDateTo('')
                }}
                className="text-[var(--color-text-muted)] underline hover:text-[var(--color-primary)]"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>

        <p className="mb-3 text-xs text-[var(--color-text-muted)]">
          {periodOrders.length} commande(s) sur la période · {periodRevenue.toFixed(2)} € (hors remboursées)
        </p>

        {periodBreakdown.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">Aucun article sur cette période.</p>
        ) : (
          <div className="overflow-x-auto rounded-md border border-[var(--color-border)]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--color-background)] text-xs text-[var(--color-text-muted)] uppercase">
                <tr>
                  <th className="px-4 py-2">Article</th>
                  <th className="px-4 py-2">Commandés</th>
                  <th className="px-4 py-2">Traités</th>
                </tr>
              </thead>
              <tbody>
                {periodBreakdown.map((row) => (
                  <tr key={row.name} className="border-t border-[var(--color-border)]">
                    <td className="px-4 py-2 text-[var(--color-text)]">{row.name}</td>
                    <td className="px-4 py-2 font-semibold text-[var(--color-primary)]">{row.ordered}</td>
                    <td className="px-4 py-2 font-semibold text-emerald-500">{row.processed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold tracking-wide text-[var(--color-primary)] uppercase">Précommandes</h3>
          {orders.length > 0 && (
            <label className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
              <input
                type="checkbox"
                checked={selectedIds.size > 0 && selectedIds.size === orders.length}
                onChange={toggleSelectAll}
              />
              Tout sélectionner
            </label>
          )}
        </div>
        {selectedIds.size > 0 && (
          <div className="mb-3 flex flex-wrap items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-background)] p-3">
            <span className="text-xs font-semibold text-[var(--color-text)]">
              {selectedIds.size} sélectionnée(s)
            </span>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => bulkSetStatus('processed')}
              className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] transition-colors hover:border-[var(--color-primary)] disabled:opacity-50"
            >
              Marquer traitées
            </button>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => bulkSetStatus('pending')}
              className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] transition-colors hover:border-[var(--color-primary)] disabled:opacity-50"
            >
              Remettre à traiter
            </button>
            <button
              type="button"
              disabled={isBusy}
              onClick={bulkRefund}
              className="rounded-md bg-[var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
            >
              Rembourser
            </button>
          </div>
        )}
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
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(order.id)}
                      onChange={() => toggleSelected(order.id)}
                      className="mt-1"
                    />
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-text)]">
                        {order.customer_email ?? '—'}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {new Date(order.created_at).toLocaleString('fr-FR')}
                        {order.stripe_session_id.startsWith('mock_') && ' · commande test (sans paiement réel)'}
                      </p>
                    </div>
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
                        disabled={busyId === order.id || isBulkBusy}
                        onClick={() => setStatus(order.id, 'processed')}
                        className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] transition-colors hover:border-[var(--color-primary)] disabled:opacity-50"
                      >
                        Marquer traitée
                      </button>
                    )}
                    {order.status === 'processed' && (
                      <button
                        type="button"
                        disabled={busyId === order.id || isBulkBusy}
                        onClick={() => setStatus(order.id, 'pending')}
                        className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] transition-colors hover:border-[var(--color-primary)] disabled:opacity-50"
                      >
                        Remettre à traiter
                      </button>
                    )}
                    {order.status !== 'refunded' && (
                      <button
                        type="button"
                        disabled={busyId === order.id || isBulkBusy}
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
