import type { NewsItem } from '../config/site.config'
import { useSiteConfig } from '../context/useSiteConfig'
import { readFileAsDataUrl } from '../lib/file'
import { Field } from './fields'

const emptyNewsItem: NewsItem = {
  date: new Date().getFullYear().toString(),
  title: 'Nouvelle actualité',
  excerpt: '',
  image: '/images/news-placeholder.svg',
}

/** Add/edit/reorder/delete UI for the "Actualités" list — no JSON editing required. */
export function NewsTab() {
  const { config, updateConfig } = useSiteConfig()
  const items = config.news.items

  const setItems = (next: NewsItem[]) => updateConfig({ news: { items: next } })

  const updateItem = (index: number, patch: Partial<NewsItem>) => {
    setItems(items.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  const removeItem = (index: number) => {
    if (window.confirm('Supprimer cette actualité ?')) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const addItem = () => setItems([{ ...emptyNewsItem }, ...items])

  const moveItem = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= items.length) return
    const next = [...items]
    const [moved] = next.splice(index, 1)
    next.splice(target, 0, moved)
    setItems(next)
  }

  const handleImageUpload = async (index: number, file: File) => {
    const dataUrl = await readFileAsDataUrl(file)
    updateItem(index, { image: dataUrl })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-[var(--color-text-muted)]">
          Ajoutez, modifiez, réordonnez ou supprimez les actualités affichées sur le site.
        </p>
        <button
          type="button"
          onClick={addItem}
          className="shrink-0 rounded-md bg-[var(--color-primary)] px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[var(--color-primary-dark)]"
        >
          + Ajouter une actualité
        </button>
      </div>

      {items.length === 0 && (
        <p className="rounded-lg border border-dashed border-[var(--color-border)] p-6 text-center text-sm text-[var(--color-text-muted)]">
          Aucune actualité pour le moment.
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
                <div className="aspect-video overflow-hidden rounded-md border border-[var(--color-border)]">
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
                <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
                  <Field
                    label="Date"
                    value={item.date}
                    onChange={(value) => updateItem(index, { date: value })}
                  />
                  <Field
                    label="Titre"
                    value={item.title}
                    onChange={(value) => updateItem(index, { title: value })}
                  />
                </div>
                <Field
                  label="Résumé"
                  textarea
                  value={item.excerpt}
                  onChange={(value) => updateItem(index, { excerpt: value })}
                />
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
    </div>
  )
}
