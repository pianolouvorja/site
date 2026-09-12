import { getGeoStats } from '../../utils/geo-visit'

/**
 * GET /api/admin/geo?days=30
 * Retorna agregados de audiência por país (LGPD: somente agregados,
 * nenhum IP individual é exposto).
 * Exige Firebase ID token valido (Bearer token no header Authorization).
 */
export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const query = getQuery(event)
  const rawDays = Number(query.days)
  const days = Number.isFinite(rawDays) && rawDays > 0 ? Math.min(rawDays, 365) : 30

  const stats = await getGeoStats(days)

  setHeader(event, 'cache-control', 'private, max-age=300')

  return stats
})
