import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { LightboxContext, type LightboxImage } from './lightboxContextInstance'

interface GalleryState {
  images: LightboxImage[]
  index: number
}

/** Renders a fullscreen viewer for whichever image/gallery is currently opened via `useLightbox()`. */
export function LightboxProvider({ children }: { children: ReactNode }) {
  const [gallery, setGallery] = useState<GalleryState | null>(null)

  const openImage = useCallback((image: LightboxImage) => setGallery({ images: [image], index: 0 }), [])
  const openGallery = useCallback(
    (images: LightboxImage[], startIndex: number) => setGallery({ images, index: startIndex }),
    [],
  )
  const close = useCallback(() => setGallery(null), [])
  const next = useCallback(
    () => setGallery((prev) => (prev ? { ...prev, index: (prev.index + 1) % prev.images.length } : prev)),
    [],
  )
  const prev = useCallback(
    () =>
      setGallery((current) =>
        current ? { ...current, index: (current.index - 1 + current.images.length) % current.images.length } : current,
      ),
    [],
  )

  useEffect(() => {
    if (!gallery) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
      if (event.key === 'ArrowRight') next()
      if (event.key === 'ArrowLeft') prev()
    }
    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [gallery, close, next, prev])

  const image = gallery?.images[gallery.index]
  const hasMultiple = (gallery?.images.length ?? 0) > 1

  return (
    <LightboxContext.Provider value={{ openImage, openGallery }}>
      {children}
      {image && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={image.alt || 'Image en plein écran'}
          onClick={close}
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
        >
          <button
            type="button"
            onClick={close}
            aria-label="Fermer"
            className="absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/30 text-2xl leading-none text-white transition-colors hover:border-white"
          >
            ×
          </button>

          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  prev()
                }}
                aria-label="Image précédente"
                className="absolute top-1/2 left-2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 text-2xl leading-none text-white transition-colors hover:border-white sm:left-4"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  next()
                }}
                aria-label="Image suivante"
                className="absolute top-1/2 right-2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 text-2xl leading-none text-white transition-colors hover:border-white sm:right-4"
              >
                ›
              </button>
              <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
                {gallery!.index + 1} / {gallery!.images.length}
              </span>
            </>
          )}

          <img
            src={image.src}
            alt={image.alt}
            onClick={(event) => event.stopPropagation()}
            className="max-h-full max-w-full rounded-md object-contain shadow-2xl"
          />
        </div>
      )}
    </LightboxContext.Provider>
  )
}

