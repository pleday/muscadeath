import { useSiteConfig } from '../context/useSiteConfig'
import { ClickableImage } from './ClickableImage'

export function Hero() {
  const { config } = useSiteConfig()
  const { hero } = config

  return (
    <section
      id="accueil"
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-24"
    >
      {/* The backdrop itself is rendered once by <SiteBackground /> and stays fixed behind every section. */}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-[var(--color-background)]/60 to-[var(--color-background)]/20" />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        {hero.logoImage && (
          <div className="mx-auto mb-6 h-28 w-28 overflow-hidden rounded-full border-2 border-[var(--color-border)] shadow-lg sm:h-36 sm:w-36">
            <ClickableImage src={hero.logoImage} alt={hero.title} className="h-full w-full object-cover" />
          </div>
        )}
        <p className="mb-4 inline-block rounded-full border border-[var(--color-primary)] px-4 py-1 text-xs font-semibold tracking-[0.2em] text-[var(--color-secondary)] uppercase">
          {hero.eyebrow}
        </p>
        <h1
          style={{ fontFamily: 'var(--font-logo)' }}
          className="text-4xl tracking-wide text-[var(--color-primary)] sm:text-6xl"
        >
          {hero.title}
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base text-[var(--color-text-muted)] sm:text-lg">
          {hero.subtitle}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-[var(--color-text)]">
          <span className="rounded-full bg-[var(--color-surface)] px-4 py-2 font-semibold">
            {hero.eventDate}
          </span>
          <span className="rounded-full bg-[var(--color-surface)] px-4 py-2 font-semibold">
            {hero.eventLocation}
          </span>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href={hero.primaryCta.href}
            className="rounded-md bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-dark)]"
          >
            {hero.primaryCta.label}
          </a>
          <a
            href={hero.secondaryCta.href}
            className="rounded-md border border-[var(--color-border)] px-6 py-3 text-sm font-semibold text-[var(--color-text)] transition-colors hover:border-[var(--color-primary)]"
          >
            {hero.secondaryCta.label}
          </a>
        </div>
      </div>
    </section>
  )
}
