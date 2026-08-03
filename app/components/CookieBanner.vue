<template>
  <div
    v-if="!hasConsented"
    class="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg"
  >
    <div
      class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4"
    >
      <div class="text-sm text-gray-700 dark:text-gray-300">
        <p>
          {{ $t('cookieBanner.message') }}
          <NuxtLink
            to="/privacy"
            class="whitespace-nowrap text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium underline"
          >
            {{ $t('cookieBanner.privacyLink') }}
          </NuxtLink>
        </p>
      </div>

      <div class="flex-shrink-0 flex gap-3 w-full sm:w-auto">
        <button
          data-testid="accept-cookie-btn"
          class="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors"
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

  const hasConsented = ref(false)
  const consentCookie = useCookie('piano_cookie_consent', { maxAge: 31536000 })

  onMounted(() => {
    if (consentCookie.value === 'true') {
      hasConsented.value = true
    }
  })

  const acceptCookies = () => {
    consentCookie.value = 'true'
    hasConsented.value = true
  }
</script>
