/** Reads a File as a base64 data URL, for client-side image uploads with no backend. */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const MAX_IMAGE_DIMENSION = 1600
const IMAGE_QUALITY = 0.82
// Below this size, re-encoding wouldn't meaningfully help, so skip it.
const SKIP_RESIZE_BELOW_BYTES = 400_000

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

/**
 * Reads an uploaded image file for use in the site config, downscaling and
 * re-encoding large photos so a single upload can't blow past the browser's
 * localStorage quota (which used to crash the admin panel on bigger files).
 * SVGs are returned as-is since they're already lightweight and vector-based.
 */
export async function readImageFileForUpload(file: File): Promise<string> {
  const originalDataUrl = await readFileAsDataUrl(file)

  if (file.type === 'image/svg+xml' || file.size < SKIP_RESIZE_BELOW_BYTES) {
    return originalDataUrl
  }

  try {
    const image = await loadImage(originalDataUrl)
    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(image.width, image.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(image.width * scale))
    canvas.height = Math.max(1, Math.round(image.height * scale))
    const ctx = canvas.getContext('2d')
    if (!ctx) return originalDataUrl
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', IMAGE_QUALITY)
  } catch {
    // If anything goes wrong (unsupported format, canvas taint...), fall back
    // to the original file rather than blocking the upload entirely.
    return originalDataUrl
  }
}
