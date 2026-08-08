import { describe, it, expect, vi, beforeEach } from 'vitest'

// --- Mocks ---

const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

vi.stubGlobal('useRuntimeConfig', () => ({
  buttondownApiKey: 'bd_test_key',
}))

// Mutable body value (referenced by hoisted mock factory)
let mockReadBody: { email?: unknown; metadata?: Record<string, string> } = {
  email: 'user@example.com',
  metadata: { locale: 'pt-BR' },
}

vi.mock('h3', () => ({
  readBody: vi.fn(async () => mockReadBody),
  createError: vi.fn((opts: Record<string, unknown>) => {
    const err = new Error(opts.statusMessage as string)
    Object.assign(err, opts)
    return err
  }),
}))

// Import AFTER mocks
import { readBody, createError } from 'h3'
import {
  handleSubscribe,
  mapButtondownError,
  validateSubscribeBody,
} from '~~/server/api/newsletter/subscribe.post'

describe('validateSubscribeBody', () => {
  it('returns null for valid email with metadata', () => {
    expect(
      validateSubscribeBody({ email: 'user@example.com', metadata: { locale: 'pt-BR' } }),
    ).toBeNull()
  })

  it('returns null for valid email without metadata', () => {
    expect(validateSubscribeBody({ email: 'user@example.com' })).toBeNull()
  })

  it('returns invalid-email when email is missing', () => {
    expect(validateSubscribeBody({ email: undefined })).toBe('invalid-email')
  })

  it('returns invalid-email when email is not a string', () => {
    expect(validateSubscribeBody({ email: 12345 })).toBe('invalid-email')
  })

  it('returns invalid-email when email fails regex', () => {
    expect(validateSubscribeBody({ email: 'not-an-email' })).toBe('invalid-email')
  })

  it('returns invalid-email when body is null', () => {
    expect(validateSubscribeBody(null)).toBe('invalid-email')
  })

  it('returns invalid-email when body is undefined', () => {
    expect(validateSubscribeBody(undefined)).toBe('invalid-email')
  })

  it('accepts email with subdomains', () => {
    expect(validateSubscribeBody({ email: 'user@mail.example.co.uk' })).toBeNull()
  })
})

describe('mapButtondownError', () => {
  it('maps "already subscribed" detail to already-subscribed', () => {
    expect(mapButtondownError({ data: { detail: 'already subscribed' } })).toBe(
      'already-subscribed',
    )
  })

  it('maps "already exists" detail to already-subscribed', () => {
    expect(mapButtondownError({ data: { detail: 'Subscriber already exists' } })).toBe(
      'already-subscribed',
    )
  })

  it('maps "invalid" detail to invalid-email', () => {
    expect(mapButtondownError({ data: { detail: 'Invalid email format' } })).toBe('invalid-email')
  })

  it('maps "email" in detail to invalid-email', () => {
    expect(mapButtondownError({ data: { detail: 'email not valid' } })).toBe('invalid-email')
  })

  it('maps "rate limit" detail to rate-limited', () => {
    expect(mapButtondownError({ data: { detail: 'rate limit exceeded' } })).toBe('rate-limited')
  })

  it('maps "too many" detail to rate-limited', () => {
    expect(mapButtondownError({ data: { detail: 'too many requests' } })).toBe('rate-limited')
  })

  it('maps HTTP 429 statusCode to rate-limited (no detail)', () => {
    expect(mapButtondownError({ statusCode: 429 })).toBe('rate-limited')
  })

  it('maps unrecognized detail to service-unavailable', () => {
    expect(mapButtondownError({ data: { detail: 'Some unknown error' } })).toBe(
      'service-unavailable',
    )
  })

  it('maps generic Error without detail to service-unavailable', () => {
    expect(mapButtondownError(new Error('Connection refused'))).toBe('service-unavailable')
  })

  it('maps empty object to service-unavailable', () => {
    expect(mapButtondownError({})).toBe('service-unavailable')
  })

  it('maps null to service-unavailable', () => {
    expect(mapButtondownError(null)).toBe('service-unavailable')
  })

  it('maps undefined to service-unavailable', () => {
    expect(mapButtondownError(undefined)).toBe('service-unavailable')
  })

  it('maps error with detail but no recognized pattern to service-unavailable', () => {
    expect(mapButtondownError({ data: { detail: 'something weird happened' } })).toBe(
      'service-unavailable',
    )
  })

  it('maps error with statusCode but not 429 to service-unavailable', () => {
    expect(mapButtondownError({ statusCode: 500 })).toBe('service-unavailable')
  })
})

describe('handleSubscribe', () => {
  beforeEach(() => {
    mockFetch.mockReset()
    vi.mocked(createError).mockClear()
    vi.mocked(readBody).mockClear()
    mockReadBody = { email: 'user@example.com', metadata: { locale: 'pt-BR' } }
  })

  it('returns success when Buttondown accepts the subscription', async () => {
    mockFetch.mockResolvedValueOnce({ id: '123' })

    const result = await handleSubscribe({} as never)

    expect(result).toEqual({ success: true })
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.buttondown.com/api/v1/subscribers',
      expect.objectContaining({
        method: 'POST',
        headers: {
          Authorization: 'Token bd_test_key',
          'Content-Type': 'application/json',
        },
        body: {
          email: 'user@example.com',
          metadata: { locale: 'pt-BR' },
        },
      }),
    )
  })

  it('sends empty metadata when not provided', async () => {
    mockReadBody = { email: 'user@example.com' }
    mockFetch.mockResolvedValueOnce({ id: '123' })

    await handleSubscribe({} as never)

    const callArgs = mockFetch.mock.calls[0]![1] as { body: Record<string, unknown> }
    expect(callArgs.body.metadata).toEqual({})
  })

  it('throws service-unavailable when API key is not configured', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({ buttondownApiKey: '' }))

    await expect(handleSubscribe({} as never)).rejects.toThrow()
    expect(createError).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 503,
        statusMessage: 'service-unavailable',
        data: { code: 'service-unavailable' },
      }),
    )

    vi.stubGlobal('useRuntimeConfig', () => ({ buttondownApiKey: 'bd_test_key' }))
  })

  it('throws invalid-email when email is missing', async () => {
    mockReadBody = { email: undefined }

    await expect(handleSubscribe({} as never)).rejects.toThrow()
    expect(createError).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        statusMessage: 'invalid-email',
        data: { code: 'invalid-email' },
      }),
    )
  })

  it('throws invalid-email when email fails regex', async () => {
    mockReadBody = { email: 'not-an-email' }

    await expect(handleSubscribe({} as never)).rejects.toThrow()
    expect(createError).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        data: { code: 'invalid-email' },
      }),
    )
  })

  it('throws already-subscribed when Buttondown returns "already subscribed"', async () => {
    mockFetch.mockRejectedValueOnce({ data: { detail: 'already subscribed' } })

    await expect(handleSubscribe({} as never)).rejects.toThrow()
    expect(createError).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 409,
        statusMessage: 'already-subscribed',
        data: { code: 'already-subscribed' },
      }),
    )
  })

  it('throws rate-limited when Buttondown returns "rate limit"', async () => {
    mockFetch.mockRejectedValueOnce({ data: { detail: 'rate limit exceeded' } })

    await expect(handleSubscribe({} as never)).rejects.toThrow()
    expect(createError).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 429,
        data: { code: 'rate-limited' },
      }),
    )
  })

  it('throws service-unavailable for unrecognized Buttondown error', async () => {
    mockFetch.mockRejectedValueOnce({ data: { detail: 'Some unknown error' } })

    await expect(handleSubscribe({} as never)).rejects.toThrow()
    expect(createError).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 502,
        statusMessage: 'service-unavailable',
        data: { code: 'service-unavailable' },
      }),
    )
  })

  it('throws service-unavailable for generic error without detail', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Connection refused'))

    await expect(handleSubscribe({} as never)).rejects.toThrow()
    expect(createError).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 502,
        data: { code: 'service-unavailable' },
      }),
    )
  })
})
