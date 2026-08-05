import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock firebase/auth
vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(() => vi.fn()),
}))

import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'

// All Nuxt auto-imports (useFirebaseClient, useState, onMounted)
// are stubed globally in test/setup.ts
// import.meta.client is replaced with `true` by vitest.config.ts define

import { useFirebaseAuth } from '~/composables/useFirebaseAuth'

describe('useFirebaseAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset useFirebaseClient to return valid auth by default
    vi.stubGlobal(
      'useFirebaseClient',
      vi.fn(() => ({ name: 'mock-auth' })),
    )
  })

  it('returns user, loading, error, login, logout, getToken', () => {
    const result = useFirebaseAuth()
    expect(result).toHaveProperty('user')
    expect(result).toHaveProperty('loading')
    expect(result).toHaveProperty('error')
    expect(result).toHaveProperty('login')
    expect(result).toHaveProperty('logout')
    expect(result).toHaveProperty('getToken')
  })

  it('login succeeds with valid credentials', async () => {
    const mockUser = { uid: '123', email: 'test@test.com' }
    vi.mocked(signInWithEmailAndPassword).mockResolvedValue({ user: mockUser } as never)

    const { login, user } = useFirebaseAuth()
    await login('test@test.com', 'password')
    expect(user.value).toEqual(mockUser)
  })

  it('login sets error on failure', async () => {
    vi.mocked(signInWithEmailAndPassword).mockRejectedValue(new Error('Invalid credentials'))

    const { error, login } = useFirebaseAuth()
    await expect(login('bad@test.com', 'wrong')).rejects.toThrow('Invalid credentials')
    expect(error.value).toBe('Invalid credentials')
  })

  it('logout signs out when auth exists', async () => {
    vi.mocked(signOut).mockResolvedValue(undefined as never)

    const { user, logout } = useFirebaseAuth()
    user.value = { uid: '123' } as never
    await logout()
    expect(signOut).toHaveBeenCalled()
    expect(user.value).toBeNull()
  })

  it('getToken returns null if no user', async () => {
    const { user, getToken } = useFirebaseAuth()
    user.value = null
    const token = await getToken()
    expect(token).toBeNull()
  })

  it('getToken returns token from user', async () => {
    const mockGetIdToken = vi.fn().mockResolvedValue('mock-token')

    const { user, getToken } = useFirebaseAuth()
    user.value = { getIdToken: mockGetIdToken } as never

    const token = await getToken()
    expect(token).toBe('mock-token')
    expect(mockGetIdToken).toHaveBeenCalled()
  })

  it('catches error when useFirebaseClient throws (loading=false)', () => {
    vi.stubGlobal(
      'useFirebaseClient',
      vi.fn(() => {
        throw new Error('Firebase not configured')
      }),
    )

    const result = useFirebaseAuth()
    expect(result.loading.value).toBe(false)
  })

  it('login throws if auth is null (useFirebaseClient throws)', async () => {
    vi.stubGlobal(
      'useFirebaseClient',
      vi.fn(() => {
        throw new Error('Firebase not configured')
      }),
    )

    const { login } = useFirebaseAuth()
    await expect(login('test@test.com', 'pass')).rejects.toThrow('Firebase not initialized')
  })

  it('logout does nothing if no auth', async () => {
    vi.stubGlobal(
      'useFirebaseClient',
      vi.fn(() => {
        throw new Error('Firebase not configured')
      }),
    )

    const { logout } = useFirebaseAuth()
    await logout()
    expect(signOut).not.toHaveBeenCalled()
  })

  it('registers onAuthStateChanged on mount when auth succeeds', () => {
    useFirebaseAuth()
    expect(onAuthStateChanged).toHaveBeenCalled()
  })

  it('onAuthStateChanged callback sets user and loading=false', () => {
    let callback: ((u: unknown) => void) | null = null
    vi.mocked(onAuthStateChanged).mockImplementation((_a: unknown, cb: (u: unknown) => void) => {
      callback = cb
      return vi.fn() as never
    })

    const { user, loading } = useFirebaseAuth()
    expect(callback).not.toBeNull()

    ;(callback as (u: unknown) => void)({ uid: 'mount-user' })
    expect(user.value).toEqual({ uid: 'mount-user' })
    expect(loading.value).toBe(false)
  })
})
