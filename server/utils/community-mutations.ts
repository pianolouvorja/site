/**
 * TASK-005 — RF-003/RF-004/RF-007: mudança de role, ban/suspend e audit log.
 *
 * Puro (Firestore injetado). Toda ação gera entrada em admin_audit_log.
 */

import { roleAtLeast, type MemberRole } from './community-schema'

export interface AuditEntry {
  actorUid: string
  action: 'role_change' | 'ban' | 'suspend' | 'reactivate'
  targetUid: string
  before: Record<string, unknown>
  after: Record<string, unknown>
  ip: string
  ts: string
}

export interface RoleChangeRequest {
  actorRole: MemberRole
  targetCurrentRole: MemberRole
  newRole: MemberRole
}

export interface BanRequest {
  actorRole: MemberRole
  targetCurrentRole: MemberRole
  reason: string
  until?: string | null
}

export interface MutationResult {
  ok: boolean
  status: 200 | 403 | 422
  error?: string
  audit: AuditEntry | null
}

const PROTECTED_ROLES: MemberRole[] = ['owner']

/** RF-003: mudança de role — só owner/admin, não pode mexer em owner. */
export function validateRoleChange(req: RoleChangeRequest): MutationResult {
  if (!roleAtLeast(req.actorRole, 'admin')) {
    return { ok: false, status: 403, error: 'Role insuficiente', audit: null }
  }
  if (PROTECTED_ROLES.includes(req.targetCurrentRole)) {
    return { ok: false, status: 422, error: 'Owner não pode ser alterado', audit: null }
  }
  if (req.actorRole === 'admin' && req.newRole === 'owner') {
    return { ok: false, status: 403, error: 'Só owner atribui owner', audit: null }
  }
  if (req.newRole === req.targetCurrentRole) {
    return { ok: false, status: 422, error: 'Role já é a atual', audit: null }
  }
  return {
    ok: true,
    status: 200,
    audit: {
      actorUid: '',
      action: 'role_change',
      targetUid: '',
      before: { role: req.targetCurrentRole },
      after: { role: req.newRole },
      ip: '',
      ts: '',
    },
  }
}

/** RF-004: ban/suspend — motivo obrigatório, owner protegido. */
export function validateBan(req: BanRequest): MutationResult {
  if (!roleAtLeast(req.actorRole, 'admin')) {
    return { ok: false, status: 403, error: 'Role insuficiente', audit: null }
  }
  if (PROTECTED_ROLES.includes(req.targetCurrentRole)) {
    return { ok: false, status: 422, error: 'Owner não pode ser banido', audit: null }
  }
  if (!req.reason || req.reason.trim().length < 3) {
    return { ok: false, status: 422, error: 'Motivo obrigatório (min 3 chars)', audit: null }
  }
  return {
    ok: true,
    status: 200,
    audit: {
      actorUid: '',
      action: req.until ? 'suspend' : 'ban',
      targetUid: '',
      before: { status: 'active' },
      after: {
        status: req.until ? 'suspended' : 'banned',
        banReason: req.reason.trim(),
        suspendedUntil: req.until ?? null,
      },
      ip: '',
      ts: '',
    },
  }
}

/** Completa a entrada de auditoria com ator/alvo/ip/ts (server-side). */
export function finalizeAudit(
  audit: AuditEntry,
  actorUid: string,
  targetUid: string,
  ip: string,
  now = new Date(),
): AuditEntry {
  return {
    ...audit,
    actorUid,
    targetUid,
    ip,
    ts: now.toISOString(),
  }
}

/** Ordena audit log desc por ts (mais recente primeiro). */
export function sortAuditDesc(entries: AuditEntry[]): AuditEntry[] {
  return [...entries].sort((a, b) => b.ts.localeCompare(a.ts))
}
