import { describe, expect, it } from 'vitest'
import { computeHealth } from '@@/server/utils/community-health'

const NOW = new Date('2026-09-24T12:00:00Z')
const DAYS_AGO = (n: number) => new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000).toISOString()

describe('TASK-008 — RF-008 saúde da comunidade', () => {
  it('conta novos membros da semana corrente', () => {
    const members = [
      { createdAt: DAYS_AGO(1), status: 'active' },
      { createdAt: DAYS_AGO(10), status: 'active' },
    ]
    const h = computeHealth(members, [], NOW)
    expect(h.newThisWeek).toBe(1)
  })

  it('taxa de aprovação 30d = aprovados+resolvidos / revisados', () => {
    const reports = [
      { status: 'aprovado', createdAt: DAYS_AGO(5) },
      { status: 'rejeitado', createdAt: DAYS_AGO(6) },
      { status: 'resolvido', createdAt: DAYS_AGO(7) },
      { status: 'novo', createdAt: DAYS_AGO(2) },
    ]
    const h = computeHealth([], reports, NOW)
    // 3 revisados, 2 favoráveis → 67%
    expect(h.approvalRate30d).toBe(67)
  })

  it('sem revisados → taxa 0 (não NaN)', () => {
    const h = computeHealth([], [{ status: 'novo', createdAt: DAYS_AGO(1) }], NOW)
    expect(h.approvalRate30d).toBe(0)
  })

  it('openReports conta status novo; banned conta membros banidos', () => {
    const members = [
      { createdAt: DAYS_AGO(40), status: 'banned' },
      { createdAt: DAYS_AGO(40), status: 'active' },
    ]
    const reports = [{ status: 'novo', createdAt: DAYS_AGO(3) }]
    const h = computeHealth(members, reports, NOW)
    expect(h.openReports).toBe(1)
    expect(h.bannedMembers).toBe(1)
  })
})
