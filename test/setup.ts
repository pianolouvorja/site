import { vi, beforeEach } from 'vitest'
import { config, RouterLinkStub } from '@vue/test-utils'
import { computed, ref } from 'vue'
import ptBR from '../i18n/pt-BR.json'

// Função auxiliar simples para buscar o valor dentro de chaves encadeadas
function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const value = path.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part]
    }
    return undefined
  }, obj)
  return typeof value === 'string' ? value : path
}

// Mock de NuxtLink via Vue Test Utils
config.global.stubs = {
  ...config.global.stubs,
  NuxtLink: RouterLinkStub,
}

// Mock de I18n global para componentes: usa o JSON de pt-BR real
config.global.mocks = {
  ...config.global.mocks,
  $t: (key: string) => getNestedValue(ptBR, key),
}

// Mock de Composables do Nuxt e Vue i18n
const sharedLocale = ref('pt-BR')
const mockSetLocale = vi.fn((code: string) => {
  sharedLocale.value = code
})

vi.stubGlobal('useI18n', () => ({
  t: (key: string) => getNestedValue(ptBR, key),
  locale: sharedLocale,
  locales: {
    value: [
      { code: 'pt-BR', iso: 'pt-BR', name: 'Português' },
      { code: 'en', iso: 'en', name: 'English' },
      { code: 'es', iso: 'es', name: 'Español' },
    ],
  },
  setLocale: mockSetLocale,
}))

vi.stubGlobal('useRoute', () => ({
  path: '/',
  query: {},
  params: {},
}))

vi.stubGlobal('useHead', vi.fn())
vi.stubGlobal('computed', computed)
vi.stubGlobal('ref', ref)

vi.stubGlobal('useLocalePath', () => (path: string) => path)

// Mock de useRuntimeConfig
vi.stubGlobal('useRuntimeConfig', () => ({
  public: {
    firebaseApiKey: 'test-api-key',
    firebaseAuthDomain: 'test.firebaseapp.com',
    firebaseProjectId: 'test-project',
    firebaseStorageBucket: 'test.appspot.com',
    firebaseMessagingSenderId: '123456',
    firebaseAppId: '1:123:web:abc',
  },
}))

// Mock de useState do Nuxt
const stateMap = new Map<string, ReturnType<typeof ref>>()
vi.stubGlobal('useState', <T>(key: string, init: () => T) => {
  if (!stateMap.has(key)) {
    stateMap.set(key, ref(init()))
  }
  return stateMap.get(key)!
})

// Mock de onMounted — auto-executa o callback
vi.stubGlobal(
  'onMounted',
  vi.fn((fn: () => unknown) => fn()),
)

// Mock de useFirebaseClient
vi.stubGlobal(
  'useFirebaseClient',
  vi.fn(() => ({ name: 'mock-auth' })),
)

// Mock de useFirebaseAuth
vi.stubGlobal('useFirebaseAuth', () => ({
  user: ref(null),
  loading: ref(false),
  error: ref(null),
  login: vi.fn(),
  logout: vi.fn(),
  getToken: vi.fn(),
}))

// Mock de navigateTo
vi.stubGlobal(
  'navigateTo',
  vi.fn((path: string) => ({ path })),
)

// Mock de defineNuxtRouteMiddleware
vi.stubGlobal('defineNuxtRouteMiddleware', (fn: (...args: unknown[]) => unknown) => fn)

// Mock de defineNuxtPlugin
vi.stubGlobal('defineNuxtPlugin', (fn: (...args: unknown[]) => unknown) => fn)

// Mock local storage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
}
vi.stubGlobal('localStorage', localStorageMock)

beforeEach(() => {
  sharedLocale.value = 'pt-BR'
  stateMap.clear()
})
