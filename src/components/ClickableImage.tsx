import { useLightbox } from '../context/useLightbox'
import type { LightboxImage } from '../context/lightboxContextInstance'

interface ClickableImageProps {
  src: string
  alt: string
  className?: string
  loading?: 'lazy' | 'eager'
  /** When part of a set (carousel, gallery grid...), pass the full list to enable next/previous navigation in the lightbox. */
  gallery?: LightboxImage[]
  /** Index of this image within `gallery`. */
  index?: number
}

/** An <img> that opens itself in a fullscreen lightbox when clicked. */
export function ClickableImage({ src, alt, className, loading, gallery, index = 0 }: ClickableImageProps) {
  const { openImage, openGallery } = useLightbox()

  const handleClick = () => {
    if (gallery && gallery.length > 1) {
      openGallery(gallery, index)
    } else {
      openImage({ src, alt })
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Agrandir l'image${alt ? ` : ${alt}` : ''}`}
      className="block h-full w-full cursor-zoom-in appearance-none border-0 bg-transparent p-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
    >
      <img src={src} alt={alt} loading={loading} className={className} />
    </button>
  )
}
