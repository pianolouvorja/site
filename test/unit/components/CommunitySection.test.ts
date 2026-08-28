import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CommunitySection from '~/components/CommunitySection.vue'

const stubs = { i: true }

describe('CommunitySection', () => {
  it('renderiza a secao com id community', () => {
    const wrapper = mount(CommunitySection, { global: { stubs } })
    expect(wrapper.find('#community').exists()).toBe(true)
  })

  it('renderiza header com eyebrow, titulo e subtitulo via i18n', () => {
    const wrapper = mount(CommunitySection, { global: { stubs } })
    expect(wrapper.find('.community__eyebrow').text().length).toBeGreaterThan(3)
    expect(wrapper.find('.community__title').text().length).toBeGreaterThan(3)
    expect(wrapper.find('.community__subtitle').text().length).toBeGreaterThan(10)
  })

  it('renderiza um card por membro com nome, papel e desde', () => {
    const wrapper = mount(CommunitySection, { global: { stubs } })
    const cards = wrapper.findAll('.community__card')
    expect(cards.length).toBeGreaterThanOrEqual(2)
    cards.forEach((card) => {
      expect(card.find('.community__name').text().length).toBeGreaterThan(3)
      expect(card.find('.community__role').text().length).toBeGreaterThan(3)
      expect(card.find('.community__since').text().length).toBeGreaterThan(3)
    })
  })

  it('papel do membro vem do i18n por chave de role', () => {
    const wrapper = mount(CommunitySection, { global: { stubs } })
    const roles = wrapper.findAll('.community__role').map((r) => r.text())
    expect(roles).toContain('Testador')
  })

  it('card tem link opcional com rel noopener e target blank', () => {
    const wrapper = mount(CommunitySection, { global: { stubs } })
    const links = wrapper.findAll('a.community__link')
    if (links.length > 0) {
      expect(links[0]!.attributes('target')).toBe('_blank')
      expect(links[0]!.attributes('rel')).toBe('noopener noreferrer')
    }
  })

  it('renderiza CTA para entrar na comunidade', () => {
    const wrapper = mount(CommunitySection, { global: { stubs } })
    const cta = wrapper.find('a.community__cta')
    expect(cta.exists()).toBe(true)
    expect(cta.attributes('href')).toMatch(/^https?:\/\//)
    expect(cta.text().length).toBeGreaterThan(5)
  })
})
