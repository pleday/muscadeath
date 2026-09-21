import { useContext } from 'react'
import { LightboxContext } from './lightboxContextInstance'

/** Kept in its own file (not LightboxContext.tsx) so Vite Fast Refresh works reliably. */
export function useLightbox() {
  const ctx = useContext(LightboxContext)
  if (!ctx) throw new Error('useLightbox must be used within a LightboxProvider')
  return ctx
}
