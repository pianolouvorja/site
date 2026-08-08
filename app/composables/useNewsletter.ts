/**
 * useNewsletter — subscription management via Buttondown API.
 *
 * State machine: idle → loading → (success | error) → idle
 *
 * Buttondown API docs: POST /api/v1/subscribers
 * Auth header: "Token <api-key>"
 * Error shape: { data: { detail: "..." } }
 */

import { ref, readonly } from 'vue'

type NewsletterStatus = 'idle' | 'loading' | 'success' | 'error'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface ButtondownError {
  data?: { detail?: string }
  message?: string
}

/**
 * Maps a Buttondown/network error to a user-friendly error code.
 *
 * Error codes → i18n keys (newsletter.errors.*):
 *   invalid-email        → invalidEmail
 *   already-subscribed   → alreadySubscribed
 *   rate-limited         → rateLimited
 *   service-unavailable  → serviceUnavailable
 *   subscribe-failed     → generic
 *   unknown-error        → generic (fallback)
 */
function mapErrorToCode(e: ButtondownError | null | undefined): string {
  if (!e) return 'unknown-error'

  // Buttondown structured error: { data: { detail: "..." } }
  const detail = e?.data?.detail ?? ''
  const message = e?.message ?? ''

  if (detail) {
    const lower = detail.toLowerCase()
    if (lower.includes('already subscribed') || lower.includes('already exists')) {
      return 'already-subscribed'
    }
    if (lower.includes('invalid') || lower.includes('email')) {
      return 'invalid-email'
    }
    if (lower.includes('rate limit') || lower.includes('too many')) {
      return 'rate-limited'
    }
    // Buttondown returned an error we don't recognize
    return 'subscribe-failed'
  }

  // Network/HTTP errors (no data.detail, but may have message)
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
  const config = useRuntimeConfig()
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
      await $fetch(config.public.buttondownEndpoint, {
        method: 'POST',
        headers: {
          Authorization: `Token ${config.public.buttondownApiKey}`,
          'Content-Type': 'application/json',
        },
        body: { email, metadata: { locale: locale.value } },
      })
      status.value = 'success'
    } catch (err: unknown) {
      const e = err as ButtondownError
      status.value = 'error'

      // User-friendly error messages - don't leak API details
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
