/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_GOOGLE_MAPS_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Minimal ambient types for the parts of the Google Maps JS API (Places
// library) this project uses, loaded dynamically via a <script> tag.
declare namespace google.maps.places {
  interface PlaceResult {
    formatted_address?: string
    geometry?: { location?: { lat(): number; lng(): number } }
  }

  class Autocomplete {
    constructor(input: HTMLInputElement, options?: Record<string, unknown>)
    addListener(event: 'place_changed', handler: () => void): void
    getPlace(): PlaceResult
  }
}

interface Window {
  google: typeof google
}
