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

interface ButtondownError {
  data?: { detail?: string | Array<{ detail?: string; code?: string }> }
  statusCode?: number
}

/**
 * Extracts a string detail from a Buttondown error response.
 * Detail can be a string or an array of { detail, code } objects.
 */
function extractDetail(err: ButtondownError): string {
  const rawDetail = err?.data?.detail
  if (typeof rawDetail === 'string') return rawDetail
  if (Array.isArray(rawDetail)) {
    return rawDetail.map((d) => d?.detail ?? '').join(' ')
  }
  return ''
}

/**
 * Maps a Buttondown error to a user-friendly error code.
 * Exported for unit testing (pure function, no h3 dependency).
 */
export function mapButtondownError(err: unknown): string {
  const e = err as ButtondownError
  const detail = extractDetail(e)
  const statusCode = e?.statusCode ?? 0

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
  }

  if (statusCode === 429) {
    return 'rate-limited'
  }

  return 'service-unavailable'
}

/**
 * Validates the subscribe body. Returns error code or null if valid.
 * Exported for unit testing (pure function, no h3 dependency).
 */
export function validateSubscribeBody(body: SubscribeBody | null | undefined): string | null {
  if (!body?.email || typeof body.email !== 'string' || !EMAIL_RE.test(body.email)) {
    return 'invalid-email'
  }
  return null
}

/**
 * Core subscription logic — exported for unit testing.
 * Uses h3's createError for structured error responses.
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

  const validationError = validateSubscribeBody(body)
  if (validationError) {
    throw createError({
      statusCode: 400,
      statusMessage: validationError,
      data: { code: validationError },
    })
  }

  try {
    await $fetch('https://api.buttondown.com/v1/subscribers', {
      method: 'POST',
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: {
        email_address: body!.email as string,
        metadata: body!.metadata ?? {},
      },
    })

    return { success: true }
  } catch (err: unknown) {
    const code = mapButtondownError(err)
    const statusMap: Record<string, number> = {
      'already-subscribed': 409,
      'invalid-email': 400,
      'rate-limited': 429,
      'service-unavailable': 502,
    }
    // Stryker disable next-line EqualityOperator -- all mapButtondownError return values exist in statusMap
    throw createError({
      statusCode: statusMap[code],
      statusMessage: code,
      data: { code },
    })
  }
}

/* istanbul ignore next -- Nitro auto-import; unreachable in unit tests */
export default defineEventHandler(handleSubscribe)
