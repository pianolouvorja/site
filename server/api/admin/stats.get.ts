import { getDashboardStats } from '../../utils/dashboard-stats'

/**
 * GET /api/admin/stats
 * Retorna metricas agregadas do dashboard.
 * Exige Firebase ID token valido (Bearer token no header Authorization).
 */
export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const stats = await getDashboardStats()

  // Cache HTTP de 5 min para reduzir load no cliente
  setHeader(event, 'cache-control', 'private, max-age=300')

  return stats
})
