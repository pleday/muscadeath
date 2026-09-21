export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

/** True once VITE_GOOGLE_MAPS_API_KEY is set (see .env.example). */
export const isGoogleMapsConfigured = Boolean(GOOGLE_MAPS_API_KEY)

let loadPromise: Promise<typeof google> | null = null

/** Loads the Google Maps JavaScript API (Places library) once, and reuses it on subsequent calls. */
export function loadGoogleMaps(): Promise<typeof google> {
  if (!isGoogleMapsConfigured) {
    return Promise.reject(new Error('VITE_GOOGLE_MAPS_API_KEY is not configured.'))
  }
  if (loadPromise) return loadPromise

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-google-maps]')
    if (existing) {
      existing.addEventListener('load', () => resolve(window.google))
      existing.addEventListener('error', reject)
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`
    script.async = true
    script.dataset.googleMaps = 'true'
    script.onload = () => resolve(window.google)
    script.onerror = reject
    document.head.appendChild(script)
  })

  return loadPromise
}
