/**
 * TASK-002 — RF-005: autorização server-side por role (Firebase custom claims).
 *
 * Uso nos endpoints admin:
 *   const auth = await requireRole(event, 'moderator')
 *   // auth.uid / auth.role / auth.email disponíveis no handler
 *
 * Hierarquia: owner(4) > admin(3) > moderator(2) > member(1).
 * Falhas: 401 sem/expirado token, 403 sem claim ou role insuficiente.
 */
import { createError, getHeader, type H3Event } from 'h3'
import { getAuth } from 'firebase-admin/auth'
import { getFirebaseAdmin } from './firebase-admin'
import { roleAtLeast, type MemberRole } from './community-schema'

export interface AdminAuth {
  uid: string
  email: string
  role: MemberRole
}

function extractBearer(event: H3Event): string | null {
  const header = getHeader(event, 'authorization')
  if (!header?.startsWith('Bearer ')) return null
  return header.slice(7).trim() || null
}

export async function requireRole(event: H3Event, min: MemberRole): Promise<AdminAuth> {
  const token = extractBearer(event)
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Token ausente' })
  }

  let decoded: { uid: string; email?: string; role?: string }
  try {
    decoded = await getAuth(getFirebaseAdmin()).verifyIdToken(token, true)
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Token inválido ou expirado' })
  }

  const role = decoded.role as MemberRole | undefined
  if (!role || !(role in { owner: 1, admin: 1, moderator: 1, member: 1 })) {
    throw createError({ statusCode: 403, statusMessage: 'Sem role atribuída' })
  }

  if (!roleAtLeast(role, min)) {
    throw createError({ statusCode: 403, statusMessage: 'Role insuficiente' })
  }

  return { uid: decoded.uid, email: decoded.email ?? '', role }
}
