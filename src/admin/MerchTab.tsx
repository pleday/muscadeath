import type { MerchItem } from '../config/site.config'
import { useSiteConfig } from '../context/useSiteConfig'
import { readImageFileForUpload } from '../lib/file'
import { Field } from './fields'

function slugify(text: string) {
  return (
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'article'
  )
}

function createEmptyMerchItem(): MerchItem {
  return {
    id: `article-${Date.now()}`,
    name: 'Nouvel article',
    price: 0,
    image: '/images/merch-tshirt.svg',
    description: '',
    sizes: '',
    available: true,
  }
}

/** Add/edit/reorder/delete UI for the "Boutique" pre-order items — no JSON editing required. */
export function MerchTab() {
  const { config, updateConfig } = useSiteConfig()
  const { merch } = config
  const items = merch.items

  const setItems = (next: MerchItem[]) => updateConfig({ merch: { items: next } })

  const updateItem = (index: number, patch: Partial<MerchItem>) => {
    setItems(items.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  const removeItem = (index: number) => {
    if (window.confirm('Supprimer cet article ?')) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const addItem = () => setItems([createEmptyMerchItem(), ...items])

  const moveItem = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= items.length) return
    const next = [...items]
    const [moved] = next.splice(index, 1)
    next.splice(target, 0, moved)
    setItems(next)
  }

  const handleImageUpload = async (index: number, file: File) => {
    const dataUrl = await readImageFileForUpload(file)
    updateItem(index, { image: dataUrl })
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h3 className="text-sm font-bold tracking-wide text-[var(--color-primary)] uppercase">
          Section Boutique
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Kicker"
            value={merch.kicker}
            onChange={(value) => updateConfig({ merch: { kicker: value } })}
          />
          <Field
            label="Titre"
            value={merch.title}
            onChange={(value) => updateConfig({ merch: { title: value } })}
          />
        </div>
        <Field
          label="Note (modalités de précommande)"
          textarea
          value={merch.note}
          onChange={(value) => updateConfig({ merch: { note: value } })}
        />
        <Field
          label="Texte du bouton"
          value={merch.ctaLabel}
          onChange={(value) => updateConfig({ merch: { ctaLabel: value } })}
        />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-sm font-bold tracking-wide text-[var(--color-primary)] uppercase">Articles</h3>
          <button
            type="button"
            onClick={addItem}
            className="shrink-0 rounded-md bg-[var(--color-primary)] px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[var(--color-primary-dark)]"
          >
            + Ajouter un article
          </button>
        </div>

        {items.length === 0 && (
          <p className="rounded-lg border border-dashed border-[var(--color-border)] p-6 text-center text-sm text-[var(--color-text-muted)]">
            Aucun article pour le moment.
          </p>
        )}

        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="w-full shrink-0 sm:w-32">
                  <div className="aspect-square overflow-hidden rounded-md border border-[var(--color-border)]">
                    <img src={item.image} alt="" className="h-full w-full object-cover" />
                  </div>
                  <label className="mt-2 block cursor-pointer text-center text-[10px] font-semibold text-[var(--color-text)] underline">
                    Changer l'image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0]
                        if (file) handleImageUpload(index, file)
                      }}
                    />
                  </label>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-[1fr_100px]">
                    <Field
                      label="Nom"
                      value={item.name}
                      onChange={(value) =>
                        updateItem(index, { name: value, id: item.id || slugify(value) })
                      }
                    />
                    <Field
                      label="Prix (€)"
                      value={String(item.price)}
                      onChange={(value) => updateItem(index, { price: Number(value) || 0 })}
                    />
                  </div>
                  <Field
                    label="Description"
                    textarea
                    value={item.description}
                    onChange={(value) => updateItem(index, { description: value })}
                  />
                  <Field
                    label="Tailles / variantes disponibles"
                    value={item.sizes}
                    onChange={(value) => updateItem(index, { sizes: value })}
                  />
                  <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
                    <input
                      type="checkbox"
                      checked={item.available}
                      onChange={(event) => updateItem(index, { available: event.target.checked })}
                    />
                    Disponible à la précommande
                  </label>
                </div>
              </div>

              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => moveItem(index, -1)}
                  disabled={index === 0}
                  aria-label="Monter"
                  className="rounded-md border border-[var(--color-border)] px-3 py-1 text-xs text-[var(--color-text)] transition-colors hover:border-[var(--color-primary)] disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(index, 1)}
                  disabled={index === items.length - 1}
                  aria-label="Descendre"
                  className="rounded-md border border-[var(--color-border)] px-3 py-1 text-xs text-[var(--color-text)] transition-colors hover:border-[var(--color-primary)] disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="rounded-md border border-[var(--color-primary)] px-3 py-1 text-xs font-semibold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)] hover:text-white"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
