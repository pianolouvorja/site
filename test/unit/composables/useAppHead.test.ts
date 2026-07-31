import { describe, it, expect, vi } from 'vitest'

// Mock useHead before importing the composable
const useHeadMock = vi.fn()
;(globalThis as any).useHead = useHeadMock

import { useAppHead } from '~/composables/useAppHead'

describe('useAppHead', () => {
  it('chama useHead ao ser invocada', () => {
    useHeadMock.mockClear()
    useAppHead()
    expect(useHeadMock).toHaveBeenCalledOnce()
  })

  it('passa titulo customizado quando options.title fornecido', () => {
    useHeadMock.mockClear()
    useAppHead({ title: 'Pagina Teste' })
    const arg = useHeadMock.mock.calls[0][0]
    expect(arg.title).toBeDefined()
    // title is a computed ref, access .value
    expect(arg.title.value).toContain('Pagina Teste')
    expect(arg.title.value).toContain('PIANO LouvorJA')
  })

  it('usa titulo default do meta quando sem options.title', () => {
    useHeadMock.mockClear()
    useAppHead()
    const arg = useHeadMock.mock.calls[0][0]
    // t('meta.title') resolves to the real i18n string in pt-BR
    expect(arg.title.value).toBe('PIANO LouvorJA — Gerenciador de Culto Web')
  })

  it('usa descricao customizada quando options.description fornecido', () => {
    useHeadMock.mockClear()
    useAppHead({ description: 'Desc custom' })
    const arg = useHeadMock.mock.calls[0][0]
    expect(arg.meta).toBeDefined()
    const descMeta = arg.meta.find((m: any) => m.name === 'description')
    expect(descMeta.content.value).toBe('Desc custom')
  })

  it('constroi canonical URL com path fornecido', () => {
    useHeadMock.mockClear()
    useAppHead({ path: '/sobre' })
    const arg = useHeadMock.mock.calls[0][0]
    // og:url should contain the path
    const ogUrl = arg.meta.find((m: any) => m.property === 'og:url')
    expect(ogUrl.content.value).toContain('/sobre')
    expect(ogUrl.content.value).toContain('pianolouvorja.com')
  })

  it('usa path default / quando nenhum path fornecido', () => {
    useHeadMock.mockClear()
    useAppHead()
    const arg = useHeadMock.mock.calls[0][0]
    const ogUrl = arg.meta.find((m: any) => m.property === 'og:url')
    expect(ogUrl.content.value).toBe('https://pianolouvorja.com/')
  })

  it('inclui link canonical na tag link', () => {
    useHeadMock.mockClear()
    useAppHead({ path: '/docs' })
    const arg = useHeadMock.mock.calls[0][0]
    const canonical = arg.link.find((l: any) => l.rel === 'canonical')
    expect(canonical).toBeDefined()
    expect(canonical.href).toContain('/docs')
  })

  it('inclui links alternate hreflang para todos os locales', () => {
    useHeadMock.mockClear()
    useAppHead()
    const arg = useHeadMock.mock.calls[0][0]
    const alternates = arg.link.filter((l: any) => l.rel === 'alternate')
    expect(alternates.length).toBe(3)
    const hreflangs = alternates.map((a: any) => a.hreflang)
    expect(hreflangs).toContain('pt-BR')
    expect(hreflangs).toContain('en')
    expect(hreflangs).toContain('es')
  })

  it('inclui JSON-LD structured data do tipo WebApplication', () => {
    useHeadMock.mockClear()
    useAppHead()
    const arg = useHeadMock.mock.calls[0][0]
    const script = arg.script.find((s: any) => s.type === 'application/ld+json')
    expect(script).toBeDefined()
    const jsonLd = script.innerHTML
    const parsed = JSON.parse(jsonLd)
    expect(parsed['@type']).toBe('WebApplication')
    expect(parsed.name).toBe('PIANO LouvorJA')
    expect(parsed.applicationCategory).toBe('UtilitiesApplication')
  })

  it('define htmlAttrs.lang com o locale atual', () => {
    useHeadMock.mockClear()
    useAppHead()
    const arg = useHeadMock.mock.calls[0][0]
    expect(arg.htmlAttrs.lang).toBeDefined()
  })
})
