<script setup lang="ts">
  import type { CategoryResult } from '~/utils/downloads'

  const props = defineProps<{
    mobileData: CategoryResult
    appUrl: string
  }>()

  const { t } = useI18n()

  const hasAssets = computed(() => Object.keys(props.mobileData.assets).length > 0)

  const mobileCards = computed(() => {
    if (!hasAssets.value) return []
    return Object.entries(props.mobileData.assets).map(([platform, asset]) => ({
      platform,
      asset,
      icon: platform === 'ios' ? 'ti-brand-apple' : 'ti-brand-android',
      i18nPrefix: `download.mobile.${platform}`,
    }))
  })

  const features = [
    { key: 'download.mobile.features.remote', icon: 'ti-device-mobile' },
    { key: 'download.mobile.features.network', icon: 'ti-wifi' },
    { key: 'download.mobile.features.offline', icon: 'ti-wifi-off' },
  ]
</script>

<template>
  <section class="download-section download-section--alt">
    <div class="download-section__container">
      <div class="download-section__header">
        <span class="download-section__badge download-section__badge--muted">{{
          t('download.mobile.badge')
        }}</span>
        <h2 class="download-section__title">
          {{ t('download.mobile.title') }}
        </h2>
        <p class="download-section__desc">
          {{ t('download.mobile.description') }}
        </p>
      </div>

      <div v-if="hasAssets" class="download-cards">
        <div v-for="card in mobileCards" :key="card.platform" class="download-card">
          <div class="download-card__header">
            <i :class="`ti ${card.icon}`" class="download-card__icon" aria-hidden="true" />
            <div>
              <h3 class="download-card__title">
                {{ t(`${card.i18nPrefix}.name`) }}
              </h3>
              <p class="download-card__format">
                {{ t(`${card.i18nPrefix}.format`) }}
              </p>
            </div>
          </div>
          <p class="download-card__arch">
            {{ t(`${card.i18nPrefix}.arch`) }}
          </p>
          <p v-if="mobileData.tag" class="download-card__version">
            {{ mobileData.tag }}
          </p>
          <a
            :href="card.asset.url"
            class="download-card__btn"
            :aria-label="t(`${card.i18nPrefix}.downloadLabel`)"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i class="ti ti-download" aria-hidden="true" />
            {{ t(`${card.i18nPrefix}.downloadLabel`) }}
          </a>
          <p class="download-card__hint">
            {{ t(`${card.i18nPrefix}.hint`) }}
          </p>
        </div>
      </div>

      <template v-else>
        <p class="download-section__empty">
          {{ t('download.mobile.noAssets') }}
        </p>
        <a :href="appUrl" class="download-card__btn download-card__btn--large">
          <i class="ti ti-device-mobile" aria-hidden="true" />
          {{ t('download.mobile.useWebInstead') }}
        </a>
      </template>

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
    background: var(--piano-bg-tertiary);

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
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
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
    align-items: flex-start;
    transition:
      border-color 0.15s ease,
      box-shadow 0.15s ease;

    &:hover {
      border-color: var(--piano-accent);
      box-shadow: var(--piano-shadow-md);
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
      border-radius: var(--piano-radius-sm);
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
        margin: 0.5rem auto 0;
      }
    }

    &__hint {
      font-size: 0.75rem;
      color: var(--piano-text-tertiary);
      line-height: 1.4;
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
</style>
