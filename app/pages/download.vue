<script setup lang="ts">
  import { siteConfig } from '~/data/site'

  const { t } = useI18n()

  useSeoMeta({
    title: () => t('download.metaTitle'),
    description: () => t('download.metaDescription'),
  })

  // Server-side proxy avoids GitHub API rate limits on client
  interface GithubAsset {
    name: string
    browser_download_url: string
    size: number
  }

  interface GithubRelease {
    tag_name: string
    assets: GithubAsset[]
  }

  const latestTag = ref<string | null>(null)
  const downloadUrls = ref<Record<string, string>>({})
  const fetchError = ref(false)

  // Detect OS client-side only to avoid hydration mismatch
  const detectedOs = ref<'linux' | 'windows' | 'macos' | null>(null)

  onMounted(async () => {
    // OS detection on client only (avoids SSR/client mismatch)
    const ua = navigator.userAgent
    const lower = ua.toLowerCase()
    if (lower.includes('mac os') || lower.includes('macos') || lower.includes('darwin')) {
      detectedOs.value = 'macos'
    } else if (lower.includes('windows')) {
      detectedOs.value = 'windows'
    } else if (lower.includes('linux') || lower.includes('x11')) {
      detectedOs.value = 'linux'
    }

    // Fetch latest release via server proxy (token-backed, no rate limit)
    try {
      const res = await fetch('/api/github/latest-app-release')
      if (!res.ok) throw new Error('Failed to fetch release')
      const data: GithubRelease = await res.json()
      latestTag.value = data.tag_name

      for (const asset of data.assets) {
        const name = asset.name.toLowerCase()
        if (name.endsWith('.appimage')) {
          downloadUrls.value.linux = asset.browser_download_url
        } else if (name.endsWith('.exe')) {
          downloadUrls.value.windows = asset.browser_download_url
        } else if (name.endsWith('.dmg')) {
          downloadUrls.value.macos = asset.browser_download_url
        }
      }
    } catch {
      fetchError.value = true
    }
  })

  const desktopCards = computed(() => [
    {
      os: 'linux' as const,
      icon: '', // Tux renderizado via SVG inline no template
      i18nPrefix: 'download.desktop.linux',
      recommended: detectedOs.value === 'linux',
      requiresDiskSpace: true,
    },
    {
      os: 'windows' as const,
      icon: 'ti-brand-windows',
      i18nPrefix: 'download.desktop.windows',
      recommended: detectedOs.value === 'windows',
      requiresDiskSpace: true,
    },
    {
      os: 'macos' as const,
      icon: 'ti-brand-apple',
      i18nPrefix: 'download.desktop.macos',
      recommended: detectedOs.value === 'macos',
      requiresDiskSpace: true,
    },
  ])
</script>

<template>
  <div class="download-page">
    <!-- Hero -->
    <section class="download-hero">
      <div class="download-hero__container">
        <span class="download-hero__eyebrow">{{ $t('download.heroEyebrow') }}</span>
        <h1 class="download-hero__title">
          {{ $t('download.heroTitle') }}
        </h1>
        <p class="download-hero__subtitle">
          {{ $t('download.heroSubtitle') }}
        </p>
        <div class="download-hero__actions">
          <a :href="siteConfig.appUrl" class="download-hero__btn download-hero__btn--primary">
            <i class="ti ti-world" aria-hidden="true" />
            {{ $t('download.heroWebCta') }}
          </a>
          <a
            href="https://github.com/pianolouvorja/app"
            class="download-hero__btn download-hero__btn--secondary"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i class="ti ti-brand-github" aria-hidden="true" />
            {{ $t('download.heroGithubCta') }}
          </a>
        </div>
      </div>
    </section>

    <!-- Desktop Native -->
    <section class="download-section">
      <div class="download-section__container">
        <div class="download-section__header">
          <span class="download-section__badge">{{ $t('download.desktop.badge') }}</span>
          <h2 class="download-section__title">
            {{ $t('download.desktop.title') }}
          </h2>
          <p class="download-section__desc">
            {{ $t('download.desktop.description') }}
          </p>
        </div>

        <!-- Platform cards -->
        <div class="download-cards">
          <div
            v-for="card in desktopCards"
            :key="card.os"
            class="download-card"
            :class="{ 'download-card--recommended': card.recommended }"
          >
            <span v-if="card.recommended" class="download-card__badge">
              <i class="ti ti-star" aria-hidden="true" />
              {{ $t('download.desktop.badge') }}
            </span>
            <div class="download-card__header">
              <!-- Tux (Linux) via SVG inline - ti-brand-tux nao existe no Tabler -->
              <svg
                v-if="card.os === 'linux'"
                class="download-card__icon download-card__icon--svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489a.424.424 0 0 0-.11.135c-.26.268-.45.6-.663.839-.199.199-.485.267-.797.4-.313.136-.658.269-.864.68-.09.189-.136.394-.132.602 0 .199.027.4.055.536.058.399.116.728.04.97-.249.68-.28 1.145-.106 1.484.174.334.535.47.94.601.81.2 1.91.135 2.774.6.926.466 1.866.67 2.616.47.526-.116.97-.464 1.208-.946.587-.003 1.23-.269 2.26-.334.699-.058 1.574.267 2.577.2.025.134.063.198.114.333l.003.003c.391.778 1.113 1.132 1.884 1.071.771-.06 1.592-.536 2.257-1.306.631-.765 1.683-1.084 2.378-1.503.348-.199.629-.469.649-.853.023-.4-.2-.811-.714-1.376v-.097l-.003-.003c-.17-.2-.25-.535-.338-.926-.085-.401-.182-.786-.492-1.046h-.003c-.059-.054-.123-.067-.188-.135a.357.357 0 0 0-.19-.064c.431-1.278.264-2.55-.173-3.694-.533-1.41-1.465-2.638-2.175-3.483-.796-1.005-1.576-1.957-1.56-3.368.026-2.152.236-6.133-3.544-6.139zm.529 3.405h.063c.343.001.628.118.861.353.234.235.351.522.353.86v.04c-.002.336-.119.621-.353.856-.234.235-.52.353-.861.353h-.063a1.163 1.163 0 0 1-.839-.353 1.16 1.16 0 0 1-.353-.856v-.04c.002-.337.119-.623.353-.859.233-.234.515-.353.839-.354zm-1.715.396c-.183 0-.332.156-.332.346 0 .19.149.346.332.346.184 0 .332-.156.332-.346 0-.19-.148-.346-.332-.346zm3.735 1.181c.183 0 .332.156.332.346 0 .19-.149.346-.332.346-.184 0-.332-.156-.332-.346 0-.19.148-.346.332-.346zm-2.71.528a.48.48 0 0 1 .482.482.48.48 0 0 1-.482.483.48.48 0 0 1-.482-.483.48.48 0 0 1 .482-.482zm1.477.396c.183 0 .332.156.332.346 0 .19-.149.346-.332.346-.184 0-.332-.156-.332-.346 0-.19.148-.346.332-.346z"
                />
              </svg>
              <i v-else :class="`ti ${card.icon}`" class="download-card__icon" aria-hidden="true" />
              <div>
                <h3 class="download-card__title">
                  {{ $t(`${card.i18nPrefix}.name`) }}
                </h3>
                <p class="download-card__format">
                  {{ $t(`${card.i18nPrefix}.format`) }}
                </p>
              </div>
            </div>
            <p class="download-card__arch">
              {{ $t(`${card.i18nPrefix}.arch`) }}
            </p>
            <p v-if="latestTag" class="download-card__version">
              {{ latestTag }}
            </p>
            <a
              v-if="downloadUrls[card.os] && !fetchError"
              :href="downloadUrls[card.os]"
              class="download-card__btn"
              :aria-label="$t(`${card.i18nPrefix}.downloadLabel`)"
            >
              <i class="ti ti-download" aria-hidden="true" />
              {{ $t(`${card.i18nPrefix}.downloadLabel`) }}
            </a>
            <a
              v-else
              href="https://github.com/pianolouvorja/app/releases"
              class="download-card__btn"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i class="ti ti-download" aria-hidden="true" />
              {{ $t(`${card.i18nPrefix}.downloadLabel`) }}
            </a>
            <p class="download-card__hint">
              {{ $t(`${card.i18nPrefix}.hint`) }}
            </p>
          </div>
        </div>

        <ul class="download-features">
          <li>
            <i class="ti ti-check" aria-hidden="true" />
            {{ $t('download.desktop.features.multiScreen') }}
          </li>
          <li>
            <i class="ti ti-check" aria-hidden="true" />
            {{ $t('download.desktop.features.offline') }}
          </li>
          <li>
            <i class="ti ti-check" aria-hidden="true" />
            {{ $t('download.desktop.features.shortcuts') }}
          </li>
          <li>
            <i class="ti ti-check" aria-hidden="true" />
            {{ $t('download.desktop.features.autoUpdate') }}
          </li>
          <!-- TODO: add localization for disk space requirement, using hardcoded string for now -->
          <li class="download-features__disk-space">
            <i class="ti ti-database" aria-hidden="true" />
            Requer 15GB de espaço livre para funcionar offline
          </li>
        </ul>

        <div class="download-source">
          <span>{{ $t('download.desktop.buildFromSource') }}</span>
          <a
            href="https://github.com/pianolouvorja/app#readme"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ $t('download.desktop.buildFromSourceLink') }}
            <i class="ti ti-external-link" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>

    <!-- Web App -->
    <section class="download-section download-section--alt">
      <div class="download-section__container">
        <div class="download-section__header">
          <span class="download-section__badge download-section__badge--accent">
            {{ $t('download.web.badge') }}
          </span>
          <h2 class="download-section__title">
            {{ $t('download.web.title') }}
          </h2>
          <p class="download-section__desc">
            {{ $t('download.web.description') }}
          </p>
          <a :href="siteConfig.appUrl" class="download-card__btn download-card__btn--large">
            <i class="ti ti-world" aria-hidden="true" />
            {{ $t('download.web.cta') }}
          </a>
        </div>

        <ul class="download-features">
          <li>
            <i class="ti ti-check" aria-hidden="true" />
            {{ $t('download.web.features.noInstall') }}
          </li>
          <li>
            <i class="ti ti-check" aria-hidden="true" />
            {{ $t('download.web.features.anyOs') }}
          </li>
          <li>
            <i class="ti ti-check" aria-hidden="true" />
            {{ $t('download.web.features.autoUpdate') }}
          </li>
          <li>
            <i class="ti ti-check" aria-hidden="true" />
            {{ $t('download.web.features.pwa') }}
          </li>
        </ul>
      </div>
    </section>

    <!-- Mobile -->
    <section class="download-section">
      <div class="download-section__container">
        <div class="download-section__header">
          <span class="download-section__badge download-section__badge--muted">
            {{ $t('download.mobile.badge') }}
          </span>
          <h2 class="download-section__title">
            {{ $t('download.mobile.title') }}
          </h2>
          <p class="download-section__desc">
            {{ $t('download.mobile.description') }}
          </p>
          <p class="download-section__subtext">
            {{ $t('download.mobile.platforms') }}
          </p>
        </div>

        <ul class="download-features download-features--muted">
          <li>
            <i class="ti ti-clock" aria-hidden="true" />
            {{ $t('download.mobile.features.nativeAndroid') }}
          </li>
          <li>
            <i class="ti ti-clock" aria-hidden="true" />
            {{ $t('download.mobile.features.nativeIos') }}
          </li>
          <li>
            <i class="ti ti-clock" aria-hidden="true" />
            {{ $t('download.mobile.features.cloudSync') }}
          </li>
        </ul>

        <a :href="siteConfig.appUrl" class="download-card__btn download-card__btn--large">
          <i class="ti ti-device-mobile" aria-hidden="true" />
          {{ $t('download.mobile.useWebInstead') }}
        </a>
      </div>
    </section>

    <!-- System Requirements -->
    <section class="download-section download-section--alt">
      <div class="download-section__container download-requirements">
        <h2 class="download-section__title download-section__title--small">
          {{ $t('download.systemRequirements.title') }}
        </h2>
        <ul class="download-requirements__list">
          <li>{{ $t('download.systemRequirements.desktop') }}</li>
          <li>{{ $t('download.systemRequirements.web') }}</li>
        </ul>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
  @use 'sass:color' as sasscolor;

  .download-page {
    --download-radius: var(--piano-radius-md);
    --download-radius-sm: var(--piano-radius-sm);
  }

  /* Hero */
  .download-hero {
    padding: clamp(3rem, 8vw, 6rem) 1.5rem;
    text-align: center;
    background: linear-gradient(180deg, var(--piano-bg-tertiary) 0%, var(--piano-bg-solid) 100%);

    &__container {
      max-width: 42rem;
      margin: 0 auto;
    }

    &__eyebrow {
      display: inline-block;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--piano-accent);
      margin-bottom: 1rem;
    }

    &__title {
      font-size: clamp(2rem, 5vw, 3.25rem);
      font-weight: 800;
      line-height: 1.1;
      margin-bottom: 1rem;
      color: var(--piano-text-primary);
    }

    &__subtitle {
      font-size: 1.125rem;
      line-height: 1.6;
      color: var(--piano-text-secondary);
      margin-bottom: 2rem;
    }

    &__actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    &__btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.875rem 1.75rem;
      border-radius: var(--download-radius);
      font-weight: 600;
      font-size: 1rem;
      text-decoration: none;
      transition:
        transform 0.15s ease,
        box-shadow 0.15s ease;
      cursor: pointer;
      border: 2px solid transparent;

      i {
        font-size: 1.25rem;
      }

      &--primary {
        background: var(--piano-accent);
        color: var(--piano-text-on-dark);

        &:hover {
          background: var(--piano-accent-hover);
          transform: translateY(-2px);
          box-shadow: var(--piano-shadow-md);
        }
      }

      &--secondary {
        border-color: var(--piano-border);
        color: var(--piano-text-primary);
        background: var(--piano-bg-solid);

        &:hover {
          border-color: var(--piano-accent);
          color: var(--piano-accent);
        }
      }
    }
  }

  /* Sections */
  .download-section {
    padding: clamp(2.5rem, 6vw, 4rem) 1.5rem;

    &--alt {
      background: var(--piano-bg-tertiary);
    }

    &__container {
      max-width: 72rem;
      margin: 0 auto;
    }

    &__header {
      text-align: center;
      max-width: 42rem;
      margin: 0 auto 2.5rem;
    }

    &__badge {
      display: inline-block;
      padding: 0.3rem 0.8rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: var(--piano-accent-soft);
      color: var(--piano-accent);
      margin-bottom: 0.75rem;

      &--accent {
        background: rgba(34, 197, 94, 0.12);
        color: #15803d;
      }

      &--muted {
        background: rgba(217, 119, 6, 0.12);
        color: #b45309;
      }
    }

    &__title {
      font-size: clamp(1.5rem, 3.5vw, 2.25rem);
      font-weight: 700;
      margin-bottom: 0.75rem;
      color: var(--piano-text-primary);

      &--small {
        font-size: 1.25rem;
      }
    }

    &__desc {
      font-size: 1.0625rem;
      line-height: 1.6;
      color: var(--piano-text-secondary);
    }

    &__subtext {
      font-size: 0.875rem;
      color: var(--piano-text-tertiary);
      margin-top: 0.5rem;
    }
  }

  /* Desktop cards */
  .download-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .download-card {
    border: 1px solid var(--piano-border);
    border-radius: var(--download-radius);
    padding: 1.5rem;
    background: var(--piano-bg-solid);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    transition:
      border-color 0.15s ease,
      box-shadow 0.15s ease;

    &:hover {
      border-color: var(--piano-accent);
      box-shadow: var(--piano-shadow-md);
    }

    /* Recommended badge */
    &__badge {
      position: absolute;
      top: -0.625rem;
      right: 0.875rem;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.2rem 0.625rem;
      border-radius: 999px;
      font-size: 0.6875rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      background: var(--piano-accent);
      color: var(--piano-text-on-dark);
      box-shadow: var(--piano-shadow-sm);
    }

    /* Highlight recommended card */
    &--recommended {
      position: relative;
      border-color: var(--piano-accent);
      box-shadow:
        0 0 0 1px var(--piano-accent),
        var(--piano-shadow-md);
    }

    &__header {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      margin-bottom: 0.75rem;
    }

    &__icon {
      font-size: 2rem;
      color: var(--piano-accent);
    }

    &__icon--svg {
      width: 2rem;
      height: 2rem;
      flex-shrink: 0;
    }

    &__title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--piano-text-primary);
    }

    &__format {
      font-size: 0.8125rem;
      color: var(--piano-text-secondary);
    }

    &__arch {
      font-size: 0.8125rem;
      color: var(--piano-text-tertiary);
      margin-bottom: 0.25rem;
    }

    &__version {
      font-size: 0.75rem;
      color: var(--piano-accent);
      font-weight: 600;
      margin-bottom: 1rem;
    }

    &__btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.75rem 1rem;
      border-radius: var(--download-radius-sm);
      font-weight: 600;
      font-size: 0.9375rem;
      text-decoration: none;
      background: var(--piano-accent);
      color: var(--piano-text-on-dark);
      transition: background 0.15s ease;
      cursor: pointer;
      margin-bottom: 0.5rem;

      &:hover {
        background: var(--piano-accent-hover);
      }

      &--large {
        display: inline-flex;
        width: auto;
        padding: 0.875rem 2rem;
        margin-top: 0.5rem;
      }
    }

    &__hint {
      font-size: 0.75rem;
      color: var(--piano-text-tertiary);
      line-height: 1.4;
    }
  }

  /* Feature lists */
  .download-features {
    list-style: none;
    padding: 0;
    margin: 0 0 2rem;
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));

    li {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.9375rem;
      color: var(--piano-text-secondary);

      i {
        color: var(--piano-accent);
        font-size: 1.25rem;
      }
    }

    &__disk-space {
      color: #b45309 !important; /* Warning color */

      i {
        color: #b45309 !important;
      }
    }

    &--muted {
      li i {
        color: var(--piano-text-tertiary);
      }
    }
  }
  .download-source {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
    padding-top: 1.5rem;
    border-top: 1px solid var(--piano-border-subtle);
    font-size: 0.875rem;
    color: var(--piano-text-secondary);

    a {
      color: var(--piano-accent);
      text-decoration: none;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  /* System Requirements */
  .download-requirements {
    text-align: center;

    &__list {
      list-style: none;
      padding: 0;
      margin: 1rem auto 0;
      max-width: 40rem;

      li {
        font-size: 0.9375rem;
        color: var(--piano-text-secondary);
        padding: 0.5rem 0;
        border-bottom: 1px solid var(--piano-border-subtle);

        &:last-child {
          border-bottom: none;
        }
      }
    }
  }

  @media (max-width: 640px) {
    .download-hero__actions {
      flex-direction: column;
      width: 100%;

      .download-hero__btn {
        width: 100%;
        justify-content: center;
      }
    }
  }
</style>
