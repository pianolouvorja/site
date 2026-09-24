import { beforeEach, describe, expect, it, vi } from 'vitest'

// RF-005 — autorização server-side por role. Firebase Admin e h3 mockados;
// o contrato testado é o comportamento do requireRole puro.

const { verifyIdTokenMock, getAuthMock } = vi.hoisted(() => ({
  verifyIdTokenMock: vi.fn(),
  getAuthMock: vi.fn(() => ({ verifyIdToken: verifyIdTokenMock })),
}))

vi.mock('firebase-admin/auth', () => ({ getAuth: getAuthMock }))
vi.mock('@@/server/utils/firebase-admin', () => ({
  getFirebaseAdmin: vi.fn(() => ({})),
}))
vi.mock('h3', () => ({
  getHeader: vi.fn(),
  createError: (err: { statusCode: number; statusMessage: string }) => {
    const e = new Error(err.statusMessage) as Error & { statusCode: number }
    e.statusCode = err.statusCode
    return e
  },
}))

import { getHeader } from 'h3'
import { requireRole } from '@@/server/utils/require-role'

function mockEvent(header?: string) {
  vi.mocked(getHeader).mockImplementation(
    (_e, name) => (name === 'authorization' ? header : undefined) as never,
  )
  return {} as never
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('RF-005 — requireRole', () => {
  function eventWith(header?: string) {
    mockEvent(header)
    return mockEvent(header)
  }

  it('401 quando header Authorization ausente', async () => {
    await expect(requireRole(eventWith(undefined), 'moderator')).rejects.toMatchObject({
      statusCode: 401,
    })
  })

  it('401 quando header sem prefixo Bearer', async () => {
    await expect(requireRole(eventWith('Basic abc'), 'moderator')).rejects.toMatchObject({
      statusCode: 401,
    })
  })

  it('401 quando token expirado/inválido (verifyIdToken rejeita)', async () => {
    const ev = eventWith('Bearer token')
    verifyIdTokenMock.mockRejectedValue(new Error('expired'))
    await expect(requireRole(ev, 'moderator')).rejects.toMatchObject({
      statusCode: 401,
    })
  })

  it('403 quando token válido sem claim role', async () => {
    const ev = eventWith('Bearer token')
    verifyIdTokenMock.mockResolvedValue({ uid: 'u1', email: 'a@b.c' })
    await expect(requireRole(ev, 'moderator')).rejects.toMatchObject({
      statusCode: 403,
    })
  })

  it('403 quando role insuficiente (member pede moderator)', async () => {
    const ev = eventWith('Bearer token')
    verifyIdTokenMock.mockResolvedValue({ uid: 'u1', email: 'a@b.c', role: 'member' })
    await expect(requireRole(ev, 'moderator')).rejects.toMatchObject({
      statusCode: 403,
    })
  })

  it('200 quando role atinge o mínimo (moderator pede moderator)', async () => {
    const ev = eventWith('Bearer token')
    verifyIdTokenMock.mockResolvedValue({ uid: 'u1', email: 'a@b.c', role: 'moderator' })
    const auth = await requireRole(ev, 'moderator')
    expect(auth).toEqual({ uid: 'u1', email: 'a@b.c', role: 'moderator' })
  })

  it('hierarquia: admin satisfaz pedido de moderator', async () => {
    const ev = eventWith('Bearer token')
    verifyIdTokenMock.mockResolvedValue({ uid: 'u2', email: 'e@f.g', role: 'admin' })
    const auth = await requireRole(ev, 'moderator')
    expect(auth.role).toBe('admin')
  })

  it('hierarquia: só owner satisfaz pedido de owner', async () => {
    const ev = eventWith('Bearer token')
    verifyIdTokenMock.mockResolvedValue({ uid: 'u3', email: 'x@y.z', role: 'admin' })
    await expect(requireRole(ev, 'owner')).rejects.toMatchObject({
      statusCode: 403,
    })
  })

  it('Bearer com espaços extras é tratado (trim)', async () => {
    const ev = eventWith('Bearer   spaced  ')
    verifyIdTokenMock.mockResolvedValue({ uid: 'u4', email: 'a@b.c', role: 'owner' })
    await requireRole(ev, 'owner')
    expect(verifyIdTokenMock).toHaveBeenCalledWith('spaced', true)
  })
})
