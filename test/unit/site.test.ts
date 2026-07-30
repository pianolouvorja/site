import { describe, it, expect } from 'vitest'
import { siteConfig, navLinks, features } from '~/data/site'

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
})

describe('navLinks', () => {
  it('tem pelo menos 3 links', () => {
    expect(navLinks.length).toBeGreaterThanOrEqual(3)
  })

  it('cada link tem label e href', () => {
    navLinks.forEach((link) => {
      expect(link.label).toBeTruthy()
      expect(link.href).toBeTruthy()
      expect(link.href.startsWith('#')).toBe(true)
    })
  })

  it('nao tem links duplicados', () => {
    const hrefs = navLinks.map((l) => l.href)
    expect(new Set(hrefs).size).toBe(hrefs.length)
  })
})

describe('features', () => {
  it('tem pelo menos 6 funcionalidades', () => {
    expect(features.length).toBeGreaterThanOrEqual(6)
  })

  it('cada feature tem id unico', () => {
    const ids = features.map((f) => f.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('cada feature tem titulo, descricao e icone', () => {
    features.forEach((f) => {
      expect(f.title.length).toBeGreaterThan(2)
      expect(f.description.length).toBeGreaterThan(10)
      expect(f.icon).toBeTruthy()
    })
  })
})
