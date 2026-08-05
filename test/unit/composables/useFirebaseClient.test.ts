import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock firebase/app
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({ name: 'mock-app' })),
  getApps: vi.fn(() => []),
}))

// Mock firebase/auth
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({ name: 'mock-auth' })),
}))

// Mock useRuntimeConfig
const mockConfig = {
  public: {
    firebaseApiKey: 'test-api-key',
    firebaseAuthDomain: 'test.firebaseapp.com',
    firebaseProjectId: 'test-project',
    firebaseStorageBucket: 'test.appspot.com',
    firebaseMessagingSenderId: '123456',
    firebaseAppId: '1:123:web:abc',
  },
}
vi.stubGlobal('useRuntimeConfig', () => mockConfig)

describe('useFirebaseClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('initializes app when no apps exist (getApps returns [])', async () => {
    const { initializeApp, getApps } = await import('firebase/app')
    const { getAuth } = await import('firebase/auth')
    vi.mocked(getApps).mockReturnValue([])

    const { useFirebaseClient } = await import('~/composables/useFirebaseClient')
    const auth = useFirebaseClient()

    expect(initializeApp).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKey: 'test-api-key',
        projectId: 'test-project',
        appId: '1:123:web:abc',
      }),
    )
    expect(getAuth).toHaveBeenCalled()
    expect(auth).toBeDefined()
  })

  it('reuses existing app when getApps returns non-empty', async () => {
    const { initializeApp, getApps } = await import('firebase/app')
    const { getAuth } = await import('firebase/auth')
    vi.mocked(getApps).mockReturnValue([{ name: 'existing-app' }] as never)

    const { useFirebaseClient } = await import('~/composables/useFirebaseClient')
    const auth = useFirebaseClient()

    // initializeApp should NOT be called since apps exist
    expect(initializeApp).not.toHaveBeenCalled()
    expect(getAuth).toHaveBeenCalled()
    expect(auth).toBeDefined()
  })

  it('throws when firebaseApiKey is missing', async () => {
    const saved = mockConfig.public.firebaseApiKey
    mockConfig.public.firebaseApiKey = ''

    const { useFirebaseClient } = await import('~/composables/useFirebaseClient')
    expect(() => useFirebaseClient()).toThrow('Firebase configuration missing')
    mockConfig.public.firebaseApiKey = saved
  })

  it('throws when firebaseAppId is missing', async () => {
    const saved = mockConfig.public.firebaseAppId
    mockConfig.public.firebaseAppId = ''

    const { useFirebaseClient } = await import('~/composables/useFirebaseClient')
    expect(() => useFirebaseClient()).toThrow('Firebase configuration missing')
    mockConfig.public.firebaseAppId = saved
  })

  it('returns cached authInstance on subsequent calls', async () => {
    const { getApps } = await import('firebase/app')
    const { getAuth } = await import('firebase/auth')
    vi.mocked(getApps).mockReturnValue([])

    const { useFirebaseClient } = await import('~/composables/useFirebaseClient')
    const auth1 = useFirebaseClient()
    const callsAfter1 = vi.mocked(getAuth).mock.calls.length
    const auth2 = useFirebaseClient()
    const callsAfter2 = vi.mocked(getAuth).mock.calls.length

    expect(callsAfter2).toBe(callsAfter1)
    expect(auth2).toBe(auth1)
  })
})
