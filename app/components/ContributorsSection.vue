<script setup lang="ts">
  const { t } = useI18n()

  interface Contributor {
    login: string
    avatar_url: string
    html_url: string
    contributions: number
  }

  const contributors = ref<Contributor[]>([])
  const loading = ref(true)
  const fetchError = ref(false)

  onMounted(async () => {
    try {
      const res = await fetch(
        'https://api.github.com/repos/pianolouvorja/app/contributors?per_page=12',
      )
      if (!res.ok) throw new Error('Failed to fetch contributors')
      const data: Contributor[] = await res.json()

      // Filter out bots from display (keep real people first)
      contributors.value = data.filter(
        (c) => !c.login.includes('[bot]') && !c.login.endsWith('-bot'),
      )
    } catch {
      fetchError.value = true
    } finally {
      loading.value = false
    }
  })

  const ctaWays = computed(() => [
    { icon: 'ti-code', text: t('contributors.ctaWays.code') },
    { icon: 'ti-bug', text: t('contributors.ctaWays.bugs') },
    { icon: 'ti-language', text: t('contributors.ctaWays.translate') },
    { icon: 'ti-share', text: t('contributors.ctaWays.share') },
  ])
</script>

<template>
  <section id="contributors" class="contributors">
    <div class="contributors__container">
      <div class="contributors__header">
        <h2 class="contributors__title">
          {{ $t('contributors.title') }}
        </h2>
        <p class="contributors__subtitle">
          {{ $t('contributors.subtitle') }}
        </p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="contributors__state">
        <i class="ti ti-loader-2 contributors__spinner" aria-hidden="true" />
        <p>{{ $t('contributors.loading') }}</p>
      </div>

      <!-- Error -->
      <div v-else-if="fetchError" class="contributors__state contributors__state--error">
        <i class="ti ti-alert-circle" aria-hidden="true" />
        <p>{{ $t('contributors.error') }}</p>
      </div>

      <!-- Contributors grid -->
      <div v-else class="contributors__grid">
        <a
          v-for="person in contributors"
          :key="person.login"
          :href="person.html_url"
          class="contributors__card"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            :src="person.avatar_url"
            :alt="person.login"
            class="contributors__avatar"
            width="64"
            height="64"
            loading="lazy"
          />
          <div class="contributors__info">
            <span class="contributors__name">@{{ person.login }}</span>
            <span class="contributors__count">
              {{ person.contributions }} {{ $t('contributors.contributions') }}
            </span>
          </div>
        </a>
      </div>

      <!-- View all link -->
      <div v-if="!loading && !fetchError && contributors.length > 0" class="contributors__view-all">
        <a
          href="https://github.com/pianolouvorja/app/graphs/contributors"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ $t('contributors.viewAll') }}
          <i class="ti ti-arrow-right" aria-hidden="true" />
        </a>
      </div>

      <!-- CTA section -->
      <div class="contributors__cta">
        <h3 class="contributors__cta-title">
          {{ $t('contributors.ctaTitle') }}
        </h3>
        <p class="contributors__cta-text">
          {{ $t('contributors.ctaText') }}
        </p>

        <ul class="contributors__ways">
          <li v-for="(way, i) in ctaWays" :key="i">
            <i class="ti" :class="way.icon" aria-hidden="true" />
            <span>{{ way.text }}</span>
          </li>
        </ul>

        <a
          href="https://github.com/pianolouvorja/app"
          class="contributors__cta-btn"
          target="_blank"
          rel="noopener noreferrer"
        >
          <i class="ti ti-brand-github" aria-hidden="true" />
          {{ $t('contributors.ctaButton') }}
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
  .contributors {
    padding: clamp(2.5rem, 6vw, 4rem) 1.5rem;
    background: var(--piano-bg-tertiary);

    &__container {
      max-width: 64rem;
      margin: 0 auto;
    }

    &__header {
      text-align: center;
      margin-bottom: 2.5rem;
    }

    &__title {
      font-size: clamp(1.5rem, 3.5vw, 2.25rem);
      font-weight: 700;
      color: var(--piano-text-primary);
      margin-bottom: 0.75rem;
    }

    &__subtitle {
      font-size: 1.0625rem;
      line-height: 1.6;
      color: var(--piano-text-secondary);
      max-width: 36rem;
      margin: 0 auto;
    }

    &__state {
      text-align: center;
      padding: 2rem;
      color: var(--piano-text-secondary);

      i {
        font-size: 1.75rem;
        display: block;
        margin-bottom: 0.5rem;
      }

      &--error i {
        color: var(--piano-error);
      }
    }

    &__spinner {
      animation: contributors-spin 1s linear infinite;
    }

    &__grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    &__card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      border: 1px solid var(--piano-border);
      border-radius: var(--piano-radius-md);
      background: var(--piano-bg-solid);
      text-decoration: none;
      transition:
        border-color 0.15s ease,
        box-shadow 0.15s ease,
        transform 0.15s ease;

      &:hover {
        border-color: var(--piano-accent);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
        transform: translateY(-2px);
      }
    }

    &__avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    &__info {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
      overflow: hidden;
    }

    &__name {
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--piano-text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    &__count {
      font-size: 0.75rem;
      color: var(--piano-text-tertiary);
    }

    &__view-all {
      text-align: center;
      margin-bottom: 2.5rem;

      a {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--piano-accent);
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    &__cta {
      background: var(--piano-bg-solid);
      border: 1px solid var(--piano-border);
      border-radius: var(--piano-radius-lg);
      padding: clamp(1.5rem, 4vw, 2.5rem);
      text-align: center;
    }

    &__cta-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--piano-text-primary);
      margin-bottom: 0.5rem;
    }

    &__cta-text {
      font-size: 0.9375rem;
      line-height: 1.6;
      color: var(--piano-text-secondary);
      max-width: 36rem;
      margin: 0 auto 1.5rem;
    }

    &__ways {
      list-style: none;
      padding: 0;
      margin: 0 0 1.5rem;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 0.75rem;
      text-align: left;

      li {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        color: var(--piano-text-secondary);
        padding: 0.5rem 0.75rem;
        border-radius: var(--piano-radius-sm);
        background: var(--piano-bg-tertiary);

        i {
          color: var(--piano-accent);
          font-size: 1.125rem;
        }
      }
    }

    &__cta-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.75rem;
      border-radius: var(--piano-radius-md);
      font-weight: 600;
      font-size: 0.9375rem;
      text-decoration: none;
      background: var(--piano-accent);
      color: var(--piano-text-on-dark);
      transition:
        background 0.15s ease,
        transform 0.15s ease;

      &:hover {
        background: var(--piano-accent-hover);
        transform: translateY(-2px);
      }
    }
  }

  @keyframes contributors-spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
