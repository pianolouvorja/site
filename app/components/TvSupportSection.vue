<script setup lang="ts">
  import { useTvBrands } from '~/composables/useTvBrands'

  const tvBrands = useTvBrands()

  function statusLabel(brand: { id: string; status: string }): string {
    if (brand.status === 'available') return `tvSupport.statusAvailable`
    return `tvSupport.${brand.id}Status`
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
          :class="{ 'tv-support__brand--available': brand.status === 'available' }"
          data-testid="tv-brand-card"
        >
          <img :src="brand.logo" :alt="brand.alt" class="tv-support__brand-logo" loading="lazy" />
          <p class="tv-support__brand-name">
            {{ $t(`tvSupport.${brand.id}Brand`) }}
          </p>
          <span
            class="tv-support__brand-status"
            :class="`tv-support__brand-status--${brand.status}`"
          >
            <i
              class="ti"
              :class="brand.status === 'available' ? 'ti-circle-check' : 'ti-loader-2'"
              aria-hidden="true"
            />
            {{ $t(statusLabel(brand)) }}
          </span>
        </div>
      </div>

      <a href="/download#tv" class="tv-support__cta">
        {{ $t('tvSupport.cta') }}
        <i class="ti ti-arrow-right" aria-hidden="true" />
      </a>
    </div>
  </section>
</template>
<style scoped lang="scss">
  .tv-support {
    padding: 5rem 1.5rem;
    background: var(--piano-bg-primary);

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
      margin: 0 auto 2.5rem;

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

      &--available {
        border-color: rgba(34, 197, 94, 0.3);
        background: linear-gradient(
          135deg,
          rgba(34, 197, 94, 0.06) 0%,
          rgba(16, 67, 140, 0.08) 100%
        );

        &:hover {
          border-color: rgba(34, 197, 94, 0.5);
        }
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
      padding: 0.25rem 0.75rem;
      border-radius: var(--piano-radius-full);

      // In-development / planned — amarelo com spinner
      &--in-development,
      &--planned {
        color: var(--piano-yellow);
        background: rgba(252, 206, 2, 0.1);
        border: 1px solid rgba(252, 206, 2, 0.2);

        i {
          font-size: 0.85rem;
          animation: spin 1.5s linear infinite;
        }
      }

      // Available — verde com check
      &--available {
        color: #22c55e;
        background: rgba(34, 197, 94, 0.1);
        border: 1px solid rgba(34, 197, 94, 0.3);

        i {
          font-size: 0.9rem;
        }
      }
    }

    &__cta {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.75rem;
      border-radius: var(--piano-radius-md);
      font-weight: 600;
      font-size: 0.9375rem;
      color: var(--piano-cyan);
      text-decoration: none;
      border: 1px solid var(--piano-cyan);
      transition:
        background 0.15s ease,
        color 0.15s ease;

      &:hover {
        background: var(--piano-cyan);
        color: #000;
      }

      i {
        font-size: 1.125rem;
        transition: transform 0.15s ease;
      }

      &:hover i {
        transform: translateX(3px);
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
