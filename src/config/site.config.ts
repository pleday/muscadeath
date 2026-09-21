/**
 * Site content configuration.
 *
 * Edit this file to change ALL the text content, contact info, lineup,
 * gallery images, etc. of the website without touching any component code.
 *
 * Images: put your files in the `public/images/` folder and reference them
 * here with a path starting with `/images/...`.
 */

export interface NavLink {
  label: string
  href: string
}

export interface Artist {
  name: string
  genre: string
  day: string
  /** Passage time on stage, e.g. "21:30", used for the running order. */
  time: string
  image: string
}

export interface LineupYear {
  year: string
  artists: Artist[]
}

export interface PriceOption {
  label: string
  price: string
  description?: string
}

export interface NewsItem {
  date: string
  title: string
  excerpt: string
  image: string
}

export interface MerchItem {
  /** Stable identifier used by the cart/checkout, keep it unique and unchanged once orders exist. */
  id: string
  name: string
  /** Price in euros (e.g. 20 for 20 €). */
  price: number
  image: string
  description: string
  /** Comma-separated size options, or '' if the item has no size choice. */
  sizes: string
  /** false = épuisé / plus disponible à la précommande */
  available: boolean
}

export interface GalleryImage {
  src: string
  alt: string
}

export interface SocialLink {
  label: string
  href: string
  icon: 'facebook' | 'youtube' | 'instagram'
}

export interface PosterItem {
  /** Edition number in roman numerals, e.g. "XXIV". */
  edition: string
  image: string
}

export interface FeteMusiqueSlot {
  time: string
  act: string
}

export interface FeteMusiquePoster {
  year: string
  image: string
}

export interface PartnerItem {
  name: string
  logo: string
  url: string
}

/** Converts an integer to a roman numeral, e.g. 24 -> "XXIV" (used for the poster gallery). */
function toRoman(num: number): string {
  const numerals: [number, string][] = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ]
  let remaining = num
  let result = ''
  for (const [value, symbol] of numerals) {
    while (remaining >= value) {
      result += symbol
      remaining -= value
    }
  }
  return result
}

export const siteConfig = {
  meta: {
    siteName: 'Muscadeath',
    tagline: 'Festival de Metal - Vallet, au cœur du vignoble Nantais',
  },

  nav: {
    logoText: 'MUSCADEATH',
    links: [
      { label: 'Accueil', href: '#accueil' },
      { label: 'Actualités', href: '#actualites' },
      { label: 'Programmation', href: '#programmation' },
      { label: 'Historique', href: '#historique' },
      { label: 'Fête de la musique', href: '#fete-de-la-musique' },
      { label: 'Boutique', href: '#boutique' },
      { label: "L'association", href: '#a-propos' },
      { label: 'Infos', href: '#infos' },
      { label: 'Contact', href: '#contact' },
    ] as NavLink[],
  },

  hero: {
    eyebrow: 'Prochaine édition',
    title: 'MUSCADEATH FESTIVAL',
    subtitle:
      'Deux jours de metal sous le soleil du vignoble : concerts, camping, bar associatif et bonne ambiance à Vallet (44).',
    eventDate: 'Rendez-vous en 2027',
    eventLocation: 'Vallet, Loire-Atlantique',
    primaryCta: { label: 'Billetterie', href: '#infos' },
    secondaryCta: { label: 'Voir la programmation', href: '#programmation' },
    // Logo/badge image displayed above the title on the homepage.
    logoImage: '/images/hero-logo.svg',
    // 'image' shows backgroundImage, 'color' shows a flat backgroundColor instead.
    backgroundType: 'image' as 'image' | 'color',
    backgroundImage: '/images/hero-background.svg',
    backgroundColor: '#19181a',
  },

  about: {
    title: 'Carnage',
    kicker: "L'association derrière Muscadeath",
    paragraphs: [
      "Carnage est l'association loi 1901 qui organise le festival Muscadeath ainsi qu'une scène ouverte pour la Fête de la Musique. Née de l'envie d'une bande de passionnés de faire vivre la scène metal locale, l'association rassemble aujourd'hui une équipe de bénévoles qui prépare l'événement toute l'année.",
      "L'ensemble des bénéfices sert à financer l'édition suivante et à soutenir les musiciens de la région. Ambiance conviviale, camping sur place, restauration et bar associatif garantissent un week-end inoubliable, dans le respect de l'esprit associatif et bénévole qui anime Carnage depuis toujours.",
    ],
    stats: [
      { value: '10+', label: 'éditions organisées' },
      { value: '80+', label: 'groupes accueillis' },
      { value: '100%', label: 'bénévole & associatif' },
    ],
    // 'image' shows the image below, 'color' shows a flat backgroundColor instead.
    backgroundType: 'image' as 'image' | 'color',
    image: '/images/about.svg',
    backgroundColor: '#19181a',
  },

  partners: {
    title: 'Mécènes & partenaires',
    kicker: "Ils soutiennent l'association Carnage",
    note: "Liste d'exemple : mettez-la à jour dans src/config/site.config.ts avec vos vrais partenaires et mécènes.",
    items: [
      { name: 'Mairie de Vallet', logo: '/images/partner-placeholder.svg', url: '' },
      { name: 'Cave coopérative locale', logo: '/images/partner-placeholder.svg', url: '' },
      { name: 'Bar Le Repaire', logo: '/images/partner-placeholder.svg', url: '' },
      { name: 'Radio locale', logo: '/images/partner-placeholder.svg', url: '' },
    ] as PartnerItem[],
  },

  lineup: {
    title: 'Programmation',
    kicker: 'Prog 2027 et running order',
    note: 'La programmation ci-dessous est un exemple : mettez-la à jour dans src/config/site.config.ts dès que votre affiche est confirmée.',
    years: [
      {
        year: '2027',
        artists: [
          { name: 'À annoncer', genre: 'Death Metal', day: 'Vendredi', time: '19:00', image: '/images/artist-placeholder.svg' },
          { name: 'À annoncer', genre: 'Thrash Metal', day: 'Vendredi', time: '21:00', image: '/images/artist-placeholder.svg' },
          { name: 'À annoncer', genre: 'Black Metal', day: 'Samedi', time: '19:30', image: '/images/artist-placeholder.svg' },
          { name: 'À annoncer', genre: 'Groove Metal', day: 'Samedi', time: '21:30', image: '/images/artist-placeholder.svg' },
        ],
      },
    ] as LineupYear[],
  },

  historique: {
    title: 'Historique',
    kicker: 'Depuis quand fait-on du bruit à Vallet ?',
    intro:
      "L'histoire du festival Muscadeath, affiche après affiche. Remplacez ces visuels d'exemple par les vraies affiches de chaque édition dans public/images/ (voir le README).",
    // Most recent edition first, like the "Affiches" page of the original site.
    posters: Array.from({ length: 24 }, (_, i) => 24 - i).map((edition) => ({
      edition: toRoman(edition),
      image: '/images/poster-placeholder.svg',
    })) as PosterItem[],
  },

  feteMusique: {
    title: 'Fête de la Musique',
    kicker: 'Un rendez-vous gratuit et ouvert à tous',
    presentation:
      "Chaque 21 juin, l'association Carnage organise également une scène ouverte à Vallet à l'occasion de la Fête de la Musique : concerts gratuits, tremplin pour les groupes locaux et ambiance conviviale, dans un tout autre esprit que Muscadeath.",
    programme: [
      { time: '18:00', act: 'Scène ouverte - groupes locaux' },
      { time: '20:00', act: 'Groupe invité' },
      { time: '22:00', act: 'Set DJ' },
    ] as FeteMusiqueSlot[],
    historiqueIntro:
      "Née en marge de Muscadeath, la Fête de la Musique de l'association existe depuis plusieurs éditions. Remplacez ces visuels d'exemple par les vraies affiches de chaque année dans public/images/ (voir le README).",
    // Most recent year first, like the "Historique" page of the original site.
    historiquePosters: [
      { year: '2025', image: '/images/poster-placeholder.svg' },
      { year: '2024', image: '/images/poster-placeholder.svg' },
      { year: '2023', image: '/images/poster-placeholder.svg' },
      { year: '2022', image: '/images/poster-placeholder.svg' },
      { year: '2019', image: '/images/poster-placeholder.svg' },
      { year: '2018', image: '/images/poster-placeholder.svg' },
    ] as FeteMusiquePoster[],
  },

  infos: {
    title: 'Infos',
    kicker: 'Billetterie, dates, lieu et à savoir',
    dates: 'Rendez-vous en 2027',
    address: '6 rue de l’Ormoie, 44330 Vallet, France',
    // Set automatically when the address is picked from Google Places
    // suggestions in the admin; used for a precise map instead of a text search.
    location: null as { lat: number; lng: number } | null,
    schedule: 'Ouverture des portes le vendredi 18h - Fermeture du site le dimanche midi',
    prices: [
      { label: 'Pass 2 jours', price: '35 €', description: 'Accès complet vendredi et samedi' },
      { label: 'Pass 1 jour', price: '20 €', description: 'Au choix vendredi ou samedi' },
      { label: 'Camping', price: 'Gratuit', description: 'Sur place, sur présentation du pass' },
    ] as PriceOption[],
    access: [
      { label: 'En voiture', detail: 'Parking gratuit sur place, à 20 min de Nantes' },
      { label: 'En train', detail: 'Gare de Vallet, puis 15 min à pied' },
      { label: 'Camping', detail: 'Espace camping gratuit et surveillé sur le site du festival' },
    ],
    goodToKnow: [
      "Festival en plein air : prévoyez de quoi vous protéger de la pluie et du soleil.",
      "Animaux non admis sur le site, sauf chiens guides d'assistance.",
      "Entrées et sorties libres pendant toute la durée du festival pour les détenteurs d'un pass.",
      "Bar associatif sur place, paiement par carte et espèces accepté.",
    ],
  },

  merch: {
    title: 'Boutique',
    kicker: 'Précommandez vos souvenirs du festival',
    note: "Les articles précommandés et payés en ligne sont à récupérer directement sur place, au stand merchandising du festival.",
    ctaLabel: 'Ajouter au panier',
    items: [
      {
        id: 'tshirt',
        name: 'T-shirt Muscadeath',
        price: 20,
        image: '/images/merch-tshirt.svg',
        description: "T-shirt officiel de l'édition, floqué recto-verso.",
        sizes: 'S, M, L, XL, XXL',
        available: true,
      },
      {
        id: 'hoodie',
        name: 'Sweat capuche',
        price: 35,
        image: '/images/merch-hoodie.svg',
        description: 'Sweat à capuche floqué, idéal pour les nuits fraîches sur le camping.',
        sizes: 'S, M, L, XL, XXL',
        available: true,
      },
      {
        id: 'totebag',
        name: 'Tote bag',
        price: 10,
        image: '/images/merch-totebag.svg',
        description: 'Tote bag en toile épaisse, logo du festival.',
        sizes: '',
        available: true,
      },
      {
        id: 'pin',
        name: 'Pin’s collector',
        price: 5,
        image: '/images/merch-pin.svg',
        description: 'Édition limitée, émaillée.',
        sizes: '',
        available: false,
      },
    ] as MerchItem[],
  },

  gallery: {
    title: 'Galerie',
    kicker: "Ambiance des éditions précédentes",
    images: [
      { src: '/images/gallery-1.svg', alt: 'Scène principale du festival' },
      { src: '/images/gallery-2.svg', alt: 'Public en concert' },
      { src: '/images/gallery-3.svg', alt: 'Camping du festival' },
      { src: '/images/gallery-4.svg', alt: 'Bar associatif' },
      { src: '/images/gallery-5.svg', alt: "Groupe sur scène" },
      { src: '/images/gallery-6.svg', alt: 'Ambiance de nuit' },
    ] as GalleryImage[],
  },

  news: {
    title: 'Actualités',
    kicker: 'Les dernières nouvelles du festival',
    items: [
      {
        date: '2026',
        title: 'Rendez-vous en 2027',
        excerpt:
          "L'équipe se retrouve en 2027 pour une nouvelle édition. Suivez nos réseaux sociaux pour ne rien manquer des annonces à venir.",
        image: '/images/news-placeholder.svg',
      },
    ] as NewsItem[],
  },

  contact: {
    title: 'Contact',
    kicker: 'Une question ? Une envie de bénévolat ?',
    address: '6 rue de l\u2019Ormoie, 44330 Vallet',
    phone: '06 52 80 35 08',
    email: 'muscadeath@free.fr',
    social: [
      { label: 'Facebook', href: 'https://www.facebook.com/muscadeathfestival', icon: 'facebook' },
      { label: 'YouTube', href: 'https://www.youtube.com/channel/UC3xH3E57jJ4ZwLVdsZOmmaQ', icon: 'youtube' },
    ] as SocialLink[],
  },

  footer: {
    associationName: 'Association Muscadeath',
    credits: 'Site réalisé avec React, Vite et Tailwind CSS.',
  },
}

export type SiteConfig = typeof siteConfig
