<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isVisible"
        data-testid="welcome-popup"
        class="fixed bottom-4 right-4 z-50 w-full max-w-sm rounded-lg bg-surface shadow-2xl ring-1 ring-primary/20 p-6 flex flex-col gap-4"
      >
        <!-- Close Button -->
        <button
          data-testid="welcome-close"
          class="absolute top-4 right-4 text-text-muted hover:text-text"
          aria-label="Close"
          @click="dismiss"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <!-- Content -->
        <div class="flex items-start gap-3">
          <div
            class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="text-primary"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div>
            <h3 class="font-bold text-lg text-text">
              {{ t('welcomePopup.title') }}
            </h3>
            <p class="text-sm text-text-muted mt-1">
              {{ t('welcomePopup.description') }}
            </p>
          </div>
        </div>

        <!-- Action -->
        <NuxtLink
          to="/contact"
          class="mt-2 w-full text-center px-4 py-2 bg-primary text-background font-semibold rounded hover:bg-primary/90 transition-colors"
          @click="dismiss"
        >
          {{ t('welcomePopup.action') }}
        </NuxtLink>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'

  const { t } = useI18n()

  // Cookie tracking visits for 30 days
  const welcomeCookie = useCookie('welcome_seen', {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  })

  const isVisible = ref(false)
  let timer: number | null = null

  onMounted(() => {
    // If user hasn't seen it, show after 5s
    if (!welcomeCookie.value) {
      timer = globalThis.setTimeout(() => {
        isVisible.value = true
      }, 5000) as unknown as number
    }
  })

  onUnmounted(() => {
    if (timer) globalThis.clearTimeout(timer)
  })

  const dismiss = () => {
    isVisible.value = false
    // Cast via true flag in cookie so they don't see it again for a month
    welcomeCookie.value = 'true'
  }
</script>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition:
      opacity 0.3s ease,
      transform 0.3s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
    transform: translateY(20px);
  }
</style>
