interface SectionTitleProps {
  kicker?: string
  title: string
  align?: 'left' | 'center'
  light?: boolean
}

/** Consistent "kicker + heading" block reused across every section. */
export function SectionTitle({ kicker, title, align = 'center', light }: SectionTitleProps) {
  return (
    <div className={align === 'center' ? 'text-center' : 'text-left'}>
      {kicker && (
        <p className="mb-2 text-sm font-semibold tracking-[0.2em] uppercase text-[var(--color-secondary)]">
          {kicker}
        </p>
      )}
      <h2
        style={{ fontFamily: 'var(--font-display)' }}
        className={
          'text-3xl sm:text-4xl font-bold tracking-wide ' +
          (light ? 'text-[var(--color-text)]' : 'text-[var(--color-text)]')
        }
      >
        {title}
      </h2>
    </div>
  )
}
