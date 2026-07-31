<script setup lang="ts">
  import type { NuxtError } from '#app'

  const props = defineProps<{
    error: NuxtError
  }>()

  const { t } = useI18n()

  const is500 = computed(() => (props.error?.statusCode ?? 500) >= 500)
  const is404 = computed(() => props.error?.statusCode === 404)
  const isDev = computed(() => import.meta.dev)

  const errorCode = computed(() => props.error?.statusCode ?? 500)
  const errorTitle = computed(() => (is404.value ? t('error.title') : t('error.serverErrorTitle')))
  const errorDesc = computed(() => (is404.value ? t('error.desc404') : t('error.desc500')))
  const metaDesc = computed(() => (is404.value ? t('error.metaDesc404') : t('error.metaDesc500')))
  const errorIcon = computed(() => (is404.value ? 'ti-compass-off' : 'ti-server-off'))

  // SEO
  useHead({
    title: () => `${errorCode.value} — PIANO LouvorJA`,
    meta: [{ name: 'description', content: () => metaDesc.value }],
  })

  function handleError() {
    clearError({ redirect: '/' })
  }
</script>

<template>
  <div class="error-page">
    <div class="error-page__bg-gradient" />

    <main class="error-page__container">
      <div class="error-page__icon">
        <i :class="`ti ${errorIcon}`" />
      </div>

      <div class="error-page__code">
        {{ errorCode }}
      </div>

      <h1 class="error-page__title">
        {{ errorTitle }}
      </h1>

      <p class="error-page__description">
        {{ errorDesc }}
      </p>

      <!-- Only show detailed error in development -->
      <p v-if="!is404 && error?.message && isDev" class="error-page__detail">
        {{ error.message }}
      </p>

      <div class="error-page__actions">
        <button
          class="error-page__btn error-page__btn--primary"
          data-testid="error-back-home"
          @click="handleError"
        >
          <i class="ti ti-home" />
          {{ $t('error.backHome') }}
        </button>

        <a
          v-if="is500"
          href="mailto:contato@pianolouvorja.com?subject=Erro%20500%20PIANO%20LouvorJA"
          class="error-page__btn error-page__btn--secondary"
        >
          <i class="ti ti-bug" />
          {{ $t('error.reportIssue') }}
        </a>
      </div>
    </main>
  </div>
</template>

<style scoped lang="scss">
  .error-page {
    position: relative;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: var(--piano-dark);

    &__bg-gradient {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse at top, rgba(4, 84, 155, 0.4) 0%, transparent 50%),
        radial-gradient(ellipse at bottom, rgba(0, 193, 230, 0.15) 0%, transparent 50%);
      pointer-events: none;
    }

    &__container {
      position: relative;
      z-index: 1;
      text-align: center;
      padding: 2rem 1.5rem;
      max-width: 560px;
    }

    &__icon {
      font-size: 4rem;
      color: var(--piano-cyan);
      margin-bottom: 1.5rem;
      opacity: 0.8;
    }

    &__code {
      font-size: clamp(6rem, 20vw, 10rem);
      font-weight: 800;
      line-height: 1;
      background: linear-gradient(135deg, var(--piano-blue-light), var(--piano-cyan));
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 1rem;
      letter-spacing: -0.04em;
    }

    &__title {
      font-size: clamp(1.5rem, 4vw, 2rem);
      font-weight: 700;
      color: #fff;
      margin: 0 0 1rem;
    }

    &__description {
      font-size: 1.1rem;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.7);
      margin: 0 0 2rem;
    }

    &__detail {
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.4);
      font-family: ui-monospace, 'SF Mono', Monaco, monospace;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: var(--piano-radius-sm);
      padding: 0.75rem 1rem;
      margin: 0 0 2rem;
      word-break: break-word;
    }

    &__actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    &__btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.875rem 1.75rem;
      border-radius: var(--piano-radius-full);
      font-size: 1rem;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      border: none;
      transition: all 0.2s;

      &--primary {
        background: linear-gradient(135deg, var(--piano-blue), var(--piano-cyan));
        color: #fff;

        &:hover {
          transform: translateY(-2px);
          box-shadow: var(--piano-shadow-glow);
        }
      }

      &--secondary {
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.9);
        border: 1px solid rgba(255, 255, 255, 0.15);

        &:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.3);
        }
      }

      @media (max-width: 480px) {
        width: 100%;
        justify-content: center;
      }
    }
  }
</style>
