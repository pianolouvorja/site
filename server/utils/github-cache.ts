/**
 * In-memory cache with TTL + stale-while-revalidate for GitHub API responses.
 *
 * Layer 1: fresh cache (TTL 5 min) → serve directly
 * Layer 2: stale cache + upstream failure → serve stale with x-cache: stale
 * Layer 3: no cache + upstream failure → caller falls back to static snapshot
 */

interface CacheEntry<T> {
  value: T
  /** Unix ms when the entry was fetched. */
  fetchedAt: number
}

interface GithubCacheOptions {
  /** Fresh window in ms (default 5 minutes). */
  ttl?: number
}

const DEFAULT_TTL = 5 * 60 * 1000

// Module-level cache — shared across requests within the same Nitro server
const store = new Map<string, CacheEntry<unknown>>()

export interface CachedResult<T> {
  value: T
  /** 'fresh' = within TTL, 'stale' = beyond TTL (served on upstream failure). */
  cache: 'fresh' | 'stale'
}

/**
 * Fetches via `fetcher`, caching the result under `key` for `ttl` ms.
 * On upstream failure, serves the last cached value (even if expired),
 * marking it as `stale`. Throws only when there is nothing cached at all.
 */
export async function githubCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: GithubCacheOptions = {},
): Promise<CachedResult<T>> {
  const ttl = options.ttl ?? DEFAULT_TTL
  const entry = store.get(key) as CacheEntry<T> | undefined
  const now = Date.now()

  // Fresh cache → serve without hitting GitHub
  if (entry && now - entry.fetchedAt < ttl) {
    return { value: entry.value, cache: 'fresh' }
  }

  try {
    const value = await fetcher()
    store.set(key, { value, fetchedAt: Date.now() })
    return { value, cache: 'fresh' }
  } catch (error) {
    // Upstream failed → serve stale cache if we have one
    if (entry) {
      return { value: entry.value, cache: 'stale' }
    }
    throw error
  }
}

/** Test helper: clears the whole cache store. */
export function clearGithubCache(): void {
  store.clear()
}
