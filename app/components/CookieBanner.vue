<template>
  <div v-if="!hasConsented" class="cookie-banner">
    <div class="cookie-banner__container">
      <div class="cookie-banner__text">
        <p>
          {{ $t('cookieBanner.message') }}
          <NuxtLink :to="localePath('/privacy')" class="cookie-banner__link">
            {{ $t('cookieBanner.privacyLink') }}
          </NuxtLink>
        </p>
      </div>

      <div class="cookie-banner__actions">
        <button
          data-testid="reject-cookie-btn"
          class="cookie-banner__button cookie-banner__button--reject"
          @click="rejectCookies"
        >
          {{ $t('cookieBanner.reject') }}
        </button>
        <button
          data-testid="accept-cookie-btn"
          class="cookie-banner__button"
          @click="acceptCookies"
        >
          {{ $t('cookieBanner.accept') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'

  const localePath = useLocalePath()
  const hasConsented = ref(false)
  const consentCookie = useCookie<'true' | 'false' | undefined>('piano_cookie_consent', {
    maxAge: 31536000,
  })

  /**
   * Updates Google Consent Mode v2 signals.
   * Called on mount (with stored value) and on user action.
   */
  function updateConsent(granted: boolean) {
    // Stryker disable next-line ConditionalExpression -- import.meta.client→true is equivalent in jsdom test env
    if (import.meta.client) {
      const w = window as unknown as { gtag?: (...args: unknown[]) => void }
      if (typeof w.gtag === 'function') {
        w.gtag('consent', 'update', {
          analytics_storage: granted ? 'granted' : 'denied',
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
        })
      }
    }
  }

  onMounted(() => {
    if (consentCookie.value === 'true') {
      hasConsented.value = true
      updateConsent(true)
    } else if (consentCookie.value === 'false') {
      hasConsented.value = true
      updateConsent(false)
    }
    // If no cookie, banner shows — default consent "denied" is set by nuxt-gtag initialConsent: false
  })

  const acceptCookies = () => {
    consentCookie.value = 'true'
    hasConsented.value = true
    updateConsent(true)
  }

  const rejectCookies = () => {
    consentCookie.value = 'false'
    hasConsented.value = true
    updateConsent(false)
  }
</script>

<style scoped lang="scss">
  .cookie-banner {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 50;
    background: var(--piano-dark);
    border-top: 1px solid var(--piano-cyan);

    &__container {
      max-width: 75rem;
      margin: 0 auto;
      padding: 1rem 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;

      @media (min-width: 640px) {
        flex-direction: row;
      }
    }

    &__text {
      font-size: 0.875rem;
      color: var(--piano-white);

      p {
        margin: 0;
      }
    }

    &__link {
      white-space: nowrap;
      color: var(--piano-cyan);
      font-weight: 500;
      text-decoration: underline;

      &:hover {
        color: var(--piano-cyan-light);
      }
    }

    &__actions {
      flex-shrink: 0;
      display: flex;
      gap: 0.75rem;
      width: 100%;

      @media (min-width: 640px) {
        width: auto;
      }
    }

    &__button {
      width: 100%;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: var(--piano-radius-sm);
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--piano-white);
      background: var(--piano-blue);
      cursor: pointer;
      transition: background 0.2s;

      @media (min-width: 640px) {
        width: auto;
      }

      &:hover {
        background: var(--piano-blue-deep);
      }

      &--reject {
        background: transparent;
        border: 1px solid var(--piano-border-subtle);
        color: var(--piano-text-on-dark-secondary);

        &:hover {
          background: var(--piano-slate);
          color: var(--piano-text-on-dark);
        }
      }
    }
  }
</style>
