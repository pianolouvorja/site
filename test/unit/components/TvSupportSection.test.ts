import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TvSupportSection from '~/components/TvSupportSection.vue'

const mountSection = () =>
  mount(TvSupportSection, {
    global: {
      stubs: {
        ClientOnly: { template: '<slot />' },
      },
    },
  })

describe('TvSupportSection', () => {
  it('renderiza o titulo da secao', () => {
    const wrapper = mountSection()
    expect(wrapper.text()).toContain('A TV vira o palco da sua igreja')
  })

  it('renderiza o eyebrow Roadmap', () => {
    const wrapper = mountSection()
    expect(wrapper.text()).toContain('Roadmap')
  })

  it('renderiza a descricao da secao', () => {
    const wrapper = mountSection()
    expect(wrapper.text()).toContain(
      'Controle o culto pelo celular enquanto a Smart TV exibe os hinos',
    )
  })

  it('renderiza 6 cards de marcas com logo, nome e status', () => {
    const wrapper = mountSection()
    const cards = wrapper.findAll('[data-testid="tv-brand-card"]')
    expect(cards).toHaveLength(6)
  })

  it('primeiro card (LG) tem logo e nome webOS', () => {
    const wrapper = mountSection()
    const card = wrapper.findAll('[data-testid="tv-brand-card"]')[0]
    const img = card.find('img')
    expect(img.attributes('src')).toBe('/brand/lg-logo.svg')
    expect(card.text()).toContain('webOS (LG)')
  })

  it('marcas disponiveis (LG, Android TV) tem badge verde com check', () => {
    const wrapper = mountSection()
    const cards = wrapper.findAll('[data-testid="tv-brand-card"]')
    const available = cards.filter((c) => c.classes().includes('tv-support__brand--available'))
    expect(available).toHaveLength(3)
    // Verifica icone de check
    const checkIcons = available.map((c) => c.find('.ti-circle-check'))
    for (const icon of checkIcons) {
      expect(icon.exists()).toBe(true)
    }
    // Verifica badge verde
    const badges = available.map((c) => c.find('.tv-support__brand-status--available'))
    for (const badge of badges) {
      expect(badge.exists()).toBe(true)
    }
  })

  it('marcas em desenvolvimento/planejadas tem badge amarelo com spinner', () => {
    const wrapper = mountSection()
    const cards = wrapper.findAll('[data-testid="tv-brand-card"]')
    const notAvailable = cards.filter((c) => !c.classes().includes('tv-support__brand--available'))
    expect(notAvailable).toHaveLength(3)
    for (const card of notAvailable) {
      const spinner = card.find('.ti-loader-2')
      expect(spinner.exists()).toBe(true)
    }
  })

  it('exibe status Disponivel para LG', () => {
    const wrapper = mountSection()
    const cards = wrapper.findAll('[data-testid="tv-brand-card"]')
    expect(cards[0].text()).toContain('Disponivel')
  })

  it('logos usam lazy loading', () => {
    const wrapper = mountSection()
    const logos = wrapper.findAll('.tv-support__brand-logo')
    for (const logo of logos) {
      expect(logo.attributes('loading')).toBe('lazy')
    }
  })

  it('CTA aponta para /download#tv', () => {
    const wrapper = mountSection()
    const cta = wrapper.find('.tv-support__cta')
    expect(cta.exists()).toBe(true)
    expect(cta.attributes('href')).toBe('/download#tv')
    expect(cta.text()).toContain('Acompanhar novidades')
  })
})
