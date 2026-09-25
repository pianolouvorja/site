const SITE_URL = 'https://pianolouvorja.com.br'
const SITE_NAME = 'PIANO LouvorJA'

interface AppHeadOptions {
  /** Page-specific title (without site name suffix). */
  title?: string
  /** Page-specific description. Defaults to the i18n meta.description. */
  description?: string
  /** Path appended to SITE_URL for canonical/og:url (without locale prefix). Defaults to '/'. */
  path?: string
}

/**
 * Centralised SEO head manager for the PIANO LouvorJA site.
 *
 * Provides per-page reactive title/description, full Open Graph + Twitter
 * Card tags, canonical URL, alternate links for every configured locale,
 * and JSON-LD structured data — all driven by the active i18n locale.
 */
export function useAppHead(options: AppHeadOptions = {}) {
  const { t, locale, locales } = useI18n()
  const defaultLocale = 'pt-BR'

  const pageTitle = computed(() =>
    options.title ? `${options.title} — ${SITE_NAME}` : t('meta.title'),
  )

  const pageDescription = computed(() => options.description ?? t('meta.description'))

  const ogLocale = computed(() => locale.value.replace('-', '_'))

  // A função resolve o caminho dependendo se é o defaultLocale (que não tem prefixo)
  const getUrlForLocale = (code: string) => {
    const baseRoute = options.path ?? '/'

    // Default locale não recebe prefixo (devido ao prefix_except_default)
    if (code === defaultLocale) {
      return `${SITE_URL}${baseRoute}`
    }

    // Resolve double slashes (e.g. se a rota for '/', vira '/en', não '/en/')
    return `${SITE_URL}/${code}${baseRoute === '/' ? '' : baseRoute}`
  }

  // Canonical URL é a URL do locale atual
  const canonicalUrl = computed(() => getUrlForLocale(locale.value))

  // JSON-LD structured data for Organization
  const jsonLdOrganization = computed(() => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/brand/logo-louvor-ja.svg`,
    sameAs: [
      'https://github.com/pianolouvorja',
      'https://www.youtube.com/@pianolouvorja',
      'https://chat.whatsapp.com/LBcTv5rQDZw3OU56QmUahc',
    ],
  }))

  // JSON-LD structured data for a WebApplication
  const jsonLdWebApplication = computed(() => ({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE_NAME,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: ['Windows', 'macOS', 'Linux', 'Android', 'iOS'],
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'BRL',
      availability: 'https://schema.org/InStock',
    },
    description: pageDescription.value,
    url: SITE_URL,
    inLanguage: locale.value,
    isAccessibleForFree: true,
    // Entity linking: conecta a entidade aos perfis oficiais (melhora rankeamento)
    sameAs: [
      'https://github.com/pianolouvorja',
      'https://www.youtube.com/@pianolouvorja',
      'https://chat.whatsapp.com/LBcTv5rQDZw3OU56QmUahc',
      'https://t.me/c/4390408870/6',
    ],
  }))

  // Build hreflang alternate links for all configured locales (e.g. Google crawlers)
  const alternateLinks = computed(() =>
    (locales.value as Array<{ code: string }>).map((l) => ({
      rel: 'alternate' as const,
      hreflang: l.code,
      href: getUrlForLocale(l.code),
    })),
  )

  // og:locale:alternate for each non-default locale
  const ogLocaleAlternates = computed(() =>
    (locales.value as Array<{ code: string }>)
      .filter((l) => l.code !== defaultLocale)
      .map((l) => ({
        property: 'og:locale:alternate' as const,
        content: l.code.replace('-', '_'),
      })),
  )

  useHead({
    htmlAttrs: {
      lang: locale,
    },
    title: pageTitle,
    meta: [
      { name: 'description', content: pageDescription },
      // Open Graph
      { property: 'og:site_name', content: SITE_NAME },
      { property: 'og:title', content: pageTitle },
      { property: 'og:description', content: pageDescription },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: canonicalUrl },
      { property: 'og:locale', content: ogLocale },
      { property: 'og:image', content: `${SITE_URL}/og-image.png` },
      // og:locale:alternate for each non-default locale
      ...ogLocaleAlternates.value,
      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: pageTitle },
      { name: 'twitter:description', content: pageDescription },
      { name: 'twitter:image', content: `${SITE_URL}/og-image.png` },
      { name: 'twitter:site', content: '@pianolouvorja' },
      // Theme color for browser chrome
      { name: 'theme-color', content: '#0d1b2a' },
      // Google Search Console verification (valor default; sobrescrever via NUXT_PUBLIC_GOOGLE_SITE_VERIFICATION)
      { name: 'google-site-verification', content: 'A0OHlivpSyISUwtfHocbr3ESg1ShWBjjUSmRvaC0exQ' },
    ],
    link: [
      { rel: 'canonical', href: canonicalUrl.value },
      {
        rel: 'alternate',
        type: 'application/rss+xml',
        title: 'PIANO LouvorJA — Releases',
        href: `${SITE_URL}/rss.xml`,
      },
      { rel: 'manifest', href: '/manifest.json' },
      ...alternateLinks.value,
    ],
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(jsonLdOrganization.value),
      },
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(jsonLdWebApplication.value),
      },
    ],
  })
}
