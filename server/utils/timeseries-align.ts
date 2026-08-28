export function alignToBuckets<T extends { key: string; value: number }>(
  buckets: string[],
  points: T[],
  extract: (p: T) => string = (p) => p.key,
  pick: (p: T) => number = (p) => p.value,
): number[] {
  if (buckets.length === 0) {
    return []
  }

  const monthly = (buckets[0] ?? '').length === 7
  const sums = new Map<string, number>()
  for (const bucket of buckets) {
    sums.set(bucket, 0)
  }

  for (const point of points) {
    const key = extract(point)
    const matchKey = monthly ? key.slice(0, 7) : key.slice(0, 10)
    if (sums.has(matchKey)) {
      sums.set(matchKey, (sums.get(matchKey) ?? 0) + pick(point))
    }
  }

  return buckets.map((b) => sums.get(b) ?? 0)
}
