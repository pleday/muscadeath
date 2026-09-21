import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { siteConfig as defaultSiteConfig, type SiteConfig } from '../config/site.config'
import { theme as defaultTheme, themePresets, type ThemeColors } from '../config/theme'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { ConfigContext, type ConfigContextValue } from './configContextInstance'

const CONFIG_STORAGE_KEY = 'muscadeath_admin_config_override'
const THEME_STORAGE_KEY = 'muscadeath_admin_theme_override'
const CONFIG_VERSION_KEY = 'muscadeath_admin_config_version'
// Bump this whenever the shape/order of `siteConfig` changes (e.g. nav links
// reordered, new required field) so saved browser overrides from an older
// version of the site don't shadow the new defaults forever.
const CONFIG_VERSION = '6'

/** Drops a saved content override if it predates the current config version. */
function clearStaleOverride() {
  if (window.localStorage.getItem(CONFIG_VERSION_KEY) !== CONFIG_VERSION) {
    window.localStorage.removeItem(CONFIG_STORAGE_KEY)
    window.localStorage.setItem(CONFIG_VERSION_KEY, CONFIG_VERSION)
  }
}

function loadJson<T>(key: string): Partial<T> | null {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as Partial<T>) : null
  } catch {
    return null
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Recursively merges an override on top of a base object. Arrays are replaced wholesale. */
function deepMerge<T>(base: T, override: unknown): T {
  if (!isPlainObject(override) || !isPlainObject(base)) {
    return (override as T) ?? base
  }
  const result: Record<string, unknown> = { ...base }
  for (const key of Object.keys(override)) {
    const baseValue = (base as Record<string, unknown>)[key]
    const overrideValue = override[key]
    result[key] = isPlainObject(baseValue) ? deepMerge(baseValue, overrideValue) : overrideValue
  }
  return result as T
}

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SiteConfig>(() => {
    clearStaleOverride()
    return deepMerge(defaultSiteConfig, loadJson<SiteConfig>(CONFIG_STORAGE_KEY))
  })
  const [themeColors, setThemeColors] = useState<ThemeColors>(() => ({
    ...defaultTheme,
    ...(loadJson<ThemeColors>(THEME_STORAGE_KEY) ?? {}),
  }))
  const [cloudStatus, setCloudStatus] = useState<ConfigContextValue['cloudStatus']>(
    isSupabaseConfigured ? 'loading' : 'disabled',
  )

  // Fetch the published content from Supabase (if configured) so every
  // visitor sees the same live content, regardless of their own browser.
  useEffect(() => {
    if (!supabase) return
    let cancelled = false
    supabase
      .from('site_content')
      .select('data')
      .eq('id', 'main')
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return
        if (error || !data?.data) {
          setCloudStatus('error')
          return
        }
        const remote = data.data as { config?: unknown; theme?: Partial<ThemeColors> }
        if (remote.config) setConfig(deepMerge(defaultSiteConfig, remote.config))
        if (remote.theme) setThemeColors((prev) => ({ ...prev, ...remote.theme }))
        setCloudStatus('synced')
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--color-background', themeColors.background)
    root.style.setProperty('--color-background-alt', themeColors.backgroundAlt)
    root.style.setProperty('--color-surface', themeColors.surface)
    root.style.setProperty('--color-primary', themeColors.primary)
    root.style.setProperty('--color-primary-dark', themeColors.primaryDark)
    root.style.setProperty('--color-secondary', themeColors.secondary)
    root.style.setProperty('--color-text', themeColors.text)
    root.style.setProperty('--color-text-muted', themeColors.textMuted)
    root.style.setProperty('--color-border', themeColors.border)
  }, [themeColors])

  const updateConfig = (patch: Record<string, unknown>) => {
    setConfig((prev) => {
      const next = deepMerge(prev, patch)
      window.localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  const updateTheme = (patch: Partial<ThemeColors>) => {
    setThemeColors((prev) => {
      const next = { ...prev, ...patch }
      window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  const applyThemePreset = (name: string) => {
    const preset = themePresets[name]
    if (!preset) return
    setThemeColors(preset)
    window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(preset))
  }

  const resetAll = () => {
    window.localStorage.removeItem(CONFIG_STORAGE_KEY)
    window.localStorage.removeItem(THEME_STORAGE_KEY)
    setConfig(defaultSiteConfig)
    setThemeColors(defaultTheme)
  }

  const exportJson = () => JSON.stringify({ config, themeColors }, null, 2)

  const publish = async (): Promise<{ ok: boolean; error?: string }> => {
    if (!supabase) {
      return { ok: false, error: "Supabase n'est pas configuré (voir .env.example et le README)." }
    }
    const { error } = await supabase
      .from('site_content')
      .update({ data: { config, theme: themeColors }, updated_at: new Date().toISOString() })
      .eq('id', 'main')
    if (error) {
      setCloudStatus('error')
      return { ok: false, error: error.message }
    }
    setCloudStatus('synced')
    return { ok: true }
  }

  const value = useMemo(
    () => ({
      config,
      themeColors,
      updateConfig,
      updateTheme,
      applyThemePreset,
      resetAll,
      exportJson,
      cloudStatus,
      publish,
    }),
    [config, themeColors, cloudStatus],
  )

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
}
