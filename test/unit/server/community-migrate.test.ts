import { describe, expect, it } from 'vitest'
import {
  dedupeByEmail,
  planMigration,
  rowToMember,
  uidFromEmail,
  type SheetRow,
} from '@@/server/utils/community-migrate'

function row(n: number, email: string, name = 'Nome'): SheetRow {
  return { row: n, values: [name, email] }
}

describe('TASK-003 — RF-006 migração sheet→Firestore', () => {
  it('uidFromEmail é determinístico e único por email', () => {
    expect(uidFromEmail('a@b.c')).toBe(uidFromEmail('a@b.c'))
    expect(uidFromEmail('a@b.c')).not.toBe(uidFromEmail('d@e.f'))
  })

  it('rowToMember normaliza email e deriva nome', () => {
    const m = rowToMember(row(1, '  A@B.C ', 'Maria'), 1, 0)
    expect(m?.email).toBe('a@b.c')
    expect(m?.name).toBe('Maria')
    expect(m?.migrated).toBe(true)
    expect(m?.source).toBe('sheet')
  })

  it('rowToMember retorna null para email inválido', () => {
    expect(rowToMember(row(1, 'sem-arroba'), 1, 0)).toBeNull()
    expect(rowToMember(row(2, ''), 1, 0)).toBeNull()
  })

  it('RF-006: 3 linhas com 2 emails únicos → 2 members', () => {
    const rows = [row(1, 'a@b.c'), row(2, 'a@b.c'), row(3, 'd@e.f')]
    const { members, skipped } = planMigration(rows, 1, 0)
    expect(members).toHaveLength(2)
    expect(skipped).toBe(1)
  })

  it('RF-006: migração é idempotente (rodar 2x = mesmo estado)', () => {
    const rows = [row(1, 'a@b.c'), row(2, 'd@e.f')]
    const r1 = planMigration(rows, 1, 0)
    const r2 = planMigration(rows, 1, 0)
    expect(r1.members.map((m) => m.uid)).toEqual(r2.members.map((m) => m.uid))
  })

  it('RF-006: linha sem email vira error reportado', () => {
    const rows = [row(1, 'a@b.c'), row(2, 'inválido')]
    const { errors, members } = planMigration(rows, 1, 0)
    expect(members).toHaveLength(1)
    expect(errors[0]).toContain('linha 2')
  })

  it('dedupeByEmail conta skipped corretamente', () => {
    const ms = [
      rowToMember(row(1, 'a@b.c'), 1, 0)!,
      rowToMember(row(2, 'a@b.c'), 1, 0)!,
      rowToMember(row(3, 'd@e.f'), 1, 0)!,
    ]
    const { unique, skipped } = dedupeByEmail(ms)
    expect(unique).toHaveLength(2)
    expect(skipped).toBe(1)
  })
})
