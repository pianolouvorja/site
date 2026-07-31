<script setup lang="ts">
  import type { NuxtError } from '#app'

  // Stryker disable all
  // Stryker disable all
  defineProps({
    error: {
      type: Object as () => NuxtError,
      required: true,
    },
  })
  // Stryker restore all
  // Stryker restore all

  // Se estivermos em dev, vamos expor os detalhes do erro para facilitar o debug
  const isDev = computed(() => import.meta.dev)

  function handleError() {
    clearError({ redirect: '/' })
  }
</script>

<template>
  <div class="error-page">
    <div class="error-page__bg-gradient" />

    <main class="error-page__container">
      <div class="error-page__icon">
        <i class="ti" :class="error?.statusCode === 404 ? 'ti-error-404' : 'ti-alert-circle'" />
      </div>

      <h1 class="error-page__title">
        {{ error?.statusCode === 404 ? $t('error.title404') : $t('error.title500') }}
      </h1>

      <p class="error-page__message">
        {{ error?.message || $t('error.defaultMessage') }}
      </p>

      <div v-if="isDev && error?.stack" class="error-page__dev-info">
        <pre>{{ error.stack }}</pre>
      </div>

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
          v-if="error?.statusCode !== 404"
          href="mailto:contato@pianolouvorja.com"
          class="error-page__btn error-page__btn--secondary"
        >
          <i class="ti ti-mail" />
          {{ $t('error.reportIssue') }}
        </a>
      </div>
    </main>
  </div>
</template>

<style scoped>
  /* Base styles */
  .error-page {
    position: relative;
    display: flex;
    min-height: 100vh;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    background-color: var(--color-surface);
    overflow: hidden;
  }

  /* Decorative background */
  .error-page__bg-gradient {
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle at top center,
      rgba(var(--color-primary-rgb), 0.05) 0%,
      transparent 50%
    );
    pointer-events: none;
  }

  /* Container */
  .error-page__container {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: 36rem;
    text-align: center;
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 1.5rem;
    padding: 3rem 2rem;
    box-shadow:
      0 20px 25px -5px rgba(0, 0, 0, 0.05),
      0 8px 10px -6px rgba(0, 0, 0, 0.05);
  }

  /* Icon */
  .error-page__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 5rem;
    height: 5rem;
    border-radius: 9999px;
    background-color: rgba(var(--color-primary-rgb), 0.1);
    color: var(--color-primary);
    margin-bottom: 1.5rem;
  }

  .error-page__icon i {
    font-size: 2.5rem;
  }

  /* Typography */
  .error-page__title {
    font-size: 2rem;
    font-weight: 700;
    letter-spacing: -0.025em;
    color: var(--color-text-primary);
    margin-bottom: 1rem;
    line-height: 1.2;
  }

  .error-page__message {
    font-size: 1.125rem;
    color: var(--color-text-secondary);
    margin-bottom: 2rem;
    max-width: 28rem;
    margin-inline: auto;
  }

  /* Actions */
  .error-page__actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    justify-content: center;
  }

  @media (min-width: 600px) {
    .error-page__actions {
      flex-direction: row;
    }
  }

  /* Buttons */
  .error-page__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border-radius: 0.75rem;
    font-weight: 500;
    font-size: 1rem;
    transition: all 0.2s ease;
    width: 100%;
    cursor: pointer;
    text-decoration: none;
  }

  @media (min-width: 600px) {
    .error-page__btn {
      width: auto;
    }
  }

  .error-page__btn--primary {
    background-color: var(--color-primary);
    color: white;
    border: none;
    box-shadow: 0 4px 6px -1px rgba(var(--color-primary-rgb), 0.2);
  }

  .error-page__btn--primary:hover {
    background-color: var(--color-primary-hover);
    transform: translateY(-1px);
    box-shadow: 0 6px 8px -1px rgba(var(--color-primary-rgb), 0.3);
  }

  .error-page__btn--secondary {
    background-color: transparent;
    color: var(--color-text-secondary);
    border: 1px solid var(--color-border);
  }

  .error-page__btn--secondary:hover {
    background-color: var(--color-bg-hover);
    color: var(--color-text-primary);
  }

  /* Developer info */
  .error-page__dev-info {
    margin: 1.5rem 0;
    padding: 1rem;
    background-color: #1e1e1e;
    border-radius: 0.5rem;
    text-align: left;
    overflow-x: auto;
  }

  .error-page__dev-info pre {
    color: #e5e5e5;
    font-family: monospace;
    font-size: 0.875rem;
    white-space: pre-wrap;
    word-break: break-all;
  }
</style>
