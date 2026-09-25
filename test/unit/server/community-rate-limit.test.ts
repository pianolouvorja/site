import { beforeEach, describe, expect, it } from 'vitest'
import { allowRequest, clientIp, resetRateLimit } from '@@/server/utils/community-rate-limit'

describe('TASK-009 — RF-009 rate limit do cadastro', () => {
  beforeEach(() => resetRateLimit())

  it('permite até 5 requests por IP na janela', () => {
    for (let i = 0; i < 5; i++) {
      expect(allowRequest('1.2.3.4')).toBe(true)
    }
  })

  it('bloqueia o 6º request do mesmo IP', () => {
    for (let i = 0; i < 5; i++) allowRequest('1.2.3.4')
    expect(allowRequest('1.2.3.4')).toBe(false)
  })

  it('IPs diferentes têm cotas independentes', () => {
    for (let i = 0; i < 5; i++) allowRequest('1.1.1.1')
    expect(allowRequest('2.2.2.2')).toBe(true)
  })

  it('janela expirada libera nova cota', () => {
    const now = Date.now()
    for (let i = 0; i < 5; i++) allowRequest('1.2.3.4', now)
    // 2h depois
    expect(allowRequest('1.2.3.4', now + 2 * 60 * 60 * 1000)).toBe(true)
  })

  it('clientIp prioriza x-forwarded-for (primeiro da lista)', () => {
    expect(clientIp({ 'x-forwarded-for': '10.0.0.1, 10.0.0.2' })).toBe('10.0.0.1')
    expect(clientIp({ 'x-real-ip': '10.9.9.9' })).toBe('10.9.9.9')
    expect(clientIp({})).toBe('unknown')
  })
})
