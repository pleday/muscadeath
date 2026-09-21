import { useLightbox } from '../context/useLightbox'

interface ClickableImageProps {
  src: string
  alt: string
  className?: string
  loading?: 'lazy' | 'eager'
}

/** An <img> that opens itself in a fullscreen lightbox when clicked. */
export function ClickableImage({ src, alt, className, loading }: ClickableImageProps) {
  const { openImage } = useLightbox()

  return (
    <button
      type="button"
      onClick={() => openImage({ src, alt })}
      aria-label={`Agrandir l'image${alt ? ` : ${alt}` : ''}`}
      className="block h-full w-full cursor-zoom-in appearance-none border-0 bg-transparent p-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
    >
      <img src={src} alt={alt} loading={loading} className={className} />
    </button>
  )
}
