import { useSiteConfig } from '../context/useSiteConfig'
import { Carousel } from './Carousel'
import { SectionTitle } from './SectionTitle'

export function Historique() {
  const { config } = useSiteConfig()
  const { historique } = config

  return (
    <section id="historique" className="bg-[var(--color-background)]/90 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionTitle kicker={historique.kicker} title={historique.title} />
        <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-[var(--color-text-muted)]">
          {historique.intro}
        </p>

        <div className="mt-12">
          <Carousel
            items={historique.posters.map((poster) => ({
              image: poster.image,
              alt: `Affiche ${poster.edition}`,
              caption: `Affiche ${poster.edition}`,
            }))}
          />
        </div>
      </div>
    </section>
  )
}
