import { describe, expect, it } from 'vitest'
import {
  applyFilters,
  normalizeQuery,
  paginate,
  pageSize,
  queryMembers,
  type MemberQuery,
} from '@@/server/utils/community-members'

const FIXTURE = Array.from({ length: 30 }, (_, i) => ({
  uid: `u${i + 1}`,
  name: i < 12 ? `Membro ${i + 1}` : `Outro ${i + 1}`,
  email: `user${i + 1}@mail.com`,
  role: i % 5 === 0 ? 'moderator' : 'member',
  status: i % 7 === 0 ? 'banned' : 'active',
}))

describe('TASK-004 — RF-001 query de membros', () => {
  it('normaliza busca (trim + lowercase)', () => {
    expect(normalizeQuery('  Ana  ')).toBe('ana')
    expect(normalizeQuery(undefined)).toBe('')
  })

  it('pageSize: default 25, cap 100, mínimo 1', () => {
    expect(pageSize(undefined)).toBe(25)
    expect(pageSize(200)).toBe(100)
    expect(pageSize(0)).toBe(25)
  })

  it('RF-001: 30 members → página 1 com 25, cursor p/ página 2 com 5', () => {
    const page1 = paginate(FIXTURE, {})
    expect(page1.members).toHaveLength(25)
    expect(page1.nextCursor).toBe('25')
    expect(page1.total).toBe(30)
    const page2 = paginate(FIXTURE, { cursor: page1.nextCursor! })
    expect(page2.members).toHaveLength(5)
    expect(page2.nextCursor).toBeNull()
  })

  it('RF-001: busca por prefixo case-insensitive em name/email', () => {
    const { members } = queryMembers(FIXTURE, { q: 'membro' })
    expect(members).toHaveLength(12)
    const byEmail = queryMembers(FIXTURE, { q: 'user3' })
    expect(byEmail.members.length).toBeGreaterThanOrEqual(1)
  })

  it('RF-001: filtro exato por role e status', () => {
    const mods = applyFilters(FIXTURE, { role: 'moderator' })
    expect(mods.every((m) => m.role === 'moderator')).toBe(true)
    const banned = applyFilters(FIXTURE, { status: 'banned' })
    expect(banned.every((m) => m.status === 'banned')).toBe(true)
  })

  it('RF-001: pipeline completo (busca + filtro + paginação)', () => {
    const q: MemberQuery = { q: 'outro', status: 'active', limit: 5 }
    const page = queryMembers(FIXTURE, q)
    expect(page.members.length).toBeLessThanOrEqual(5)
    expect(page.members.every((m) => String(m.name).startsWith('Outro'))).toBe(true)
  })
})
