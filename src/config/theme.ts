/**
 * Theme configuration.
 *
 * This is the ONLY file you need to edit to change the color palette of the
 * whole website. Pick one of the existing presets below by changing
 * `ACTIVE_THEME`, or edit the hex values directly / add your own preset.
 *
 * Colors are applied as CSS custom properties on `:root` (see src/main.tsx),
 * so every component automatically follows the chosen palette.
 */

export interface ThemeColors {
  /** Main page background */
  background: string
  /** Slightly different background used for alternating sections */
  backgroundAlt: string
  /** Cards, panels, header background */
  surface: string
  /** Main brand color (buttons, links, highlights) */
  primary: string
  /** Darker shade of primary, used for hover states */
  primaryDark: string
  /** Secondary accent color (badges, small highlights) */
  secondary: string
  /** Main text color */
  text: string
  /** Muted / secondary text color */
  textMuted: string
  /** Borders and dividers */
  border: string
}

export const themePresets: Record<string, ThemeColors> = {
  // Default: black & stone-grey with a blood-red accent, matching the
  // festival's skull emblem (carved stone ring, dripping red lettering).
  'muscadet-metal': {
    background: '#0a0a0b',
    backgroundAlt: '#121213',
    surface: '#19181a',
    primary: '#b8101c',
    primaryDark: '#7a0a12',
    secondary: '#9a9a9c',
    text: '#f2f1f0',
    textMuted: '#9c9a9d',
    border: '#2a292b',
  },
  // Toxic green alternative, common in metal / punk visuals.
  'toxic-green': {
    background: '#0a0f0c',
    backgroundAlt: '#101613',
    surface: '#161d19',
    primary: '#7ee81f',
    primaryDark: '#5aad12',
    secondary: '#e0a63d',
    text: '#f2f7f3',
    textMuted: '#9db3a3',
    border: '#232c27',
  },
  // Purple night alternative.
  'purple-night': {
    background: '#0d0a14',
    backgroundAlt: '#130f1c',
    surface: '#1a1424',
    primary: '#8b3bff',
    primaryDark: '#5f24b8',
    secondary: '#ff5c8a',
    text: '#f4f1f8',
    textMuted: '#a89fb5',
    border: '#251c31',
  },
}

/** Change this key to switch the whole site's color scheme. */
export const ACTIVE_THEME: keyof typeof themePresets = 'muscadet-metal'

export const theme = themePresets[ACTIVE_THEME]
