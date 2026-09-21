import { useState } from 'react'
import type { MerchItem } from '../config/site.config'
import { useSiteConfig } from '../context/useSiteConfig'
import { useCart } from '../context/useCart'
import { ClickableImage } from './ClickableImage'
import { SectionTitle } from './SectionTitle'

function MerchCard({ item, ctaLabel }: { item: MerchItem; ctaLabel: string }) {
  const { addItem } = useCart()
  const sizeOptions = item.sizes
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const [size, setSize] = useState(sizeOptions[0] ?? '')
  const [quantity, setQuantity] = useState(1)
  const [justAdded, setJustAdded] = useState(false)

  const handleAdd = () => {
    addItem({ id: item.id, name: item.name, price: item.price, image: item.image }, size, quantity)
    setJustAdded(true)
    setQuantity(1)
    setTimeout(() => setJustAdded(false), 1500)
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="relative aspect-square overflow-hidden">
        <ClickableImage src={item.image} alt={item.name} className="h-full w-full object-cover" />
        {!item.available && (
          <span className="absolute top-3 right-3 rounded-full bg-[var(--color-background)]/90 px-3 py-1 text-[10px] font-semibold tracking-wide text-[var(--color-text)] uppercase">
            Épuisé
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="font-bold text-[var(--color-text)]">{item.name}</p>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">{item.description}</p>

        {item.available && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {sizeOptions.length > 0 && (
              <select
                value={size}
                onChange={(event) => setSize(event.target.value)}
                className="rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 py-1 text-xs text-[var(--color-text)]"
              >
                {sizeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="h-6 w-6 rounded border border-[var(--color-border)] text-xs text-[var(--color-text)]"
                aria-label="Diminuer la quantité"
              >
                −
              </button>
              <span className="w-5 text-center text-xs text-[var(--color-text)]">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="h-6 w-6 rounded border border-[var(--color-border)] text-xs text-[var(--color-text)]"
                aria-label="Augmenter la quantité"
              >
                +
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-1 items-end justify-between gap-2">
          <p className="text-lg font-extrabold text-[var(--color-primary)]">{item.price.toFixed(2)} €</p>
          {item.available ? (
            <button
              type="button"
              onClick={handleAdd}
              className="rounded-md bg-[var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[var(--color-primary-dark)]"
            >
              {justAdded ? 'Ajouté ✓' : ctaLabel}
            </button>
          ) : (
            <span className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text-muted)]">
              Indisponible
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export function Merch() {
  const { config } = useSiteConfig()
  const { merch } = config

  return (
    <section id="boutique" className="bg-[var(--color-background-alt)]/90 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionTitle kicker={merch.kicker} title={merch.title} />

        {merch.note && (
          <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-[var(--color-text-muted)]">
            {merch.note}
          </p>
        )}

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {merch.items.map((item) => (
            <MerchCard key={item.id} item={item} ctaLabel={merch.ctaLabel} />
          ))}
        </div>
      </div>
    </section>
  )
}
