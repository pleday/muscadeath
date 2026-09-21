import { useState } from 'react'
import { useSiteConfig } from '../context/useSiteConfig'

interface JsonSectionProps {
  label: string
  value: unknown
  onApply: (parsed: unknown) => void
}

function JsonSection({ label, value, onApply }: JsonSectionProps) {
  const [text, setText] = useState(() => JSON.stringify(value, null, 2))
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const handleApply = () => {
    try {
      const parsed = JSON.parse(text)
      onApply(parsed)
      setError('')
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    } catch {
      setError('JSON invalide : vérifiez la syntaxe (virgules, guillemets, crochets...).')
    }
  }

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4">
      <p className="text-sm font-semibold text-[var(--color-text)]">{label}</p>
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={10}
        spellCheck={false}
        className="mt-2 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-3 font-mono text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
      />
      {error && <p className="mt-1 text-xs text-[var(--color-primary)]">{error}</p>}
      <button
        type="button"
        onClick={handleApply}
        className="mt-2 rounded-md bg-[var(--color-primary)] px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[var(--color-primary-dark)]"
      >
        {saved ? 'Appliqué ✓' : 'Appliquer'}
      </button>
    </div>
  )
}

/** Raw JSON editors for the remaining list-shaped content that has no dedicated tab. */
export function AdvancedTab() {
  const { config, updateConfig } = useSiteConfig()

  return (
    <div className="space-y-6">
      <p className="text-xs text-[var(--color-text-muted)]">
        Édition avancée au format JSON pour les listes du site qui n'ont pas d'onglet dédié.
        Respectez la structure existante (mêmes clés, mêmes types de valeurs) avant de cliquer
        sur « Appliquer ».
      </p>
      <JsonSection
        label="Tarifs"
        value={config.infos.prices}
        onApply={(parsed) => updateConfig({ infos: { prices: parsed } })}
      />
      <JsonSection
        label="Accès"
        value={config.infos.access}
        onApply={(parsed) => updateConfig({ infos: { access: parsed } })}
      />
      <JsonSection
        label="À savoir"
        value={config.infos.goodToKnow}
        onApply={(parsed) => updateConfig({ infos: { goodToKnow: parsed } })}
      />
      <JsonSection
        label="Fête de la musique (programme)"
        value={config.feteMusique.programme}
        onApply={(parsed) => updateConfig({ feteMusique: { programme: parsed } })}
      />
      <JsonSection
        label="Réseaux sociaux"
        value={config.contact.social}
        onApply={(parsed) => updateConfig({ contact: { social: parsed } })}
      />
    </div>
  )
}
