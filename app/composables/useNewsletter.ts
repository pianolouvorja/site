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
      if (e?.data?.detail) {
        // Map Buttondown API errors to user-friendly messages
        if (
          e.data.detail.includes('already subscribed') ||
          e.data.detail.includes('already exists')
        ) {
          errorMessage.value = 'already-subscribed'
        } else if (e.data.detail.includes('invalid') || e.data.detail.includes('email')) {
          errorMessage.value = 'invalid-email'
        } else if (e.data.detail.includes('rate limit') || e.data.detail.includes('too many')) {
          errorMessage.value = 'rate-limited'
        } else {
          errorMessage.value = 'subscribe-failed'
        }
      } else if (e?.message?.includes('404') || e?.message?.includes('Not Found')) {
        errorMessage.value = 'service-unavailable'
      } else {
        errorMessage.value = 'unknown-error'
      }
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
