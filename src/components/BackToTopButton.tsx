import { useEffect, useState } from 'react'

/** Floating button that appears after scrolling down and smoothly scrolls back to the top. */
export function BackToTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Retour en haut de la page"
      className="fixed bottom-6 left-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-lg transition-colors hover:bg-[var(--color-primary-dark)]"
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}
