<script setup lang="ts">
  import { useTvBrands } from '~/composables/useTvBrands'
  import type { AllDownloadsResponse } from '~/utils/downloads'

  const tvBrands = useTvBrands()

  // Map each brand card to the download asset platform it depends on.
  // Brands without a platform mapping (Roku, Chromecast, Apple TV) stay on
  // their i18n roadmap status — nothing published for them yet.
  const BRAND_PLATFORMS: Record<string, string | undefined> = {
    lg: 'webos',
    samsung: 'tizen',
    androidTv: 'androidtv',
    appleTv: undefined,
    roku: undefined,
    chromecast: undefined,
  }

  const downloads = ref<AllDownloadsResponse | null>(null)

  onMounted(async () => {
    try {
      const res = await fetch('/api/github/all-downloads')
      if (!res.ok) return
      downloads.value = (await res.json()) as AllDownloadsResponse
    } catch {
      // keep roadmap statuses — network failure must not blank the section
    }
  })

  function isAvailable(brandId: string): boolean {
    const platform = BRAND_PLATFORMS[brandId]
    if (!platform || !downloads.value) return false
    return Boolean(downloads.value.tv?.assets?.[platform]?.url)
  }

  function brandStatus(brandId: string): string {
    if (isAvailable(brandId)) {
      return useI18n().t('tvSupport.statusAvailable')
    }
    return useI18n().t(`tvSupport.${brandId}Status`)
  }
</script>

<template>
  <section id="tv-support" class="tv-support">
    <div class="tv-support__container">
      <div class="tv-support__header">
        <span class="tv-support__eyebrow">{{ $t('tvSupport.eyebrow') }}</span>
        <h2 class="tv-support__title">
          {{ $t('tvSupport.title') }}
        </h2>
        <p class="tv-support__description">
          {{ $t('tvSupport.description') }}
        </p>
      </div>

      <div class="tv-support__brands">
        <div
          v-for="brand in tvBrands"
          :key="brand.id"
          class="tv-support__brand"
          :class="{ 'tv-support__brand--available': isAvailable(brand.id) }"
          data-testid="tv-brand-card"
        >
          <img :src="brand.logo" :alt="brand.alt" class="tv-support__brand-logo" loading="lazy" />
          <p class="tv-support__brand-name">
            {{ $t(`tvSupport.${brand.id}Brand`) }}
          </p>
          <span class="tv-support__brand-status">
            <i
              :class="isAvailable(brand.id) ? 'ti ti-circle-check' : 'ti ti-loader-2'"
              aria-hidden="true"
            />
            {{ brandStatus(brand.id) }}
          </span>
          <a
            v-if="isAvailable(brand.id)"
            :href="`/download#tv`"
            class="tv-support__brand-link"
            data-testid="tv-brand-download"
          >
            {{ $t('tvSupport.downloadCta') }}
            <i class="ti ti-arrow-right" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
<style scoped lang="scss">
  .tv-support {
    padding: 5rem 1.5rem;
    background: var(--piano-bg-primary);
    position: relative;

    &__container {
      max-width: 1200px;
      margin: 0 auto;
    }

    &__header {
      text-align: center;
      max-width: 640px;
      margin: 0 auto 3rem;
    }

    &__eyebrow {
      display: inline-block;
      color: var(--piano-cyan);
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 0.75rem;
    }

    &__title {
      font-size: 2rem;
      font-weight: 800;
      color: #fff;
      margin-bottom: 0.75rem;
      letter-spacing: -0.02em;
    }

    &__description {
      font-size: 1.05rem;
      color: rgba(255, 255, 255, 0.65);
      line-height: 1.65;
    }

    &__brands {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      max-width: 900px;
      margin: 0 auto;

      @media (max-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
      }

      @media (max-width: 480px) {
        grid-template-columns: 1fr;
      }
    }

    &__brand {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 2rem 2.5rem;
      border-radius: var(--piano-radius-lg);
      border: 1px solid rgba(255, 255, 255, 0.08);
      background: linear-gradient(135deg, rgba(0, 193, 230, 0.06) 0%, rgba(16, 67, 140, 0.1) 100%);
      transition:
        transform 0.3s,
        border-color 0.3s;

      &:hover {
        transform: translateY(-4px);
        border-color: rgba(0, 193, 230, 0.35);
      }
    }

    &__brand-logo {
      height: 56px;
      width: auto;
      max-width: 120px;
      object-fit: contain;
      filter: brightness(1.1);
    }

    &__brand-name {
      font-size: 1rem;
      font-weight: 600;
      color: var(--piano-cyan-light);
      text-align: center;
    }

    &__brand-status {
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

      i {
        font-size: 0.85rem;
        animation: spin 1.5s linear infinite;
      }
    }

    &__brand--available &__brand-status {
      color: var(--piano-green, #4ade80);
      background: rgba(74, 222, 128, 0.1);
      border-color: rgba(74, 222, 128, 0.25);

      i {
        animation: none;
      }
    }

    &__brand-link {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--piano-cyan);
      text-decoration: none;
      margin-top: 0.5rem;

      &:hover {
        text-decoration: underline;
      }
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    @media (max-width: 768px) {
      padding: 3.5rem 1.25rem;

      &__title {
        font-size: 1.6rem;
      }

      &__brand {
        padding: 1.5rem 2rem;
      }

      &__brand-logo {
        width: 100px;
      }
    }

    @media (max-width: 430px) {
      &__brands {
        flex-direction: column;
        align-items: center;
      }
    }
  }
</style>
