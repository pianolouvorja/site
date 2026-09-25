/**
 * TASK-004/005 — Endpoints admin da comunidade.
 *
 * GET  /api/admin/community/members      → lista paginada (RF-001)
 * PATCH/PUT /api/admin/community/members → role/ban (RF-003/004)
 * GET  /api/admin/community/audit        → audit log (RF-007)
 *
 * Todos exigem requireRole; handlers finos sobre utils puros (testados).
 */
import { getFirestore } from 'firebase-admin/firestore'
import { requireRole } from '@@/server/utils/require-role'
import { queryMembers, type MemberQuery } from '@@/server/utils/community-members'
import {
  finalizeAudit,
  sortAuditDesc,
  validateBan,
  validateRoleChange,
} from '@@/server/utils/community-mutations'

export interface MemberDoc {
  uid: string
  email: string
  name: string
  role: string
  status: string
  [key: string]: unknown
}

/** Lista membros do Firestore aplicando busca/filtro/paginação (RF-001). */
export async function listMembers(query: MemberQuery): Promise<{
  members: Array<Record<string, unknown>>
  nextCursor: string | null
  total: number
}> {
  const db = getFirestore()
  const snap = await db.collection('community_members').get()
  const docs = snap.docs.map((d) => ({ uid: d.id, ...d.data() }))
  return queryMembers(docs, query)
}

/** Busca um membro por uid (RF-002). Retorna null se não existe. */
export async function getMember(uid: string): Promise<MemberDoc | null> {
  const db = getFirestore()
  const doc = await db.collection('community_members').doc(uid).get()
  if (!doc.exists) return null
  return { uid: doc.id, ...(doc.data() as Record<string, unknown>) } as MemberDoc
}

export interface MutationInput {
  action: 'role_change' | 'ban' | 'suspend' | 'reactivate'
  newRole?: string
  reason?: string
  until?: string | null
}

/**
 * Aplica mutação num membro com autorização + audit (RF-003/004/007).
 * Retorna { status, error? } — persistência via Admin SDK.
 */
export async function applyMutation(
  event: Parameters<typeof requireRole>[0],
  actor: { uid: string; role: string },
  targetUid: string,
  input: MutationInput,
): Promise<{ status: number; error?: string }> {
  const db = getFirestore()
  const targetRef = db.collection('community_members').doc(targetUid)
  const targetDoc = await targetRef.get()
  if (!targetDoc.exists) {
    return { status: 404, error: 'Membro não encontrado' }
  }
  const target = targetDoc.data() as { role: string; status: string }
  const targetRole = target.role as Parameters<typeof validateRoleChange>[0]['targetCurrentRole']
  const actorRole = actor.role as Parameters<typeof validateRoleChange>[0]['actorRole']

  let result
  if (input.action === 'role_change') {
    if (!input.newRole) return { status: 422, error: 'newRole obrigatório' }
    result = validateRoleChange({
      actorRole,
      targetCurrentRole: targetRole,
      newRole: input.newRole as Parameters<typeof validateRoleChange>[0]['newRole'],
    })
  } else if (input.action === 'ban' || input.action === 'suspend') {
    result = validateBan({
      actorRole,
      targetCurrentRole: targetRole,
      reason: input.reason ?? '',
      until: input.until ?? null,
    })
  } else {
    // reactivate — admin+ pode reativar
    if (!['owner', 'admin'].includes(actor.role)) {
      return { status: 403, error: 'Role insuficiente' }
    }
    result = {
      ok: true,
      status: 200,
      audit: {
        actorUid: '',
        action: 'reactivate' as const,
        targetUid: '',
        before: { status: target.status },
        after: { status: 'active' },
        ip: '',
        ts: '',
      },
    }
  }

  if (!result.ok || !result.audit) {
    return { status: result.status, error: result.error }
  }

  // Persistência atômica: doc + audit entry
  const auditEntry = finalizeAudit(
    result.audit,
    actor.uid,
    targetUid,
    getRequestIP(event, { xForwardedFor: true }) ?? 'unknown',
  )
  const batch = db.batch()
  if (input.action === 'role_change') {
    batch.update(targetRef, { role: input.newRole, updatedAt: new Date().toISOString() })
  } else if (input.action === 'ban') {
    batch.update(targetRef, {
      status: 'banned',
      banReason: input.reason ?? '',
      updatedAt: new Date().toISOString(),
    })
  } else if (input.action === 'suspend') {
    batch.update(targetRef, {
      status: 'suspended',
      banReason: input.reason ?? '',
      suspendedUntil: input.until ?? null,
      updatedAt: new Date().toISOString(),
    })
  } else {
    batch.update(targetRef, { status: 'active', updatedAt: new Date().toISOString() })
  }
  batch.set(db.collection('admin_audit_log').doc(), auditEntry)
  await batch.commit()

  return { status: 200 }
}

/** Audit log paginado, mais recente primeiro (RF-007). */
export async function listAudit(limit = 50): Promise<Array<Record<string, unknown>>> {
  const db = getFirestore()
  const snap = await db.collection('admin_audit_log').orderBy('ts', 'desc').limit(limit).get()
  return sortAuditDesc(
    snap.docs.map((d) => ({ id: d.id, ...d.data() })) as unknown as Parameters<
      typeof sortAuditDesc
    >[0],
  ) as unknown as Array<Record<string, unknown>>
}
