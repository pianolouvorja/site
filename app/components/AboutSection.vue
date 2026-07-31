<script setup lang="ts">
  import { siteConfig } from '~/data/site'
</script>

<template>
  <section id="about" class="about">
    <div class="about__container">
      <div class="about__visual">
        <div class="about__visual-card">
          <i class="ti ti-heart-handshake" />
          <span class="about__visual-text">{{ $t('about.openSource') }}</span>
        </div>
        <div class="about__visual-glow" />
      </div>

      <div class="about__content">
        <span class="about__eyebrow">{{ $t('about.eyebrow') }}</span>
        <h2 class="about__title">
          {{ $t('about.title') }}
        </h2>
        <p class="about__text">
          {{ $t('about.text1', { name: siteConfig.name }) }}
        </p>
        <p class="about__text">
          {{ $t('about.text2') }}
        </p>

        <div class="about__stats">
          <div class="about__stat">
            <span class="about__stat-num">100%</span>
            <span class="about__stat-label">{{ $t('about.stats.free') }}</span>
          </div>
          <div class="about__stat">
            <span class="about__stat-num">0</span>
            <span class="about__stat-label">{{ $t('about.stats.installs') }}</span>
          </div>
          <div class="about__stat">
            <span class="about__stat-num">PWA</span>
            <span class="about__stat-label">{{ $t('about.stats.offline') }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
  .about {
    padding: 6rem 1.5rem;
    background: var(--piano-gray-100);
    position: relative;
    overflow: hidden;

    &__container {
      max-width: 1100px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr 1.3fr;
      gap: 4rem;
      align-items: center;
    }

    &__visual {
      position: relative;
      display: flex;
      justify-content: center;

      &-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
        background: var(--piano-bg-primary);
        padding: 3rem 2.5rem;
        border-radius: var(--piano-radius-lg);
        box-shadow: var(--piano-shadow-lg);
        z-index: 1;

        i {
          font-size: 4rem;
          color: var(--piano-cyan);
        }
      }

      &-text {
        font-size: 1.1rem;
        font-weight: 700;
        color: #fff;
        letter-spacing: 0.05em;
      }

      &-glow {
        position: absolute;
        width: 300px;
        height: 300px;
        background: var(--piano-cyan);
        border-radius: 50%;
        filter: blur(80px);
        opacity: 0.15;
      }
    }

    &__content {
      // alignment handled by grid
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
      font-size: 2.25rem;
      font-weight: 800;
      color: var(--piano-text-primary);
      margin-bottom: 1.5rem;
      letter-spacing: -0.02em;
      line-height: 1.2;
    }

    &__text {
      font-size: 1.05rem;
      color: var(--piano-text-secondary);
      line-height: 1.8;
      margin-bottom: 1.25rem;
    }

    &__stats {
      display: flex;
      gap: 2.5rem;
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid var(--piano-gray-300);
    }

    &__stat {
      display: flex;
      flex-direction: column;

      &-num {
        font-size: 1.75rem;
        font-weight: 800;
        color: var(--piano-blue);
      }

      &-label {
        font-size: 0.85rem;
        color: var(--piano-gray-700);
      }
    }

    @media (max-width: 768px) {
      &__container {
        grid-template-columns: 1fr;
        gap: 2.5rem;
      }

      &__visual {
        order: -1;
      }

      &__title {
        font-size: 1.75rem;
      }

      &__stats {
        gap: 1.5rem;
      }
    }

    @media (max-width: 430px) {
      &__stats {
        flex-wrap: wrap;
        gap: 1rem;
      }

      &__stat-num {
        font-size: 1.4rem;
      }
    }
  }
</style>
