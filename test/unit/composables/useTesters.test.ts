import { describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  runtimeConfig: { public: { testersSheetUrl: '' } as Record<string, unknown> },
  fetchMock: vi.fn(),
}))

vi.stubGlobal('useRuntimeConfig', () => mocks.runtimeConfig)
vi.stubGlobal('$fetch', mocks.fetchMock)
// composable usa onMounted — stuba pra rodar load() direto no teste
vi.stubGlobal('onMounted', (fn: () => void) => fn())

import { useTestersReports, useTestersRoster } from '~/composables/useTesters'

describe('useTestersReports', () => {
  it('returns enabled=false and no fetch when env is missing', async () => {
    mocks.runtimeConfig.public.testersSheetUrl = ''
    const { reports, pending, hasReports, hasPositiveReports, enabled } = useTestersReports()
    expect(enabled).toBe(false)
    expect(pending.value).toBe(false)
    expect(reports.value).toBeNull()
    expect(hasReports.value).toBe(false)
    expect(hasPositiveReports.value).toBe(false)
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

  it('sets reports to null when payload is not a string', async () => {
    mocks.runtimeConfig.public.testersSheetUrl = 'https://example.com/csv'
    mocks.fetchMock.mockResolvedValue({ not: 'csv' })
    const { reports, pending } = useTestersReports()
    await vi.waitFor(() => expect(pending.value).toBe(false))
    expect(reports.value).toBeNull()
  })

  it('sets reports to null on fetch failure (empty-state path)', async () => {
    mocks.runtimeConfig.public.testersSheetUrl = 'https://example.com/csv'
    mocks.fetchMock.mockRejectedValue(new Error('network'))
    const { reports, hasReports, pending } = useTestersReports()
    await vi.waitFor(() => expect(pending.value).toBe(false))
    expect(reports.value).toBeNull()
    expect(hasReports.value).toBe(false)
  })

  it('hasPositiveReports is true only for status ok', async () => {
    mocks.runtimeConfig.public.testersSheetUrl = 'https://example.com/csv'
    mocks.fetchMock.mockResolvedValue('Nome,Status,Relato\n"Ana","bug","falhou"')
    const { hasPositiveReports, pending } = useTestersReports()
    await vi.waitFor(() => expect(pending.value).toBe(false))
    expect(hasPositiveReports.value).toBe(false)
  })
})

describe('useTestersRoster', () => {
  it('treats a missing sheet url as disabled', () => {
    mocks.runtimeConfig.public.testersSheetUrl = undefined
    const reports = useTestersReports()
    const roster = useTestersRoster()
    expect(reports.enabled).toBe(false)
    expect(roster.enabled).toBe(false)
    expect(roster.sinceById.value).toEqual({})
  })

  it('returns empty roster when env is missing', async () => {
    mocks.runtimeConfig.public.testersSheetUrl = ''
    const { testers, pending, enabled, sheetBios } = useTestersRoster()
    expect(enabled).toBe(false)
    expect(pending.value).toBe(false)
    expect(testers.value).toEqual([])
    expect(sheetBios.value).toEqual({})
  })

  it('maps sheet profiles and fills focus community when empty', async () => {
    mocks.runtimeConfig.public.testersSheetUrl = 'https://example.com/sheet'
    mocks.fetchMock.mockResolvedValue(
      'nome,bio,desde,foco\n"Ana","bio","2026-08","web"\n"Bob","b","2026-01",',
    )
    const { testers, sheetBios, sinceById, pending } = useTestersRoster()
    await vi.waitFor(() => expect(pending.value).toBe(false))
    expect(mocks.fetchMock).toHaveBeenCalledWith('https://example.com/sheet?sheet=testadores', {
      responseType: 'text',
    })
    expect(testers.value.map((t) => t.focus)).toEqual([['web'], ['community']])
    expect(sheetBios.value.ana).toBe('bio')
    expect(sinceById.value.bob).toBe('2026-01')
  })

  it('appends sheet query when the url already has params', async () => {
    mocks.runtimeConfig.public.testersSheetUrl = 'https://example.com/sheet?tqx=out:csv'
    mocks.fetchMock.mockResolvedValue('nome\n"Ana"')
    const { pending } = useTestersRoster()
    await vi.waitFor(() => expect(pending.value).toBe(false))
    expect(mocks.fetchMock).toHaveBeenCalledWith(
      'https://example.com/sheet?tqx=out:csv&sheet=testadores',
      { responseType: 'text' },
    )
  })

  it('clears roster on non-string payload and on fetch failure', async () => {
    mocks.runtimeConfig.public.testersSheetUrl = 'https://example.com/sheet'
    mocks.fetchMock.mockResolvedValue(12)
    const bad = useTestersRoster()
    await vi.waitFor(() => expect(bad.pending.value).toBe(false))
    expect(bad.testers.value).toEqual([])

    mocks.fetchMock.mockRejectedValue(new Error('down'))
    const failed = useTestersRoster()
    await vi.waitFor(() => expect(failed.pending.value).toBe(false))
    expect(failed.testers.value).toEqual([])
  })

  it('returns empty roster when the sheet has no valid rows', async () => {
    mocks.runtimeConfig.public.testersSheetUrl = 'https://example.com/sheet'
    mocks.fetchMock.mockResolvedValue('nome\n"A"')
    const { testers, pending } = useTestersRoster()
    await vi.waitFor(() => expect(pending.value).toBe(false))
    expect(testers.value).toEqual([])
  })
})
