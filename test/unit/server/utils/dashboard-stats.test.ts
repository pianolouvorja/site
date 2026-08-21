import { describe, it, expect, beforeEach, vi } from 'vitest'

// --- Mocks ---

const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

vi.stubGlobal('useRuntimeConfig', () => ({
  public: {
    buttondownApiKey: '',
    googleAnalyticsId: '',
  },
  buttondownApiKey: 'test-api-key',
}))

// Mock @octokit/rest — Octokit construtor que retorna dados fake
// O novo fetchGitHubStats chama listReleases 3x (app, palco-receiver, apk)
const defaultListReleasesResults = [
  // app (desktop)
  {
    data: [
      {
        tag_name: 'v2.0.0',
        assets: [
          { name: 'LouvorJA-2.0.0.AppImage', download_count: 200 },
          { name: 'LouvorJA-Setup-2.0.0.exe', download_count: 350 },
          { name: 'LouvorJA-2.0.0.dmg', download_count: 100 },
          { name: 'latest-linux.yml', download_count: 50 }, // ignored (yml)
          { name: 'LouvorJA-2.0.0.exe.blockmap', download_count: 10 }, // ignored
        ],
      },
      {
        tag_name: 'v1.9.0',
        assets: [
          { name: 'LouvorJA-1.9.0.AppImage', download_count: 80 },
          { name: 'LouvorJA-Setup-1.9.0.exe', download_count: 120 },
        ],
      },
    ],
  },
  // palco-receiver (TV)
  {
    data: [
      {
        tag_name: 'v0.5.0',
        assets: [
          { name: 'AndroidTV-louvorja-palco-0.5.0.apk', download_count: 45 },
          { name: 'louvorja-palco-webos-0.5.0.ipk', download_count: 12 },
          { name: 'louvorja-palco-tizen-0.5.0.wgt', download_count: 8 },
        ],
      },
    ],
  },
  // apk (mobile)
  {
    data: [
      {
        tag_name: 'v1.2.0',
        assets: [
          { name: 'louvorja-piano-1.2.0.apk', download_count: 500 },
          { name: 'louvorja-piano-ios-unsigned.ipa', download_count: 30 },
        ],
      },
      {
        tag_name: 'v1.1.0',
        assets: [
          { name: 'louvorja-piano-1.1.0.apk', download_count: 200 },
        ],
      },
    ],
  },
]

const mockInstance = {
  rest: {
    repos: {
      listReleases: vi
        .fn()
        .mockImplementation(async () => defaultListReleasesResults.shift() ?? { data: [] }),
      get: vi.fn().mockResolvedValue({
        data: { stargazers_count: 42, forks_count: 7 },
      }),
    },
  },
}

vi.mock('@octokit/rest', () => {
  return {
    Octokit: vi.fn().mockImplementation(() => mockInstance),
  }
})

// Import AFTER mocks
import {
  fetchGitHubStats,
  fetchNewsletterStats,
  fetchVisitStats,
  getDashboardStats,
  clearStatsCache,
  __setOctokitForTesting,
} from '../../../../server/utils/dashboard-stats'
import { Octokit } from '@octokit/rest'

describe('dashboard-stats', () => {
  beforeEach(() => {
    mockFetch.mockReset()
    clearStatsCache()
    __setOctokitForTesting(null)

    // Reset listReleases to consume fresh copies each test
    const releasesCopy = structuredClone(defaultListReleasesResults)
    mockInstance.rest.repos.listReleases.mockImplementation(
      async () => releasesCopy.shift() ?? { data: [] },
    )
    mockInstance.rest.repos.get.mockResolvedValue({
      data: { stargazers_count: 42, forks_count: 7 },
    })
  })

  // --- GitHub Stats ---

  describe('fetchGitHubStats', () => {
    it('returns per-app breakdown with total downloads', async () => {
      const result = await fetchGitHubStats()
      expect(result.downloads).not.toBeNull()
      expect(result.downloads!.total).toBe(
        200 + 350 + 100 + 80 + 120 + // desktop: 850
          45 + 12 + 8 + // TV: 65
          500 + 30 + 200, // mobile: 730
      ) // total: 1645
      expect(result.downloads!.apps).toHaveLength(3)
    })

    it('desktop app: sums per-platform downloads ignoring yml/blockmap', async () => {
      const result = await fetchGitHubStats()
      const desktop = result.downloads!.apps.find((a) => a.category === 'desktop')!
      expect(desktop.totalDownloads).toBe(850)
      expect(desktop.latestTag).toBe('v2.0.0')
      expect(desktop.platforms).toEqual([
        { platform: 'Linux', downloads: 280 }, // 200 + 80
        { platform: 'Windows', downloads: 470 }, // 350 + 120
        { platform: 'macOS', downloads: 100 },
      ])
    })

    it('tv app: aggregates per-platform (keeps highest count per platform)', async () => {
      const result = await fetchGitHubStats()
      const tv = result.downloads!.apps.find((a) => a.category === 'tv')!
      expect(tv.totalDownloads).toBe(65)
      expect(tv.latestTag).toBe('v0.5.0')
      expect(tv.platforms).toEqual([
        { platform: 'Android TV', downloads: 45 },
        { platform: 'WebOS', downloads: 12 },
        { platform: 'Tizen', downloads: 8 },
      ])
    })

    it('mobile app: sums Android APKs across releases', async () => {
      const result = await fetchGitHubStats()
      const mobile = result.downloads!.apps.find((a) => a.category === 'mobile')!
      expect(mobile.totalDownloads).toBe(730)
      expect(mobile.latestTag).toBe('v1.2.0')
      expect(mobile.platforms).toEqual([
        { platform: 'Android', downloads: 700 }, // 500 + 200
        { platform: 'iOS', downloads: 30 },
      ])
    })

    it('returns stars and forks from repo info', async () => {
      const result = await fetchGitHubStats()
      expect(result.stars).toBe(42)
      expect(result.forks).toBe(7)
    })

    it('returns null for all metrics if API fails', async () => {
      const failingOctokit = {
        rest: {
          repos: {
            listReleases: vi.fn().mockRejectedValue(new Error('API error')),
            get: vi.fn().mockRejectedValue(new Error('API error')),
          },
        },
      } as unknown as Octokit
      __setOctokitForTesting(failingOctokit)

      const result = await fetchGitHubStats()
      expect(result.downloads).toBeNull()
      expect(result.stars).toBeNull()
      expect(result.forks).toBeNull()
    })

    it('handles repos with no matching assets', async () => {
      // Override to return empty releases
      mockInstance.rest.repos.listReleases.mockResolvedValue({ data: [] })
      const result = await fetchGitHubStats()
      expect(result.downloads).not.toBeNull()
      expect(result.downloads!.total).toBe(0)
      for (const app of result.downloads!.apps) {
        expect(app.totalDownloads).toBe(0)
        expect(app.platforms).toEqual([])
        expect(app.latestTag).toBeNull()
      }
    })

    it('handles repos with releases but no assets', async () => {
      mockInstance.rest.repos.listReleases.mockResolvedValue({
        data: [{ tag_name: 'v1.0.0', assets: [] }],
      })
      const result = await fetchGitHubStats()
      expect(result.downloads!.total).toBe(0)
      for (const app of result.downloads!.apps) {
        expect(app.latestTag).toBe('v1.0.0')
      }
    })
  })

  // --- Newsletter Stats ---

  describe('fetchNewsletterStats', () => {
    it('returns subscriber count from Buttondown', async () => {
      mockFetch.mockResolvedValueOnce({ count: 53 })
      const result = await fetchNewsletterStats()
      expect(result.subscribers).toBe(53)
    })

    it('returns null if API fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Buttondown API error'))
      const result = await fetchNewsletterStats()
      expect(result.subscribers).toBeNull()
    })
  })

  // --- Visit Stats (GA4) ---

  describe('fetchVisitStats', () => {
    it('returns null when GOOGLE_ANALYTICS_ID is empty', async () => {
      const result = await fetchVisitStats()
      expect(result.visits).toBeNull()
    })
  })

  // --- Aggregator with cache ---

  describe('getDashboardStats', () => {
    it('aggregates all metrics into a single object', async () => {
      mockFetch.mockResolvedValue({ count: 10, data: [] })

      const result = await getDashboardStats()

      expect(result).toHaveProperty('downloads')
      expect(result).toHaveProperty('stars')
      expect(result).toHaveProperty('forks')
      expect(result).toHaveProperty('subscribers')
      expect(result).toHaveProperty('donations')
      expect(result).toHaveProperty('visits')
      expect(result).toHaveProperty('updatedAt')
      expect(typeof result.updatedAt).toBe('string')
      expect(result.donations).toBeNull()
    })

    it('if newsletter fails, GitHub still returns data', async () => {
      mockFetch.mockRejectedValueOnce(new Error('newsletter fail'))

      const result = await getDashboardStats()

      expect(result.downloads).not.toBeNull()
      expect(result.downloads!.total).toBe(1645)
      expect(result.stars).toBe(42)
      expect(result.subscribers).toBeNull()
    })

    it('if GitHub fails, other sources still return data (Promise.allSettled)', async () => {
      const failingOctokit = {
        rest: {
          repos: {
            listReleases: vi.fn().mockRejectedValue(new Error('GitHub down')),
            get: vi.fn().mockRejectedValue(new Error('GitHub down')),
          },
        },
      } as unknown as Octokit
      __setOctokitForTesting(failingOctokit)

      mockFetch.mockResolvedValueOnce({ count: 25 })

      const result = await getDashboardStats()

      expect(result.downloads).toBeNull()
      expect(result.stars).toBeNull()
      expect(result.subscribers).toBe(25)
    })

    it('uses cache on second call within 5 minutes', async () => {
      mockFetch.mockResolvedValue({ count: 42, data: [] })

      const first = await getDashboardStats()
      const firstTime = first.updatedAt

      const second = await getDashboardStats()
      expect(second.updatedAt).toBe(firstTime)
    })

    it('returns updatedAt as ISO string', async () => {
      mockFetch.mockResolvedValue({ count: 5, data: [] })
      const result = await getDashboardStats()
      expect(() => new Date(result.updatedAt).toISOString()).not.toThrow()
    })
  })
})
