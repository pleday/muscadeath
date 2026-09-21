import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { LightboxContext, type LightboxImage } from './lightboxContextInstance'

/** Renders a fullscreen viewer for whichever image is currently opened via `useLightbox()`. */
export function LightboxProvider({ children }: { children: ReactNode }) {
  const [image, setImage] = useState<LightboxImage | null>(null)

  const openImage = useCallback((next: LightboxImage) => setImage(next), [])
  const close = useCallback(() => setImage(null), [])

  useEffect(() => {
    if (!image) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [image, close])

  return (
    <LightboxContext.Provider value={{ openImage }}>
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

