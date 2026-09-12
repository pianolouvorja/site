import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import type { H3Event } from 'h3'
import { getFirebaseAdmin } from './firebase-admin'
import { getClientIp, geoDayBucket, getCountryFromEvent, hashIp } from './geo'

/**
 * Registro de visita agregada por país (LGPD-compliant).
 *
 * Fluxo:
 *  1. Extrai país dos headers da CDN (cf-ipcountry / x-vercel-ip-country)
 *  2. Hasheia o IP com salt — usado SÓ para deduplicação diária
 *  3. Incrementa contador diário por país no Firestore
 *
 * O IP (nem seu hash) nunca é persistido junto ao contador: o hash derivado
 * vira parte de um visitorId efêmero (`dia:hash16`) que existe apenas para
 * não contar a mesma origem duas vezes no mesmo dia. Fire-and-forget:
 * falha de telemetria nunca quebra a request principal.
 */

/** Visitor id já registrado hoje (memo em memória por instância serverless). */
const seenVisitors = new Set<string>()
const SEEN_MAX = 10_000

export async function recordGeoVisit(event: H3Event): Promise<void> {
  try {
    const config = useRuntimeConfig()
    const salt = config.geoSalt as string
    if (!salt) return // telemetria desativada sem GEO_SALT

    const country = getCountryFromEvent(event)
    if (country === 'unknown') return

    const ip = getClientIp(event)
    if (!ip) return

    const day = geoDayBucket()
    const visitorId = `${day}:${hashIp(ip, salt).slice(0, 16)}`
    if (seenVisitors.has(visitorId)) return

    const db = getFirestore(getFirebaseAdmin())
    const doc = db.collection('geoStats').doc(day)

    await doc.set({ day, countries: { [country]: FieldValue.increment(1) } }, { merge: true })

    seenVisitors.add(visitorId)
    if (seenVisitors.size > SEEN_MAX) {
      const first = seenVisitors.values().next().value
      if (first !== undefined) seenVisitors.delete(first)
    }
  } catch {
    // Telemetria é best-effort: falha silenciosa é aceitável aqui.
  }
}

/** Agregado por país para o dashboard admin. */
export interface GeoStatsResult {
  totalVisits: number
  days: number
  countries: Array<{ country: string; visits: number }>
}

/**
 * Soma os contadores diários dos últimos `days` dias.
 */
export async function getGeoStats(days: number): Promise<GeoStatsResult> {
  const db = getFirestore(getFirebaseAdmin())
  const cutoff = geoDayBucket(new Date(Date.now() - days * 24 * 60 * 60 * 1000))

  const snapshot = await db
    .collection('geoStats')
    .where('day', '>=', cutoff)
    .orderBy('day', 'asc')
    .get()

  const byCountry = new Map<string, number>()
  let totalVisits = 0

  for (const doc of snapshot.docs) {
    const countries = (doc.data().countries ?? {}) as Record<string, number>
    for (const [country, visits] of Object.entries(countries)) {
      const n = Number(visits) || 0
      totalVisits += n
      byCountry.set(country, (byCountry.get(country) ?? 0) + n)
    }
  }

  const countries = [...byCountry.entries()]
    .map(([country, visits]) => ({ country, visits }))
    .sort((a, b) => b.visits - a.visits)

  return { totalVisits, days, countries }
}
