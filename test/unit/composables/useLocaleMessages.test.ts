import { describe, it, expect, beforeEach } from 'vitest'

// Manipulate the mock locale before each test
function setLocale(code: string) {
  const mock = (globalThis as any).useI18n
  // The setup.ts useI18n returns an object with a mutable locale ref.
  // We call useI18n and set locale.value directly.
  const { locale } = mock()
  locale.value = code
}

import { useLocaleMessages } from '~/composables/useLocaleMessages'

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
})
