/**
 * TASK-003 — RF-006: migração idempotente sheet → Firestore.
 *
 * Lê as abas testadores/desenvolvedores/relatos da planilha (Google Sheets API
 * com OAuth refresh token — mesma fonte do cadastro público) e grava em
 * `community_members` / `community_reports` com `source: 'sheet'` e
 * `migrated: true`. Dedupe por email: rodar 2x produz o mesmo estado.
 */

export interface SheetRow {
  row: number
  values: string[]
}

export interface MigrationReport {
  created: number
  skipped: number
  errors: string[]
}

export interface MemberRecord {
  uid: string
  email: string
  name: string
  role: 'member'
  status: 'active' | 'pending'
  source: 'sheet'
  migrated: boolean
  sheetRow: number
  createdAt: string
  updatedAt: string
}

/** Deriva um uid estável do email (determinístico, idempotente). */
export function uidFromEmail(email: string): string {
  let h1 = 0x811c9dc5
  let h2 = 0x01000193
  for (let i = 0; i < email.length; i++) {
    const c = email.charCodeAt(i)
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0
    h2 = Math.imul(h2 ^ c, 0x85ebca6b) >>> 0
  }
  return `sheet_${h1.toString(16).padStart(8, '0')}${h2.toString(16).padStart(8, '0')}`
}

/** Mapeia uma linha da sheet para member (ou null se não migrável). */
export function rowToMember(row: SheetRow, emailIdx: number, nameIdx: number): MemberRecord | null {
  const email = (row.values[emailIdx] ?? '').trim().toLowerCase()
  if (!email || !email.includes('@')) return null
  const now = new Date().toISOString()
  return {
    uid: uidFromEmail(email),
    email,
    name: (row.values[nameIdx] ?? '').trim() || email.split('@')[0]!,
    role: 'member',
    status: 'active',
    source: 'sheet',
    migrated: true,
    sheetRow: row.row,
    createdAt: now,
    updatedAt: now,
  }
}

/** Dedupe por email mantendo a primeira ocorrência. */
export function dedupeByEmail(members: MemberRecord[]): {
  unique: MemberRecord[]
  skipped: number
} {
  const seen = new Set<string>()
  const unique: MemberRecord[] = []
  for (const m of members) {
    if (seen.has(m.email)) continue
    seen.add(m.email)
    unique.push(m)
  }
  return { unique, skipped: members.length - unique.length }
}

/** Executa a migração em memória (pura — I/O injetada). */
export function planMigration(
  rows: SheetRow[],
  emailIdx: number,
  nameIdx: number,
): {
  members: MemberRecord[]
  skipped: number
  errors: string[]
} {
  const members: MemberRecord[] = []
  const errors: string[] = []
  for (const row of rows) {
    const m = rowToMember(row, emailIdx, nameIdx)
    if (!m) {
      errors.push(`linha ${row.row}: email inválido ou ausente`)
      continue
    }
    members.push(m)
  }
  const { unique, skipped } = dedupeByEmail(members)
  return { members: unique, skipped, errors }
}
