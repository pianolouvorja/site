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

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

// Mock defineNuxtPlugin — returns the function directly
vi.stubGlobal('defineNuxtPlugin', (fn: (nuxtApp: unknown) => unknown) => fn)

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

import plugin from '~/plugins/firebase.client'

describe('firebase.client plugin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockConfig.public.firebaseApiKey = 'test-api-key'
    mockConfig.public.firebaseProjectId = 'test-project'
  })

  it('initializes Firebase app and returns provide with firebaseApp + firebaseAuth', () => {
    const result = plugin({} as never)

    expect(initializeApp).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKey: 'test-api-key',
        projectId: 'test-project',
        appId: '1:123:web:abc',
      }),
    )
    expect(getAuth).toHaveBeenCalled()
    expect(result).toEqual({
      provide: {
        firebaseApp: expect.objectContaining({ name: 'mock-app' }),
        firebaseAuth: expect.objectContaining({ name: 'mock-auth' }),
      },
    })
  })

  it('warns and skips init when config is missing (no apiKey)', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mockConfig.public.firebaseApiKey = ''

    const result = plugin({} as never)

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '[firebase] Missing config — set FIREBASE_* env vars',
    )
    expect(initializeApp).not.toHaveBeenCalled()
    expect(result).toBeUndefined()

    consoleWarnSpy.mockRestore()
  })

  it('warns and skips init when projectId is missing', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mockConfig.public.firebaseProjectId = ''

    const result = plugin({} as never)

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '[firebase] Missing config — set FIREBASE_* env vars',
    )
    expect(initializeApp).not.toHaveBeenCalled()
    expect(result).toBeUndefined()

    consoleWarnSpy.mockRestore()
  })
})
