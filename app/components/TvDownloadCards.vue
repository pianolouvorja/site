<script setup lang="ts">
  import type { CategoryResult } from '~/utils/downloads'
  import { useTvBrands } from '~/composables/useTvBrands'

  const props = defineProps<{
    tvData: CategoryResult
  }>()

  const { t } = useI18n()
  const tvBrands = useTvBrands()

  // Brand → download asset platform. Brands without mapping stay on roadmap.
  const BRAND_PLATFORMS: Record<string, string | undefined> = {
    lg: 'webos',
    samsung: 'tizen',
    androidTv: 'androidtv',
    appleTv: undefined,
    roku: undefined,
    chromecast: undefined,
  }

  interface TvCard {
    id: string
    logo: string
    alt: string
    name: string
    format: string
    hint: string
    available: boolean
    url?: string
  }

  const tvCards = computed<TvCard[]>(() =>
    tvBrands.map((brand) => {
      const platform = BRAND_PLATFORMS[brand.id]
      const asset = platform ? props.tvData.assets[platform] : undefined
      const available = Boolean(asset?.url)
      return {
        id: brand.id,
        logo: brand.logo,
        alt: brand.alt,
        name: t(`tvSupport.${brand.id}Brand`),
        format: available ? t(`download.tv.${platform}.format`) : '',
        hint: available ? t(`download.tv.${platform}.hint`) : '',
        available,
        url: asset?.url,
      }
    }),
  )

  const hasAnyAsset = computed(() => Object.keys(props.tvData.assets).length > 0)

  const features = [
    { key: 'download.tv.features.realtime', icon: 'ti-broadcast' },
    { key: 'download.tv.features.multicast', icon: 'ti-devices' },
    { key: 'download.tv.features.autodiscover', icon: 'ti-wifi' },
  ]
</script>

<template>
  <section class="download-section">
    <div class="download-section__container">
      <div class="download-section__header">
        <span class="download-section__badge">{{ t('download.tv.badge') }}</span>
        <h2 class="download-section__title">
          {{ t('download.tv.title') }}
        </h2>
        <p class="download-section__desc">
          {{ t('download.tv.description') }}
        </p>
      </div>

      <div class="download-cards">
        <div
          v-for="card in tvCards"
          :key="card.id"
          class="download-card download-card--tv"
          :class="{ 'download-card--wip': !card.available }"
          :data-testid="`tv-download-${card.id}`"
        >
          <img :src="card.logo" :alt="card.alt" class="download-card__brand-logo" loading="lazy" />
          <h3 class="download-card__title">
            {{ card.name }}
          </h3>
          <p v-if="card.format" class="download-card__format">
            {{ card.format }}
          </p>
          <p v-if="tvData.tag && card.available" class="download-card__version">
            {{ tvData.tag }}
          </p>
          <a
            v-if="card.available && card.url"
            :href="card.url"
            class="download-card__btn"
            :aria-label="t('download.tv.downloadGeneric')"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i class="ti ti-download" aria-hidden="true" />
            {{ t('download.tv.downloadGeneric') }}
          </a>
          <span v-else class="download-card__status">
            <i class="ti ti-loader-2" aria-hidden="true" />
            {{ t('download.tv.noAssets') }}
          </span>
          <p v-if="card.hint" class="download-card__hint">
            {{ card.hint }}
          </p>
        </div>
      </div>

      <p v-if="!hasAnyAsset" class="download-section__empty">
        {{ t('download.tv.noAssets') }}
      </p>

      <ul class="download-features">
        <li v-for="feat in features" :key="feat.key">
          <i :class="`ti ${feat.icon}`" aria-hidden="true" />
          {{ t(feat.key) }}
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped lang="scss">
  .download-section {
    padding: clamp(2.5rem, 6vw, 4rem) 1.5rem;

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
      background: rgba(139, 92, 246, 0.12);
      color: #7c3aed;
      margin-bottom: 0.75rem;
    }

    &__title {
      font-size: clamp(1.5rem, 3.5vw, 2.25rem);
      font-weight: 700;
      margin-bottom: 0.75rem;
      color: var(--piano-text-primary);
    }

    &__desc {
      font-size: 1.0625rem;
      line-height: 1.6;
      color: var(--piano-text-secondary);
    }

    &__empty {
      text-align: center;
      color: var(--piano-text-tertiary);
      font-size: 1rem;
      margin-bottom: 2rem;
    }
  }

  .download-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .download-card {
    border: 1px solid var(--piano-border);
    border-radius: var(--piano-radius-md);
    padding: 1.5rem;
    background: var(--piano-bg-solid);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    transition:
      border-color 0.15s ease,
      box-shadow 0.15s ease;

    &:hover {
      border-color: var(--piano-accent);
      box-shadow: var(--piano-shadow-md);
    }

    &--wip {
      opacity: 0.75;
    }

    &__brand-logo {
      height: 48px;
      width: auto;
      max-width: 120px;
      object-fit: contain;
      margin-bottom: 1rem;
      filter: brightness(1.1);
    }

    &__title {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--piano-text-primary);
      margin-bottom: 0.25rem;
    }

    &__format {
      font-size: 0.8125rem;
      color: var(--piano-text-secondary);
    }

    &__version {
      font-size: 0.75rem;
      color: var(--piano-accent);
      font-weight: 600;
      margin-top: 0.25rem;
    }

    &__btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.75rem 1rem;
      border-radius: var(--piano-radius-sm);
      font-weight: 600;
      font-size: 0.9375rem;
      text-decoration: none;
      background: var(--piano-accent);
      color: var(--piano-text-on-dark);
      transition: background 0.15s ease;
      cursor: pointer;
      margin-top: 1rem;

      &:hover {
        background: var(--piano-accent-hover);
      }
    }

    &__status {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--piano-yellow);
      background: rgba(252, 206, 2, 0.1);
      padding: 0.25rem 0.75rem;
      border-radius: var(--piano-radius-full);
      border: 1px solid rgba(252, 206, 2, 0.2);
      margin-top: 1rem;

      i {
        font-size: 0.85rem;
        animation: tv-spin 1.5s linear infinite;
      }
    }

    &__hint {
      font-size: 0.75rem;
      color: var(--piano-text-tertiary);
      line-height: 1.4;
      margin-top: 0.75rem;
    }
  }

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
  }

  @keyframes tv-spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
