import { useSiteConfig } from '../context/useSiteConfig'
import { BackgroundTypeField, Field } from './fields'

/** Editable fields for the most frequently changed text content. */
export function ContentTab() {
  const { config, updateConfig } = useSiteConfig()

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h3 className="text-sm font-bold tracking-wide text-[var(--color-primary)] uppercase">Général</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Nom du site"
            value={config.meta.siteName}
            onChange={(value) => updateConfig({ meta: { siteName: value } })}
          />
          <Field
            label="Texte du logo (menu)"
            value={config.nav.logoText}
            onChange={(value) => updateConfig({ nav: { logoText: value } })}
          />
        </div>
        <Field
          label="Accroche"
          value={config.meta.tagline}
          onChange={(value) => updateConfig({ meta: { tagline: value } })}
        />
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-bold tracking-wide text-[var(--color-primary)] uppercase">
          Section Accueil
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Eyebrow (au-dessus du titre)"
            value={config.hero.eyebrow}
            onChange={(value) => updateConfig({ hero: { eyebrow: value } })}
          />
          <Field
            label="Titre principal"
            value={config.hero.title}
            onChange={(value) => updateConfig({ hero: { title: value } })}
          />
        </div>
        <Field
          label="Sous-titre"
          textarea
          value={config.hero.subtitle}
          onChange={(value) => updateConfig({ hero: { subtitle: value } })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Date de l'événement"
            value={config.hero.eventDate}
            onChange={(value) => updateConfig({ hero: { eventDate: value } })}
          />
          <Field
            label="Lieu"
            value={config.hero.eventLocation}
            onChange={(value) => updateConfig({ hero: { eventLocation: value } })}
          />
          <Field
            label="Bouton principal - texte"
            value={config.hero.primaryCta.label}
            onChange={(value) => updateConfig({ hero: { primaryCta: { label: value } } })}
          />
          <Field
            label="Bouton secondaire - texte"
            value={config.hero.secondaryCta.label}
            onChange={(value) => updateConfig({ hero: { secondaryCta: { label: value } } })}
          />
        </div>
        <BackgroundTypeField
          label="Fond de la section"
          backgroundType={config.hero.backgroundType}
          color={config.hero.backgroundColor}
          onTypeChange={(type) => updateConfig({ hero: { backgroundType: type } })}
          onColorChange={(color) => updateConfig({ hero: { backgroundColor: color } })}
        />
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-bold tracking-wide text-[var(--color-primary)] uppercase">
          Section Carnage (association)
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Kicker"
            value={config.about.kicker}
            onChange={(value) => updateConfig({ about: { kicker: value } })}
          />
          <Field
            label="Titre"
            value={config.about.title}
            onChange={(value) => updateConfig({ about: { title: value } })}
          />
        </div>
        <Field
          label="Paragraphes (séparer chaque paragraphe par une ligne vide)"
          textarea
          rows={6}
          value={config.about.paragraphs.join('\n\n')}
          onChange={(value) =>
            updateConfig({ about: { paragraphs: value.split(/\n\s*\n/).filter(Boolean) } })
          }
        />
        <BackgroundTypeField
          label="Fond de la section"
          backgroundType={config.about.backgroundType}
          color={config.about.backgroundColor}
          onTypeChange={(type) => updateConfig({ about: { backgroundType: type } })}
          onColorChange={(color) => updateConfig({ about: { backgroundColor: color } })}
        />
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-bold tracking-wide text-[var(--color-primary)] uppercase">
          Mécènes & partenaires
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Kicker"
            value={config.partners.kicker}
            onChange={(value) => updateConfig({ partners: { kicker: value } })}
          />
          <Field
            label="Titre"
            value={config.partners.title}
            onChange={(value) => updateConfig({ partners: { title: value } })}
          />
        </div>
        <Field
          label="Note"
          value={config.partners.note}
          onChange={(value) => updateConfig({ partners: { note: value } })}
        />
        <p className="text-xs text-[var(--color-text-muted)]">
          La liste des partenaires (nom, logo, lien) se modifie dans l'onglet dédié « Partenaires ».
        </p>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-bold tracking-wide text-[var(--color-primary)] uppercase">
          Fête de la musique
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Kicker"
            value={config.feteMusique.kicker}
            onChange={(value) => updateConfig({ feteMusique: { kicker: value } })}
          />
          <Field
            label="Titre"
            value={config.feteMusique.title}
            onChange={(value) => updateConfig({ feteMusique: { title: value } })}
          />
        </div>
        <Field
          label="Présentation"
          textarea
          value={config.feteMusique.presentation}
          onChange={(value) => updateConfig({ feteMusique: { presentation: value } })}
        />
        <p className="text-xs text-[var(--color-text-muted)]">
          Le programme (horaires) se modifie dans l'onglet Avancé. Le texte et les affiches de
          l'historique de la Fête de la musique se modifient dans l'onglet « Historique(s) ».
        </p>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-bold tracking-wide text-[var(--color-primary)] uppercase">
          Programmation
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Kicker"
            value={config.lineup.kicker}
            onChange={(value) => updateConfig({ lineup: { kicker: value } })}
          />
          <Field
            label="Titre"
            value={config.lineup.title}
            onChange={(value) => updateConfig({ lineup: { title: value } })}
          />
        </div>
        <Field
          label="Note"
          value={config.lineup.note}
          onChange={(value) => updateConfig({ lineup: { note: value } })}
        />
        <p className="text-xs text-[var(--color-text-muted)]">
          La liste des groupes se modifie dans l'onglet dédié « Programmation ».
        </p>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-bold tracking-wide text-[var(--color-primary)] uppercase">Galerie</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Kicker"
            value={config.gallery.kicker}
            onChange={(value) => updateConfig({ gallery: { kicker: value } })}
          />
          <Field
            label="Titre"
            value={config.gallery.title}
            onChange={(value) => updateConfig({ gallery: { title: value } })}
          />
        </div>
        <p className="text-xs text-[var(--color-text-muted)]">
          Les photos se modifient dans l'onglet dédié « Galerie ».
        </p>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-bold tracking-wide text-[var(--color-primary)] uppercase">
          Infos pratiques
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Dates"
            value={config.infos.dates}
            onChange={(value) => updateConfig({ infos: { dates: value } })}
          />
          <Field
            label="Horaires"
            value={config.infos.schedule}
            onChange={(value) => updateConfig({ infos: { schedule: value } })}
          />
        </div>
        <Field
          label="Adresse"
          value={config.infos.address}
          onChange={(value) => updateConfig({ infos: { address: value } })}
        />
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-bold tracking-wide text-[var(--color-primary)] uppercase">Contact</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Téléphone"
            value={config.contact.phone}
            onChange={(value) => updateConfig({ contact: { phone: value } })}
          />
          <Field
            label="Email"
            value={config.contact.email}
            onChange={(value) => updateConfig({ contact: { email: value } })}
          />
        </div>
        <Field
          label="Adresse"
          value={config.contact.address}
          onChange={(value) => updateConfig({ contact: { address: value } })}
        />
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-bold tracking-wide text-[var(--color-primary)] uppercase">
          Pied de page
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Nom de l'association"
            value={config.footer.associationName}
            onChange={(value) => updateConfig({ footer: { associationName: value } })}
          />
          <Field
            label="Crédits"
            value={config.footer.credits}
            onChange={(value) => updateConfig({ footer: { credits: value } })}
          />
        </div>
      </section>
    </div>
  )
}
