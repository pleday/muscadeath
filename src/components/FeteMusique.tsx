import { useSiteConfig } from '../context/useSiteConfig'
import { Carousel } from './Carousel'
import { SectionTitle } from './SectionTitle'

export function FeteMusique() {
  const { config } = useSiteConfig()
  const { feteMusique } = config

  return (
    <section id="fete-de-la-musique" className="bg-[var(--color-background-alt)]/90 px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <SectionTitle kicker={feteMusique.kicker} title={feteMusique.title} />

        <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-[var(--color-text-muted)]">
          {feteMusique.presentation}
        </p>

        <div className="mt-12 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <p className="mb-4 text-sm font-semibold tracking-wide text-[var(--color-primary)] uppercase">
            Programme
          </p>
          <ul className="space-y-3">
            {feteMusique.programme.map((slot, index) => (
              <li key={index} className="flex items-center justify-between text-sm">
                <span className="font-semibold text-[var(--color-text)]">{slot.time}</span>
                <span className="text-[var(--color-text-muted)]">{slot.act}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10">
          <p className="mb-2 text-sm font-semibold tracking-wide text-[var(--color-primary)] uppercase">
            Historique
          </p>
          <p className="mb-6 text-sm text-[var(--color-text-muted)]">{feteMusique.historiqueIntro}</p>
          <Carousel
            items={feteMusique.historiquePosters.map((poster) => ({
              image: poster.image,
              alt: `Fête de la Musique ${poster.year}`,
              caption: poster.year,
            }))}
          />
        </div>
      </div>
    </section>
  )
}
