import type { ChangeEvent } from 'react'

interface FieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  textarea?: boolean
  rows?: number
}

const inputClass =
  'mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-text)] outline-none transition-colors focus:border-[var(--color-primary)]'

/** Labeled text input/textarea used throughout the admin forms. */
export function Field({ label, value, onChange, textarea, rows = 3 }: FieldProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    onChange(event.target.value)

  return (
    <label className="block">
      <span className="text-xs font-semibold tracking-wide text-[var(--color-text-muted)] uppercase">
        {label}
      </span>
      {textarea ? (
        <textarea value={value} onChange={handleChange} rows={rows} className={inputClass} />
      ) : (
        <input value={value} onChange={handleChange} className={inputClass} />
      )}
    </label>
  )
}

interface ColorFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
}

/** Color picker + hex input pair used in the theme editor. */
export function ColorField({ label, value, onChange }: ColorFieldProps) {
  return (
    <label className="block">
      <span className="text-xs font-semibold tracking-wide text-[var(--color-text-muted)] uppercase">
        {label}
      </span>
      <div className="mt-1 flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 w-9 shrink-0 cursor-pointer rounded border border-[var(--color-border)] bg-transparent p-1"
        />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
        />
      </div>
    </label>
  )
}

interface BackgroundTypeFieldProps {
  label: string
  backgroundType: 'image' | 'color'
  color: string
  onTypeChange: (type: 'image' | 'color') => void
  onColorChange: (color: string) => void
}

/**
 * Toggle between "image" (replace the actual file from the Médiathèque tab) and "flat color"
 * for a section background. Only the color needs an input here; the image itself lives in the
 * Médiathèque so there is a single place to manage fixed images.
 */
export function BackgroundTypeField({
  label,
  backgroundType,
  color,
  onTypeChange,
  onColorChange,
}: BackgroundTypeFieldProps) {
  return (
    <div>
      <span className="text-xs font-semibold tracking-wide text-[var(--color-text-muted)] uppercase">
        {label}
      </span>
      <div className="mt-1 flex gap-2">
        <button
          type="button"
          onClick={() => onTypeChange('image')}
          className={
            'rounded-full px-3 py-1 text-xs font-semibold transition-colors ' +
            (backgroundType === 'image'
              ? 'bg-[var(--color-primary)] text-white'
              : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]')
          }
        >
          Image (voir Médiathèque)
        </button>
        <button
          type="button"
          onClick={() => onTypeChange('color')}
          className={
            'rounded-full px-3 py-1 text-xs font-semibold transition-colors ' +
            (backgroundType === 'color'
              ? 'bg-[var(--color-primary)] text-white'
              : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]')
          }
        >
          Couleur unie
        </button>
      </div>
      {backgroundType === 'color' && (
        <div className="mt-3">
          <ColorField label="Couleur de fond" value={color} onChange={onColorChange} />
        </div>
      )}
    </div>
  )
}
