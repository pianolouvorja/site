import type { DeviceInfo } from '~/utils/device-detection'

/**
 * Composable: detects the visitor's device platform (client-only, on mount)
 * and exposes which download category should be highlighted/recommended.
 *
 * SSR-safe: state starts as `null` and is set in onMounted, so the server
 * render matches the initial client render (no hydration mismatch).
 */
export function useDeviceRecommendation() {
  const device = ref<DeviceInfo | null>(null)

  onMounted(() => {
    device.value = detectDevice(navigator.userAgent)
  })

  /** True once detection has run (client only). */
  const ready = computed(() => device.value !== null)

  /** Category to highlight first on /download ('tv' | 'mobile' | 'desktop' | null). */
  const recommendedCategory = computed(() => device.value?.category ?? null)

  /** True when the visitor is on any TV platform. */
  const isTv = computed(() => device.value?.category === 'tv')

  return { device, ready, recommendedCategory, isTv }
}
