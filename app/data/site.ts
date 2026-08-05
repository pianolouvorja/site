export interface Feature {
  id: string
  icon: string
}

export interface NavLink {
  i18nKey: string
  href: string
}

export interface Step {
  num: number
}

export const siteConfig = {
  name: 'PIANO LouvorJA',
  tagline: 'Gerenciamento de culto na web',
  description:
    'Sistema web para gerenciamento de cultos: bíblia, liturgia, hinário, cronômetro e muito mais. Simples, rápido, completo.',
  appUrl: 'https://app.pianolouvorja.com.br',
  contactEmail: 'app@pianolouvorja.com.br',
} as const

export const navLinks: NavLink[] = [
  { i18nKey: 'nav.features', href: '#features' },
  { i18nKey: 'nav.download', href: '/download' },
  { i18nKey: 'nav.releases', href: '/releases' },
  { i18nKey: 'nav.docs', href: '/docs' },
]

/** Links secundários — exibidos no footer, não no header (evita overflow) */
export const secondaryNavLinks: NavLink[] = [
  { i18nKey: 'nav.platforms', href: '#platforms' },
  { i18nKey: 'nav.howItWorks', href: '#how-it-works' },
  { i18nKey: 'nav.about', href: '#about' },
  { i18nKey: 'nav.contact', href: '/contact' },
]

/**
 * Features do app para a seção de funcionalidades.
 * Títulos e descrições são i18n via features.items.${id}.
 */
export const webFeatures: Feature[] = [
  { id: 'media', icon: 'ti-music' },
  { id: 'liturgy', icon: 'ti-clipboard-text' },
  { id: 'bible', icon: 'ti-book-2' },
  { id: 'projection', icon: 'ti-device-desktop' },
  { id: 'tools', icon: 'ti-stopwatch' },
  { id: 'player', icon: 'ti-player-play' },
  { id: 'settings', icon: 'ti-adjustments' },
  { id: 'offline', icon: 'ti-wifi-off' },
]

export const steps: Step[] = [{ num: 1 }, { num: 2 }, { num: 3 }, { num: 4 }]
