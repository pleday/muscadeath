import { useSiteConfig } from '../context/useSiteConfig'
import { ClickableImage } from './ClickableImage'
import { SectionTitle } from './SectionTitle'

export function News() {
  const { config } = useSiteConfig()
  const { news } = config

  return (
    <section id="actualites" className="bg-[var(--color-background)]/90 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionTitle kicker={news.kicker} title={news.title} />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {news.items.map((item, index) => (
            <article
              key={index}
              className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
            >
              <div className="aspect-video overflow-hidden">
                <ClickableImage src={item.image} alt={item.title} className="h-full w-full object-cover" />
              </div>
              <div className="p-5">
                <p className="text-xs font-semibold tracking-wide text-[var(--color-secondary)] uppercase">
                  {item.date}
                </p>
                <h3 className="mt-1 font-bold text-[var(--color-text)]">{item.title}</h3>
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">{item.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
