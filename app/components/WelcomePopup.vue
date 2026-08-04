<template>
  <Teleport to="body">
    <Transition name="welcome-fade">
      <div
        v-if="isVisible"
        data-testid="welcome-popup"
        class="welcome-overlay"
        role="dialog"
        aria-modal="true"
        :aria-label="t('welcomePopup.title')"
        @click.self="dismiss"
      >
        <div ref="popupRef" class="welcome-popup">
          <!-- Close Button -->
          <button
            data-testid="welcome-close"
            class="welcome-popup__close"
            :aria-label="t('welcomePopup.close')"
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
          <div class="welcome-popup__content">
            <div class="welcome-popup__icon-wrapper">
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
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <h3 class="welcome-popup__title">
              {{ t('welcomePopup.title') }}
            </h3>
            <p class="welcome-popup__description">
              {{ t('welcomePopup.description') }}
            </p>
          </div>

          <!-- Actions -->
          <div class="welcome-popup__actions">
            <NuxtLink
              data-testid="welcome-cta"
              :to="localePath('/download')"
              class="welcome-popup__cta"
              @click="dismiss"
            >
              {{ t('welcomePopup.cta') }}
            </NuxtLink>
            <button
              data-testid="welcome-secondary"
              class="welcome-popup__secondary"
              @click="dismiss"
            >
              {{ t('welcomePopup.secondaryCta') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
  import { ref, nextTick, onMounted, onUnmounted } from 'vue'

  const { t } = useI18n()
  const localePath = useLocalePath()

  const isVisible = ref(false)
  const popupRef = ref<HTMLElement | null>(null)
  let exitTrigger: ((e: MouseEvent) => void) | null = null
  let mobileTimer: ReturnType<typeof setTimeout> | null = null
  let mobileTimer2: ReturnType<typeof setTimeout> | null = null
  let previouslyFocused: HTMLElement | null = null

  // Cookie — 7 days (shorter than before since it's a CTA, not a welcome)
  const welcomeCookie = useCookie('welcome_exit_seen', {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  // Session flag — only once per session
  const sessionKey = 'welcome_exit_session'
  const dismissSession = () => {
    if (import.meta.client && sessionStorage.getItem(sessionKey)) return true
    return false
  }

  const FOCUSABLE_SELECTOR =
    'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'

  const trapFocus = (e: KeyboardEvent) => {
    if (!popupRef.value || e.key !== 'Tab') return
    const focusable = popupRef.value.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (!first || !last) return
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isVisible.value) {
      dismiss()
    } else {
      trapFocus(e)
    }
  }

  const lockScroll = () => {
    if (import.meta.client) {
      document.body.style.overflow = 'hidden'
    }
  }

  const unlockScroll = () => {
    if (import.meta.client) {
      document.body.style.overflow = ''
    }
  }

  const show = () => {
    if (welcomeCookie.value || dismissSession()) return
    isVisible.value = true
    lockScroll()
    previouslyFocused = document.activeElement as HTMLElement
    nextTick(() => {
      const firstFocusable = popupRef.value?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
      firstFocusable?.focus()
    })
    document.addEventListener('keydown', handleKeydown)
  }

  const dismiss = () => {
    isVisible.value = false
    welcomeCookie.value = 'true'
    unlockScroll()
    document.removeEventListener('keydown', handleKeydown)
    previouslyFocused?.focus()
    if (import.meta.client) {
      sessionStorage.setItem(sessionKey, '1')
    }
  }

  onMounted(() => {
    if (welcomeCookie.value || dismissSession()) return

    const isMobile = window.innerWidth < 768
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024

    if (isMobile) {
      // Mobile: 7s initial + scroll >40% + 20s total
      let scrolled = false
      const scrollListener = () => {
        const scrollPercent =
          (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
        if (scrollPercent > 40) {
          scrolled = true
          window.removeEventListener('scroll', scrollListener)
        }
      }
      window.addEventListener('scroll', scrollListener, { passive: true })

      mobileTimer = setTimeout(() => {
        if (scrolled) show()
      }, 7000)

      mobileTimer2 = setTimeout(() => {
        show()
        window.removeEventListener('scroll', scrollListener)
      }, 20000)
    } else if (isTablet) {
      // Tablet: 10s
      mobileTimer = setTimeout(() => show(), 10000)
    } else {
      // Desktop: exit intent — mouse leaves top of viewport
      exitTrigger = (e: MouseEvent) => {
        if (e.clientY <= 0) {
          show()
          if (exitTrigger) {
            document.removeEventListener('mouseleave', exitTrigger)
            exitTrigger = null
          }
        }
      }
      document.addEventListener('mouseleave', exitTrigger)
    }
  })

  onUnmounted(() => {
    if (exitTrigger) document.removeEventListener('mouseleave', exitTrigger)
    if (mobileTimer) clearTimeout(mobileTimer)
    if (mobileTimer2) clearTimeout(mobileTimer2)
    document.removeEventListener('keydown', handleKeydown)
    unlockScroll()
  })
</script>

<style scoped lang="scss">
  .welcome-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  .welcome-popup {
    position: relative;
    width: 100%;
    max-width: 28rem;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    background: var(--piano-bg-solid);
    border-radius: var(--piano-radius-lg);
    box-shadow: var(--piano-shadow-lg);
    border: 1px solid var(--piano-border);

    &__close {
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
      width: 44px;
      height: 44px;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--piano-text-tertiary);
      transition: color 0.2s;
      padding: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--piano-radius-sm);

      &:hover {
        color: var(--piano-text-primary);
        background: var(--piano-bg-tertiary);
      }

      &:focus-visible {
        outline: 2px solid var(--piano-accent);
        outline-offset: 2px;
      }
    }

    &__content {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding-right: 2rem;
    }

    &__icon-wrapper {
      width: 3rem;
      height: 3rem;
      border-radius: 50%;
      background: rgba(0, 193, 230, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: var(--piano-cyan);
    }

    &__title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--piano-text-primary);
      line-height: 1.3;
    }

    &__description {
      font-size: 0.9375rem;
      color: var(--piano-text-secondary);
      line-height: 1.5;
    }

    &__actions {
      display: flex;
      flex-direction: column;
      gap: 0.625rem;
    }

    &__cta {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 48px;
      padding: 0.75rem 1.5rem;
      background: var(--piano-accent);
      color: var(--piano-text-on-dark);
      border-radius: var(--piano-radius-sm);
      text-decoration: none;
      transition:
        background 0.2s,
        transform 0.15s;
      cursor: pointer;

      &:hover {
        background: var(--piano-accent-hover);
        transform: translateY(-1px);
      }

      &:focus-visible {
        outline: 2px solid var(--piano-accent);
        outline-offset: 2px;
      }
    }

    &__secondary {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 40px;
      padding: 0.5rem 1rem;
      background: none;
      color: var(--piano-text-secondary);
      font-weight: 500;
      font-size: 0.875rem;
      border: none;
      border-radius: var(--piano-radius-sm);
      cursor: pointer;
      transition: color 0.2s;

      &:hover {
        color: var(--piano-text-primary);
      }

      &:focus-visible {
        outline: 2px solid var(--piano-accent);
        outline-offset: 2px;
      }
    }
  }

  /* Mobile: bottom sheet */
  @media (max-width: 767px) {
    .welcome-overlay {
      align-items: flex-end;
      padding: 0;
    }

    .welcome-popup {
      max-width: 100%;
      width: calc(100vw - 2rem);
      margin: 1rem;
      border-radius: var(--piano-radius-lg) var(--piano-radius-lg) 0 0;
      padding: 1.5rem 1.25rem 1.25rem;
      animation: welcome-slide-up 0.4s cubic-bezier(0.32, 0.72, 0, 1);
    }
  }

  @keyframes welcome-slide-up {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .welcome-fade-enter-active,
  .welcome-fade-leave-active {
    transition:
      opacity 0.3s ease,
      transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
  }

  .welcome-fade-enter-from,
  .welcome-fade-leave-to {
    opacity: 0;
  }

  /* Desktop: scale + fade */
  @media (min-width: 768px) {
    .welcome-fade-enter-from .welcome-popup,
    .welcome-fade-leave-to .welcome-popup {
      transform: scale(0.95);
    }
  }
</style>
