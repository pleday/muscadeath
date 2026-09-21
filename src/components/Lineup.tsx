import { useState } from 'react'
import { useSiteConfig } from '../context/useSiteConfig'
import { ClickableImage } from './ClickableImage'
import { SectionTitle } from './SectionTitle'

export function Lineup() {
  const { config } = useSiteConfig()
  const { lineup } = config
  const [activeYear, setActiveYear] = useState(lineup.years[0]?.year)
  const currentYear = lineup.years.find((y) => y.year === activeYear) ?? lineup.years[0]

  const days = [...new Set((currentYear?.artists ?? []).map((artist) => artist.day))]

  return (
    <section id="programmation" className="bg-[var(--color-background-alt)]/90 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionTitle kicker={lineup.kicker} title={lineup.title} />

        {lineup.years.length > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {lineup.years.map((y) => (
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
          </div>
        )}

        {lineup.note && (
          <p className="mx-auto mt-6 max-w-2xl text-center text-xs italic text-[var(--color-text-muted)]">
            {lineup.note}
          </p>
        )}

        <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {currentYear?.artists.map((artist, index) => (
            <div
              key={`${artist.name}-${index}`}
              className="group overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
            >
              <div className="aspect-square overflow-hidden">
                <ClickableImage
                  src={artist.image}
                  alt={artist.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <p className="text-xs font-semibold tracking-wide text-[var(--color-secondary)] uppercase">
                  {artist.day}
                </p>
                <p className="mt-1 font-bold text-[var(--color-text)]">{artist.name}</p>
                <p className="text-sm text-[var(--color-text-muted)]">{artist.genre}</p>
              </div>
            </div>
          ))}
        </div>

        {days.length > 0 && (
          <div className="mt-16">
            <p className="mb-6 text-center text-sm font-bold tracking-wide text-[var(--color-primary)] uppercase">
              Running order
            </p>
            <div className="grid gap-6 sm:grid-cols-2">
              {days.map((day) => (
                <div key={day} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                  <p className="mb-3 font-bold text-[var(--color-text)]">{day}</p>
                  <ul className="space-y-2">
                    {currentYear?.artists
                      .filter((artist) => artist.day === day)
                      .sort((a, b) => a.time.localeCompare(b.time))
                      .map((artist, index) => (
                        <li key={index} className="flex items-center justify-between text-sm">
                          <span className="font-semibold text-[var(--color-secondary)]">{artist.time}</span>
                          <span className="text-[var(--color-text)]">{artist.name}</span>
                          <span className="text-[var(--color-text-muted)]">{artist.genre}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
