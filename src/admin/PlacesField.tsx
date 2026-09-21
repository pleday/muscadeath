import { useEffect, useRef, useState } from 'react'
import { isGoogleMapsConfigured, loadGoogleMaps } from '../lib/googleMaps'
import { Field } from './fields'

interface PlacesFieldProps {
  label: string
  value: string
  onChange: (address: string, location: { lat: number; lng: number } | null) => void
}

/**
 * Address input backed by Google Places Autocomplete when configured, so the
 * stored address is always a real, geocodable location (used for the map).
 * Falls back to a plain text field when VITE_GOOGLE_MAPS_API_KEY isn't set.
 */
export function PlacesField({ label, value, onChange }: PlacesFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!isGoogleMapsConfigured) return
    let cancelled = false

    loadGoogleMaps()
      .then((maps) => {
        if (cancelled || !inputRef.current) return
        const autocomplete = new maps.maps.places.Autocomplete(inputRef.current, {
          fields: ['formatted_address', 'geometry'],
        })
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace()
          const location = place.geometry?.location
          onChange(place.formatted_address ?? inputRef.current!.value, location ? { lat: location.lat(), lng: location.lng() } : null)
        })
        setReady(true)
      })
      .catch(() => setError(true))

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!isGoogleMapsConfigured) {
    return <Field label={label} value={value} onChange={(next) => onChange(next, null)} />
  }

  return (
    <label className="block">
      <span className="text-xs font-semibold tracking-wide text-[var(--color-text-muted)] uppercase">
        {label}
      </span>
      <input
        ref={inputRef}
        defaultValue={value}
        onChange={(event) => onChange(event.target.value, null)}
        placeholder="Commencez à taper une adresse..."
        className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-text)] outline-none transition-colors focus:border-[var(--color-primary)]"
      />
      {error && (
        <span className="mt-1 block text-xs text-[var(--color-primary)]">
          Impossible de charger Google Maps, vérifiez la clé API.
        </span>
      )}
      {!error && (
        <span className="mt-1 block text-xs text-[var(--color-text-muted)]">
          {ready ? 'Choisissez une adresse dans les suggestions Google Maps.' : 'Chargement de Google Maps...'}
        </span>
      )}
    </label>
  )
}
