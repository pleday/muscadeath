import { Link } from 'react-router-dom'
import { useSiteConfig } from '../context/useSiteConfig'

export function Footer() {
  const { config } = useSiteConfig()
  const { footer, nav } = config

  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-background)]/90 px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 text-center">
        <p className="text-sm font-semibold text-[var(--color-text)]">{footer.associationName}</p>

        <nav className="flex flex-wrap justify-center gap-4">
          {nav.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <p className="text-xs text-[var(--color-text-muted)]">{footer.credits}</p>

        {/* Discreet entry point to the admin page, kept out of the main navigation. */}
        <Link
          to="/admin"
          aria-label="Administration du site"
          className="text-[10px] text-[var(--color-text-muted)] opacity-30 transition-opacity hover:opacity-70"
        >
          ⚙
        </Link>
      </div>
    </footer>
  )
}
