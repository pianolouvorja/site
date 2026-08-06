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

  // ========================================================================
  // ADDITIONAL TESTS — kill mutation survivors
  // ========================================================================

  it('second waitForAuth call does not re-register onAuthStateChanged (kills resolved=false mutants)', async () => {
    mockFirebaseAuth.value = { app: {} }
    const mockUnsub = vi.fn()

    vi.mocked(onAuthStateChanged).mockImplementation(
      (auth: unknown, onSuccess: (u: unknown) => void) => {
        // Fire immediately with a user
        setTimeout(() => onSuccess({ uid: 'abc' }), 0)
        return mockUnsub
      },
    )

    const state = useAuthState()
    await state.waitForAuth()

    // Clear to count new registrations
    vi.mocked(onAuthStateChanged).mockClear()
    vi.mocked(onAuthStateChanged).mockReturnValue(mockUnsub)

    // Second call — should resolve immediately without calling onAuthStateChanged
    await state.waitForAuth()

    // If resolved=true was mutated to false, second call would re-register
    expect(onAuthStateChanged).not.toHaveBeenCalled()
  })

  it('resolved flag short-circuits even when isLoading is true (kills LogicalOperator mutant)', async () => {
    mockFirebaseAuth.value = null
    const state = useAuthState()

    // First call resolves, sets resolved=true and isLoading=false
    await state.waitForAuth()

    // Manually set isLoading back to true to test resolved short-circuit
    state.isLoading.value = true

    vi.useFakeTimers()
    const start = Date.now()
    vi.mocked(onAuthStateChanged).mockClear()

    // Second call should resolve immediately despite isLoading=true
    await state.waitForAuth()
    const elapsed = Date.now() - start

    // Should not have waited for timeout or registered listener
    expect(elapsed).toBeLessThan(50)
    expect(onAuthStateChanged).not.toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('no firebase auth: sets isLoading=false and does not register listener (kills ConditionalExpression)', async () => {
    mockFirebaseAuth.value = null

    const state = useAuthState()
    await state.waitForAuth()

    // Mutant removing the !($firebaseAuth) check would call onAuthStateChanged with null
    expect(onAuthStateChanged).not.toHaveBeenCalled()
    expect(state.isLoading.value).toBe(false)
  })

  it('timeout callback sets resolved=true (second call after timeout is instant)', async () => {
    mockFirebaseAuth.value = { app: {} }
    const mockUnsub = vi.fn()
    vi.mocked(onAuthStateChanged).mockReturnValue(mockUnsub)

    const state = useAuthState()

    vi.useFakeTimers()
    const promise = state.waitForAuth()
    vi.advanceTimersByTime(3000)
    await promise

    // Clear mock to verify second call doesn't re-register
    vi.mocked(onAuthStateChanged).mockClear()

    // Second call — resolved=true from timeout, should be instant
    const start = Date.now()
    await state.waitForAuth()
    const elapsed = Date.now() - start

    expect(elapsed).toBeLessThan(50)
    expect(onAuthStateChanged).not.toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('error callback sets resolved=true (second call after error is instant)', async () => {
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

    errorCb!(new Error('fail'))
    await promise

    // Clear and verify second call is instant (resolved=true was set by error cb)
    vi.mocked(onAuthStateChanged).mockClear()
    vi.mocked(onAuthStateChanged).mockReturnValue(mockUnsub)

    const start = Date.now()
    await state.waitForAuth()
    const elapsed = Date.now() - start

    expect(elapsed).toBeLessThan(50)
    expect(onAuthStateChanged).not.toHaveBeenCalled()
  })
})
