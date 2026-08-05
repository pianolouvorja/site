<script setup lang="ts">
  import { ref } from 'vue'
  import { siteConfig } from '~/data/site'

  const showNotifyModal = ref(false)

  function openNotifyModal() {
    showNotifyModal.value = true
  }

  const platforms = [
    {
      id: 'desktop',
      icon: 'ti-device-desktop',
      badge: 'platforms.desktop.badge',
      name: 'platforms.desktop.title',
      tagline: 'platforms.desktop.subtitle',
      description: 'platforms.desktop.description',
      features: [
        { icon: 'ti-device-tv', key: 'feature1' },
        { icon: 'ti-wifi-off', key: 'feature2' },
        { icon: 'ti-keyboard', key: 'feature3' },
      ],
      accent: 'cyan',
      ctaHref: '#download',
      ctaLabel: 'platforms.desktop.cta',
    },
    {
      id: 'web',
      icon: 'ti-world',
      badge: 'platforms.web.badge',
      name: 'platforms.web.title',
      tagline: 'platforms.web.subtitle',
      description: 'platforms.web.description',
      features: [
        { icon: 'ti-bolt', key: 'feature1' },
        { icon: 'ti-devices', key: 'feature2' },
        { icon: 'ti-refresh', key: 'feature3' },
      ],
      accent: 'yellow',
      ctaHref: siteConfig.appUrl,
      ctaLabel: 'platforms.web.cta',
    },
    {
      id: 'mobile',
      icon: 'ti-device-mobile',
      badge: 'platforms.mobile.badge',
      name: 'platforms.mobile.title',
      tagline: 'platforms.mobile.subtitle',
      description: 'platforms.mobile.description',
      features: [
        { icon: 'ti-brand-android', key: 'feature1' },
        { icon: 'ti-brand-apple', key: 'feature2' },
        { icon: 'ti-cloud', key: 'feature3' },
      ],
      accent: 'blue',
      ctaLabel: 'platforms.mobile.cta',
    },
  ] as const
</script>

<template>
  <section id="platforms" class="platforms">
    <div class="platforms__container">
      <div class="platforms__header">
        <span class="platforms__eyebrow">{{ $t('platforms.eyebrow') }}</span>
        <h2 class="platforms__title">
          {{ $t('platforms.title') }}
        </h2>
        <p class="platforms__description">
          {{ $t('platforms.description') }}
        </p>
      </div>

      <div class="platforms__grid">
        <div
          v-for="platform in platforms"
          :key="platform.id"
          data-testid="platform-card"
          class="platforms__card"
          :class="`platforms__card--${platform.accent}`"
        >
          <div class="platforms__card-header">
            <div class="platforms__card-icon">
              <i :class="`ti ${platform.icon}`" />
            </div>
            <span
              class="platforms__card-badge"
              :class="`platforms__card-badge--${platform.accent}`"
            >
              {{ $t(`platforms.${platform.id}.badge`) }}
            </span>
          </div>

          <h3 class="platforms__card-name">
            {{ $t(`platforms.${platform.id}.title`) }}
          </h3>
          <p class="platforms__card-tagline">
            {{ $t(`platforms.${platform.id}.subtitle`) }}
          </p>
          <p class="platforms__card-desc">
            {{ $t(`platforms.${platform.id}.description`) }}
          </p>

          <ul class="platforms__card-list">
            <li v-for="feature in platform.features" :key="feature.key">
              <i :class="`ti ${feature.icon}`" />
              <span>{{ $t(`platforms.${platform.id}.${feature.key}`) }}</span>
            </li>
          </ul>

          <a
            v-if="platform.id === 'mobile'"
            href="#"
            class="platforms__card-cta"
            :class="`platforms__card-cta--${platform.accent}`"
            data-testid="mobile-notify-trigger"
            @click.prevent="openNotifyModal"
          >
            <span>{{ $t(platform.ctaLabel) }}</span>
            <i class="ti ti-arrow-right" />
          </a>
          <a
            v-else
            :href="platform.ctaHref"
            class="platforms__card-cta"
            :class="`platforms__card-cta--${platform.accent}`"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>{{ $t(platform.ctaLabel) }}</span>
            <i class="ti ti-arrow-right" />
          </a>
        </div>
      </div>
    </div>

    <ClientOnly>
      <NotifyModal v-model="showNotifyModal" />
    </ClientOnly>
  </section>
</template>

<style scoped lang="scss">
  .platforms {
    padding: 6rem 1.5rem;
    background: var(--piano-bg-primary);
    position: relative;
    overflow: hidden;

    &__container {
      max-width: 1200px;
      margin: 0 auto;
      position: relative;
      z-index: 1;
    }

    &__header {
      text-align: center;
      max-width: 720px;
      margin: 0 auto 3.5rem;
    }

    &__eyebrow {
      display: inline-block;
      color: var(--piano-cyan);
      font-size: 0.85rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 0.75rem;
    }

    &__title {
      font-size: 2.5rem;
      font-weight: 800;
      color: #fff;
      margin-bottom: 1rem;
      letter-spacing: -0.02em;
    }

    &__description {
      font-size: 1.1rem;
      color: rgba(255, 255, 255, 0.7);
      line-height: 1.7;
    }

    &__grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.75rem;
    }

    &__card {
      display: flex;
      flex-direction: column;
      padding: 2.25rem;
      border-radius: var(--piano-radius-lg);
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition:
        transform 0.3s,
        border-color 0.3s;

      &:hover {
        transform: translateY(-4px);
      }

      &--cyan {
        background: linear-gradient(
          135deg,
          rgba(0, 193, 230, 0.08) 0%,
          rgba(16, 67, 140, 0.12) 100%
        );

        &:hover {
          border-color: rgba(0, 193, 230, 0.4);
        }
      }

      &--yellow {
        background: linear-gradient(
          135deg,
          rgba(252, 206, 2, 0.06) 0%,
          rgba(16, 67, 140, 0.12) 100%
        );

        &:hover {
          border-color: rgba(252, 206, 2, 0.3);
        }
      }

      &--blue {
        background: linear-gradient(
          135deg,
          rgba(4, 84, 155, 0.12) 0%,
          rgba(16, 67, 140, 0.18) 100%
        );

        &:hover {
          border-color: rgba(4, 84, 155, 0.5);
        }
      }

      &-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1.5rem;
      }

      &-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 52px;
        height: 52px;
        border-radius: var(--piano-radius-md);

        i {
          font-size: 1.6rem;
          color: #fff;
        }
      }

      &--cyan &-icon {
        background: linear-gradient(135deg, var(--piano-cyan) 0%, #0098b3 100%);
      }

      &--yellow &-icon {
        background: linear-gradient(135deg, var(--piano-yellow) 0%, #d9a800 100%);
      }

      &--blue &-icon {
        background: linear-gradient(135deg, var(--piano-blue-deep) 0%, #0a3070 100%);
      }

      &-badge {
        font-size: 0.7rem;
        font-weight: 700;
        padding: 0.3rem 0.7rem;
        border-radius: var(--piano-radius-full);
        text-transform: uppercase;
        letter-spacing: 0.04em;

        &--cyan {
          background: rgba(0, 193, 230, 0.15);
          color: var(--piano-cyan-light);
          border: 1px solid rgba(0, 193, 230, 0.3);
        }

        &--yellow {
          background: rgba(252, 206, 2, 0.12);
          color: var(--piano-yellow);
          border: 1px solid rgba(252, 206, 2, 0.3);
        }

        &--blue {
          background: rgba(4, 84, 155, 0.25);
          color: var(--piano-cyan-light);
          border: 1px solid rgba(4, 84, 155, 0.5);
        }
      }

      &-name {
        font-size: 1.4rem;
        font-weight: 700;
        color: #fff;
        margin-bottom: 0.25rem;
      }

      &-tagline {
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--piano-cyan-light);
        margin-bottom: 0.75rem;
      }

      &--yellow &-tagline {
        color: var(--piano-yellow);
      }

      &--blue &-tagline {
        color: var(--piano-cyan-light);
      }

      &-desc {
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.65);
        line-height: 1.6;
        margin-bottom: 1.5rem;
      }

      &-list {
        list-style: none;
        padding: 0;
        margin: 0 0 1.75rem;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;

        li {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.8);

          i {
            font-size: 1.1rem;
            color: var(--piano-cyan);
          }
        }
      }

      &--yellow &-list li i {
        color: var(--piano-yellow);
      }

      &--blue &-list li i {
        color: var(--piano-cyan-light);
      }

      &-cta {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.7rem 1.25rem;
        border-radius: var(--piano-radius-full);
        font-weight: 600;
        font-size: 0.9rem;
        text-decoration: none;
        margin-top: auto;
        transition:
          transform 0.2s,
          box-shadow 0.2s;

        &--cyan {
          background: var(--piano-bg-accent);
          color: #fff;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 20px rgba(0, 193, 230, 0.4);
          }
        }

        &--yellow {
          background: rgba(252, 206, 2, 0.15);
          color: var(--piano-yellow);
          border: 1px solid rgba(252, 206, 2, 0.3);

          &:hover {
            background: rgba(252, 206, 2, 0.2);
            transform: translateY(-2px);
          }
        }

        &--blue {
          background: rgba(4, 84, 155, 0.3);
          color: var(--piano-cyan-light);
          border: 1px solid rgba(4, 84, 155, 0.5);

          &:hover {
            background: rgba(4, 84, 155, 0.4);
            transform: translateY(-2px);
          }
        }
      }
    }

    @media (max-width: 960px) {
      &__grid {
        grid-template-columns: 1fr;
        max-width: 500px;
        margin: 0 auto;
      }
    }

    @media (max-width: 600px) {
      padding: 4rem 1.25rem;

      &__title {
        font-size: 2rem;
      }

      &__card {
        padding: 1.75rem;
      }
    }
  }
</style>
