import { themePresets, type ThemeColors } from '../config/theme'
import { useSiteConfig } from '../context/useSiteConfig'
import { ColorField } from './fields'

const colorLabels: { key: keyof ThemeColors; label: string }[] = [
  { key: 'background', label: 'Fond principal' },
  { key: 'backgroundAlt', label: 'Fond alterné' },
  { key: 'surface', label: 'Cartes / panneaux' },
  { key: 'primary', label: 'Couleur principale' },
  { key: 'primaryDark', label: 'Couleur principale (survol)' },
  { key: 'secondary', label: 'Couleur secondaire' },
  { key: 'text', label: 'Texte' },
  { key: 'textMuted', label: 'Texte atténué' },
  { key: 'border', label: 'Bordures' },
]

export function ThemeTab() {
  const { themeColors, updateTheme, applyThemePreset } = useSiteConfig()

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h3 className="text-sm font-bold tracking-wide text-[var(--color-primary)] uppercase">
          Thèmes prédéfinis
        </h3>
        <div className="flex flex-wrap gap-2">
          {Object.keys(themePresets).map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => applyThemePreset(name)}
              className="rounded-full border border-[var(--color-border)] px-4 py-1.5 text-sm text-[var(--color-text)] transition-colors hover:border-[var(--color-primary)]"
            >
              {name}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-bold tracking-wide text-[var(--color-primary)] uppercase">
          Couleurs personnalisées
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {colorLabels.map(({ key, label }) => (
            <ColorField
              key={key}
              label={label}
              value={themeColors[key]}
              onChange={(value) => updateTheme({ [key]: value })}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
