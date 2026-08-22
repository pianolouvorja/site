import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PlatformsSection from '~/components/PlatformsSection.vue'

const mountPlatform = () =>
  mount(PlatformsSection, {
    global: {
      stubs: {
        ClientOnly: { template: '<slot />' },
      },
    },
  })

describe('PlatformsSection', () => {
  it('renderiza o titulo da secao', () => {
    const wrapper = mountPlatform()
    expect(wrapper.text()).toContain('Disponível onde você precisa')
  })

  it('renderiza o eyebrow da secao', () => {
    const wrapper = mountPlatform()
    expect(wrapper.text()).toContain('Multiplataforma')
  })

  it('renderiza 3 cards de plataforma', () => {
    const wrapper = mountPlatform()
    const cards = wrapper.findAll('[data-testid="platform-card"]')
    expect(cards.length).toBe(3)
  })

  it('cada card tem titulo, descricao e CTA', () => {
    const wrapper = mountPlatform()
    const cards = wrapper.findAll('[data-testid="platform-card"]')
    cards.forEach((card) => {
      expect(card.text().length).toBeGreaterThan(0)
      expect(card.find('a').exists()).toBe(true)
    })
  })

  it('card desktop aponta para #download', () => {
    const wrapper = mountPlatform()
    const cards = wrapper.findAll('[data-testid="platform-card"]')
    const desktopCard = cards[0]
    const cta = desktopCard.find('a')
    expect(cta.attributes('href')).toBe('#download')
  })

  it('card web aponta para a URL do app e abre em nova aba', () => {
    const wrapper = mountPlatform()
    const cards = wrapper.findAll('[data-testid="platform-card"]')
    const webCard = cards[1]
    const cta = webCard.find('a')
    expect(cta.attributes('href')).toMatch(/^https:\/\//)
    expect(cta.attributes('target')).toBe('_blank')
  })

  it('card mobile aponta para a pagina de download (app disponivel)', () => {
    const wrapper = mountPlatform()
    const cards = wrapper.findAll('[data-testid="platform-card"]')
    const mobileCard = cards[2]
    const cta = mobileCard.find('a')
    expect(cta.attributes('href')).toBe('/download')
    // Link interno — nao deve abrir em nova aba
    expect(cta.attributes('target')).toBeUndefined()
    // Badge de disponibilidade, nao "Em breve"
    expect(mobileCard.text()).toContain('Novo')
    expect(mobileCard.text()).not.toContain('Em Breve')
  })
})
