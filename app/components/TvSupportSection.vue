<script setup lang="ts">
  const tvBrands = [
    {
      id: 'lg',
      logo: '/brand/lg-logo.svg',
      nameKey: 'tvSupport.lgBrand',
      statusKey: 'tvSupport.lgStatus',
    },
  ] as const
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
          data-testid="tv-brand-card"
        >
          <img
            :src="brand.logo"
            :alt="`${brand.id === 'lg' ? 'LG' : ''} Smart TV`"
            class="tv-support__brand-logo"
            loading="lazy"
          />
          <p class="tv-support__brand-name">
            {{ $t(brand.nameKey) }}
          </p>
          <span class="tv-support__brand-status">
            <i class="ti ti-loader-2" aria-hidden="true" />
            {{ $t(brand.statusKey) }}
          </span>
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
      display: flex;
      justify-content: center;
      gap: 2rem;
      flex-wrap: wrap;
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
      width: 120px;
      height: auto;
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
