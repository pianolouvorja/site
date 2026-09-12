import { describe, it, expect, beforeEach, vi } from 'vitest'

// --- Mocks ---

const mockGet = vi.fn()
const mockSet = vi.fn()
const mockDoc = vi.fn(() => ({ get: mockGet, set: mockSet }))
const mockWhere = vi.fn(() => ({ where: mockWhere, get: mockQueryGet }))
const mockQueryGet = vi.fn()
const mockCollection = vi.fn(() => ({
  doc: mockDoc,
  where: mockWhere,
}))
const mockGetFirestore = vi.fn(() => ({ collection: mockCollection }))
const mockGetFirebaseAdmin = vi.fn(() => ({}))

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: (...args: unknown[]) => mockGetFirestore(...args),
  FieldValue: { increment: (n: number) => ({ __increment: n }) },
}))
vi.mock('../../../server/utils/firebase-admin', () => ({
  getFirebaseAdmin: (...args: unknown[]) => mockGetFirebaseAdmin(...args),
}))
const mockFetchSubscribers = vi.fn()
vi.mock('../../../server/utils/subscribers', () => ({
  fetchSubscribers: (...args: unknown[]) => mockFetchSubscribers(...args),
}))

import {
  fetchVisitsSeries,
  fetchDownloadsSeries,
  fetchSubscribersSeries,
  recordDownloadSnapshot,
} from '../../../server/utils/timeseries-sources'

/** QuerySnapshot fake iterável com .docs. */
function fakeSnap(docs: Array<{ id: string; data: () => Record<string, unknown> }>) {
  return { docs, [Symbol.iterator]: docs[Symbol.iterator].bind(docs) }
}

const GEO_DOC = (id: string, countries: Record<string, number>) => ({
  id,
  data: () => ({ day: id, countries }),
})
const SNAP_DOC = (id: string, total: number) => ({
  id,
  data: () => ({ day: id, total }),
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('fetchVisitsSeries', () => {
  it('soma countries por dia (match exato) e zera dias ausentes', async () => {
    mockQueryGet.mockResolvedValue(
      fakeSnap([GEO_DOC('2026-08-26', { BR: 3, US: 2 }), GEO_DOC('2026-08-27', { BR: 1 })]),
    )
    const result = await fetchVisitsSeries(['2026-08-25', '2026-08-26', '2026-08-27'])
    expect(result).toEqual([
      { key: '2026-08-25', value: 0 },
      { key: '2026-08-26', value: 5 },
      { key: '2026-08-27', value: 1 },
    ])
  })

  it('agrega por prefixo de mês para buckets mensais', async () => {
    mockQueryGet.mockResolvedValue(
      fakeSnap([
        GEO_DOC('2026-07-31', { BR: 1 }),
        GEO_DOC('2026-08-01', { BR: 2, PT: 4 }),
        GEO_DOC('2026-08-15', { US: 1 }),
      ]),
    )
    const result = await fetchVisitsSeries(['2026-07', '2026-08'])
    expect(result).toEqual([
      { key: '2026-07', value: 1 },
      { key: '2026-08', value: 7 },
    ])
  })

  it('ignora countries inválidos/ausentes', async () => {
    mockQueryGet.mockResolvedValue(
      fakeSnap([
        { id: '2026-08-26', data: () => ({ day: '2026-08-26' }) },
        { id: '2026-08-27', data: () => ({ day: '2026-08-27', countries: { BR: 'x' } }) },
      ]),
    )
    const result = await fetchVisitsSeries(['2026-08-26', '2026-08-27'])
    expect(result.every((p) => p.value === 0)).toBe(true)
  })

  it('usa doc.id quando day não é string', async () => {
    mockQueryGet.mockResolvedValue(
      fakeSnap([{ id: '2026-08-26', data: () => ({ countries: { BR: 2 } }) }]),
    )
    const result = await fetchVisitsSeries(['2026-08-26'])
    expect(result).toEqual([{ key: '2026-08-26', value: 2 }])
  })

  it('retorna [] para buckets vazios sem tocar Firestore', async () => {
    const result = await fetchVisitsSeries([])
    expect(result).toEqual([])
    expect(mockGetFirestore).not.toHaveBeenCalled()
  })

  it('propaga erro de Firestore (caller decide fail-soft)', async () => {
    mockQueryGet.mockRejectedValue(new Error('boom'))
    await expect(fetchVisitsSeries(['2026-08-26'])).rejects.toThrow('boom')
  })
})

describe('fetchDownloadsSeries', () => {
  it('alinha snapshots diários aos buckets (prefixo mensal)', async () => {
    mockQueryGet.mockResolvedValue(
      fakeSnap([SNAP_DOC('2026-08-25', 100), SNAP_DOC('2026-08-26', 150)]),
    )
    const result = await fetchDownloadsSeries(['2026-08-24', '2026-08-25', '2026-08-26'])
    expect(result).toEqual([
      { key: '2026-08-24', value: 0 },
      { key: '2026-08-25', value: 100 },
      { key: '2026-08-26', value: 150 },
    ])
  })

  it('trata total não-numérico como 0', async () => {
    mockQueryGet.mockResolvedValue(
      fakeSnap([{ id: '2026-08-26', data: () => ({ day: '2026-08-26', total: 'x' }) }]),
    )
    const result = await fetchDownloadsSeries(['2026-08-26'])
    expect(result).toEqual([{ key: '2026-08-26', value: 0 }])
  })
})

describe('fetchSubscribersSeries', () => {
  it('conta novos assinantes por dia', async () => {
    mockFetchSubscribers.mockResolvedValue([
      {
        email: 'a@x.com',
        createdAt: '2026-08-25T10:00:00Z',
        tags: [],
        active: true,
        locale: 'pt-BR',
      },
      {
        email: 'b@x.com',
        createdAt: '2026-08-25T11:00:00Z',
        tags: [],
        active: true,
        locale: 'pt-BR',
      },
      {
        email: 'c@x.com',
        createdAt: '2026-08-26T10:00:00Z',
        tags: [],
        active: true,
        locale: 'pt-BR',
      },
    ])
    const result = await fetchSubscribersSeries(['2026-08-24', '2026-08-25', '2026-08-26'])
    expect(result).toEqual([
      { key: '2026-08-24', value: 0 },
      { key: '2026-08-25', value: 2 },
      { key: '2026-08-26', value: 1 },
    ])
  })

  it('agrega por mês via prefixo', async () => {
    mockFetchSubscribers.mockResolvedValue([
      {
        email: 'a@x.com',
        createdAt: '2026-07-31T10:00:00Z',
        tags: [],
        active: true,
        locale: 'pt-BR',
      },
      {
        email: 'b@x.com',
        createdAt: '2026-08-02T10:00:00Z',
        tags: [],
        active: true,
        locale: 'pt-BR',
      },
    ])
    const result = await fetchSubscribersSeries(['2026-07', '2026-08'])
    expect(result).toEqual([
      { key: '2026-07', value: 1 },
      { key: '2026-08', value: 1 },
    ])
  })

  it('retorna série zerada sem assinantes', async () => {
    mockFetchSubscribers.mockResolvedValue([])
    const result = await fetchSubscribersSeries(['2026-08-26'])
    expect(result).toEqual([{ key: '2026-08-26', value: 0 }])
  })
})

describe('recordDownloadSnapshot', () => {
  it('faz upsert do snapshot de hoje', async () => {
    mockGet.mockResolvedValue({ exists: false })
    vi.useFakeTimers().setSystemTime(new Date('2026-08-28T12:00:00Z'))
    await recordDownloadSnapshot(500)
    expect(mockDoc).toHaveBeenCalledWith('2026-08-28')
    expect(mockSet).toHaveBeenCalledWith({ day: '2026-08-28', total: 500 }, { merge: true })
    vi.useRealTimers()
  })

  it('não rebaixa total existente maior', async () => {
    mockGet.mockResolvedValue({ exists: true, data: () => ({ total: 600 }) })
    await recordDownloadSnapshot(500)
    expect(mockSet).not.toHaveBeenCalled()
  })

  it('grava quando total atual é maior', async () => {
    mockGet.mockResolvedValue({ exists: true, data: () => ({ total: 400 }) })
    await recordDownloadSnapshot(500)
    expect(mockSet).toHaveBeenCalled()
  })

  it('nunca lança em erro de Firestore', async () => {
    mockGet.mockRejectedValue(new Error('boom'))
    await expect(recordDownloadSnapshot(500)).resolves.toBeUndefined()
  })

  it('não lança quando data() retorna undefined', async () => {
    mockGet.mockResolvedValue({ exists: true, data: () => undefined })
    await expect(recordDownloadSnapshot(100)).resolves.toBeUndefined()
    expect(mockSet).toHaveBeenCalled()
  })
})

describe('fetchDailyAggregate — ordenação de buckets (min/max do reduce)', () => {
  it('cobre a < b e a > b com buckets fora de ordem', async () => {
    mockQueryGet.mockResolvedValue(
      fakeSnap([{ id: '2026-08-25', data: () => ({ day: '2026-08-25', total: 10 }) }]),
    )
    // buckets fora de ordem: reduce percorre pares (a<b) e (a>b)
    const result = await fetchDownloadsSeries(['2026-08-26', '2026-08-25'])
    expect(result).toEqual([
      { key: '2026-08-26', value: 0 },
      { key: '2026-08-25', value: 10 },
    ])
  })
})
