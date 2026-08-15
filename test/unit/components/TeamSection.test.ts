import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TeamSection from '~/components/TeamSection.vue'

describe('TeamSection', () => {
  it('renderiza a secao com id team', () => {
    const wrapper = mount(TeamSection, { global: { stubs: ['i'] } })
    expect(wrapper.find('#team').exists()).toBe(true)
  })

  it('renderiza as 6 frentes de trabalho', () => {
    const wrapper = mount(TeamSection, { global: { stubs: ['i'] } })
    expect(wrapper.findAll('.team__card')).toHaveLength(6)
  })

  it('cada frente tem titulo e descricao via i18n', () => {
    const wrapper = mount(TeamSection, { global: { stubs: ['i'] } })
    const cards = wrapper.findAll('.team__card')
    expect(cards.length).toBeGreaterThan(0)
    cards.forEach((card) => {
      expect(card.find('.team__card-title').text().length).toBeGreaterThan(3)
      expect(card.find('.team__card-text').text().length).toBeGreaterThan(20)
    })
  })

  it('exibe a stack tecnologica de cada frente', () => {
    const wrapper = mount(TeamSection, { global: { stubs: ['i'] } })
    // 6 frentes x 3 chips = 18 chips minimos
    expect(wrapper.findAll('.team__chip').length).toBeGreaterThanOrEqual(18)
  })

  it('nao expoe pessoas identificadas (sem avatars, nomes ou bios pessoais)', () => {
    const wrapper = mount(TeamSection, { global: { stubs: ['i'] } })
    expect(wrapper.findAll('img').length).toBe(0)
    expect(wrapper.findAll('.team__avatar')).toHaveLength(0)
    expect(wrapper.find('.team__person').exists()).toBe(false)
  })

  it('renderiza o bloco de como trabalhamos', () => {
    const wrapper = mount(TeamSection, { global: { stubs: ['i'] } })
    expect(wrapper.find('.team__work-title').text().length).toBeGreaterThan(3)
    expect(wrapper.find('.team__work-text').text().length).toBeGreaterThan(30)
  })

  it('linka para a organizacao no GitHub', () => {
    const wrapper = mount(TeamSection, { global: { stubs: ['i'] } })
    const link = wrapper.find('a.team__cta')
    expect(link.exists()).toBe(true)
    expect(link.attributes('href')).toBe('https://github.com/pianolouvorja')
  })
})
