import { describe, it, expect, vi, beforeEach } from 'vitest'

// defineEventHandler is provided globally via test/setup.ts

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
import { createError, readBody } from 'h3'
import { handleSubscribe } from '~~/server/api/newsletter/subscribe.post'

describe('handleSubscribe (POST /api/newsletter/subscribe)', () => {
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

    // Restore
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

  it('throws invalid-email when email is not a string', async () => {
    mockReadBody = { email: 12345 }

    await expect(handleSubscribe({} as never)).rejects.toThrow()
    expect(createError).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
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

  // --- Buttondown error mapping ---

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

  it('throws already-subscribed when Buttondown returns "already exists"', async () => {
    mockFetch.mockRejectedValueOnce({ data: { detail: 'Subscriber already exists' } })

    await expect(handleSubscribe({} as never)).rejects.toThrow()
    expect(createError).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 409,
        data: { code: 'already-subscribed' },
      }),
    )
  })

  it('throws invalid-email when Buttondown returns "invalid"', async () => {
    mockFetch.mockRejectedValueOnce({ data: { detail: 'Invalid email format' } })

    await expect(handleSubscribe({} as never)).rejects.toThrow()
    expect(createError).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        statusMessage: 'invalid-email',
        data: { code: 'invalid-email' },
      }),
    )
  })

  it('throws invalid-email when Buttondown returns "email" in detail', async () => {
    mockFetch.mockRejectedValueOnce({ data: { detail: 'email not valid' } })

    await expect(handleSubscribe({} as never)).rejects.toThrow()
    expect(createError).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        data: { code: 'invalid-email' },
      }),
    )
  })

  it('throws rate-limited when Buttondown returns "rate limit"', async () => {
    mockFetch.mockRejectedValueOnce({ data: { detail: 'rate limit exceeded' } })

    await expect(handleSubscribe({} as never)).rejects.toThrow()
    expect(createError).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 429,
        statusMessage: 'rate-limited',
        data: { code: 'rate-limited' },
      }),
    )
  })

  it('throws rate-limited when Buttondown returns "too many"', async () => {
    mockFetch.mockRejectedValueOnce({ data: { detail: 'too many requests' } })

    await expect(handleSubscribe({} as never)).rejects.toThrow()
    expect(createError).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 429,
        data: { code: 'rate-limited' },
      }),
    )
  })

  it('throws rate-limited when Buttondown returns HTTP 429 with no detail', async () => {
    mockFetch.mockRejectedValueOnce({ statusCode: 429 })

    await expect(handleSubscribe({} as never)).rejects.toThrow()
    expect(createError).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 429,
        data: { code: 'rate-limited' },
      }),
    )
  })

  it('throws service-unavailable for unrecognized Buttondown error with detail', async () => {
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

  it('throws service-unavailable for error with no data and no statusCode', async () => {
    mockFetch.mockRejectedValueOnce({})

    await expect(handleSubscribe({} as never)).rejects.toThrow()
    expect(createError).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 502,
        statusMessage: 'service-unavailable',
        data: { code: 'service-unavailable' },
      }),
    )
  })
})
