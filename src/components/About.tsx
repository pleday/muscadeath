import { useSiteConfig } from '../context/useSiteConfig'
import { ClickableImage } from './ClickableImage'
import { SectionTitle } from './SectionTitle'

export function About() {
  const { config } = useSiteConfig()
  const { about } = config

  return (
    <section id="a-propos" className="bg-[var(--color-background)]/90 px-6 py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
        <div>
          <SectionTitle kicker={about.kicker} title={about.title} align="left" />
          <div className="mt-6 space-y-4 text-[var(--color-text-muted)]">
            {about.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-10 grid grid-cols-3 gap-4">
            {about.stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-5 text-center"
              >
                <p className="text-2xl font-extrabold text-[var(--color-primary)]">{stat.value}</p>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[var(--color-border)]">
          {about.backgroundType === 'color' ? (
            <div className="aspect-[4/3] w-full" style={{ backgroundColor: about.backgroundColor }} />
          ) : (
            <ClickableImage src={about.image} alt={about.title} className="h-full w-full object-cover" />
          )}
        </div>
      </div>
    </section>
  )
}
