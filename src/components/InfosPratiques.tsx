import { useSiteConfig } from '../context/useSiteConfig'
import { GOOGLE_MAPS_API_KEY, isGoogleMapsConfigured } from '../lib/googleMaps'
import { ClockIcon, PinIcon } from './icons'
import { SectionTitle } from './SectionTitle'

function getMapEmbedUrl(address: string, location: { lat: number; lng: number } | null) {
  if (isGoogleMapsConfigured) {
    // Official Maps Embed API: precise coordinates when available, else the address text.
    const query = location ? `${location.lat},${location.lng}` : address
    return `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(query)}`
  }
  // Keyless fallback embed.
  return `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`
}

export function InfosPratiques() {
  const { config } = useSiteConfig()
  const { infos } = config

  return (
    <section id="infos" className="bg-[var(--color-background)]/90 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionTitle kicker={infos.kicker} title={infos.title} />

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
              <div className="flex items-start gap-3">
                <ClockIcon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-primary)]" />
                <div>
                  <p className="font-semibold text-[var(--color-text)]">{infos.dates}</p>
                  <p className="text-sm text-[var(--color-text-muted)]">{infos.schedule}</p>
                </div>
              </div>
              <div className="mt-4 flex items-start gap-3">
                <PinIcon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-primary)]" />
                <p className="text-sm text-[var(--color-text-muted)]">{infos.address}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {infos.prices.map((price) => (
                <div
                  key={price.label}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-center"
                >
                  <p className="text-2xl font-extrabold text-[var(--color-primary)]">{price.price}</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">{price.label}</p>
                  {price.description && (
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">{price.description}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
              <p className="mb-3 text-sm font-semibold text-[var(--color-text)]">Accès</p>
              <ul className="space-y-2">
                {infos.access.map((item) => (
                  <li key={item.label} className="text-sm text-[var(--color-text-muted)]">
                    <span className="font-semibold text-[var(--color-text)]">{item.label} : </span>
                    {item.detail}
                  </li>
                ))}
              </ul>
            </div>

            {infos.goodToKnow.length > 0 && (
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
                <p className="mb-3 text-sm font-semibold text-[var(--color-text)]">À savoir</p>
                <ul className="list-inside list-disc space-y-2">
                  {infos.goodToKnow.map((tip, index) => (
                    <li key={index} className="text-sm text-[var(--color-text-muted)]">
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-xl border border-[var(--color-border)]">
            <iframe
              title="Localisation du festival"
              src={getMapEmbedUrl(infos.address, infos.location)}
              className="h-full min-h-[400px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
