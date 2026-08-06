import { describe, it, expect, beforeEach, vi } from 'vitest'

// --- Mocks ---
const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

vi.stubGlobal('onMounted', (fn: () => void) => fn())
vi.stubGlobal('onUnmounted', vi.fn())

// Import AFTER mocks
import { useDashboardStats } from '~/composables/useDashboardStats'

describe('useDashboardStats', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  describe('estado inicial', () => {
    it('inicia com stats null', () => {
      mockFetch.mockResolvedValue({ downloads: 0 })
      const { stats } = useDashboardStats()
      expect(stats.value).toBeNull()
    })

    it('inicia com loading true', () => {
      mockFetch.mockResolvedValue({ downloads: 0 })
      const { loading } = useDashboardStats()
      expect(loading.value).toBe(true)
    })

    it('inicia com error null', () => {
      mockFetch.mockResolvedValue({ downloads: 0 })
      const { error } = useDashboardStats()
      expect(error.value).toBeNull()
    })

    it('inicia com lastUpdated null', () => {
      mockFetch.mockResolvedValue({ downloads: 0 })
      const { lastUpdated } = useDashboardStats()
      expect(lastUpdated.value).toBeNull()
    })
  })

  describe('fetchStats', () => {
    it('popula stats quando fetch sucede', async () => {
      const mockData = {
        downloads: 950,
        stars: 42,
        forks: 7,
        subscribers: 53,
        donations: { count: 2, totalBRL: 75 },
        visits: null,
        updatedAt: '2026-08-05T23:00:00.000Z',
      }
      mockFetch.mockResolvedValueOnce(mockData)

      const { stats, loading, fetchStats } = useDashboardStats()
      await fetchStats()

      expect(stats.value).toEqual(mockData)
      expect(loading.value).toBe(false)
    })

    it('atualiza lastUpdated apos fetch sucedido', async () => {
      const mockData = { updatedAt: '2026-08-05T23:00:00.000Z' }
      mockFetch.mockResolvedValueOnce(mockData)

      const { lastUpdated, fetchStats } = useDashboardStats()
      await fetchStats()

      expect(lastUpdated.value).toBeInstanceOf(Date)
    })

    it('popula error quando fetch falha', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const { error, loading, fetchStats } = useDashboardStats()
      await fetchStats()

      expect(error.value).toBe('Network error')
      expect(loading.value).toBe(false)
    })

    it('usa mensagem fallback quando erro nao tem message', async () => {
      mockFetch.mockRejectedValueOnce({})

      const { error, fetchStats } = useDashboardStats()
      await fetchStats()

      expect(error.value).toBe('Erro ao buscar dados')
    })

    it('envia Bearer token no header Authorization', async () => {
      mockFetch.mockResolvedValueOnce({ updatedAt: '2026-01-01T00:00:00Z' })
      vi.stubGlobal('useFirebaseAuth', () => ({
        getToken: vi.fn().mockResolvedValue('fake-id-token'),
        user: { value: { uid: '123' } },
        logout: vi.fn(),
        loading: { value: false },
        error: { value: null },
        login: vi.fn(),
      }))

      const { fetchStats } = useDashboardStats()
      await fetchStats()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/stats'),
        expect.objectContaining({
          headers: { Authorization: 'Bearer fake-id-token' },
        }),
      )
    })

    it('funciona sem token quando Firebase falha (catch interno)', async () => {
      mockFetch.mockResolvedValueOnce({ updatedAt: '2026-01-01T00:00:00Z' })
      vi.stubGlobal('useFirebaseAuth', () => {
        throw new Error('Firebase not initialized')
      })

      const { fetchStats, stats } = useDashboardStats()
      await fetchStats()

      // Continua funcionando, so sem header de auth
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/stats'),
        expect.objectContaining({ headers: {} }),
      )
      expect(stats.value).not.toBeNull()
    })
  })

  describe('refresh', () => {
    it('forca novo fetch ignorando estado atual', async () => {
      const firstData = { downloads: 100, updatedAt: '2026-01-01T00:00:00Z' }
      const secondData = { downloads: 200, updatedAt: '2026-01-02T00:00:00Z' }
      mockFetch.mockResolvedValueOnce(firstData).mockResolvedValueOnce(secondData)

      const { stats, fetchStats, refresh } = useDashboardStats()
      await fetchStats()
      expect(stats.value?.downloads).toBe(100)

      await refresh()
      expect(stats.value?.downloads).toBe(200)
    })
  })

  describe('polling', () => {
    it('startPolling chama fetchStats e popula stats', async () => {
      mockFetch.mockResolvedValueOnce({ downloads: 50, updatedAt: '2026-01-01T00:00:00Z' })
      const { startPolling, stats } = useDashboardStats()
      startPolling()
      // fetchStats e async — aguardar microtask
      await new Promise((r) => setTimeout(r, 10))
      expect(stats.value).not.toBeNull()
      expect(stats.value?.downloads).toBe(50)
    })

    it('stopPolling limpa o interval apos startPolling', async () => {
      mockFetch.mockResolvedValue({ updatedAt: '2026-01-01T00:00:00Z' })
      const { startPolling, stopPolling } = useDashboardStats()
      startPolling()
      await new Promise((r) => setTimeout(r, 10))
      // Agora pollInterval existe — stopPolling vai limpar
      expect(() => stopPolling()).not.toThrow()
    })

    it('stopPolling nao faz nada se chamado sem startPolling', () => {
      mockFetch.mockResolvedValue({ updatedAt: '2026-01-01T00:00:00Z' })
      const { stopPolling } = useDashboardStats()
      // pollInterval e null — if nao entra
      expect(() => stopPolling()).not.toThrow()
    })
  })
})
