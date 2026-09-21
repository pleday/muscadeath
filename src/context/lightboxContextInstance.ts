import { createContext } from 'react'

export interface LightboxImage {
  src: string
  alt: string
}

export interface LightboxContextValue {
  openImage: (image: LightboxImage) => void
}

// Kept in its own file (no components here) so Vite Fast Refresh works reliably.
export const LightboxContext = createContext<LightboxContextValue | null>(null)
