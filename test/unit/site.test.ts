import { describe, it, expect } from 'vitest'
import { siteConfig, navLinks, webFeatures, steps } from '~/data/site'

describe('siteConfig', () => {
  it('tem nome definido', () => {
    expect(siteConfig.name).toBe('PIANO LouvorJA')
  })

  it('tem tagline', () => {
    expect(siteConfig.tagline).toBeTruthy()
    expect(siteConfig.tagline.length).toBeGreaterThan(5)
  })

  it('tem descricao com mais de 20 caracteres', () => {
    expect(siteConfig.description.length).toBeGreaterThan(20)
  })

  it('tem URL do app valida', () => {
    expect(siteConfig.appUrl).toMatch(/^https:\/\//)
  })

  it('tem email de contato', () => {
    expect(siteConfig.contactEmail).toMatch(/@/)
  })
})

describe('navLinks', () => {
  it('tem pelo menos 3 links', () => {
    expect(navLinks.length).toBeGreaterThanOrEqual(3)
  })

  it('cada link tem i18nKey e href', () => {
    navLinks.forEach((link) => {
      expect(link.i18nKey).toBeTruthy()
      expect(link.href).toBeTruthy()
    })
  })

  it('nao tem links duplicados', () => {
    const hrefs = navLinks.map((l) => l.href)
    expect(new Set(hrefs).size).toBe(hrefs.length)
  })
})

describe('webFeatures', () => {
  it('tem pelo menos 6 funcionalidades', () => {
    expect(webFeatures.length).toBeGreaterThanOrEqual(6)
  })

  it('cada feature tem id unico', () => {
    const ids = webFeatures.map((f) => f.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('cada feature tem id e icone', () => {
    webFeatures.forEach((f) => {
      expect(f.id.length).toBeGreaterThan(2)
      expect(f.icon).toBeTruthy()
    })
  })
})

describe('steps', () => {
  it('tem 4 passos', () => {
    expect(steps.length).toBe(4)
  })

  it('cada passo tem numero sequencial', () => {
    steps.forEach((step, i) => {
      expect(step.num).toBe(i + 1)
    })
  })
})
