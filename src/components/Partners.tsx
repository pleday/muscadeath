import { useSiteConfig } from '../context/useSiteConfig'
import { SectionTitle } from './SectionTitle'

export function Partners() {
  const { config } = useSiteConfig()
  const { partners } = config

  return (
    <section id="partenaires" className="bg-[var(--color-background)]/90 px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <SectionTitle kicker={partners.kicker} title={partners.title} />
        {partners.note && (
          <p className="mx-auto mt-4 max-w-2xl text-center text-xs italic text-[var(--color-text-muted)]">
            {partners.note}
          </p>
        )}

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {partners.items.map((partner, index) => {
            const content = (
              <div className="flex h-full flex-col items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                <img src={partner.logo} alt={partner.name} className="h-12 w-full object-contain" />
                <p className="text-center text-xs text-[var(--color-text-muted)]">{partner.name}</p>
              </div>
            )
            return partner.url ? (
              <a key={index} href={partner.url} target="_blank" rel="noreferrer noopener">
                {content}
              </a>
            ) : (
              <div key={index}>{content}</div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
