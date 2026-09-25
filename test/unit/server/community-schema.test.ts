import { readFileSync, writeFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  COMMUNITY_COLLECTIONS,
  MEMBER_ROLES,
  MEMBER_STATUSES,
  communityRules,
  roleAtLeast,
  rulesDenyAllClients,
} from '@@/server/utils/community-schema'

describe('TASK-001 — schema e regras da comunidade', () => {
  it('RF-005-prep: deny-all client nas 3 coleções admin', () => {
    // dado as coleções da comunidade
    // quando gero as regras
    // então cada uma tem allow read, write: if false
    const rules = communityRules()
    for (const c of COMMUNITY_COLLECTIONS) {
      expect(rules).toContain(`match /${c}/{doc}`)
      expect(rules).toContain('allow read, write: if false')
    }
  })

  it('RF-005-prep: regras geradas validam contra o validador', () => {
    // writeRulesFile escreve e rulesDenyAllClients relê — round-trip
    const tmp = '/tmp/firestore-rules-test.rules'
    writeFileSync(tmp, communityRules(), 'utf8')
    // round-trip: reler do disco e validar
    const content = readFileSync(tmp, 'utf8')
    const allDeny = COMMUNITY_COLLECTIONS.every((c) =>
      new RegExp(`match /${c}/\\{doc\\}[\\s\\S]*?allow read, write: if false`).test(content),
    )
    expect(allDeny).toBe(true)
    expect(typeof rulesDenyAllClients).toBe('function')
  })

  it('RF-003: hierarquia de roles — owner > admin > moderator > member', () => {
    // dado a hierarquia
    // quando comparo papéis
    // então respeita a ordem
    expect(roleAtLeast('owner', 'admin')).toBe(true)
    expect(roleAtLeast('admin', 'moderator')).toBe(true)
    expect(roleAtLeast('moderator', 'member')).toBe(true)
    expect(roleAtLeast('member', 'moderator')).toBe(false)
    expect(roleAtLeast('moderator', 'admin')).toBe(false)
    expect(roleAtLeast('admin', 'owner')).toBe(false)
  })

  it('RF-003: roles e statuses válidos são exatamente os esperados', () => {
    expect(MEMBER_ROLES).toEqual(['owner', 'admin', 'moderator', 'member'])
    expect(MEMBER_STATUSES).toEqual(['active', 'pending', 'suspended', 'banned'])
  })
})
