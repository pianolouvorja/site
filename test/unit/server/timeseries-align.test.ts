import { describe, it, expect } from 'vitest'

import { alignToBuckets } from '~~/server/utils/timeseries-align'

describe('alignToBuckets', () => {
  const points = (arr: [string, number][]) => arr.map(([key, value]) => ({ key, value }))

  it('aligns exact daily matches', () => {
    const buckets = ['2026-08-26', '2026-08-27', '2026-08-28']
    const data = points([
      ['2026-08-26', 5],
      ['2026-08-28', 2],
    ])

    expect(alignToBuckets(buckets, data)).toEqual([5, 0, 2])
  })

  it('zero-fills missing daily buckets', () => {
    const buckets = ['2026-08-25', '2026-08-26', '2026-08-27', '2026-08-28']
    const data = points([['2026-08-27', 3]])

    expect(alignToBuckets(buckets, data)).toEqual([0, 0, 3, 0])
  })

  it('sums duplicate points in the same bucket', () => {
    const buckets = ['2026-08-26', '2026-08-27']
    const data = points([
      ['2026-08-26', 2],
      ['2026-08-26', 3],
      ['2026-08-27', 1],
    ])

    expect(alignToBuckets(buckets, data)).toEqual([5, 1])
  })

  it('matches by month prefix for monthly buckets', () => {
    const buckets = ['2026-07', '2026-08']
    const data = points([
      ['2026-07-03', 1],
      ['2026-07-20', 4],
      ['2026-08-01', 9],
    ])

    expect(alignToBuckets(buckets, data)).toEqual([5, 9])
  })

  it('ignores points that do not match any bucket', () => {
    const buckets = ['2026-08-26', '2026-08-27']
    const data = points([
      ['2026-08-25', 99],
      ['2026-08-26', 1],
    ])

    expect(alignToBuckets(buckets, data)).toEqual([1, 0])
  })

  it('returns all zeros for empty points array', () => {
    const buckets = ['2026-08-26', '2026-08-27', '2026-08-28']

    expect(alignToBuckets(buckets, [])).toEqual([0, 0, 0])
  })

  it('returns empty array for empty buckets', () => {
    const data = points([['2026-08-26', 5]])

    expect(alignToBuckets([], data)).toEqual([])
  })

  it('uses custom extract and pick functions', () => {
    const buckets = ['2026-08-26', '2026-08-27']
    const data = points([
      ['2026-08-26', 10],
      ['2026-08-27', 20],
    ])

    const result = alignToBuckets(
      buckets,
      data,
      (p) => p.key,
      (p) => p.value * 2,
    )

    expect(result).toEqual([20, 40])
  })

  it('sums duplicates with month prefix matching', () => {
    const buckets = ['2026-07', '2026-08']
    const data = points([
      ['2026-07-01', 1],
      ['2026-07-15', 2],
      ['2026-07-31', 3],
      ['2026-08-10', 10],
    ])

    expect(alignToBuckets(buckets, data)).toEqual([6, 10])
  })
})
