import { createContext } from 'react'
import type { SiteConfig } from '../config/site.config'
import type { ThemeColors } from '../config/theme'

export interface ConfigContextValue {
  config: SiteConfig
  themeColors: ThemeColors
  updateConfig: (patch: Record<string, unknown>) => void
  updateTheme: (patch: Partial<ThemeColors>) => void
  applyThemePreset: (name: string) => void
  resetAll: () => void
  exportJson: () => string
  /** Whether the currently edited content has been fetched from / published to Supabase. */
  cloudStatus: 'disabled' | 'loading' | 'synced' | 'error'
  /** Publishes the current config + theme to Supabase so every visitor sees it. */
  publish: () => Promise<{ ok: boolean; error?: string }>
  /** Set when the local browser storage is full (e.g. after a large image upload). */
  storageWarning: string | null
}

// Kept in its own file (no components here) so Vite Fast Refresh works reliably.
export const ConfigContext = createContext<ConfigContextValue | null>(null)
