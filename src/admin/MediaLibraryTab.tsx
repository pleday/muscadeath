import { useState, type ChangeEvent } from 'react'
import { useSiteConfig } from '../context/useSiteConfig'
import { readImageFileForUpload } from '../lib/file'

interface FixedImageSlot {
  key: string
  label: string
  get: (config: ReturnType<typeof useSiteConfig>['config']) => string
  patch: (dataUrl: string) => Record<string, unknown>
}

// Only "fixed" single-image slots: images that always exist exactly once and
// are not part of an addable/removable list (those have their own dedicated
// tab — Actualités, Programmation, Historique(s), Boutique, Galerie,
// Partenaires — where images are managed alongside add/reorder/delete).
const FIXED_IMAGE_SLOTS: FixedImageSlot[] = [
  {
    key: 'hero-logo',
    label: 'Accueil — Logo / badge',
    get: (config) => config.hero.logoImage,
    patch: (dataUrl) => ({ hero: { logoImage: dataUrl } }),
  },
  {
    key: 'hero-background',
    label: 'Accueil — Image de fond',
    get: (config) => config.hero.backgroundImage,
    patch: (dataUrl) => ({ hero: { backgroundImage: dataUrl } }),
  },
  {
    key: 'about-image',
    label: 'Carnage (association) — Image',
    get: (config) => config.about.image,
    patch: (dataUrl) => ({ about: { image: dataUrl } }),
  },
]

/** Lists the site's fixed (non-list) images and lets you upload a replacement for any of them. */
export function MediaLibraryTab() {
  const { config, updateConfig } = useSiteConfig()
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)

  const handleUpload = async (slot: FixedImageSlot, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploadingKey(slot.key)
    const dataUrl = await readImageFileForUpload(file)
    updateConfig(slot.patch(dataUrl))
    setUploadingKey(null)
  }

  return (
    <div className="space-y-6">
      <p className="text-xs text-[var(--color-text-muted)]">
        Images fixes du site (une seule occurrence chacune). Pour les listes d'images
        (actualités, programmation, historique(s), boutique, galerie, partenaires), utilisez
        l'onglet dédié correspondant : vous pouvez y ajouter, réordonner et supprimer des
        éléments, pas seulement remplacer une image.
      </p>

      <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-4">
        {FIXED_IMAGE_SLOTS.map((slot) => (
          <div
            key={slot.key}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-3"
          >
            <div className="aspect-square overflow-hidden rounded-md border border-[var(--color-border)]">
              <img src={slot.get(config)} alt="" className="h-full w-full object-cover" />
            </div>
            <p className="mt-2 text-xs text-[var(--color-text)]">{slot.label}</p>
            <label className="mt-1 block cursor-pointer text-center text-[10px] font-semibold text-[var(--color-primary)] underline">
              {uploadingKey === slot.key ? 'Envoi...' : 'Remplacer'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => handleUpload(slot, event)}
              />
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}
