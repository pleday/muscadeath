import { useSiteConfig } from '../context/useSiteConfig'

/**
 * Persistent full-viewport backdrop (the hero image/color), fixed behind every
 * section so it stays visible through the page as sections scroll over it.
 */
export function SiteBackground() {
  const { config } = useSiteConfig()
  const { hero } = config

  if (hero.backgroundType === 'color') {
    return <div className="fixed inset-0 -z-10" style={{ backgroundColor: hero.backgroundColor }} />
  }

  return (
    <img
      src={hero.backgroundImage}
      alt=""
      aria-hidden="true"
      className="fixed inset-0 -z-10 h-full w-full object-cover"
    />
  )
}
