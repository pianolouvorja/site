import { describe, it, expect } from 'vitest'
import { getEmailStrings } from '~~/server/utils/email-i18n'

describe('getEmailStrings', () => {
  it('returns pt-BR strings for pt-BR', () => {
    const s = getEmailStrings('pt-BR')
    expect(s.appSubtitle).toBe('App de louvor para IASD')
    expect(s.unsubscribe).toContain('Cancelar inscri')
    expect(s.copyright).toContain('Todos os direitos reservados')
  })

  it('returns English strings for en', () => {
    const s = getEmailStrings('en')
    expect(s.appSubtitle).toBe('Worship app for Seventh-day Adventist Church')
    expect(s.unsubscribe).toBe('Unsubscribe')
    expect(s.copyright).toContain('All rights reserved')
  })

  it('returns Spanish strings for es', () => {
    const s = getEmailStrings('es')
    expect(s.appSubtitle).toBe('App de alabanza para IASD')
    expect(s.unsubscribe).toContain('Cancelar suscripci')
    expect(s.copyright).toContain('Todos los derechos reservados')
  })

  it('falls back to pt-BR for unknown locale', () => {
    const s = getEmailStrings('fr')
    expect(s.appSubtitle).toBe('App de louvor para IASD')
  })

  it('has badge strings for all template types in en', () => {
    const s = getEmailStrings('en')
    expect(s.badges.release).toBe('New release')
    expect(s.badges.devotional).toBe('Devotional')
    expect(s.badges.announcement).toBe('Announcement')
  })

  it('has badge strings for all template types in pt-BR', () => {
    const s = getEmailStrings('pt-BR')
    expect(s.badges.release).toContain('Nova vers')
    expect(s.badges.devotional).toBe('Devocional')
    expect(s.badges.announcement).toContain('An')
  })

  it('has badge strings for all template types in es', () => {
    const s = getEmailStrings('es')
    expect(s.badges.release).toContain('Nueva versi')
    expect(s.badges.devotional).toBe('Devocional')
    expect(s.badges.announcement).toBe('Anuncio')
  })
})
