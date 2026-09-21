import type { GalleryImage } from '../config/site.config'
import { useSiteConfig } from '../context/useSiteConfig'
import { readImageFileForUpload } from '../lib/file'
import { Field } from './fields'

const emptyImage: GalleryImage = { src: '/images/gallery-1.svg', alt: 'Nouvelle photo' }

/** Add/edit/reorder/delete UI for the "Galerie" photos — no JSON editing required. */
export function GalleryTab() {
  const { config, updateConfig } = useSiteConfig()
  const images = config.gallery.images

  const setImages = (next: GalleryImage[]) => updateConfig({ gallery: { images: next } })

  const updateImage = (index: number, patch: Partial<GalleryImage>) => {
    setImages(images.map((image, i) => (i === index ? { ...image, ...patch } : image)))
  }

  const removeImage = (index: number) => {
    if (window.confirm('Supprimer cette photo ?')) {
      setImages(images.filter((_, i) => i !== index))
    }
  }

  const addImage = () => setImages([{ ...emptyImage }, ...images])

  const moveImage = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= images.length) return
    const next = [...images]
    const [moved] = next.splice(index, 1)
    next.splice(target, 0, moved)
    setImages(next)
  }

  const handleImageUpload = async (index: number, file: File) => {
    const dataUrl = await readImageFileForUpload(file)
    updateImage(index, { src: dataUrl })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-[var(--color-text-muted)]">
          Ajoutez, réordonnez ou supprimez les photos de la galerie.
        </p>
        <button
          type="button"
          onClick={addImage}
          className="shrink-0 rounded-md bg-[var(--color-primary)] px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[var(--color-primary-dark)]"
        >
          + Ajouter une photo
        </button>
      </div>

      {images.length === 0 && (
        <p className="rounded-lg border border-dashed border-[var(--color-border)] p-6 text-center text-sm text-[var(--color-text-muted)]">
          Aucune photo pour le moment.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image, index) => (
          <div
            key={index}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4"
          >
            <div className="aspect-[4/3] overflow-hidden rounded-md border border-[var(--color-border)]">
              <img src={image.src} alt="" className="h-full w-full object-cover" />
            </div>
            <label className="mt-2 block cursor-pointer text-center text-[10px] font-semibold text-[var(--color-text)] underline">
              Changer l'image
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) handleImageUpload(index, file)
                }}
              />
            </label>
            <div className="mt-3">
              <Field
                label="Description (texte alternatif)"
                value={image.alt}
                onChange={(value) => updateImage(index, { alt: value })}
              />
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => moveImage(index, -1)}
                disabled={index === 0}
                aria-label="Monter"
                className="rounded-md border border-[var(--color-border)] px-3 py-1 text-xs text-[var(--color-text)] transition-colors hover:border-[var(--color-primary)] disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveImage(index, 1)}
                disabled={index === images.length - 1}
                aria-label="Descendre"
                className="rounded-md border border-[var(--color-border)] px-3 py-1 text-xs text-[var(--color-text)] transition-colors hover:border-[var(--color-primary)] disabled:opacity-30"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="rounded-md border border-[var(--color-primary)] px-3 py-1 text-xs font-semibold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)] hover:text-white"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
