import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HeroSection from '~/components/HeroSection.vue'

describe('HeroSection', () => {
  it('renderiza o headline principal', () => {
    const wrapper = mount(HeroSection)
    expect(wrapper.text()).toContain('Gerenciamento de culto')
  })

  it('renderiza subheadline com descricao', () => {
    const wrapper = mount(HeroSection)
    expect(wrapper.find('[data-testid="hero-subtitle"]').exists()).toBe(true)
  })

  it('tem botao CTA primario apontando pro app', () => {
    const wrapper = mount(HeroSection)
    const cta = wrapper.find('[data-testid="hero-cta"]')
    expect(cta.exists()).toBe(true)
    expect(cta.attributes('href')).toContain('app.pianolouvorja')
  })

  it('tem link secundario para funcionalidades', () => {
    const wrapper = mount(HeroSection)
    const secondary = wrapper.find('[data-testid="hero-secondary"]')
    expect(secondary.exists()).toBe(true)
    expect(secondary.attributes('href')).toBe('#features')
  })
})
