export type Period = '7d' | '30d' | '12m'

export const PERIODS: Record<Period, number> = {
  '7d': 7,
  '30d': 30,
  '12m': 12,
} as const

export function resolvePeriod(raw: string | undefined | null): Period {
  if (raw === '7d' || raw === '12m' || raw === '30d') {
    return raw
  }
  return '30d'
}

function dayBucket(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function buildBuckets(period: Period, now: Date = new Date()): string[] {
  if (period === '12m') {
    const buckets: string[] = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1))
      buckets.push(d.toISOString().slice(0, 7))
    }
    return buckets
  }

  const days = PERIODS[period]
  const buckets: string[] = []
  for (let i = days - 1; i >= 0; i--) {
    buckets.push(dayBucket(new Date(now.getTime() - i * 86_400_000)))
  }
  return buckets
}
