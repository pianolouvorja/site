import { describe, it, expect } from 'vitest'
import { siteConfig, navLinks, secondaryNavLinks, webFeatures, steps } from '../../app/data/site'

describe('siteConfig', () => {
  it('name is exactly PIANO LouvorJA', () => {
    expect(siteConfig.name).toBe('PIANO LouvorJA')
  })

  it('tagline is defined and non-trivial', () => {
    expect(siteConfig.tagline.length).toBeGreaterThan(5)
  })

  it('description has more than 20 chars', () => {
    expect(siteConfig.description.length).toBeGreaterThan(20)
  })

  it('appUrl starts with https', () => {
    expect(siteConfig.appUrl.startsWith('https://')).toBe(true)
  })

  it('contactEmail contains @', () => {
    expect(siteConfig.contactEmail).toContain('@')
  })

  // --- KILL SURVIVING MUTANTS: exact values ---

  it('appUrl is exactly https://app.pianolouvorja.com.br', () => {
    expect(siteConfig.appUrl).toBe('https://app.pianolouvorja.com.br')
  })

  it('contactEmail is exactly app@pianolouvorja.com.br', () => {
    expect(siteConfig.contactEmail).toBe('app@pianolouvorja.com.br')
  })

  it('name contains PIANO and LouvorJA', () => {
    expect(siteConfig.name).toContain('PIANO')
    expect(siteConfig.name).toContain('LouvorJA')
  })

  it('tagline is exactly "Gerenciamento de culto na web"', () => {
    expect(siteConfig.tagline).toBe('Gerenciamento de culto na web')
  })
})

describe('navLinks', () => {
  it('has exactly 4 links', () => {
    expect(navLinks.length).toBe(4)
  })

  it('every link has i18nKey starting with nav.', () => {
    for (const link of navLinks) {
      expect(link.i18nKey.startsWith('nav.')).toBe(true)
    }
  })

  it('every link has non-empty href', () => {
    for (const link of navLinks) {
      expect(link.href.length).toBeGreaterThan(0)
    }
  })

  it('no duplicate hrefs', () => {
    const hrefs = navLinks.map((l) => l.href)
    expect(new Set(hrefs).size).toBe(hrefs.length)
  })

  it('first link points to #features', () => {
    expect(navLinks[0].href).toBe('#features')
  })

  it('second link points to /download', () => {
    expect(navLinks[1].href).toBe('/download')
  })
})

describe('secondaryNavLinks', () => {
  it('has exactly 4 links', () => {
    expect(secondaryNavLinks.length).toBe(4)
  })

  it('every link has i18nKey starting with nav.', () => {
    for (const link of secondaryNavLinks) {
      expect(link.i18nKey.startsWith('nav.')).toBe(true)
    }
  })

  it('every link has non-empty href', () => {
    for (const link of secondaryNavLinks) {
      expect(link.href.length).toBeGreaterThan(0)
    }
  })

  it('no duplicate hrefs', () => {
    const hrefs = secondaryNavLinks.map((l) => l.href)
    expect(new Set(hrefs).size).toBe(hrefs.length)
  })

  it('last link points to /contact', () => {
    expect(secondaryNavLinks[3].href).toBe('/contact')
  })
})

describe('webFeatures', () => {
  it('has exactly 8 features', () => {
    expect(webFeatures.length).toBe(8)
  })

  it('every feature has unique id', () => {
    const ids = webFeatures.map((f) => f.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every feature has id longer than 2 chars', () => {
    for (const f of webFeatures) {
      expect(f.id.length).toBeGreaterThan(2)
    }
  })

  it('every feature has icon starting with ti-', () => {
    for (const f of webFeatures) {
      expect(f.icon.startsWith('ti-')).toBe(true)
    }
  })

  it('first feature is media with ti-music icon', () => {
    expect(webFeatures[0].id).toBe('media')
    expect(webFeatures[0].icon).toBe('ti-music')
  })

  it('last feature is offline with ti-wifi-off icon', () => {
    expect(webFeatures[7].id).toBe('offline')
    expect(webFeatures[7].icon).toBe('ti-wifi-off')
  })
})

describe('steps', () => {
  it('has exactly 4 steps', () => {
    expect(steps.length).toBe(4)
  })

  it('each step has sequential num starting at 1', () => {
    for (let i = 0; i < steps.length; i++) {
      expect(steps[i].num).toBe(i + 1)
    }
  })

  it('first step num is 1', () => {
    expect(steps[0].num).toBe(1)
  })

  it('last step num is 4', () => {
    expect(steps[3].num).toBe(4)
  })
})
