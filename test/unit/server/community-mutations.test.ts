import { describe, expect, it } from 'vitest'
import {
  finalizeAudit,
  sortAuditDesc,
  validateBan,
  validateRoleChange,
} from '@@/server/utils/community-mutations'

describe('TASK-005 — RF-003 mudança de role', () => {
  it('admin promove member→moderator: ok + audit', () => {
    const r = validateRoleChange({
      actorRole: 'admin',
      targetCurrentRole: 'member',
      newRole: 'moderator',
    })
    expect(r.ok).toBe(true)
    expect(r.audit?.action).toBe('role_change')
    expect(r.audit?.after).toEqual({ role: 'moderator' })
  })

  it('moderator tenta promover → 403', () => {
    const r = validateRoleChange({
      actorRole: 'moderator',
      targetCurrentRole: 'member',
      newRole: 'moderator',
    })
    expect(r.status).toBe(403)
  })

  it('owner nunca pode ser alterado → 422', () => {
    const r = validateRoleChange({
      actorRole: 'owner',
      targetCurrentRole: 'owner',
      newRole: 'admin',
    })
    expect(r.status).toBe(422)
  })

  it('admin não atribui owner → 403', () => {
    const r = validateRoleChange({
      actorRole: 'admin',
      targetCurrentRole: 'member',
      newRole: 'owner',
    })
    expect(r.status).toBe(403)
  })

  it('role igual à atual → 422', () => {
    const r = validateRoleChange({
      actorRole: 'admin',
      targetCurrentRole: 'member',
      newRole: 'member',
    })
    expect(r.status).toBe(422)
  })
})

describe('TASK-005 — RF-004 ban/suspend', () => {
  it('ban com motivo → ok, action=ban', () => {
    const r = validateBan({
      actorRole: 'admin',
      targetCurrentRole: 'member',
      reason: 'spam no formulário',
    })
    expect(r.ok).toBe(true)
    expect(r.audit?.action).toBe('ban')
  })

  it('com until → action=suspend', () => {
    const r = validateBan({
      actorRole: 'admin',
      targetCurrentRole: 'member',
      reason: 'faltas',
      until: '2026-12-31',
    })
    expect(r.audit?.action).toBe('suspend')
    expect(r.audit?.after.suspendedUntil).toBe('2026-12-31')
  })

  it('motivo curto/vazio → 422', () => {
    expect(
      validateBan({ actorRole: 'admin', targetCurrentRole: 'member', reason: '' }).status,
    ).toBe(422)
    expect(
      validateBan({ actorRole: 'admin', targetCurrentRole: 'member', reason: 'ab' }).status,
    ).toBe(422)
  })

  it('owner protegido → 422 mesmo com admin', () => {
    const r = validateBan({
      actorRole: 'admin',
      targetCurrentRole: 'owner',
      reason: 'teste',
    })
    expect(r.status).toBe(422)
  })

  it('moderator não baniria → 403', () => {
    const r = validateBan({
      actorRole: 'moderator',
      targetCurrentRole: 'member',
      reason: 'qualquer',
    })
    expect(r.status).toBe(403)
  })
})

describe('TASK-005 — RF-007 audit log', () => {
  it('finalizeAudit preenche ator/alvo/ip/ts', () => {
    const base = validateBan({
      actorRole: 'admin',
      targetCurrentRole: 'member',
      reason: 'spam',
    }).audit!
    const done = finalizeAudit(base, 'actor1', 'target1', '10.0.0.1')
    expect(done.actorUid).toBe('actor1')
    expect(done.targetUid).toBe('target1')
    expect(done.ip).toBe('10.0.0.1')
    expect(done.ts).toBeTruthy()
  })

  it('sortAuditDesc: mais recente primeiro', () => {
    const sorted = sortAuditDesc([
      {
        ts: '2026-01-01',
        actorUid: '',
        action: 'ban',
        targetUid: '',
        before: {},
        after: {},
        ip: '',
      },
      {
        ts: '2026-06-01',
        actorUid: '',
        action: 'ban',
        targetUid: '',
        before: {},
        after: {},
        ip: '',
      },
      {
        ts: '2026-03-01',
        actorUid: '',
        action: 'ban',
        targetUid: '',
        before: {},
        after: {},
        ip: '',
      },
    ])
    expect(sorted.map((e) => e.ts)).toEqual(['2026-06-01', '2026-03-01', '2026-01-01'])
  })
})
