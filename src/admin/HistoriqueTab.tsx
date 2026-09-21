import type { FeteMusiquePoster, PosterItem } from '../config/site.config'
import { useSiteConfig } from '../context/useSiteConfig'
import { readImageFileForUpload } from '../lib/file'
import { Field } from './fields'

interface PosterEditorProps<T extends { image: string }> {
  posters: T[]
  labelKey: keyof T
  labelPlaceholder: string
  onChange: (next: T[]) => void
  emptyItem: T
}

/** Shared add/edit/reorder/delete grid used for both poster galleries. */
function PosterEditor<T extends { image: string }>({
  posters,
  labelKey,
  labelPlaceholder,
  onChange,
  emptyItem,
}: PosterEditorProps<T>) {
  const updatePoster = (index: number, patch: Partial<T>) => {
    onChange(posters.map((poster, i) => (i === index ? { ...poster, ...patch } : poster)))
  }

  const removePoster = (index: number) => {
    if (window.confirm('Supprimer cette affiche ?')) {
      onChange(posters.filter((_, i) => i !== index))
    }
  }

  const addPoster = () => onChange([{ ...emptyItem }, ...posters])

  const movePoster = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= posters.length) return
    const next = [...posters]
    const [moved] = next.splice(index, 1)
    next.splice(target, 0, moved)
    onChange(next)
  }

  const handleImageUpload = async (index: number, file: File) => {
    const dataUrl = await readImageFileForUpload(file)
    updatePoster(index, { image: dataUrl } as Partial<T>)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={addPoster}
          className="shrink-0 rounded-md bg-[var(--color-primary)] px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[var(--color-primary-dark)]"
        >
          + Ajouter une affiche
        </button>
      </div>

      {posters.length === 0 && (
        <p className="rounded-lg border border-dashed border-[var(--color-border)] p-6 text-center text-sm text-[var(--color-text-muted)]">
          Aucune affiche pour le moment.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posters.map((poster, index) => (
          <div
            key={index}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4"
          >
            <div className="aspect-[4/5] overflow-hidden rounded-md border border-[var(--color-border)]">
              <img src={poster.image} alt="" className="h-full w-full object-cover" />
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
            <div className="mt-3">
              <Field
                label={labelPlaceholder}
                value={String(poster[labelKey])}
                onChange={(value) => updatePoster(index, { [labelKey]: value } as Partial<T>)}
              />
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => movePoster(index, -1)}
                disabled={index === 0}
                aria-label="Monter"
                className="rounded-md border border-[var(--color-border)] px-3 py-1 text-xs text-[var(--color-text)] transition-colors hover:border-[var(--color-primary)] disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => movePoster(index, 1)}
                disabled={index === posters.length - 1}
                aria-label="Descendre"
                className="rounded-md border border-[var(--color-border)] px-3 py-1 text-xs text-[var(--color-text)] transition-colors hover:border-[var(--color-primary)] disabled:opacity-30"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => removePoster(index)}
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

/** Manages both poster galleries — Muscadeath and Fête de la musique — in a single "Historique(s)" tab. */
export function HistoriqueTab() {
  const { config, updateConfig } = useSiteConfig()

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h3 className="text-sm font-bold tracking-wide text-[var(--color-primary)] uppercase">
          Historique Muscadeath
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Kicker"
            value={config.historique.kicker}
            onChange={(value) => updateConfig({ historique: { kicker: value } })}
          />
          <Field
            label="Titre"
            value={config.historique.title}
            onChange={(value) => updateConfig({ historique: { title: value } })}
          />
        </div>
        <Field
          label="Introduction"
          textarea
          value={config.historique.intro}
          onChange={(value) => updateConfig({ historique: { intro: value } })}
        />
        <p className="text-xs text-[var(--color-text-muted)]">
          Une carte par affiche d'édition (comme la page « Affiches » du site d'origine). L'ordre
          d'affichage est celui de cette liste.
        </p>
        <PosterEditor<PosterItem>
          posters={config.historique.posters}
          labelKey="edition"
          labelPlaceholder="Édition (ex. XXIV)"
          emptyItem={{ edition: '', image: '/images/poster-placeholder.svg' }}
          onChange={(next) => updateConfig({ historique: { posters: next } })}
        />
      </section>

      <section className="space-y-4 border-t border-[var(--color-border)] pt-8">
        <h3 className="text-sm font-bold tracking-wide text-[var(--color-primary)] uppercase">
          Historique Fête de la musique
        </h3>
        <Field
          label="Introduction"
          textarea
          value={config.feteMusique.historiqueIntro}
          onChange={(value) => updateConfig({ feteMusique: { historiqueIntro: value } })}
        />
        <PosterEditor<FeteMusiquePoster>
          posters={config.feteMusique.historiquePosters}
          labelKey="year"
          labelPlaceholder="Année (ex. 2024)"
          emptyItem={{ year: '', image: '/images/poster-placeholder.svg' }}
          onChange={(next) => updateConfig({ feteMusique: { historiquePosters: next } })}
        />
      </section>
    </div>
  )
}
