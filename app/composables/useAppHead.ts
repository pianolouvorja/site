const SITE_URL = 'https://pianolouvorja.com'
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

  // JSON-LD structured data for a WebApplication
  const jsonLd = computed(() => ({
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE_NAME,
    description: pageDescription.value,
    url: SITE_URL,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web, Linux, macOS, Windows',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    inLanguage: locale.value,
    isAccessibleForFree: true,
  }))

  // Build hreflang alternate links for all configured locales (e.g. Google crawlers)
  const alternateLinks = computed(() =>
    (locales.value as Array<{ code: string }>).map((l) => ({
      rel: 'alternate' as const,
      hreflang: l.code,
      href: getUrlForLocale(l.code),
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
      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: pageTitle },
      { name: 'twitter:description', content: pageDescription },
      { name: 'twitter:image', content: `${SITE_URL}/og-image.png` },
      // Theme color for browser chrome
      { name: 'theme-color', content: '#0d1b2a' },
    ],
    link: [{ rel: 'canonical', href: canonicalUrl.value }, ...alternateLinks.value],
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(jsonLd.value),
      },
    ],
  })
}
