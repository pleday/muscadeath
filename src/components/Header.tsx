import { useEffect, useState } from 'react'
import { useSiteConfig } from '../context/useSiteConfig'
import { useCart } from '../context/useCart'
import { CartIcon, CloseIcon, MenuIcon } from './icons'

export function Header() {
  const { config } = useSiteConfig()
  const { totalItems, toggle: toggleCart } = useCart()
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={
        'fixed inset-x-0 top-0 z-50 transition-colors duration-300 ' +
        (isScrolled
          ? 'bg-[var(--color-surface)]/95 backdrop-blur border-b border-[var(--color-border)]'
          : 'bg-transparent')
      }
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a
          href="#accueil"
          style={{ fontFamily: 'var(--font-logo)' }}
          className="text-2xl tracking-[0.05em] text-[var(--color-primary)]"
        >
          {config.nav.logoText}
        </a>

        <nav className="hidden lg:flex items-center gap-5 xl:gap-7">
          {config.nav.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="whitespace-nowrap text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={toggleCart}
            aria-label="Ouvrir le panier"
            className="relative text-[var(--color-text)] transition-colors hover:text-[var(--color-primary)]"
          >
            <CartIcon className="h-6 w-6" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-primary)] text-[10px] font-semibold text-white">
                {totalItems}
              </span>
            )}
          </button>

          <button
            type="button"
            className="lg:hidden text-[var(--color-text)]"
            aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            onClick={() => setIsOpen((v) => !v)}
          >
            {isOpen ? <CloseIcon className="h-7 w-7" /> : <MenuIcon className="h-7 w-7" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <nav className="lg:hidden flex flex-col gap-1 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-4">
          {config.nav.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="rounded-md px-2 py-2 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-background-alt)] hover:text-[var(--color-primary)]"
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}
