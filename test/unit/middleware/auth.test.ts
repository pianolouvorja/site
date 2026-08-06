import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'

// Mock navigateTo
const mockNavigateTo = vi.fn((path: string) => ({ path }))
vi.stubGlobal('navigateTo', mockNavigateTo)

// Mock defineNuxtRouteMiddleware — returns the async function directly
vi.stubGlobal('defineNuxtRouteMiddleware', (fn: (to: unknown) => unknown) => fn)

// Mock useFirebaseAuth with controllable user/loading
const mockUser = ref<unknown>(null)
const mockLoading = ref(false)

vi.stubGlobal('useFirebaseAuth', () => ({
  user: mockUser,
  loading: mockLoading,
}))

import { default as middleware } from '~/middleware/auth'

describe('auth middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser.value = null
    mockLoading.value = false
  })

  it('redirects to login when user is null and not loading', async () => {
    mockLoading.value = false
    mockUser.value = null

    const result = await middleware({ path: '/admin' } as never)
    expect(mockNavigateTo).toHaveBeenCalledWith('/admin/login')
    expect(result).toEqual({ path: '/admin/login' })
  })

  it('does not redirect when user is authenticated', async () => {
    mockUser.value = { uid: '123', email: 'admin@test.com' }

    const result = await middleware({ path: '/admin' } as never)
    expect(mockNavigateTo).not.toHaveBeenCalled()
    expect(result).toBeUndefined()
  })

  it('skips login page', async () => {
    const result = await middleware({ path: '/admin/login' } as never)
    expect(mockNavigateTo).not.toHaveBeenCalled()
    expect(result).toBeUndefined()
  })

  it('waits for loading to resolve, then redirects if still no user', async () => {
    mockLoading.value = true

    // Resolve loading after 150ms
    setTimeout(() => {
      mockLoading.value = false
    }, 150)

    const result = await middleware({ path: '/admin' } as never)
    expect(mockNavigateTo).toHaveBeenCalledWith('/admin/login')
    expect(result).toEqual({ path: '/admin/login' })
  })

  it('waits for loading to resolve, then allows if user appears', async () => {
    mockLoading.value = true

    // Resolve loading + set user after 150ms
    setTimeout(() => {
      mockUser.value = { uid: '123' }
      mockLoading.value = false
    }, 150)

    const result = await middleware({ path: '/admin' } as never)
    expect(mockNavigateTo).not.toHaveBeenCalled()
    expect(result).toBeUndefined()
  })
})
