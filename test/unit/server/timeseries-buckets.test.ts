import { describe, it, expect } from 'vitest'

import {
  resolvePeriod,
  buildBuckets,
  PERIODS,
  type Period,
} from '~~/server/utils/timeseries-buckets'

describe('resolvePeriod', () => {
  it('returns "7d" for valid input', () => {
    expect(resolvePeriod('7d')).toBe<Period>('7d')
  })

  it('returns "30d" for valid input', () => {
    expect(resolvePeriod('30d')).toBe<Period>('30d')
  })

  it('returns "12m" for valid input', () => {
    expect(resolvePeriod('12m')).toBe<Period>('12m')
  })

  it('returns "30d" (default) for undefined', () => {
    expect(resolvePeriod(undefined)).toBe<Period>('30d')
  })

  it('returns "30d" (default) for null', () => {
    expect(resolvePeriod(null)).toBe<Period>('30d')
  })

  it('returns "30d" (default) for invalid string', () => {
    expect(resolvePeriod('1y')).toBe<Period>('30d')
    expect(resolvePeriod('')).toBe<Period>('30d')
    expect(resolvePeriod('abc')).toBe<Period>('30d')
  })
})

describe('PERIODS', () => {
  it('maps periods to day/month counts', () => {
    expect(PERIODS['7d']).toBe(7)
    expect(PERIODS['30d']).toBe(30)
    expect(PERIODS['12m']).toBe(12)
  })
})

describe('buildBuckets', () => {
  it('returns 7 daily buckets for 7d in YYYY-MM-DD format', () => {
    const now = new Date('2026-08-28T12:00:00Z')
    const buckets = buildBuckets('7d', now)

    expect(buckets).toHaveLength(7)
    expect(buckets.every((b) => /^\d{4}-\d{2}-\d{2}$/.test(b))).toBe(true)
    expect(buckets[0]).toBe('2026-08-22')
    expect(buckets[6]).toBe('2026-08-28')
  })

  it('returns 30 daily buckets for 30d in YYYY-MM-DD format', () => {
    const now = new Date('2026-08-28T12:00:00Z')
    const buckets = buildBuckets('30d', now)

    expect(buckets).toHaveLength(30)
    expect(buckets.every((b) => /^\d{4}-\d{2}-\d{2}$/.test(b))).toBe(true)
    expect(buckets[0]).toBe('2026-07-30')
    expect(buckets[29]).toBe('2026-08-28')
  })

  it('returns 12 monthly buckets for 12m in YYYY-MM format', () => {
    const now = new Date('2026-08-28T12:00:00Z')
    const buckets = buildBuckets('12m', now)

    expect(buckets).toHaveLength(12)
    expect(buckets.every((b) => /^\d{4}-\d{2}$/.test(b))).toBe(true)
    expect(buckets[0]).toBe('2025-09')
    expect(buckets[11]).toBe('2026-08')
  })

  it('buckets are in chronological order (ascending)', () => {
    const now = new Date('2026-08-28T12:00:00Z')

    const daily = buildBuckets('7d', now)
    for (let i = 1; i < daily.length; i++) {
      expect(daily[i] > daily[i - 1]).toBe(true)
    }

    const monthly = buildBuckets('12m', now)
    for (let i = 1; i < monthly.length; i++) {
      expect(monthly[i] > monthly[i - 1]).toBe(true)
    }
  })

  it('uses current date when now is not provided', () => {
    const buckets = buildBuckets('7d')
    expect(buckets).toHaveLength(7)
    // Last bucket should be today in UTC
    const today = new Date().toISOString().slice(0, 10)
    expect(buckets[6]).toBe(today)
  })

  it('handles month boundary correctly for 12m', () => {
    // January edge case
    const now = new Date('2026-01-15T00:00:00Z')
    const buckets = buildBuckets('12m', now)

    expect(buckets).toHaveLength(12)
    expect(buckets[0]).toBe('2025-02')
    expect(buckets[10]).toBe('2025-12')
    expect(buckets[11]).toBe('2026-01')
  })

  it('handles DST-safe UTC date for daily buckets', () => {
    // A date where local timezone might differ from UTC
    const now = new Date('2026-03-29T01:00:00Z')
    const buckets = buildBuckets('7d', now)

    expect(buckets).toHaveLength(7)
    expect(buckets[6]).toBe('2026-03-29')
    expect(buckets[0]).toBe('2026-03-23')
  })
})
