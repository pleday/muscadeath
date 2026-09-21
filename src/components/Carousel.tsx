import { useRef } from 'react'
import { ClickableImage } from './ClickableImage'

export interface CarouselItem {
  image: string
  alt: string
  caption?: string
}

interface CarouselProps {
  items: CarouselItem[]
}

/** Compact horizontal, snap-scrolling carousel (posters, past editions...). */
export function Carousel({ items }: CarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)

  const scrollByCard = (direction: -1 | 1) => {
    const track = trackRef.current
    if (!track) return
    const card = track.querySelector<HTMLElement>('[data-carousel-item]')
    const step = (card?.offsetWidth ?? 160) + 16
    track.scrollBy({ left: direction * step * 2, behavior: 'smooth' })
  }

  if (items.length === 0) return null

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, index) => (
          <div
            key={index}
            data-carousel-item
            className="w-28 shrink-0 snap-start overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] sm:w-36"
          >
            <div className="aspect-[4/5] overflow-hidden">
              <ClickableImage src={item.image} alt={item.alt} className="h-full w-full object-cover" />
            </div>
            {item.caption && (
              <p className="px-2 py-1.5 text-center text-xs font-semibold tracking-wide text-[var(--color-text)]">
                {item.caption}
              </p>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => scrollByCard(-1)}
        aria-label="Précédent"
        className="absolute top-1/2 -left-3 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] shadow-md transition-colors hover:border-[var(--color-primary)] sm:flex"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={() => scrollByCard(1)}
        aria-label="Suivant"
        className="absolute top-1/2 -right-3 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] shadow-md transition-colors hover:border-[var(--color-primary)] sm:flex"
      >
        ›
      </button>
    </div>
  )
}
