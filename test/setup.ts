import { vi, beforeEach } from 'vitest'
import { config, RouterLinkStub } from '@vue/test-utils'
import { computed, ref } from 'vue'
import ptBR from '../i18n/pt-BR.json'

// Função auxiliar simples para buscar o valor dentro de chaves encadeadas (ex: 'hero.title')
function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const value = path.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part]
    }
    return undefined
  }, obj)
  return typeof value === 'string' ? value : path // Fallback para a própria chave
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
// Usa uma ref compartilhada para que setLocale possa mutar o estado
const sharedLocale = ref('pt-BR')

// setLocale como fn estável (mesma referência em todas as chamadas de useI18n)
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

// Mock local storage se precisar
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
}
vi.stubGlobal('localStorage', localStorageMock)

// Reset locale compartilhado entre testes
beforeEach(() => {
  sharedLocale.value = 'pt-BR'
})
