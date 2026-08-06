import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, type Ref } from 'vue'

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(() => vi.fn()),
}))

import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'

// Mock useState from Nuxt — returns a reactive ref backed by a Map
const stateMap = new Map<string, Ref<unknown>>()
vi.stubGlobal('useState', <T>(key: string, init: () => T) => {
  if (!stateMap.has(key)) {
    stateMap.set(key, ref(init()) as Ref<unknown>)
  }
  return stateMap.get(key) as Ref<T>
})

// Mock useFirebaseClient
vi.stubGlobal(
  'useFirebaseClient',
  vi.fn(() => ({ name: 'mock-auth' })),
)

// Mock onMounted — execute immediately
vi.stubGlobal('onMounted', (cb: () => void) => {
  cb()
})

import { useFirebaseAuth, __setIsClientForTesting } from '~/composables/useFirebaseAuth'

describe('useFirebaseAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    stateMap.clear()
    vi.stubGlobal(
      'useFirebaseClient',
      vi.fn(() => ({ name: 'mock-auth' })),
    )
  })

  it('returns all expected properties', () => {
    const result = useFirebaseAuth()
    expect(result).toHaveProperty('user')
    expect(result).toHaveProperty('loading')
    expect(result).toHaveProperty('error')
    expect(result).toHaveProperty('login')
    expect(result).toHaveProperty('logout')
    expect(result).toHaveProperty('getToken')
  })

  it('uses correct useState keys for user, loading, error', () => {
    const keys: string[] = []
    vi.stubGlobal('useState', <T>(key: string, init: () => T) => {
      keys.push(key)
      return ref(init()) as Ref<unknown> as Ref<T>
    })
    useFirebaseAuth()
    expect(keys).toContain('firebase_user')
    expect(keys).toContain('firebase_loading')
    expect(keys).toContain('firebase_error')
    // Restore default mock
    vi.stubGlobal('useState', <T>(key: string, init: () => T) => {
      if (!stateMap.has(key)) {
        stateMap.set(key, ref(init()) as Ref<unknown>)
      }
      return stateMap.get(key) as Ref<T>
    })
  })

  it('loading is true initially when auth succeeds', () => {
    const { loading } = useFirebaseAuth()
    expect(loading.value).toBe(true)
  })

  it('error is null initially', () => {
    const { error } = useFirebaseAuth()
    expect(error.value).toBeNull()
  })

  it('user is null initially', () => {
    const { user } = useFirebaseAuth()
    expect(user.value).toBeNull()
  })

  it('login sets error to null before attempt', async () => {
    vi.mocked(signInWithEmailAndPassword).mockResolvedValue({ user: { uid: 'x' } } as never)
    const { error, login } = useFirebaseAuth()
    error.value = 'previous error'
    await login('test@test.com', 'pass')
    expect(error.value).toBeNull()
  })

  it('login calls signInWithEmailAndPassword with auth, email, password', async () => {
    vi.mocked(signInWithEmailAndPassword).mockResolvedValue({ user: { uid: 'x' } } as never)
    const { login } = useFirebaseAuth()
    await login('user@test.com', 'secret')
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'user@test.com',
      'secret',
    )
  })

  it('login sets user on success', async () => {
    const mockUser = { uid: '123', email: 'test@test.com' }
    vi.mocked(signInWithEmailAndPassword).mockResolvedValue({ user: mockUser } as never)
    const { user, login } = useFirebaseAuth()
    await login('test@test.com', 'pass')
    expect(user.value).toEqual(mockUser)
  })

  it('login sets error and rethrows on failure', async () => {
    vi.mocked(signInWithEmailAndPassword).mockRejectedValue(new Error('Invalid credentials'))
    const { error, login } = useFirebaseAuth()
    await expect(login('bad@test.com', 'wrong')).rejects.toThrow('Invalid credentials')
    expect(error.value).toBe('Invalid credentials')
  })

  it('login throws "Firebase not initialized" when auth is null', async () => {
    vi.stubGlobal(
      'useFirebaseClient',
      vi.fn(() => {
        throw new Error('Firebase not configured')
      }),
    )
    const { login } = useFirebaseAuth()
    await expect(login('test@test.com', 'pass')).rejects.toThrow('Firebase not initialized')
  })

  it('logout calls signOut when auth exists', async () => {
    vi.mocked(signOut).mockResolvedValue(undefined as never)
    const { logout } = useFirebaseAuth()
    await logout()
    expect(signOut).toHaveBeenCalled()
  })

  it('logout sets user to null', async () => {
    vi.mocked(signOut).mockResolvedValue(undefined as never)
    const { user, logout } = useFirebaseAuth()
    user.value = { uid: '123' } as never
    await logout()
    expect(user.value).toBeNull()
  })

  it('logout does NOT call signOut when auth is null', async () => {
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

  it('getToken returns null when no user', async () => {
    const { user, getToken } = useFirebaseAuth()
    user.value = null
    const token = await getToken()
    expect(token).toBeNull()
  })

  it('getToken returns token from user.getIdToken', async () => {
    const mockGetIdToken = vi.fn().mockResolvedValue('mock-token')
    const { user, getToken } = useFirebaseAuth()
    user.value = { getIdToken: mockGetIdToken } as never
    const token = await getToken()
    expect(token).toBe('mock-token')
  })

  it('registers onAuthStateChanged on mount', () => {
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

  it('onAuthStateChanged callback with null sets user null, loading false', () => {
    let callback: ((u: unknown) => void) | null = null
    vi.mocked(onAuthStateChanged).mockImplementation((_a: unknown, cb: (u: unknown) => void) => {
      callback = cb
      return vi.fn() as never
    })

    const { user, loading } = useFirebaseAuth()
    ;(callback as (u: unknown) => void)(null)
    expect(user.value).toBeNull()
    expect(loading.value).toBe(false)
  })

  it('catch block sets loading=false when useFirebaseClient throws', () => {
    vi.stubGlobal(
      'useFirebaseClient',
      vi.fn(() => {
        throw new Error('Firebase not configured')
      }),
    )
    const { loading } = useFirebaseAuth()
    expect(loading.value).toBe(false)
  })

  it('does not initialize auth when not on client (_isClient false)', () => {
    __setIsClientForTesting(false)
    const clientSpy = vi.fn(() => ({ name: 'mock-auth' }))
    vi.stubGlobal('useFirebaseClient', clientSpy)
    const { loading } = useFirebaseAuth()
    expect(loading.value).toBe(true)
    expect(clientSpy).not.toHaveBeenCalled()
    __setIsClientForTesting(true)
  })
})
