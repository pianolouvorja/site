import { describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  runtimeConfig: { public: { testersSheetUrl: '' } as Record<string, unknown> },
  fetchMock: vi.fn(),
}))

vi.stubGlobal('useRuntimeConfig', () => mocks.runtimeConfig)
vi.stubGlobal('$fetch', mocks.fetchMock)
// composable usa onMounted — stuba pra rodar load() direto no teste
vi.stubGlobal('onMounted', (fn: () => void) => fn())

import { useTestersReports } from '~/composables/useTesters'

describe('useTestersReports', () => {
  it('returns enabled=false and no fetch when env is missing', async () => {
    mocks.runtimeConfig.public.testersSheetUrl = ''
    const { reports, pending, hasReports, enabled } = useTestersReports()
    expect(enabled).toBe(false)
    expect(pending.value).toBe(false)
    expect(reports.value).toBeNull()
    expect(hasReports.value).toBe(false)
    expect(mocks.fetchMock).not.toHaveBeenCalled()
  })

  it('fetches and parses reports when enabled', async () => {
    mocks.runtimeConfig.public.testersSheetUrl =
      'https://docs.google.com/spreadsheets/d/x/gviz/tq?tqx=out:csv'
    mocks.fetchMock.mockResolvedValue(
      'Timestamp,Nome,Status,Relato\n"2026-09-23","Alice","ok","tudo certo"',
    )
    const { reports, hasReports, pending } = useTestersReports()
    await vi.waitFor(() => expect(pending.value).toBe(false))
    expect(reports.value).toEqual([
      {
        date: '2026-09-23',
        tester: 'Alice',
        version: '',
        module: '',
        status: 'ok',
        report: 'tudo certo',
      },
    ])
    expect(hasReports.value).toBe(true)
  })

  it('sets reports to null on fetch failure (empty-state path)', async () => {
    mocks.runtimeConfig.public.testersSheetUrl = 'https://example.com/csv'
    mocks.fetchMock.mockRejectedValue(new Error('network'))
    const { reports, hasReports, pending } = useTestersReports()
    await vi.waitFor(() => expect(pending.value).toBe(false))
    expect(reports.value).toBeNull()
    expect(hasReports.value).toBe(false)
  })
})
