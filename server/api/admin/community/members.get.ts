/**
 * TASK-004 — RF-001: GET /api/admin/community/members
 * Lista paginada de membros com busca e filtros. Requer moderator+.
 */
import { requireRole } from '../../../utils/require-role'
import { listMembers } from '../../../utils/community-admin'

export default defineEventHandler(async (event) => {
  await requireRole(event, 'moderator')
  const q = getQuery(event)
  return await listMembers({
    q: typeof q.q === 'string' ? q.q : undefined,
    role: typeof q.role === 'string' ? q.role : undefined,
    status: typeof q.status === 'string' ? q.status : undefined,
    cursor: typeof q.cursor === 'string' ? q.cursor : undefined,
    limit: typeof q.limit === 'string' ? Number.parseInt(q.limit, 10) : undefined,
  })
})
