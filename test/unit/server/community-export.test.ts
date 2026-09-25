import { describe, expect, it } from 'vitest'
import { escapeCsvField, membersToCsv } from '@@/server/utils/community-export'

describe('TASK-008 — RF-010 export CSV', () => {
  it('escapa vírgula e aspas no campo', () => {
    expect(escapeCsvField('Silva, Jr')).toBe('"Silva, Jr"')
    expect(escapeCsvField('diz "oi"')).toBe('"diz ""oi"""')
    expect(escapeCsvField('simples')).toBe('simples')
  })

  it('gera CSV com BOM, header e linhas', () => {
    const csv = membersToCsv([
      {
        uid: 'u1',
        name: 'Ana',
        email: 'a@b.c',
        role: 'member',
        status: 'active',
        createdAt: '2026-01-01',
      },
      {
        uid: 'u2',
        name: 'Bia, Jr',
        email: 'd@e.f',
        role: 'admin',
        status: 'active',
        createdAt: '2026-01-02',
      },
    ])
    expect(csv.startsWith('\uFEFF')).toBe(true)
    const lines = csv.trim().split('\n')
    expect(lines[0]).toBe('uid,name,email,role,status,createdAt')
    expect(lines[1]).toBe('u1,Ana,a@b.c,member,active,2026-01-01')
    expect(lines[2]).toBe('u2,"Bia, Jr",d@e.f,admin,active,2026-01-02')
  })

  it('campos ausentes viram vazio (não undefined)', () => {
    const csv = membersToCsv([{ uid: 'u1' }])
    expect(csv).toContain('u1,,,,,')
  })
})
