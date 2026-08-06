import { fetchRecentActivity } from '../../utils/recent-activity'

/**
 * GET /api/admin/activity
 * Retorna eventos recentes do repo GitHub.
 * Exige Firebase ID token valido.
 */
export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const activity = await fetchRecentActivity()

  setHeader(event, 'cache-control', 'private, max-age=300')

  return { items: activity }
})
