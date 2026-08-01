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

  it('usa descricao default do i18n quando sem options.description', () => {
    useHeadMock.mockClear()
    useAppHead()
    const arg = useHeadMock.mock.calls[0][0]
    const descMeta = arg.meta.find((m: any) => m.name === 'description')
    // t('meta.description') resolves to the real i18n string in pt-BR
    expect(descMeta.content.value).toBe(
      'Plataforma web para gerenciamento de cultos: hinário, Bíblia, liturgia, projeção multi-tela e mais. Gratuito, open-source, funciona offline.',
    )
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

  it('define og:locale convertendo hifen para underscore', () => {
    useHeadMock.mockClear()
    useAppHead()
    const arg = useHeadMock.mock.calls[0][0]
    const ogLocale = arg.meta.find((m: any) => m.property === 'og:locale')
    expect(ogLocale).toBeDefined()
    expect(ogLocale.content.value).toBe('pt_BR')
  })

  it('inclui og:site_name com valor correto', () => {
    useHeadMock.mockClear()
    useAppHead()
    const arg = useHeadMock.mock.calls[0][0]
    const m = arg.meta.find((m: any) => m.property === 'og:site_name')
    expect(m.content).toBe('PIANO LouvorJA')
  })

  it('inclui og:type com valor website', () => {
    useHeadMock.mockClear()
    useAppHead()
    const arg = useHeadMock.mock.calls[0][0]
    const m = arg.meta.find((m: any) => m.property === 'og:type')
    expect(m.content).toBe('website')
  })

  it('inclui og:image com URL completa', () => {
    useHeadMock.mockClear()
    useAppHead()
    const arg = useHeadMock.mock.calls[0][0]
    const m = arg.meta.find((m: any) => m.property === 'og:image')
    expect(m.content).toBe('https://pianolouvorja.com/og-image.png')
  })

  it('inclui twitter:card summary_large_image', () => {
    useHeadMock.mockClear()
    useAppHead()
    const arg = useHeadMock.mock.calls[0][0]
    const m = arg.meta.find((m: any) => m.name === 'twitter:card')
    expect(m.content).toBe('summary_large_image')
  })

  it('inclui twitter:title com o titulo da pagina', () => {
    useHeadMock.mockClear()
    useAppHead({ title: 'Teste Twitter' })
    const arg = useHeadMock.mock.calls[0][0]
    const m = arg.meta.find((m: any) => m.name === 'twitter:title')
    expect(m.content.value).toContain('Teste Twitter')
  })

  it('inclui twitter:description com a descricao', () => {
    useHeadMock.mockClear()
    useAppHead({ description: 'Desc Twitter' })
    const arg = useHeadMock.mock.calls[0][0]
    const m = arg.meta.find((m: any) => m.name === 'twitter:description')
    expect(m.content.value).toBe('Desc Twitter')
  })

  it('inclui twitter:image com URL completa', () => {
    useHeadMock.mockClear()
    useAppHead()
    const arg = useHeadMock.mock.calls[0][0]
    const m = arg.meta.find((m: any) => m.name === 'twitter:image')
    expect(m.content).toBe('https://pianolouvorja.com/og-image.png')
  })

  it('inclui theme-color com valor correto', () => {
    useHeadMock.mockClear()
    useAppHead()
    const arg = useHeadMock.mock.calls[0][0]
    const m = arg.meta.find((m: any) => m.name === 'theme-color')
    expect(m.content).toBe('#0d1b2a')
  })

  it('inclui og:title com o titulo da pagina', () => {
    useHeadMock.mockClear()
    useAppHead({ title: 'Titulo OG' })
    const arg = useHeadMock.mock.calls[0][0]
    const m = arg.meta.find((m: any) => m.property === 'og:title')
    expect(m.content.value).toContain('Titulo OG')
  })

  it('inclui og:description com a descricao', () => {
    useHeadMock.mockClear()
    useAppHead({ description: 'Desc OG' })
    const arg = useHeadMock.mock.calls[0][0]
    const m = arg.meta.find((m: any) => m.property === 'og:description')
    expect(m.content.value).toBe('Desc OG')
  })

  it('JSON-LD contem @context schema.org', () => {
    useHeadMock.mockClear()
    useAppHead()
    const arg = useHeadMock.mock.calls[0][0]
    const script = arg.script.find((s: any) => s.type === 'application/ld+json')
    const parsed = JSON.parse(script.innerHTML)
    expect(parsed['@context']).toBe('https://schema.org')
  })

  it('JSON-LD contem operatingSystem completo', () => {
    useHeadMock.mockClear()
    useAppHead()
    const arg = useHeadMock.mock.calls[0][0]
    const script = arg.script.find((s: any) => s.type === 'application/ld+json')
    const parsed = JSON.parse(script.innerHTML)
    expect(parsed.operatingSystem).toBe('Web, Linux, macOS, Windows')
  })

  it('JSON-LD contem offer com price 0 e currency USD', () => {
    useHeadMock.mockClear()
    useAppHead()
    const arg = useHeadMock.mock.calls[0][0]
    const script = arg.script.find((s: any) => s.type === 'application/ld+json')
    const parsed = JSON.parse(script.innerHTML)
    expect(parsed.offers['@type']).toBe('Offer')
    expect(parsed.offers.price).toBe('0')
    expect(parsed.offers.priceCurrency).toBe('USD')
  })

  it('JSON-LD contem isAccessibleForFree true', () => {
    useHeadMock.mockClear()
    useAppHead()
    const arg = useHeadMock.mock.calls[0][0]
    const script = arg.script.find((s: any) => s.type === 'application/ld+json')
    const parsed = JSON.parse(script.innerHTML)
    expect(parsed.isAccessibleForFree).toBe(true)
  })

  it('JSON-LD contem url do site', () => {
    useHeadMock.mockClear()
    useAppHead()
    const arg = useHeadMock.mock.calls[0][0]
    const script = arg.script.find((s: any) => s.type === 'application/ld+json')
    const parsed = JSON.parse(script.innerHTML)
    expect(parsed.url).toBe('https://pianolouvorja.com')
  })

  it('JSON-LD contem inLanguage com locale atual', () => {
    useHeadMock.mockClear()
    useAppHead()
    const arg = useHeadMock.mock.calls[0][0]
    const script = arg.script.find((s: any) => s.type === 'application/ld+json')
    const parsed = JSON.parse(script.innerHTML)
    expect(parsed.inLanguage).toBe('pt-BR')
  })

  it('nao inclui prefixo de locale na URL quando defaultLocale', () => {
    useHeadMock.mockClear()
    useAppHead({ path: '/sobre' })
    const arg = useHeadMock.mock.calls[0][0]
    const canonical = arg.link.find((l: any) => l.rel === 'canonical')
    // pt-BR é defaultLocale, então não tem /pt-BR na URL
    expect(canonical.href).toBe('https://pianolouvorja.com/sobre')
  })

  it('inclui prefixo de locale na URL para locale nao-padrao', () => {
    useHeadMock.mockClear()
    useAppHead({ path: '/sobre' })
    const arg = useHeadMock.mock.calls[0][0]
    const alternates = arg.link.filter((l: any) => l.rel === 'alternate')
    const enLink = alternates.find((a: any) => a.hreflang === 'en')
    expect(enLink.href).toBe('https://pianolouvorja.com/en/sobre')
  })

  it('resolve double slashes quando path e / para locale nao-padrao', () => {
    useHeadMock.mockClear()
    useAppHead()
    const arg = useHeadMock.mock.calls[0][0]
    const alternates = arg.link.filter((l: any) => l.rel === 'alternate')
    const enLink = alternates.find((a: any) => a.hreflang === 'en')
    expect(enLink.href).toBe('https://pianolouvorja.com/en')
  })

  it('canonical do defaultLocale sem path e exatamente a raiz', () => {
    useHeadMock.mockClear()
    useAppHead()
    const arg = useHeadMock.mock.calls[0][0]
    const canonical = arg.link.find((l: any) => l.rel === 'canonical')
    expect(canonical.href).toBe('https://pianolouvorja.com/')
  })
})
