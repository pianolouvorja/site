import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FeaturesSection from '~/components/FeaturesSection.vue'

describe('FeaturesSection', () => {
  it('renderiza a secao com id features', () => {
    const wrapper = mount(FeaturesSection)
    expect(wrapper.find('#features').exists()).toBe(true)
  })

  it('renderiza titulo da secao', () => {
    const wrapper = mount(FeaturesSection)
    expect(wrapper.text()).toContain('Funcionalidades')
  })

  it('renderiza cards de funcionalidades', () => {
    const wrapper = mount(FeaturesSection)
    const cards = wrapper.findAll('[data-testid="feature-card"]')
    expect(cards.length).toBeGreaterThanOrEqual(6)
  })

  it('cada card tem titulo e descricao', () => {
    const wrapper = mount(FeaturesSection)
    const cards = wrapper.findAll('[data-testid="feature-card"]')
    cards.forEach((card) => {
      expect(card.text().length).toBeGreaterThan(10)
    })
  })
})
