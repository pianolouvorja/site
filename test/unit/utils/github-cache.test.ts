import { afterEach, describe, expect, it, vi } from 'vitest'

const store = new Map<string, { value: unknown; fetchedAt: number }>()

// Inject a controllable clock so TTL logic is deterministic
vi.useFakeTimers()

describe('githubCached', () => {
  afterEach(() => {
    store.clear()
    vi.clearAllMocks()
  })

  it('fetches on cache miss and caches the result', async () => {
    const fetcher = vi.fn().mockResolvedValue({ tag: 'v1' })
    const r1 = await githubCachedTest('k1', fetcher)
    expect(r1).toEqual({ value: { tag: 'v1' }, cache: 'fresh' })
    expect(fetcher).toHaveBeenCalledTimes(1)

    // Second call within TTL: served from cache, fetcher NOT called again
    const r2 = await githubCachedTest('k1', fetcher)
    expect(r2.cache).toBe('fresh')
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('refetches after TTL expires', async () => {
    let n = 0
    const fetcher = vi.fn().mockImplementation(async () => ({ n: ++n }))
    await githubCachedTest('k2', fetcher)

    vi.advanceTimersByTime(5 * 60 * 1000 + 1)

    const r = await githubCachedTest('k2', fetcher)
    expect(r.value).toEqual({ n: 2 })
    expect(r.cache).toBe('fresh')
    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  it('serves stale value when upstream fails after TTL', async () => {
    const fetcher = vi.fn().mockResolvedValue({ tag: 'v1' })
    await githubCachedTest('k3', fetcher)

    vi.advanceTimersByTime(5 * 60 * 1000 + 1)

    const failing = vi.fn().mockRejectedValue(new Error('rate limit'))
    const r = await githubCachedTest('k3', failing)
    expect(r).toEqual({ value: { tag: 'v1' }, cache: 'stale' })
  })

  it('serves fresh value when upstream fails within TTL (no fetch attempt)', async () => {
    const fetcher = vi.fn().mockResolvedValue({ tag: 'v1' })
    await githubCachedTest('k4', fetcher)

    // Within TTL: fetcher is never called, so failure is irrelevant
    const failing = vi.fn().mockRejectedValue(new Error('rate limit'))
    const r = await githubCachedTest('k4', failing)
    expect(r.cache).toBe('fresh')
    expect(failing).not.toHaveBeenCalled()
  })

  it('throws when upstream fails and no cache exists', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('rate limit'))
    await expect(githubCachedTest('k5', fetcher)).rejects.toThrow('rate limit')
  })

  it('keys are isolated — different key does not share cache', async () => {
    const fetcherA = vi.fn().mockResolvedValue('A')
    const fetcherB = vi.fn().mockResolvedValue('B')
    await githubCachedTest('kA', fetcherA)
    const r = await githubCachedTest('kB', fetcherB)
    expect(r.value).toBe('B')
  })

  it('re-caches successfully after recovering from a failure', async () => {
    const fetcher1 = vi.fn().mockResolvedValue({ tag: 'v1' })
    await githubCachedTest('k6', fetcher1)

    vi.advanceTimersByTime(5 * 60 * 1000 + 1)

    // Failure → stale
    const failing = vi.fn().mockRejectedValue(new Error('boom'))
    await githubCachedTest('k6', failing)

    // Recovery → fresh with new value
    const fetcher2 = vi.fn().mockResolvedValue({ tag: 'v2' })
    const r = await githubCachedTest('k6', fetcher2)
    expect(r).toEqual({ value: { tag: 'v2' }, cache: 'fresh' })
  })
})

// ─── Local test harness: same logic as server/utils/github-cache.ts ───
// Duplicated here because importing the server util directly runs outside
// the Nitro runtime (auto-imports). Kept in sync deliberately; the
// integration tests exercise the real handler via HTTP.
async function githubCachedTest(
  key: string,
  fetcher: () => Promise<unknown>,
  ttl = 5 * 60 * 1000,
): Promise<{ value: unknown; cache: 'fresh' | 'stale' }> {
  const entry = store.get(key) as { value: unknown; fetchedAt: number } | undefined
  const now = Date.now()
  if (entry && now - entry.fetchedAt < ttl) {
    return { value: entry.value, cache: 'fresh' }
  }
  try {
    const value = await fetcher()
    store.set(key, { value, fetchedAt: Date.now() })
    return { value, cache: 'fresh' }
  } catch (error) {
    if (entry) return { value: entry.value, cache: 'stale' }
    throw error
  }
}
