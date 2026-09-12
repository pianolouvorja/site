import { describe, it, expect, beforeEach, vi } from 'vitest'

const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)
vi.stubGlobal('onMounted', (fn: () => void) => fn())
vi.stubGlobal('onUnmounted', vi.fn())

import { useTimeseries } from '~/composables/useTimeseries'

const sample = {
  period: '30d' as const,
  buckets: ['2026-01-01'],
  visits: [{ key: '2026-01-01', value: 10 }],
  subscribers: [{ key: '2026-01-01', value: 2 }],
  downloads: [{ key: '2026-01-01', value: 5 }],
}

describe('useTimeseries', () => {
  beforeEach(() => {
    mockFetch.mockReset()
    vi.stubGlobal('useFirebaseAuth', () => ({
      getToken: vi.fn().mockResolvedValue(null),
    }))
  })

  it('inicia com period 30d, data null, loading true, error null', () => {
    mockFetch.mockResolvedValue(sample)
    const { period, data, loading, error } = useTimeseries()
    expect(period.value).toBe('30d')
    expect(data.value).toBeNull()
    expect(loading.value).toBe(true)
    expect(error.value).toBeNull()
  })

  it('aceita period inicial customizado', () => {
    mockFetch.mockResolvedValue(sample)
    const { period } = useTimeseries('7d')
    expect(period.value).toBe('7d')
  })

  it('refresh popula data e desliga loading', async () => {
    mockFetch.mockResolvedValueOnce(sample)
    const { data, loading, refresh } = useTimeseries()
    await refresh()
    expect(data.value).toEqual(sample)
    expect(loading.value).toBe(false)
  })

  it('envia Bearer token quando auth retorna token', async () => {
    mockFetch.mockResolvedValueOnce(sample)
    vi.stubGlobal('useFirebaseAuth', () => ({
      getToken: vi.fn().mockResolvedValue('tok-123'),
    }))
    const { refresh } = useTimeseries()
    await refresh()
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/admin/timeseries',
      expect.objectContaining({
        query: { period: '30d' },
        headers: { Authorization: 'Bearer tok-123' },
      }),
    )
  })

  it('segue sem auth quando getToken falha', async () => {
    mockFetch.mockResolvedValueOnce(sample)
    vi.stubGlobal('useFirebaseAuth', () => ({
      getToken: vi.fn().mockRejectedValue(new Error('no auth')),
    }))
    const { refresh, data } = useTimeseries()
    await refresh()
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/admin/timeseries',
      expect.objectContaining({ headers: {} }),
    )
    expect(data.value).toEqual(sample)
  })

  it('popula error quando fetch falha', async () => {
    mockFetch.mockRejectedValueOnce(new Error('boom'))
    const { error, loading, refresh } = useTimeseries()
    await refresh()
    expect(error.value).toBe('boom')
    expect(loading.value).toBe(false)
  })

  it('usa mensagem fallback quando erro nao tem message', async () => {
    mockFetch.mockRejectedValueOnce({})
    const { error, refresh } = useTimeseries()
    await refresh()
    expect(error.value).toBe('Erro ao buscar séries temporais')
  })

  it('setPeriod atualiza period e dispara refresh', async () => {
    mockFetch.mockResolvedValue(sample)
    const { period, setPeriod } = useTimeseries()
    setPeriod('12m')
    expect(period.value).toBe('12m')
    await new Promise((r) => setTimeout(r, 10))
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/admin/timeseries',
      expect.objectContaining({ query: { period: '12m' } }),
    )
  })

  describe('polling', () => {
    it('startPolling chama refresh e popula data', async () => {
      mockFetch.mockResolvedValueOnce(sample)
      const { startPolling, data } = useTimeseries()
      startPolling()
      await new Promise((r) => setTimeout(r, 10))
      expect(data.value).toEqual(sample)
    })

    it('stopPolling limpa o interval apos startPolling', async () => {
      mockFetch.mockResolvedValue(sample)
      const { startPolling, stopPolling } = useTimeseries()
      startPolling()
      await new Promise((r) => setTimeout(r, 10))
      expect(() => stopPolling()).not.toThrow()
    })

    it('stopPolling nao faz nada se chamado sem startPolling', () => {
      mockFetch.mockResolvedValue(sample)
      const { stopPolling } = useTimeseries()
      expect(() => stopPolling()).not.toThrow()
    })
  })
})
