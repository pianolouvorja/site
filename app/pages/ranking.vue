<script setup lang="ts">
  /**
   * SPEC piano-site-public v1.0.0 (RF-02..RF-05): ranking público da
   * comunidade. Fonte: GET /api/piano/proxy/v1/custom/ranking?window=week|all
   * (endpoint público da API, sem auth). Regra: NUNCA exibir e-mail — só
   * display name + pontos. API fora → estado de erro com retry (site não quebra).
   */
  const { t } = useI18n()

  const window = ref<'all' | 'week'>('all')
  const entries = ref<
    Array<{
      position: number
      user_id: number
      display_name: string | null
      total: number
    }>
  >([])
  const loading = ref(true)
  const failed = ref(false)

  const podium = computed(() => entries.value.slice(0, 3))
  const rest = computed(() => entries.value.slice(3))

  async function load(): Promise<void> {
    loading.value = true
    failed.value = false
    try {
      const doFetch = globalThis.$fetch as unknown as (
        url: string,
      ) => Promise<{ data?: typeof entries.value }>
      const res = await doFetch<{ data?: typeof entries.value }>(
        `/api/piano/proxy/v1/custom/ranking?window=${window.value}`,
      )
      entries.value = res.data ?? []
    } catch {
      failed.value = true
    } finally {
      loading.value = false
    }
  }

  function selectWindow(w: 'all' | 'week'): void {
    if (window.value === w) return
    window.value = w
    void load()
  }

  function displayName(name: string | null, index: number): string {
    return name?.trim() || `#${index + 1}`
  }

  onMounted(() => {
    void load()
  })

  // SEO (RF-05)
  useHead({
    title: () => `${t('ranking.title')} — PIANO LouvorJA`,
    meta: [
      { name: 'description', content: () => t('ranking.metaDescription') },
      { name: 'robots', content: 'index, follow' },
    ],
  })
</script>

<template>
  <div class="ranking-page">
    <div class="ranking-page__container">
      <header class="ranking-page__header">
        <h1 class="ranking-page__title">
          {{ $t('ranking.title') }}
        </h1>
        <p class="ranking-page__updated">
          {{ $t('ranking.subtitle') }}
        </p>
      </header>

      <div class="ranking-page__tabs" role="tablist" :aria-label="$t('ranking.tabsLabel')">
        <button
          type="button"
          role="tab"
          class="ranking-page__tab"
          :class="{ 'ranking-page__tab--active': window === 'all' }"
          :aria-selected="window === 'all'"
          data-testid="ranking-tab-all"
          @click="selectWindow('all')"
        >
          {{ $t('ranking.tabAll') }}
        </button>
        <button
          type="button"
          role="tab"
          class="ranking-page__tab"
          :class="{ 'ranking-page__tab--active': window === 'week' }"
          :aria-selected="window === 'week'"
          data-testid="ranking-tab-week"
          @click="selectWindow('week')"
        >
          {{ $t('ranking.tabWeek') }}
        </button>
      </div>

      <div v-if="loading" class="ranking-page__loading" role="status">
        {{ $t('common.loading') }}
      </div>

      <div v-else-if="failed" class="ranking-page__error" data-testid="ranking-error" role="alert">
        <p>{{ $t('ranking.errorText') }}</p>
        <button type="button" class="ranking-page__retry" data-testid="ranking-retry" @click="load">
          <i class="ti ti-refresh" aria-hidden="true" />
          {{ $t('ranking.retry') }}
        </button>
      </div>

      <div v-else-if="entries.length === 0" class="ranking-page__empty">
        {{ $t('ranking.empty') }}
      </div>

      <template v-else>
        <div class="ranking-page__podium" data-testid="ranking-podium">
          <div
            v-for="(entry, i) in podium"
            :key="entry.user_id"
            class="ranking-page__podium-item"
            :class="`ranking-page__podium-item--${i + 1}`"
            data-testid="ranking-podium-item"
          >
            <span class="ranking-page__podium-pos">{{ i + 1 }}</span>
            <span class="ranking-page__podium-name">{{ displayName(entry.display_name, i) }}</span>
            <span class="ranking-page__podium-total">{{ entry.total }}</span>
          </div>
        </div>

        <ol class="ranking-page__list">
          <li
            v-for="(entry, i) in rest"
            :key="entry.user_id"
            class="ranking-page__row"
            data-testid="ranking-row"
          >
            <span class="ranking-page__row-pos">{{ entry.position }}</span>
            <span class="ranking-page__row-name">{{ displayName(entry.display_name, i + 3) }}</span>
            <span class="ranking-page__row-total">{{ entry.total }}</span>
          </li>
        </ol>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .ranking-page {
    background: var(--piano-bg-primary);
    color: var(--piano-text-primary);
    min-height: 100vh;
    padding: 0 1.5rem 4rem;

    &__container {
      max-width: 800px;
      margin: 0 auto;
    }

    &__header {
      text-align: center;
      margin-bottom: 2rem;
    }

    &__title {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--piano-text-primary);
      margin: 0 0 0.5rem;
    }

    &__updated {
      font-size: 0.95rem;
      color: var(--piano-text-muted);
      margin: 0;
    }

    &__tabs {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 2rem;
    }

    &__tab {
      border: 1px solid var(--piano-border);
      background: var(--piano-bg-secondary);
      color: var(--piano-text-secondary);
      border-radius: 999px;
      padding: 0.5rem 1.25rem;
      font-size: 0.95rem;
      cursor: pointer;

      &:hover {
        color: var(--piano-text-primary);
      }

      &--active {
        background: var(--piano-accent);
        border-color: var(--piano-accent);
        color: var(--piano-bg-primary);
        font-weight: 600;
      }
    }

    &__loading,
    &__empty {
      text-align: center;
      color: var(--piano-text-muted);
      padding: 3rem 0;
    }

    &__error {
      text-align: center;
      padding: 3rem 0;

      p {
        color: var(--piano-text-secondary);
        margin: 0 0 1rem;
      }
    }

    &__retry {
      border: 1px solid var(--piano-accent);
      background: transparent;
      color: var(--piano-accent);
      border-radius: var(--piano-radius-md);
      padding: 0.5rem 1.25rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;

      &:hover {
        background: var(--piano-accent-soft);
      }
    }

    &__podium {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 2rem;
    }

    &__podium-item {
      background: var(--piano-bg-secondary);
      border: 1px solid var(--piano-border);
      border-radius: var(--piano-radius-md);
      padding: 1.25rem 1rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;

      &--1 {
        border-color: var(--piano-accent);
        border-width: 2px;
      }
    }

    &__podium-pos {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--piano-accent);
    }

    &__podium-name {
      font-weight: 600;
      color: var(--piano-text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__podium-total,
    &__row-total {
      color: var(--piano-text-secondary);
      font-variant-numeric: tabular-nums;
    }

    &__list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    &__row {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.65rem 1rem;
      border-bottom: 1px solid var(--piano-border);

      &:hover {
        background: var(--piano-bg-secondary);
      }
    }

    &__row-pos {
      width: 2.5rem;
      color: var(--piano-text-muted);
      font-variant-numeric: tabular-nums;
    }

    &__row-name {
      flex: 1;
      color: var(--piano-text-primary);
    }

    @media (max-width: 600px) {
      padding: 0 1rem 2rem;

      &__title {
        font-size: 1.75rem;
      }

      &__podium {
        grid-template-columns: 1fr;
      }
    }
  }
</style>
