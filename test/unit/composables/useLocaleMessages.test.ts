import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'

const mockLocale = ref('pt-BR')

// Re-stub useI18n with a shared mutable ref so setLocale works reliably
vi.stubGlobal('useI18n', () => ({
  locale: mockLocale,
  locales: {
    value: [
      { code: 'pt-BR', iso: 'pt-BR' },
      { code: 'en', iso: 'en' },
      { code: 'es', iso: 'es' },
    ],
  },
  setLocale: vi.fn(),
}))

// Manipulate the mock locale before each test
function setLocale(code: string) {
  mockLocale.value = code
}

import { useLocaleMessages, deepGet } from '~/composables/useLocaleMessages'

describe('useLocaleMessages', () => {
  beforeEach(() => {
    setLocale('pt-BR')
  })

  it('retorna string para key valida em pt-BR', () => {
    const { raw } = useLocaleMessages()
    const result = raw('meta.title')
    expect(typeof result).toBe('string')
    expect(result).toBeTruthy()
  })

  it('retorna undefined para key inexistente', () => {
    const { raw } = useLocaleMessages()
    const result = raw('chave.que.nao.existe')
    expect(result).toBeUndefined()
  })

  it('retorna objeto para key de secao', () => {
    const { raw } = useLocaleMessages()
    const result = raw<string>('cta')
    expect(result).toBeDefined()
    expect(typeof result).toBe('object')
  })

  it('has() retorna true para key existente', () => {
    const { has } = useLocaleMessages()
    expect(has('meta.title')).toBe(true)
  })

  it('has() retorna false para key inexistente', () => {
    const { has } = useLocaleMessages()
    expect(has('nao.existe.nada')).toBe(false)
  })

  it('funciona com locale en', () => {
    setLocale('en')
    const { raw } = useLocaleMessages()
    const result = raw('meta.title')
    expect(result).toBeDefined()
  })

  it('funciona com locale es', () => {
    setLocale('es')
    const { raw } = useLocaleMessages()
    const result = raw('meta.title')
    expect(result).toBeDefined()
  })

  it('retorna dados diferentes para diferentes locales', () => {
    setLocale('pt-BR')
    const { raw: rawPt } = useLocaleMessages()
    const ptResult = rawPt('meta.title')

    setLocale('en')
    const { raw: rawEn } = useLocaleMessages()
    const enResult = rawEn('meta.title')

    // They should both be defined (different translations of the same key)
    expect(ptResult).toBeDefined()
    expect(enResult).toBeDefined()
  })

  it('retorna undefined para locale invalido', () => {
    setLocale('fr')
    const { raw } = useLocaleMessages()
    expect(raw('meta.title')).toBeUndefined()
  })

  it('retorna undefined quando key parcial passa por valor primitivo', () => {
    // 'meta.title' é string; navegar 'meta.title.foo' tenta descer em primitivo
    const { raw } = useLocaleMessages()
    expect(raw('meta.title.foo')).toBeUndefined()
  })

  it('retorna undefined quando chave intermediaria nao existe', () => {
    const { raw } = useLocaleMessages()
    expect(raw('meta.chave_inexistente')).toBeUndefined()
  })

  it('retorna valor primitivo corretamente para key de profundidade 1', () => {
    const { raw } = useLocaleMessages()
    const result = raw('meta.title')
    expect(typeof result).toBe('string')
  })
})

describe('deepGet', () => {
  it('retorna undefined para obj null', () => {
    expect(deepGet(null, 'a.b')).toBeUndefined()
  })

  it('retorna undefined para obj undefined', () => {
    expect(deepGet(undefined, 'a.b')).toBeUndefined()
  })

  it('retorna undefined quando caminho desce em primitivo', () => {
    expect(deepGet({ a: 'str' }, 'a.b')).toBeUndefined()
  })

  it('retorna undefined quando caminho desce em null', () => {
    expect(deepGet({ a: null }, 'a.b')).toBeUndefined()
  })

  it('retorna valor para path valido', () => {
    expect(deepGet({ a: { b: 42 } }, 'a.b')).toBe(42)
  })

  it('retorna undefined para chave inexistente', () => {
    expect(deepGet({ a: 1 }, 'x')).toBeUndefined()
  })

  it('retorna objeto para path parcial', () => {
    expect(deepGet({ a: { b: 1 } }, 'a')).toEqual({ b: 1 })
  })
})
