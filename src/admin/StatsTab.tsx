import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface OrderItem {
  description: string
  quantity: number
  amount_total: number
}

interface Order {
  id: string
  stripe_session_id: string
  customer_email: string | null
  amount_total: number
  currency: string
  items: OrderItem[]
  created_at: string
}

/** Reads completed orders from Supabase (RLS: admin-only) and summarizes them. */
export function StatsTab() {
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [error, setError] = useState('')

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
        Les statistiques nécessitent Supabase (voir le README, section boutique / paiement).
      </p>
    )
  }

  if (error) {
    return <p className="text-sm text-[var(--color-primary)]">Erreur : {error}</p>
  }

  if (!orders) {
    return <p className="text-sm text-[var(--color-text-muted)]">Chargement…</p>
  }

  const totalRevenue = orders.reduce((sum, order) => sum + order.amount_total, 0) / 100
  const orderCount = orders.length
  const averageBasket = orderCount > 0 ? totalRevenue / orderCount : 0

  const productTotals = new Map<string, number>()
  for (const order of orders) {
    for (const item of order.items ?? []) {
      productTotals.set(item.description, (productTotals.get(item.description) ?? 0) + item.quantity)
    }
  }
  const topProducts = [...productTotals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-5 text-center">
          <p className="text-2xl font-extrabold text-[var(--color-primary)]">{totalRevenue.toFixed(2)} €</p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">Chiffre d'affaires total</p>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-5 text-center">
          <p className="text-2xl font-extrabold text-[var(--color-primary)]">{orderCount}</p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">Commandes payées</p>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-5 text-center">
          <p className="text-2xl font-extrabold text-[var(--color-primary)]">{averageBasket.toFixed(2)} €</p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">Panier moyen</p>
        </div>
      </div>

      {topProducts.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-bold tracking-wide text-[var(--color-primary)] uppercase">
            Articles les plus vendus
          </h3>
          <ul className="space-y-2">
            {topProducts.map(([name, quantity]) => (
              <li
                key={name}
                className="flex items-center justify-between rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2 text-sm"
              >
                <span className="text-[var(--color-text)]">{name}</span>
                <span className="font-semibold text-[var(--color-primary)]">{quantity} vendus</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h3 className="mb-3 text-sm font-bold tracking-wide text-[var(--color-primary)] uppercase">
          Commandes récentes
        </h3>
        {orders.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">Aucune commande pour le moment.</p>
        ) : (
          <div className="overflow-x-auto rounded-md border border-[var(--color-border)]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--color-background)] text-xs text-[var(--color-text-muted)] uppercase">
                <tr>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Articles</th>
                  <th className="px-4 py-2">Montant</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t border-[var(--color-border)]">
                    <td className="px-4 py-2 text-[var(--color-text-muted)]">
                      {new Date(order.created_at).toLocaleString('fr-FR')}
                    </td>
                    <td className="px-4 py-2 text-[var(--color-text)]">{order.customer_email ?? '—'}</td>
                    <td className="px-4 py-2 text-[var(--color-text-muted)]">
                      {(order.items ?? []).map((item) => `${item.quantity}× ${item.description}`).join(', ')}
                    </td>
                    <td className="px-4 py-2 font-semibold text-[var(--color-primary)]">
                      {(order.amount_total / 100).toFixed(2)} €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
