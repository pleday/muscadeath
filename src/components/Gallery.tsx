import { useSiteConfig } from '../context/useSiteConfig'
import { ClickableImage } from './ClickableImage'
import { SectionTitle } from './SectionTitle'

export function Gallery() {
  const { config } = useSiteConfig()
  const { gallery } = config

  return (
    <section id="galerie" className="bg-[var(--color-background-alt)]/90 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionTitle kicker={gallery.kicker} title={gallery.title} />

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {gallery.images.map((image, index) => (
            <div
              key={index}
              className="group aspect-[4/3] overflow-hidden rounded-xl border border-[var(--color-border)]"
            >
              <ClickableImage
                src={image.src}
                alt={image.alt}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                gallery={gallery.images.map((i) => ({ src: i.src, alt: i.alt }))}
                index={index}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
