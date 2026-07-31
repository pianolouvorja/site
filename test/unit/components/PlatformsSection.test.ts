import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PlatformsSection from '~/components/PlatformsSection.vue'

describe('PlatformsSection', () => {
  it('renderiza o titulo da secao', () => {
    const wrapper = mount(PlatformsSection)
    expect(wrapper.text()).toContain('Disponível onde você precisa')
  })

  it('renderiza o eyebrow da secao', () => {
    const wrapper = mount(PlatformsSection)
    expect(wrapper.text()).toContain('Multiplataforma')
  })

  it('renderiza 3 cards de plataforma', () => {
    const wrapper = mount(PlatformsSection)
    const cards = wrapper.findAll('[data-testid="platform-card"]')
    expect(cards.length).toBe(3)
  })

  it('cada card tem titulo, descricao e CTA', () => {
    const wrapper = mount(PlatformsSection)
    const cards = wrapper.findAll('[data-testid="platform-card"]')
    cards.forEach((card) => {
      expect(card.text().length).toBeGreaterThan(0)
      expect(card.find('a').exists()).toBe(true)
    })
  })

  it('card desktop aponta para #download', () => {
    const wrapper = mount(PlatformsSection)
    const cards = wrapper.findAll('[data-testid="platform-card"]')
    const desktopCard = cards[0]
    const cta = desktopCard.find('a')
    expect(cta.attributes('href')).toBe('#download')
  })

  it('card web aponta para a URL do app', () => {
    const wrapper = mount(PlatformsSection)
    const cards = wrapper.findAll('[data-testid="platform-card"]')
    const webCard = cards[1]
    const cta = webCard.find('a')
    expect(cta.attributes('href')).toMatch(/^https:\/\//)
  })

  it('card mobile aponta para #contact', () => {
    const wrapper = mount(PlatformsSection)
    const cards = wrapper.findAll('[data-testid="platform-card"]')
    const mobileCard = cards[2]
    const cta = mobileCard.find('a')
    expect(cta.attributes('href')).toBe('#contact')
  })
})
