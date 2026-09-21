import { useContext } from 'react'
import { ConfigContext } from './configContextInstance'

/** Kept in its own file (not ConfigContext.tsx) so Vite Fast Refresh works reliably. */
export function useSiteConfig() {
  const ctx = useContext(ConfigContext)
  if (!ctx) throw new Error('useSiteConfig must be used within a ConfigProvider')
  return ctx
}
