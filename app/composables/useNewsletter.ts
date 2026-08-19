/**
 * useNewsletter — subscription management via server-side proxy.
 *
 * The client calls our own /api/newsletter/subscribe endpoint (Nitro),
 * which proxies to Buttondown server-side, keeping the API key private.
 *
 * State machine: idle → loading → (success | error) → idle
 *
 * Error codes returned by the server endpoint:
 *   invalid-email, already-subscribed, rate-limited, service-unavailable, unknown-error
 */

import { ref, readonly } from 'vue'

type NewsletterStatus = 'idle' | 'loading' | 'success' | 'error'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface ServerErrorResponse {
  data?: { code?: string }
  message?: string
}

/**
 * Maps a server error response to a user-friendly error code.
 */
function mapErrorToCode(e: ServerErrorResponse | null | undefined): string {
  if (!e) return 'unknown-error'

  // Server returns structured error: { data: { code: "..." } }
  const code = e?.data?.code
  if (code) return code

  // Fallback: try message-based detection (network errors, etc.)
  const message = e?.message ?? ''
  if (message) {
    const lower = message.toLowerCase()
    if (
      lower.includes('404') ||
      lower.includes('not found') ||
      lower.includes('503') ||
      lower.includes('service unavailable') ||
      lower.includes('timeout') ||
      lower.includes('timed out') ||
      lower.includes('network') ||
      lower.includes('fetch failed') ||
      lower.includes('econnrefused') ||
      lower.includes('econnreset')
    ) {
      return 'service-unavailable'
    }
  }

  return 'unknown-error'
}

export function useNewsletter() {
  const { locale } = useI18n()
  const status = ref<NewsletterStatus>('idle')
  const errorMessage = ref('')

  function validateEmail(email: string): boolean {
    return EMAIL_RE.test(email)
  }

  function reset(): void {
    status.value = 'idle'
    errorMessage.value = ''
  }

  async function subscribe(email: string): Promise<void> {
    if (!validateEmail(email)) {
      status.value = 'error'
      errorMessage.value = 'invalid-email'
      return
    }

    status.value = 'loading'
    errorMessage.value = ''

    try {
      await $fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: { email, metadata: { locale: locale.value } },
      })
      status.value = 'success'
    } catch (err: unknown) {
      const e = err as ServerErrorResponse
      status.value = 'error'
      errorMessage.value = mapErrorToCode(e)
    }
  }

  return {
    status: readonly(status),
    errorMessage: readonly(errorMessage),
    validateEmail,
    subscribe,
    reset,
  }
}
