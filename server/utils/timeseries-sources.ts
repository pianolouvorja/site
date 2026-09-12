import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { getFirebaseAdmin } from './firebase-admin'
import { fetchSubscribers } from './subscribers'

/**
 * Fontes de dados para séries temporais do dashboard admin.
 *
 * Visitas: Firestore `geoStats` (doc/dia, id `YYYY-MM-DD`, shape
 * `{ day, countries: { [pais]: number } }`) — soma dos países por dia.
 * Assinantes: Buttondown via fetchSubscribers() — delta de NOVOS assinantes
 * por bucket. Nunca expõe email (LGPD).
 * Downloads: snapshots diários em `downloadSnapshots` (o GitHub não expõe
 * histórico — o total atual é persistido uma vez por dia por
 * recordDownloadSnapshot, que nunca rebaixa o total).
 *
 * Fail-soft: as funções de leitura propagam erros (o caller decide); o
 * snapshot é fire-and-forget e NUNCA lança.
 */

interface Point {
  key: string
  value: number
}

/** Soma os contadores por país de um doc geoStats. */
function sumCountries(countries: unknown): number {
  if (!countries || typeof countries !== 'object') return 0
  return Object.values(countries as Record<string, unknown>).reduce<number>(
    (acc, v) => acc + (typeof v === 'number' ? v : 0),
    0,
  )
}

/** Prefixo de bucket: match exato para dias, prefixo YYYY-MM para meses. */
function matchesBucket(bucket: string, day: string): boolean {
  return bucket.length === 7 ? day.startsWith(bucket) : day === bucket
}

/** Busca docs diários do range coberto pelos buckets e agrega por bucket. */
async function fetchDailyAggregate(
  collection: string,
  buckets: string[],
  pick: (data: Record<string, unknown>) => number,
): Promise<Point[]> {
  if (buckets.length === 0) return []

  const db = getFirestore(getFirebaseAdmin())
  const first = buckets.reduce((a, b) => (a < b ? a : b))
  const last = buckets.reduce((a, b) => (a > b ? a : b))

  const snap = await db
    .collection(collection)
    .where('day', '>=', first)
    .where('day', '<=', last + '\uf8ff')
    .get()

  const totals = new Map<string, number>()
  for (const bucket of buckets) totals.set(bucket, 0)
  for (const doc of snap.docs) {
    const data = doc.data() as Record<string, unknown>
    const day = typeof data.day === 'string' ? data.day : doc.id
    for (const bucket of buckets) {
      if (matchesBucket(bucket, day)) {
        totals.set(bucket, totals.get(bucket)! + pick(data))
        break
      }
    }
  }
  return [...totals.entries()].map(([key, value]) => ({ key, value }))
}

/**
 * Série de visitas (diárias ou agregadas por mês) a partir de geoStats.
 * Lança em caso de erro de Firestore — o caller aplica fail-soft.
 */
export async function fetchVisitsSeries(buckets: string[]): Promise<Point[]> {
  return fetchDailyAggregate('geoStats', buckets, (data) => sumCountries(data.countries))
}

/** Série de downloads por bucket a partir de snapshots diários. */
export async function fetchDownloadsSeries(buckets: string[]): Promise<Point[]> {
  return fetchDailyAggregate('downloadSnapshots', buckets, (data) =>
    typeof data.total === 'number' ? data.total : 0,
  )
}

/**
 * Série de NOVOS assinantes por bucket (delta via createdAt).
 * Sem API key / sem assinantes → série zerada.
 */
export async function fetchSubscribersSeries(buckets: string[]): Promise<Point[]> {
  const subscribers = await fetchSubscribers()
  const totals = new Map<string, number>()
  for (const bucket of buckets) totals.set(bucket, 0)
  for (const sub of subscribers) {
    const day = sub.createdAt.slice(0, 10)
    for (const bucket of buckets) {
      if (matchesBucket(bucket, day)) {
        totals.set(bucket, totals.get(bucket)! + 1)
        break
      }
    }
  }
  return [...totals.entries()].map(([key, value]) => ({ key, value }))
}

/**
 * Snapshot fire-and-forget do total de downloads de hoje.
 * Monótono: se o doc existente tem total maior, mantém (evita rebaixar
 * por resposta parcial da API). NUNCA lança.
 */
export async function recordDownloadSnapshot(total: number): Promise<void> {
  try {
    const db = getFirestore(getFirebaseAdmin())
    const day = new Date().toISOString().slice(0, 10)
    const ref = db.collection('downloadSnapshots').doc(day)
    const existing = await ref.get()
    const current = existing.exists ? (existing.data()?.total as number | undefined) : undefined
    if (typeof current === 'number' && current > total) return
    await ref.set({ day, total }, { merge: true })
  } catch {
    // fire-and-forget: telemetria nunca quebra a request
  }
}

/** Re-export para conveniência do endpoint. */
export { FieldValue }
