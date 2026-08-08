/**
 * Server-side proxy for Buttondown newsletter subscriptions.
 *
 * Why: keeps the Buttondown API key server-side only (never exposed to the browser).
 * Receives email + locale from the client, calls Buttondown, and returns a
 * structured response with user-friendly error codes.
 *
 * Error codes returned (matched by useNewsletter.mapErrorToCode):
 *   invalid-email, already-subscribed, rate-limited, service-unavailable, unknown-error
 */

import { readBody, createError, type H3Event } from 'h3'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface SubscribeBody {
  email?: unknown
  metadata?: Record<string, string>
}

interface ButtondownErrorDetail {
  detail?: string
  statusCode?: number
  data?: { detail?: string }
}

/**
 * Core subscription logic — exported for unit testing.
 * Throws structured errors with { data: { code } } for the client to map.
 */
export async function handleSubscribe(event: H3Event): Promise<{ success: true }> {
  const config = useRuntimeConfig()
  const apiKey = config.buttondownApiKey

  if (!apiKey) {
    throw createError({
      statusCode: 503,
      statusMessage: 'service-unavailable',
      data: { code: 'service-unavailable' },
    })
  }

  const body = await readBody<SubscribeBody>(event)

  if (!body?.email || typeof body.email !== 'string' || !EMAIL_RE.test(body.email)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'invalid-email',
      data: { code: 'invalid-email' },
    })
  }

  try {
    await $fetch('https://api.buttondown.com/api/v1/subscribers', {
      method: 'POST',
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: {
        email: body.email,
        metadata: body.metadata ?? {},
      },
    })

    return { success: true }
  } catch (err: unknown) {
    const e = err as ButtondownErrorDetail

    const detail = e?.data?.detail ?? ''
    const statusCode = e?.statusCode ?? 0

    if (detail) {
      const lower = detail.toLowerCase()
      if (lower.includes('already subscribed') || lower.includes('already exists')) {
        throw createError({
          statusCode: 409,
          statusMessage: 'already-subscribed',
          data: { code: 'already-subscribed' },
        })
      }
      if (lower.includes('invalid') || lower.includes('email')) {
        throw createError({
          statusCode: 400,
          statusMessage: 'invalid-email',
          data: { code: 'invalid-email' },
        })
      }
      if (lower.includes('rate limit') || lower.includes('too many')) {
        throw createError({
          statusCode: 429,
          statusMessage: 'rate-limited',
          data: { code: 'rate-limited' },
        })
      }
    }

    // HTTP status-based fallback
    if (statusCode === 429) {
      throw createError({
        statusCode: 429,
        statusMessage: 'rate-limited',
        data: { code: 'rate-limited' },
      })
    }

    throw createError({
      statusCode: 502,
      statusMessage: 'service-unavailable',
      data: { code: 'service-unavailable' },
    })
  }
}

/* istanbul ignore next -- Nitro auto-import; unreachable in unit tests */
export default defineEventHandler(handleSubscribe)
