/**
 * TASK-005 — RF-003/004: PATCH /api/admin/community/members
 * Body: { targetUid, action, newRole?, reason?, until? }
 * Requer admin+ (roles e ban não são operação de moderator).
 */
import { requireRole } from '../../../utils/require-role'
import { applyMutation } from '../../../utils/community-admin'

export default defineEventHandler(async (event) => {
  const actor = await requireRole(event, 'admin')
  const body = await readBody<{
    targetUid?: string
    action?: 'role_change' | 'ban' | 'suspend' | 'reactivate'
    newRole?: string
    reason?: string
    until?: string | null
  }>(event)

  if (!body.targetUid || !body.action) {
    throw createError({ statusCode: 422, statusMessage: 'targetUid e action obrigatórios' })
  }

  const result = await applyMutation(event, actor, body.targetUid, {
    action: body.action,
    newRole: body.newRole,
    reason: body.reason,
    until: body.until ?? null,
  })

  if (result.status !== 200) {
    throw createError({ statusCode: result.status, statusMessage: result.error })
  }
  return { ok: true }
})
