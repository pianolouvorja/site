import { vi } from 'vitest'
import { config, RouterLinkStub } from '@vue/test-utils'
import { computed } from 'vue'
import ptBR from '../i18n/locales/pt-BR.json'

// Função auxiliar simples para buscar o valor dentro de chaves encadeadas (ex: 'hero.title')
function getNestedValue(obj: any, path: string): string {
  const value = path.split('.').reduce((acc, part) => acc && acc[part], obj)
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
vi.stubGlobal('useI18n', () => ({
  t: (key: string) => getNestedValue(ptBR, key),
  locale: { value: 'pt-BR' },
  locales: {
    value: [
      { code: 'pt-BR', iso: 'pt-BR' },
      { code: 'en', iso: 'en' },
      { code: 'es', iso: 'es' },
    ],
  },
  setLocale: vi.fn(),
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
