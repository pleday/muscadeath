import { useState } from 'react'
import type { Artist, LineupYear } from '../config/site.config'
import { useSiteConfig } from '../context/useSiteConfig'
import { readImageFileForUpload } from '../lib/file'
import { Field } from './fields'

const emptyArtist: Artist = {
  name: 'Nouveau groupe',
  genre: '',
  day: 'Vendredi',
  time: '20:00',
  image: '/images/artist-placeholder.svg',
}

/** Add/edit/reorder/delete UI for the "Programmation" lineup — no JSON editing required. */
export function LineupTab() {
  const { config, updateConfig } = useSiteConfig()
  const years = config.lineup.years
  const [activeYear, setActiveYear] = useState(years[0]?.year)
  const yearIndex = years.findIndex((y) => y.year === activeYear)
  const currentYear = years[yearIndex] ?? years[0]

  const setYears = (next: LineupYear[]) => updateConfig({ lineup: { years: next } })

  const updateYearLabel = (label: string) => {
    setYears(years.map((y, i) => (i === yearIndex ? { ...y, year: label } : y)))
    setActiveYear(label)
  }

  const addYear = () => {
    const label = 'Nouvelle année'
    setYears([...years, { year: label, artists: [] }])
    setActiveYear(label)
  }

  const removeYear = () => {
    if (!window.confirm('Supprimer cette année et tous ses groupes ?')) return
    const next = years.filter((_, i) => i !== yearIndex)
    setYears(next)
    setActiveYear(next[0]?.year)
  }

  const setArtists = (artists: Artist[]) => {
    setYears(years.map((y, i) => (i === yearIndex ? { ...y, artists } : y)))
  }

  const updateArtist = (index: number, patch: Partial<Artist>) => {
    setArtists(currentYear.artists.map((artist, i) => (i === index ? { ...artist, ...patch } : artist)))
  }

  const removeArtist = (index: number) => {
    if (window.confirm('Supprimer ce groupe ?')) {
      setArtists(currentYear.artists.filter((_, i) => i !== index))
    }
  }

  const addArtist = () => setArtists([{ ...emptyArtist }, ...currentYear.artists])

  const moveArtist = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= currentYear.artists.length) return
    const next = [...currentYear.artists]
    const [moved] = next.splice(index, 1)
    next.splice(target, 0, moved)
    setArtists(next)
  }

  const handleImageUpload = async (index: number, file: File) => {
    const dataUrl = await readImageFileForUpload(file)
    updateArtist(index, { image: dataUrl })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {years.map((y) => (
          <button
            key={y.year}
            type="button"
            onClick={() => setActiveYear(y.year)}
            className={
              'rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ' +
              (y.year === currentYear?.year
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]')
            }
          >
            {y.year}
          </button>
        ))}
        <button
          type="button"
          onClick={addYear}
          className="rounded-full border border-dashed border-[var(--color-border)] px-4 py-1.5 text-sm text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
        >
          + Année
        </button>
      </div>

      {currentYear && (
        <>
          <div className="flex flex-wrap items-end gap-3">
            <div className="max-w-[200px]">
              <Field label="Nom de l'année" value={currentYear.year} onChange={updateYearLabel} />
            </div>
            <button
              type="button"
              onClick={removeYear}
              className="rounded-md border border-[var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)] hover:text-white"
            >
              Supprimer cette année
            </button>
          </div>

          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-[var(--color-text-muted)]">
              Ajoutez, réordonnez ou supprimez les groupes de cette année.
            </p>
            <button
              type="button"
              onClick={addArtist}
              className="shrink-0 rounded-md bg-[var(--color-primary)] px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[var(--color-primary-dark)]"
            >
              + Ajouter un groupe
            </button>
          </div>

          {currentYear.artists.length === 0 && (
            <p className="rounded-lg border border-dashed border-[var(--color-border)] p-6 text-center text-sm text-[var(--color-text-muted)]">
              Aucun groupe pour le moment.
            </p>
          )}

          <div className="space-y-4">
            {currentYear.artists.map((artist, index) => (
              <div
                key={index}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="w-full shrink-0 sm:w-28">
                    <div className="aspect-square overflow-hidden rounded-md border border-[var(--color-border)]">
                      <img src={artist.image} alt="" className="h-full w-full object-cover" />
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
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field
                        label="Nom du groupe"
                        value={artist.name}
                        onChange={(value) => updateArtist(index, { name: value })}
                      />
                      <Field
                        label="Genre"
                        value={artist.genre}
                        onChange={(value) => updateArtist(index, { genre: value })}
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field
                        label="Jour"
                        value={artist.day}
                        onChange={(value) => updateArtist(index, { day: value })}
                      />
                      <Field
                        label="Heure de passage (ex. 21:30)"
                        value={artist.time}
                        onChange={(value) => updateArtist(index, { time: value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => moveArtist(index, -1)}
                    disabled={index === 0}
                    aria-label="Monter"
                    className="rounded-md border border-[var(--color-border)] px-3 py-1 text-xs text-[var(--color-text)] transition-colors hover:border-[var(--color-primary)] disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveArtist(index, 1)}
                    disabled={index === currentYear.artists.length - 1}
                    aria-label="Descendre"
                    className="rounded-md border border-[var(--color-border)] px-3 py-1 text-xs text-[var(--color-text)] transition-colors hover:border-[var(--color-primary)] disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeArtist(index)}
                    className="rounded-md border border-[var(--color-primary)] px-3 py-1 text-xs font-semibold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)] hover:text-white"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
