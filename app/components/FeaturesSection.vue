<script setup lang="ts">
  import { webFeatures } from '~/data/site'
</script>

<template>
  <section id="features" class="features">
    <div class="features__container">
      <div class="features__header">
        <span class="features__eyebrow">{{ $t('features.eyebrow') }}</span>
        <h2 class="features__title">
          {{ $t('features.title') }}
        </h2>
        <p class="features__description">
          {{ $t('features.description') }}
        </p>
      </div>

      <div class="features__grid">
        <div
          v-for="feature in webFeatures"
          :key="feature.id"
          data-testid="feature-card"
          class="features__card"
        >
          <div class="features__card-icon">
            <i :class="`ti ${feature.icon}`" />
          </div>
          <h3 class="features__card-title">
            {{ $t(`features.items.${feature.id}.title`) }}
          </h3>
          <p class="features__card-desc">
            {{ $t(`features.items.${feature.id}.description`) }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
  .features {
    padding: 6rem 1.5rem;
    background: var(--piano-white);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 200px;
      background: linear-gradient(180deg, var(--piano-gray-100) 0%, transparent 100%);
      pointer-events: none;
    }

    &__container {
      position: relative;
      max-width: 1200px;
      margin: 0 auto;
    }

    &__header {
      text-align: center;
      max-width: 640px;
      margin: 0 auto 3.5rem;
    }

    &__eyebrow {
      display: inline-block;
      color: var(--piano-blue);
      font-size: 0.85rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 0.75rem;
    }

    &__title {
      font-size: 2.5rem;
      font-weight: 800;
      color: var(--piano-text-primary);
      margin-bottom: 1rem;
      letter-spacing: -0.02em;
    }

    &__description {
      font-size: 1.1rem;
      color: var(--piano-text-secondary);
      line-height: 1.7;
    }

    &__grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
    }

    &__card {
      background: #fff;
      border: 1px solid var(--piano-gray-300);
      border-radius: var(--piano-radius-lg);
      padding: 2rem 1.5rem;
      transition:
        transform 0.3s,
        box-shadow 0.3s,
        border-color 0.3s;

      &:hover {
        transform: translateY(-6px);
        box-shadow: var(--piano-shadow-lg);
        border-color: var(--piano-cyan);
      }

      &-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 56px;
        height: 56px;
        border-radius: var(--piano-radius-md);
        background: var(--piano-bg-accent);
        margin-bottom: 1.25rem;

        i {
          font-size: 1.75rem;
          color: #fff;
        }
      }

      &-title {
        font-size: 1.2rem;
        font-weight: 700;
        color: var(--piano-text-primary);
        margin-bottom: 0.5rem;
      }

      &-desc {
        font-size: 0.95rem;
        color: var(--piano-text-secondary);
        line-height: 1.6;
      }
    }

    @media (max-width: 960px) {
      &__grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 600px) {
      padding: 4rem 1.25rem;

      &__title {
        font-size: 2rem;
      }

      &__grid {
        grid-template-columns: 1fr;
      }
    }
  }
</style>
