/**
 * TASK-001 — RF-005-prep: regras do Firestore para as coleções da comunidade.
 *
 * Regra central: TODAS as coleções admin/comunidade são deny-all para clients.
 * Escrita só via Admin SDK (server-side), que bypassa regras.
 * Coberto por teste de integração com emulador (ver community-rules.test.ts)
 * e validado estaticamente aqui.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

export const COMMUNITY_COLLECTIONS = [
  'community_members',
  'community_reports',
  'admin_audit_log',
] as const

export type CommunityCollection = (typeof COMMUNITY_COLLECTIONS)[number]

export const MEMBER_ROLES = ['owner', 'admin', 'moderator', 'member'] as const
export type MemberRole = (typeof MEMBER_ROLES)[number]

export const MEMBER_STATUSES = ['active', 'pending', 'suspended', 'banned'] as const
export type MemberStatus = (typeof MEMBER_STATUSES)[number]

/** Hierarquia de poder — quanto maior o número, mais poder. */
export const ROLE_HIERARCHY: Record<MemberRole, number> = {
  owner: 4,
  admin: 3,
  moderator: 2,
  member: 1,
}

export function roleAtLeast(role: MemberRole, min: MemberRole): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[min]
}

/** Gera o firestore.rules completo para as coleções da comunidade. */
export function communityRules(): string {
  const denyRules = COMMUNITY_COLLECTIONS.map(
    (c) => `    match /${c}/{doc} {
      allow read, write: if false;
    }`,
  ).join('\n')

  return `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
${denyRules}
  }
}
`
}

/** Escreve firestore.rules no disco (usado pelo setup do emulador / deploy). */
export function writeRulesFile(destPath: string): void {
  writeFileSync(destPath, communityRules(), 'utf8')
}

/** Valida que o firestore.rules existente nega client em todas as coleções. */
export function rulesDenyAllClients(rulesPath: string): boolean {
  const content = readFileSync(fileURLToPath(new URL(rulesPath, import.meta.url)), 'utf8')
  return COMMUNITY_COLLECTIONS.every((c) => {
    const match = new RegExp(`match /${c}/\\{doc\\}[\\s\\S]*?allow read, write: if false`)
    return match.test(content)
  })
}
