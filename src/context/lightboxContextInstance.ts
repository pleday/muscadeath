import { createContext } from 'react'

export interface LightboxImage {
  src: string
  alt: string
}

export interface LightboxContextValue {
  /** Opens a single image with no next/previous navigation. */
  openImage: (image: LightboxImage) => void
  /** Opens an image as part of a set, enabling next/previous navigation. */
  openGallery: (images: LightboxImage[], startIndex: number) => void
}

// Kept in its own file (no components here) so Vite Fast Refresh works reliably.
export const LightboxContext = createContext<LightboxContextValue | null>(null)
