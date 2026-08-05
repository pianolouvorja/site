import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, type Ref } from 'vue'

// Mock firebase/auth
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(),
}))

import { onAuthStateChanged } from 'firebase/auth'

// Mock useNuxtApp
const mockFirebaseAuth = { value: null as unknown }
vi.stubGlobal('useNuxtApp', () => ({
  $firebaseAuth: mockFirebaseAuth.value,
}))

// Mock useState — return a real ref that persists per-key
const stateMap = new Map<string, Ref<unknown>>()
vi.stubGlobal('useState', <T>(key: string, init: () => T): Ref<T> => {
  if (!stateMap.has(key)) {
    stateMap.set(key, ref(init()))
  }
  return stateMap.get(key) as Ref<T>
})

// Import after mocks
const { useAuthState } = await import('~/composables/useAuthState')

describe('useAuthState', () => {
  beforeEach(() => {
    stateMap.clear()
    vi.clearAllMocks()
    mockFirebaseAuth.value = null
  })

  it('returns user, isLoading, and waitForAuth', () => {
    const result = useAuthState()
    expect(result).toHaveProperty('user')
    expect(result).toHaveProperty('isLoading')
    expect(result).toHaveProperty('waitForAuth')
    expect(typeof result.waitForAuth).toBe('function')
  })

  it('resolves immediately when already resolved (isLoading=false on second call)', async () => {
    // First call with no firebase → sets isLoading=false and resolved=true
    mockFirebaseAuth.value = null
    const state = useAuthState()
    await state.waitForAuth()
    expect(state.isLoading.value).toBe(false)

    // Second call — already resolved, should resolve instantly
    await state.waitForAuth()
    expect(state.isLoading.value).toBe(false)
  })

  it('resolves without firebase (dev mode)', async () => {
    mockFirebaseAuth.value = null
    const state = useAuthState()
    await state.waitForAuth()
    expect(state.isLoading.value).toBe(false)
  })

  it('resolves with firebase auth when user callback fires', async () => {
    mockFirebaseAuth.value = { app: {} } // truthy mock

    let successCb: ((user: unknown) => void) | null = null
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let errorCb: ((err: unknown) => void) | null = null
    const mockUnsub = vi.fn()

    vi.mocked(onAuthStateChanged).mockImplementation(
      (_auth: unknown, onSuccess: (u: unknown) => void, onError?: (e: unknown) => void) => {
        successCb = onSuccess
        errorCb = onError ?? null
        return mockUnsub
      },
    )

    const state = useAuthState()
    const promise = state.waitForAuth()

    // Simulate firebase calling back with a user
    const mockUser = { uid: '123', email: 'test@test.com' }
    successCb!(mockUser)

    await promise

    expect(state.user.value).toEqual(mockUser)
    expect(state.isLoading.value).toBe(false)
    expect(mockUnsub).toHaveBeenCalled()
  })

  it('resolves when error callback fires', async () => {
    mockFirebaseAuth.value = { app: {} }

    let errorCb: ((err: unknown) => void) | null = null
    const mockUnsub = vi.fn()

    vi.mocked(onAuthStateChanged).mockImplementation(
      (_auth: unknown, _onSuccess: (u: unknown) => void, onError?: (e: unknown) => void) => {
        errorCb = onError ?? null
        return mockUnsub
      },
    )

    const state = useAuthState()
    const promise = state.waitForAuth()

    errorCb!(new Error('Auth error'))
    await promise

    expect(state.isLoading.value).toBe(false)
    expect(state.user.value).toBeNull()
    expect(mockUnsub).toHaveBeenCalled()
  })

  it('resolves after 3s timeout if no callback fires', async () => {
    mockFirebaseAuth.value = { app: {} }
    const mockUnsub = vi.fn()

    vi.mocked(onAuthStateChanged).mockReturnValue(mockUnsub)

    const state = useAuthState()

    vi.useFakeTimers()
    const promise = state.waitForAuth()

    vi.advanceTimersByTime(3000)
    await promise

    expect(state.isLoading.value).toBe(false)
    vi.useRealTimers()
  })
})
