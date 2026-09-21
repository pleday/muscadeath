import { useSiteConfig } from '../context/useSiteConfig'
import { FacebookIcon, InstagramIcon, MailIcon, PhoneIcon, PinIcon, YoutubeIcon } from './icons'
import { SectionTitle } from './SectionTitle'

const socialIcons = {
  facebook: FacebookIcon,
  youtube: YoutubeIcon,
  instagram: InstagramIcon,
}

export function Contact() {
  const { config } = useSiteConfig()
  const { contact } = config

  return (
    <section id="contact" className="bg-[var(--color-background-alt)]/90 px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <SectionTitle kicker={contact.kicker} title={contact.title} />

        <div className="mt-12 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
          <ul className="space-y-4">
            <li className="flex items-center gap-3 text-[var(--color-text)]">
              <PinIcon className="h-5 w-5 shrink-0 text-[var(--color-primary)]" />
              {contact.address}
            </li>
            <li className="flex items-center gap-3 text-[var(--color-text)]">
              <PhoneIcon className="h-5 w-5 shrink-0 text-[var(--color-primary)]" />
              <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="hover:text-[var(--color-primary)]">
                {contact.phone}
              </a>
            </li>
            <li className="flex items-center gap-3 text-[var(--color-text)]">
              <MailIcon className="h-5 w-5 shrink-0 text-[var(--color-primary)]" />
              <a href={`mailto:${contact.email}`} className="hover:text-[var(--color-primary)]">
                {contact.email}
              </a>
            </li>
          </ul>

          <div className="mt-8 flex justify-center gap-4 border-t border-[var(--color-border)] pt-6">
            {contact.social.map((social) => {
              const Icon = socialIcons[social.icon]
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={social.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                >
                  <Icon className="h-5 w-5" />
                </a>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
