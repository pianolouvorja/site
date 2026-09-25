/**
 * TASK-005 — RF-007: GET /api/admin/community/audit
 * Audit log paginado (mais recente primeiro). Requer admin+.
 */
import { requireRole } from '../../../utils/require-role'
import { listAudit } from '../../../utils/community-admin'

export default defineEventHandler(async (event) => {
  await requireRole(event, 'admin')
  const q = getQuery(event)
  const limit = typeof q.limit === 'string' ? Number.parseInt(q.limit, 10) || 50 : 50
  return { entries: await listAudit(Math.min(limit, 200)) }
})
