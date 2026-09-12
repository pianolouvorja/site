import { describe, it, expect } from 'vitest'
import { communityMembers, communityRoles, type CommunityRole } from '~/data/community'

describe('data/community', () => {
  it('define os tres papeis possiveis', () => {
    expect(communityRoles).toEqual(['tester', 'enthusiast', 'suggester'])
  })

  it('possui ao menos um membro com nome, papel valido e desde', () => {
    expect(communityMembers.length).toBeGreaterThanOrEqual(1)
    for (const member of communityMembers) {
      expect(member.name.length).toBeGreaterThan(3)
      expect(communityRoles).toContain(member.role)
      expect(member.since).toMatch(/^\d{4}-\d{2}$/)
      expect(member.url ?? '').toMatch(/^$|^https?:\/\//)
    }
  })

  it('nao expoe dados pessoais alem do nome e papel (LGPD)', () => {
    for (const member of communityMembers) {
      const keys = Object.keys(member)
      expect(keys).not.toContain('email')
      expect(keys).not.toContain('phone')
      expect(keys).not.toContain('contact')
    }
  })

  it('papel e um tipo restrito', () => {
    const role: CommunityRole = 'tester'
    expect(role).toBe('tester')
  })
})
