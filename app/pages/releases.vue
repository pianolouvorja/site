<script setup lang="ts">
  const { t, locale } = useI18n()

  useSeoMeta({
    title: () => t('releases.metaTitle'),
    description: () => t('releases.metaDescription'),
  })

  interface GithubRelease {
    tag_name: string
    name: string
    published_at: string
    body: string
    html_url: string
  }

  type ProductType = 'web' | 'desktop' | 'mobile'

  interface ParsedRelease {
    tag: string
    name: string
    date: string
    url: string
    products: ProductType[]
    highlights: string[]
    pullRequests: string[]
    changelog: string[]
  }

  /**
   * Detects which products a release affects based on tag/body keywords.
   * - Tags like v* or containing "desktop"/"electron" → desktop
   * - Tags containing "web"/"site"/"pwa" → web
   * - Tags containing "mobile"/"android"/"ios" → mobile
   * - Default: web (since this repo is pianolouvorja/web)
   */
  function detectProducts(tag: string, body: string): ProductType[] {
    const products = new Set<ProductType>()
    const combined = `${tag} ${body}`.toLowerCase()

    if (/electron|desktop|appimage|\.exe|\.dmg|windows|linux|macos/.test(combined)) {
      products.add('desktop')
    }
    if (/web|site|pwa|browser|npm|vue|nuxt/.test(combined)) {
      products.add('web')
    }
    if (/mobile|android|ios|flutter|play-store|app-store/.test(combined)) {
      products.add('mobile')
    }

    // Fallback: this is the web repo, so at least web
    if (products.size === 0) {
      products.add('web')
    }

    return Array.from(products)
  }

  const PRODUCT_ICONS: Record<ProductType, string> = {
    web: 'ti-world',
    desktop: 'ti-device-desktop',
    mobile: 'ti-device-mobile',
  }

  const releases = ref<ParsedRelease[]>([])
  const loading = ref(true)
  const fetchError = ref(false)

  /**
   * Maps locale codes to regex patterns that identify language sections in release notes.
   * Supports flags, ISO codes, and HTML comments as markers.
   */
  const LOCALE_PATTERNS: Record<string, RegExp[]> = {
    'pt-BR': [/🇧🇷|🇵🇹/i, /<!--\s*lang:\s*pt/i, /^#{1,3}\s*pt-?br/i],
    en: [/🇺🇸|🇬🇧/i, /<!--\s*lang:\s*en/i, /^#{1,3}\s*english/i],
    es: [/🇪🇸|🇲🇽|🇦🇷/i, /<!--\s*lang:\s*es/i, /^#{1,3}\s*español|espanol/i],
  }

  /**
   * Extracts only the portion of the release body for the active locale.
   * If the body has no language markers, returns it unchanged (backward compatible).
   */
  function extractLocaleBody(body: string, activeLocale: string): string {
    const allPatterns = Object.values(LOCALE_PATTERNS).flat()
    const hasLangMarkers = allPatterns.some((p) => p.test(body))

    // No language markers — return body as-is (backward compatible)
    if (!hasLangMarkers) return body

    const targetPatterns = LOCALE_PATTERNS[activeLocale] ?? LOCALE_PATTERNS['pt-BR']!
    const lines = body.split('\n')
    const result: string[] = []
    let inTargetSection = false
    let foundAnySection = false

    for (const line of lines) {
      const trimmed = line.trim()

      // Check if this line is a language section header
      const isLangHeader = Object.values(LOCALE_PATTERNS).some((patterns) =>
        patterns.some((p) => p.test(trimmed)),
      )

      if (isLangHeader) {
        foundAnySection = true
        inTargetSection = targetPatterns.some((p) => p.test(trimmed))
        continue // Skip the header line itself
      }

      if (inTargetSection) {
        result.push(line)
      }
    }

    // If we found language sections but none matched our locale, fall back to pt-BR
    if (foundAnySection && result.length === 0) {
      return extractLocaleBody(body, 'pt-BR')
    }

    // If no language sections found at all, return original
    return result.length > 0 ? result.join('\n') : body
  }

  function parseReleaseBody(
    body: string,
    activeLocale: string = 'pt-BR',
  ): Pick<ParsedRelease, 'highlights' | 'pullRequests' | 'changelog'> {
    // First, extract only the portion for the active locale
    const localizedBody = extractLocaleBody(body, activeLocale)

    const sections = {
      highlights: [] as string[],
      pullRequests: [] as string[],
      changelog: [] as string[],
    }

    const lines = localizedBody.split('\n')
    let currentSection: 'highlights' | 'pullRequests' | 'changelog' | null = null

    for (const line of lines) {
      const trimmed = line.trim()

      // Detect section headers (PT + EN + ES)
      if (/^#{1,3}\s*(destaques|highlights|destacados)/i.test(trimmed)) {
        currentSection = 'highlights'
        continue
      }
      if (/^#{1,3}\s*(prs|pull requests|pulls)/i.test(trimmed)) {
        currentSection = 'pullRequests'
        continue
      }
      if (/^#{1,3}\s*(changelog|changes|alterações|cambios)/i.test(trimmed)) {
        currentSection = 'changelog'
        continue
      }

      // Collect list items
      if (currentSection && trimmed.startsWith('-')) {
        const item = trimmed.replace(/^-\s*/, '').trim()
        if (item) {
          sections[currentSection].push(item)
        }
      }
    }

    // If no structured sections found, treat entire body as changelog
    if (
      sections.highlights.length === 0 &&
      sections.pullRequests.length === 0 &&
      sections.changelog.length === 0
    ) {
      sections.changelog = localizedBody
        .split('\n')
        .filter((l) => l.trim().startsWith('-'))
        .map((l) => l.trim().replace(/^-\s*/, ''))
    }

    return sections
  }

  function formatDate(dateStr: string, loc: string): string {
    const lang = loc === 'pt-BR' ? 'pt-BR' : loc === 'es' ? 'es' : 'en-US'
    return new Date(dateStr).toLocaleDateString(lang, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  onMounted(async () => {
    try {
      const res = await fetch('https://api.github.com/repos/pianolouvorja/web/releases?per_page=10')
      if (!res.ok) throw new Error('Failed to fetch releases')
      const data: GithubRelease[] = await res.json()

      releases.value = data.map((r) => ({
        tag: r.tag_name,
        name: r.name || r.tag_name,
        date: formatDate(r.published_at, locale.value),
        url: r.html_url,
        products: detectProducts(r.tag_name, r.body || ''),
        ...parseReleaseBody(r.body || '', locale.value),
      }))
    } catch {
      fetchError.value = true
    } finally {
      loading.value = false
    }
  })
</script>

<template>
  <div class="releases-page">
    <section class="releases-hero">
      <div class="releases-hero__container">
        <h1 class="releases-hero__title">
          {{ $t('releases.title') }}
        </h1>
        <p class="releases-hero__subtitle">
          {{ $t('releases.subtitle') }}
        </p>
      </div>
    </section>

    <section class="releases-content">
      <div class="releases-content__container">
        <!-- Loading -->
        <div v-if="loading" class="releases-state">
          <i class="ti ti-loader-2 releases-state__spinner" aria-hidden="true" />
          <p>{{ $t('releases.loading') }}</p>
        </div>

        <!-- Error -->
        <div v-else-if="fetchError" class="releases-state releases-state--error">
          <i class="ti ti-alert-circle" aria-hidden="true" />
          <p>{{ $t('releases.error') }}</p>
        </div>

        <!-- Empty -->
        <div v-else-if="releases.length === 0" class="releases-state">
          <i class="ti ti-package" aria-hidden="true" />
          <p>{{ $t('releases.noReleases') }}</p>
        </div>

        <!-- Release list -->
        <div v-else class="releases-list">
          <article
            v-for="(release, idx) in releases"
            :key="release.tag"
            class="release-card"
            :class="{ 'release-card--latest': idx === 0 }"
          >
            <div class="release-card__header">
              <div class="release-card__version-info">
                <span class="release-card__tag">{{ release.tag }}</span>
                <span v-if="idx === 0" class="release-card__latest-badge">
                  {{ $t('releases.latest') }}
                </span>
                <div class="release-card__products">
                  <span
                    v-for="product in release.products"
                    :key="product"
                    class="release-card__product-badge"
                    :class="`release-card__product-badge--${product}`"
                  >
                    <i class="ti" :class="PRODUCT_ICONS[product]" aria-hidden="true" />
                    {{ $t(`releases.products.${product}`) }}
                  </span>
                </div>
              </div>
              <time class="release-card__date">{{ release.date }}</time>
            </div>

            <div v-if="release.highlights.length" class="release-card__section">
              <h3 class="release-card__section-title">
                {{ $t('releases.highlights') }}
              </h3>
              <ul class="release-card__list">
                <li v-for="(item, i) in release.highlights" :key="`h-${i}`">
                  {{ item }}
                </li>
              </ul>
            </div>

            <div v-if="release.pullRequests.length" class="release-card__section">
              <h3 class="release-card__section-title">
                {{ $t('releases.pullRequests') }}
              </h3>
              <ul class="release-card__list release-card__list--prs">
                <li v-for="(item, i) in release.pullRequests" :key="`p-${i}`">
                  {{ item }}
                </li>
              </ul>
            </div>

            <div v-if="release.changelog.length" class="release-card__section">
              <h3 class="release-card__section-title">
                {{ $t('releases.changelog') }}
              </h3>
              <ul class="release-card__list release-card__list--changelog">
                <li v-for="(item, i) in release.changelog" :key="`c-${i}`">
                  {{ item }}
                </li>
              </ul>
            </div>

            <div class="release-card__links">
              <a
                :href="release.url"
                target="_blank"
                rel="noopener noreferrer"
                class="release-card__link"
              >
                <i class="ti ti-brand-github" aria-hidden="true" />
                {{ $t('releases.viewOnGithub') }}
              </a>
            </div>
          </article>
        </div>

        <div v-if="!loading && !fetchError && releases.length > 0" class="releases-footer">
          <a
            href="https://github.com/pianolouvorja/web/releases"
            class="releases-footer__link"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ $t('releases.allVersions') }}
            <i class="ti ti-arrow-right" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
  @use 'sass:color' as sasscolor;

  .releases-page {
    --release-radius: var(--piano-radius-md);
  }

  .releases-hero {
    padding: clamp(2.5rem, 6vw, 4.5rem) 1.5rem;
    text-align: center;
    background: linear-gradient(180deg, var(--piano-bg-tertiary) 0%, var(--piano-bg-solid) 100%);

    &__container {
      max-width: 42rem;
      margin: 0 auto;
    }

    &__title {
      font-size: clamp(1.75rem, 4.5vw, 2.75rem);
      font-weight: 800;
      color: var(--piano-text-primary);
      margin-bottom: 0.75rem;
    }

    &__subtitle {
      font-size: 1.0625rem;
      line-height: 1.6;
      color: var(--piano-text-secondary);
    }
  }

  .releases-content {
    padding: 2rem 1.5rem clamp(3rem, 6vw, 5rem);

    &__container {
      max-width: 52rem;
      margin: 0 auto;
    }
  }

  .releases-state {
    text-align: center;
    padding: 3rem 1rem;
    color: var(--piano-text-secondary);

    i {
      font-size: 2rem;
      margin-bottom: 0.75rem;
      display: block;
    }

    &__spinner {
      animation: spin 1s linear infinite;
    }

    &--error i {
      color: var(--piano-error);
    }
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .releases-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .release-card {
    border: 1px solid var(--piano-border);
    border-radius: var(--piano-radius-md);
    padding: 1.75rem;
    background: var(--piano-bg-solid);

    &--latest {
      border-color: var(--piano-accent);
      border-width: 2px;
      box-shadow: var(--piano-shadow-glow);
    }

    &__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1.25rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--piano-border-subtle);
    }

    &__version-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    &__tag {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--piano-text-primary);
    }

    &__latest-badge {
      padding: 0.2rem 0.6rem;
      border-radius: 999px;
      font-size: 0.6875rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: var(--piano-accent);
      color: var(--piano-white);
    }

    &__date {
      font-size: 0.875rem;
      color: var(--piano-text-tertiary);
    }

    &__section {
      margin-bottom: 1.25rem;

      &:last-of-type {
        margin-bottom: 0;
      }
    }

    &__section-title {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--piano-text-tertiary);
      margin-bottom: 0.5rem;
    }

    &__list {
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        font-size: 0.9375rem;
        line-height: 1.6;
        color: var(--piano-text-secondary);
        padding: 0.25rem 0 0.25rem 1.25rem;
        position: relative;

        &::before {
          content: '•';
          position: absolute;
          left: 0;
          color: var(--piano-accent);
          font-weight: bold;
        }
      }

      &--prs li::before {
        color: var(--piano-accent);
      }

      &--changelog li::before {
        color: var(--piano-text-secondary);
      }
    }

    &__products {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.75rem;
    }

    &__product-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.1875rem 0.625rem;
      border-radius: var(--piano-radius-sm);
      font-size: 0.6875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;

      i {
        font-size: 0.75rem;
      }

      &--web {
        background: rgba(0, 193, 230, 0.12);
        color: var(--piano-cyan);
      }

      &--desktop {
        background: rgba(4, 84, 155, 0.12);
        color: var(--piano-accent);
      }

      &--mobile {
        background: rgba(16, 185, 129, 0.12);
        color: #10b981;
      }
    }

    &__links {
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      gap: 1rem;
      margin-top: 1.25rem;
      overflow-x: auto;
    }

    &__link {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--piano-accent);
      text-decoration: none;
      white-space: nowrap;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .releases-footer {
    text-align: center;
    margin-top: 2.5rem;

    &__link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1.5rem;
      border: 2px solid var(--piano-border);
      border-radius: var(--piano-radius-md);
      font-weight: 600;
      font-size: 0.9375rem;
      text-decoration: none;
      color: var(--piano-text-primary);
      transition:
        border-color 0.15s ease,
        color 0.15s ease;

      &:hover {
        border-color: var(--piano-accent);
        color: var(--piano-accent);
      }
    }
  }
</style>
