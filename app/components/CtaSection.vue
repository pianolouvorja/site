<script setup lang="ts">
  import { siteConfig } from '~/data/site'
</script>

<template>
  <section id="cta" class="cta">
    <div class="cta__glow" />

    <div class="cta__container">
      <div class="cta__content">
        <i class="ti ti-rocket cta__icon" />
        <h2 class="cta__title">
          {{ $t('cta.title') }}
        </h2>
        <p class="cta__subtitle">
          {{ $t('cta.subtitle') }}
        </p>

        <a
          data-testid="cta-button"
          :href="siteConfig.appUrl"
          class="cta__button"
          target="_blank"
          rel="noopener noreferrer"
        >
          <i class="ti ti-login" />
          {{ $t('cta.button') }}
        </a>

        <div class="cta__meta">
          <span><i class="ti ti-check" /> {{ $t('cta.meta.free') }}</span>
          <span><i class="ti ti-check" /> {{ $t('cta.meta.noInstall') }}</span>
          <span><i class="ti ti-check" /> {{ $t('cta.meta.openSource') }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
  .cta {
    position: relative;
    padding: 6rem 1.5rem;
    background: var(--piano-bg-primary);
    overflow: hidden;

    &__glow {
      position: absolute;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, var(--piano-cyan) 0%, transparent 70%);
      border-radius: 50%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      opacity: 0.12;
      pointer-events: none;
    }

    &__container {
      position: relative;
      z-index: 1;
      max-width: 720px;
      margin: 0 auto;
      text-align: center;
    }

    &__icon {
      font-size: 3rem;
      color: var(--piano-cyan);
      margin-bottom: 1.25rem;
      display: block;
    }

    &__title {
      font-size: 2.5rem;
      font-weight: 800;
      color: #fff;
      margin-bottom: 1rem;
      letter-spacing: -0.02em;
      line-height: 1.2;
    }

    &__subtitle {
      font-size: 1.15rem;
      color: rgba(255, 255, 255, 0.75);
      line-height: 1.7;
      max-width: 520px;
      margin: 0 auto 2rem;
    }

    &__button {
      display: inline-flex;
      align-items: center;
      gap: 0.625rem;
      padding: 1rem 2rem;
      border-radius: var(--piano-radius-full);
      font-size: 1.1rem;
      font-weight: 700;
      text-decoration: none;
      background: linear-gradient(135deg, var(--piano-cyan) 0%, var(--piano-blue) 100%);
      color: #fff;
      box-shadow: 0 8px 32px rgba(0, 193, 230, 0.4);
      transition:
        transform 0.2s,
        box-shadow 0.2s;

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 40px rgba(0, 193, 230, 0.55);
      }

      i {
        font-size: 1.3rem;
      }
    }

    &__meta {
      display: flex;
      justify-content: center;
      gap: 1.5rem;
      flex-wrap: wrap;
      margin-top: 2rem;

      span {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.6);
      }

      i {
        color: var(--piano-cyan);
        font-size: 1.05rem;
      }
    }

    @media (max-width: 600px) {
      padding: 4rem 1.25rem;

      &__title {
        font-size: 1.75rem;
      }

      &__subtitle {
        font-size: 1rem;
      }

      &__button {
        width: 100%;
        justify-content: center;
      }

      &__meta {
        flex-direction: column;
        gap: 0.625rem;
      }
    }
  }
</style>
