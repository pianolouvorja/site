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

  it('renderiza o eyebrow "Roadmap"', () => {
    const wrapper = mountSection()
    expect(wrapper.text()).toContain('Roadmap')
  })

  it('renderiza a descricao da secao', () => {
    const wrapper = mountSection()
    expect(wrapper.text()).toContain(
      'Controle o culto pelo celular enquanto a Smart TV exibe os hinos',
    )
  })

  it('renderiza o card da marca LG com logo', () => {
    const wrapper = mountSection()
    const brandCard = wrapper.find('[data-testid="tv-brand-card"]')
    expect(brandCard.exists()).toBe(true)
    const img = brandCard.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('/brand/lg-logo.svg')
  })

  it('exibe o status "Em desenvolvimento"', () => {
    const wrapper = mountSection()
    expect(wrapper.text()).toContain('Em desenvolvimento')
  })

  it('exibe o nome da plataforma webOS', () => {
    const wrapper = mountSection()
    expect(wrapper.text()).toContain('webOS (LG)')
  })
})
