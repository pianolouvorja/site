import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock useRuntimeConfig
vi.stubGlobal('useRuntimeConfig', () => ({
  buttondownApiKey: 'bd_test_key',
}))

// Mock global fetch
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

import {
  parseSub,
  fetchSubscribers,
  getSubscriberCount,
  removeSubscriber,
  type Subscriber,
} from '~~/server/utils/subscribers'

describe('parseSub', () => {
  it('extracts locale from metadata', () => {
    const raw = {
      email: 'test@example.com',
      metadata: { locale: 'en' },
    }
    const sub = parseSub(raw)
    expect(sub.locale).toBe('en')
  })

  it('defaults to pt-BR when no metadata', () => {
    const raw = { email: 'test@example.com' }
    const sub = parseSub(raw)
    expect(sub.locale).toBe('pt-BR')
  })

  it('defaults to pt-BR when metadata exists but no locale', () => {
    const raw = { email: 'test@example.com', metadata: { other: 'val' } }
    const sub = parseSub(raw)
    expect(sub.locale).toBe('pt-BR')
  })

  it('extracts other fields correctly', () => {
    const raw = {
      email: 'user@test.com',
      creation_date: '2026-01-01',
      tags: ['newsletter'],
      secondary_type: 'regular',
      metadata: { locale: 'es' },
    }
    const sub = parseSub(raw)
    expect(sub).toEqual({
      email: 'user@test.com',
      createdAt: '2026-01-01',
      tags: ['newsletter'],
      active: true,
      locale: 'es',
    })
  })

  it('handles active=false for non-regular secondary_type', () => {
    const raw = {
      email: 'unsub@test.com',
      secondary_type: 'unsubscribed',
    }
    const sub = parseSub(raw)
    expect(sub.active).toBe(false)
  })
})

describe('Subscriber interface', () => {
  it('has locale field', () => {
    const sub: Subscriber = {
      email: 'test@example.com',
      createdAt: '2026-01-01',
      tags: [],
      active: true,
      locale: 'en',
    }
    expect(sub.locale).toBe('en')
  })
})

describe('fetchSubscribers', () => {
  beforeEach(() => mockFetch.mockReset())

  it('returns empty array when no API key', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({ buttondownApiKey: '' }))
    const result = await fetchSubscribers()
    expect(result).toEqual([])
  })

  it('fetches and parses subscribers with pagination', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({ buttondownApiKey: 'bd_test' }))
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [
            { email: 'a@test.com', creation_date: '2026-01-01', metadata: { locale: 'en' } },
            { email: 'b@test.com', created_at: '2026-02-01' },
          ],
          next: 'https://api.buttondown.com/api/v1/subscribers?page=2',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [{ email: 'c@test.com', secondary_type: 'unsubscribed' }],
          next: null,
        }),
      })

    const result = await fetchSubscribers()

    expect(result).toHaveLength(3)
    expect(result[0]!.locale).toBe('en')
    expect(result[1]!.locale).toBe('pt-BR')
    expect(result[2]!.active).toBe(false)
  })

  it('handles missing results (uses empty array fallback)', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({ buttondownApiKey: 'bd_test' }))
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ next: null }), // no results field
    })

    const result = await fetchSubscribers()
    expect(result).toEqual([])
  })

  it('stops on non-ok response', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({ buttondownApiKey: 'bd_test' }))
    mockFetch.mockResolvedValueOnce({ ok: false, json: async () => ({}) })

    const result = await fetchSubscribers()
    expect(result).toEqual([])
  })
})

describe('getSubscriberCount', () => {
  beforeEach(() => mockFetch.mockReset())

  it('returns 0 when no API key', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({ buttondownApiKey: '' }))
    expect(await getSubscriberCount()).toBe(0)
  })

  it('returns count from API', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({ buttondownApiKey: 'bd_test' }))
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ count: 42 }),
    })
    expect(await getSubscriberCount()).toBe(42)
  })

  it('returns 0 on non-ok response', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({ buttondownApiKey: 'bd_test' }))
    mockFetch.mockResolvedValueOnce({ ok: false, json: async () => ({}) })
    expect(await getSubscriberCount()).toBe(0)
  })

  it('returns 0 on network error', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({ buttondownApiKey: 'bd_test' }))
    mockFetch.mockRejectedValueOnce(new Error('Network'))
    expect(await getSubscriberCount()).toBe(0)
  })

  it('falls back to results length when no count', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({ buttondownApiKey: 'bd_test' }))
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [{ email: 'a@test.com' }, { email: 'b@test.com' }] }),
    })
    expect(await getSubscriberCount()).toBe(2)
  })

  it('returns 0 when count and results are both missing', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({ buttondownApiKey: 'bd_test' }))
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}), // no count, no results
    })
    expect(await getSubscriberCount()).toBe(0)
  })
})

describe('removeSubscriber', () => {
  beforeEach(() => mockFetch.mockReset())

  it('returns false when no API key', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({ buttondownApiKey: '' }))
    expect(await removeSubscriber('test@example.com')).toBe(false)
  })

  it('returns true on 200 OK', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({ buttondownApiKey: 'key' }))
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200 })
    expect(await removeSubscriber('test@example.com')).toBe(true)
  })

  it('returns true on 204 No Content', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({ buttondownApiKey: 'key' }))
    mockFetch.mockResolvedValueOnce({ ok: false, status: 204 })
    expect(await removeSubscriber('test@example.com')).toBe(true)
  })

  it('returns false on error response', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({ buttondownApiKey: 'key' }))
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404 })
    expect(await removeSubscriber('test@example.com')).toBe(false)
  })

  it('returns false on network error', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({ buttondownApiKey: 'key' }))
    mockFetch.mockRejectedValueOnce(new Error('Network'))
    expect(await removeSubscriber('test@example.com')).toBe(false)
  })
})
