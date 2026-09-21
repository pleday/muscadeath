import type { PartnerItem } from '../config/site.config'
import { useSiteConfig } from '../context/useSiteConfig'
import { readImageFileForUpload } from '../lib/file'
import { Field } from './fields'

const emptyPartner: PartnerItem = { name: 'Nouveau partenaire', logo: '/images/partner-placeholder.svg', url: '' }

/** Add/edit/reorder/delete UI for the "Mécènes & partenaires" list — no JSON editing required. */
export function PartnersTab() {
  const { config, updateConfig } = useSiteConfig()
  const items = config.partners.items

  const setItems = (next: PartnerItem[]) => updateConfig({ partners: { items: next } })

  const updateItem = (index: number, patch: Partial<PartnerItem>) => {
    setItems(items.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  const removeItem = (index: number) => {
    if (window.confirm('Supprimer ce partenaire ?')) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const addItem = () => setItems([{ ...emptyPartner }, ...items])

  const moveItem = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= items.length) return
    const next = [...items]
    const [moved] = next.splice(index, 1)
    next.splice(target, 0, moved)
    setItems(next)
  }

  const handleLogoUpload = async (index: number, file: File) => {
    const dataUrl = await readImageFileForUpload(file)
    updateItem(index, { logo: dataUrl })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-[var(--color-text-muted)]">
          Ajoutez, réordonnez ou supprimez les mécènes et partenaires affichés sur le site.
        </p>
        <button
          type="button"
          onClick={addItem}
          className="shrink-0 rounded-md bg-[var(--color-primary)] px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[var(--color-primary-dark)]"
        >
          + Ajouter un partenaire
        </button>
      </div>

      {items.length === 0 && (
        <p className="rounded-lg border border-dashed border-[var(--color-border)] p-6 text-center text-sm text-[var(--color-text-muted)]">
          Aucun partenaire pour le moment.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4"
          >
            <div className="flex h-16 items-center justify-center overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-2">
              <img src={item.logo} alt="" className="h-full w-full object-contain" />
            </div>
            <label className="mt-2 block cursor-pointer text-center text-[10px] font-semibold text-[var(--color-text)] underline">
              Changer le logo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) handleLogoUpload(index, file)
                }}
              />
            </label>
            <div className="mt-3 space-y-3">
              <Field
                label="Nom"
                value={item.name}
                onChange={(value) => updateItem(index, { name: value })}
              />
              <Field
                label="Lien (optionnel)"
                value={item.url}
                onChange={(value) => updateItem(index, { url: value })}
              />
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
    </div>
  )
}
