import { describe, it, expect, beforeEach, vi } from 'vitest'

// --- Mocks ---

const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

vi.stubGlobal('useRuntimeConfig', () => ({
  public: {
    buttondownApiKey: 'test-buttondown-key',
    abacatePayApiKey: 'test-abacate-key',
    googleAnalyticsId: '',
  },
  abacatePayApiKey: 'test-abacate-key',
  buttondownApiKey: 'test-buttondown-key',
}))

// Mock @octokit/rest — Octokit construtor que retorna dados fake
vi.mock('@octokit/rest', () => {
  const mockInstance = {
    rest: {
      repos: {
        listReleases: vi.fn().mockResolvedValue({
          data: [
            {
              id: 1,
              tag_name: 'v1.0.0',
              assets: [
                { name: 'app-1.0.0.AppImage', download_count: 150 },
                { name: 'app-1.0.0.exe', download_count: 300 },
              ],
            },
            {
              id: 2,
              tag_name: 'v1.1.0',
              assets: [{ name: 'app-1.1.0.AppImage', download_count: 500 }],
            },
          ],
        }),
        get: vi.fn().mockResolvedValue({
          data: { stargazers_count: 42, forks_count: 7 },
        }),
      },
    },
  }

  return {
    Octokit: vi.fn().mockImplementation(() => mockInstance),
    __mockInstance: mockInstance, // exportar para testes
  }
})

// Import AFTER mocks
import {
  fetchGitHubStats,
  fetchNewsletterStats,
  fetchDonationStats,
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

    // Reset Octokit mock aos valores padrao
    const mockInstance = (Octokit as unknown as { __mockInstance: any }).__mockInstance
    if (mockInstance) {
      mockInstance.rest.repos.listReleases.mockResolvedValue({
        data: [
          {
            id: 1,
            assets: [{ download_count: 150 }, { download_count: 300 }],
          },
          {
            id: 2,
            assets: [{ download_count: 500 }],
          },
        ],
      })
      mockInstance.rest.repos.get.mockResolvedValue({
        data: { stargazers_count: 42, forks_count: 7 },
      })
    }
  })

  // --- GitHub Stats ---

  describe('fetchGitHubStats', () => {
    it('soma downloads de todos os assets de todos os releases', async () => {
      const result = await fetchGitHubStats()
      expect(result.downloads).toBe(950) // 150 + 300 + 500
    })

    it('retorna stars e forks do repo', async () => {
      const result = await fetchGitHubStats()
      expect(result.stars).toBe(42)
      expect(result.forks).toBe(7)
    })

    it('retorna null para todas as metricas se a API falhar', async () => {
      // Forcar Octokit a lancar erro via override
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
  })

  // --- Newsletter Stats ---

  describe('fetchNewsletterStats', () => {
    it('retorna contagem de assinantes da Buttondown', async () => {
      mockFetch.mockResolvedValueOnce({ count: 53 })
      const result = await fetchNewsletterStats()
      expect(result.subscribers).toBe(53)
    })

    it('retorna null se a API falhar', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Buttondown API error'))
      const result = await fetchNewsletterStats()
      expect(result.subscribers).toBeNull()
    })
  })

  // --- Donation Stats ---

  describe('fetchDonationStats', () => {
    it('soma doacoes confirmadas e retorna total em BRL', async () => {
      mockFetch.mockResolvedValueOnce({
        data: [
          { status: 'paid', amount: 5000 }, // R$ 50,00 (centavos)
          { status: 'paid', amount: 2500 }, // R$ 25,00
          { status: 'pending', amount: 10000 }, // pendente - nao conta
        ],
      })
      const result = await fetchDonationStats()
      expect(result).toEqual({ count: 2, totalBRL: 75 })
    })

    it('retorna null se a API falhar', async () => {
      mockFetch.mockRejectedValueOnce(new Error('AbacatePay error'))
      const result = await fetchDonationStats()
      expect(result).toBeNull()
    })
  })

  // --- Visit Stats (GA4) ---

  describe('fetchVisitStats', () => {
    it('retorna null quando GOOGLE_ANALYTICS_ID esta vazio', async () => {
      const result = await fetchVisitStats()
      expect(result.visits).toBeNull()
    })
  })

  // --- Aggregator with cache ---

  describe('getDashboardStats', () => {
    it('agrega todas as metricas em um unico objeto', async () => {
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
    })

    it('se newsletter e donations falham, GitHub continua retornando dados', async () => {
      // GitHub funciona (mock padrao)
      // Newsletter e donations falham
      mockFetch
        .mockRejectedValueOnce(new Error('newsletter fail'))
        .mockRejectedValueOnce(new Error('donations fail'))

      const result = await getDashboardStats()

      expect(result.downloads).toBe(950)
      expect(result.stars).toBe(42)
      expect(result.subscribers).toBeNull()
      expect(result.donations).toBeNull()
    })

    it('se GitHub falha, outras fontes ainda retornam dados (Promise.allSettled)', async () => {
      // Injetar Octokit que falha
      const failingOctokit = {
        rest: {
          repos: {
            listReleases: vi.fn().mockRejectedValue(new Error('GitHub down')),
            get: vi.fn().mockRejectedValue(new Error('GitHub down')),
          },
        },
      } as unknown as Octokit
      __setOctokitForTesting(failingOctokit)

      // Newsletter e donations funcionam
      mockFetch
        .mockResolvedValueOnce({ count: 25 })
        .mockResolvedValueOnce({ data: [{ status: 'paid', amount: 5000 }] })

      const result = await getDashboardStats()

      expect(result.downloads).toBeNull()
      expect(result.stars).toBeNull()
      expect(result.subscribers).toBe(25)
      expect(result.donations).toEqual({ count: 1, totalBRL: 50 })
    })

    it('usa cache na segunda chamada dentro de 5 minutos', async () => {
      mockFetch.mockResolvedValue({ count: 42, data: [] })

      const first = await getDashboardStats()
      const firstTime = first.updatedAt

      const second = await getDashboardStats()
      // Mesmo updatedAt = veio do cache
      expect(second.updatedAt).toBe(firstTime)
    })

    it('retorna updatedAt como ISO string', async () => {
      mockFetch.mockResolvedValue({ count: 5, data: [] })
      const result = await getDashboardStats()
      expect(() => new Date(result.updatedAt).toISOString()).not.toThrow()
    })
  })
})
