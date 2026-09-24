import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CommunitySection from '~/components/CommunitySection.vue'
import { communityLinks } from '~/data/community'

vi.mock('~/data/community', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~/data/community')>()
  return {
    ...actual,
    communityMembers: [
      { name: 'Caique', role: 'tester' as const, since: '2026-08' },
      {
        name: 'Ana Teste',
        role: 'enthusiast' as const,
        since: '2026-01',
        url: 'https://example.com/ana',
      },
    ],
    communityLinks: {
      whatsapp: 'https://chat.whatsapp.com/LBcTv5rQDZw3OU56QmUahc',
      telegram: 'https://t.me/pianolouvorja_devs',
    },
  }
})

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

  it('renderiza um card por membro com avatar de iniciais, nome, papel e desde', () => {
    const wrapper = mount(CommunitySection, { global: { stubs } })
    const cards = wrapper.findAll('.community__card')
    expect(cards.length).toBeGreaterThanOrEqual(1)
    cards.forEach((card) => {
      const avatar = card.find('.community__avatar')
      expect(avatar.exists()).toBe(true)
      expect(avatar.text().length).toBeGreaterThan(0)
      expect(card.find('.community__name').text().length).toBeGreaterThan(3)
      expect(card.find('.community__role').text().length).toBeGreaterThan(3)
      expect(card.find('.community__since').text().length).toBeGreaterThan(3)
    })
  })

  it('avatar recebe classe de cor por papel', () => {
    const wrapper = mount(CommunitySection, { global: { stubs } })
    const avatars = wrapper.findAll('.community__avatar')
    expect(avatars.length).toBeGreaterThanOrEqual(1)
    avatars.forEach((avatar) => {
      expect(avatar.classes().some((c) => c.startsWith('community__avatar--'))).toBe(true)
    })
  })

  it('iniciais do avatar usam no maximo as duas primeiras palavras do nome', () => {
    const wrapper = mount(CommunitySection, { global: { stubs } })
    const first = wrapper.find('.community__avatar')
    expect(first.text()).toBe('C')
  })

  it('papel do membro vem do i18n por chave de role', () => {
    const wrapper = mount(CommunitySection, { global: { stubs } })
    const roles = wrapper.findAll('.community__role').map((r) => r.text())
    expect(roles).toContain('Testador')
  })

  it('card tem link opcional com rel noopener e target blank', () => {
    const wrapper = mount(CommunitySection, { global: { stubs } })
    const links = wrapper.findAll('a.community__link')
    expect(links.length).toBe(1)
    expect(links[0]!.attributes('href')).toBe('https://example.com/ana')
    expect(links[0]!.attributes('target')).toBe('_blank')
    expect(links[0]!.attributes('rel')).toBe('noopener noreferrer')
  })

  it('nao renderiza link quando membro nao tem url', () => {
    const wrapper = mount(CommunitySection, { global: { stubs } })
    const caique = wrapper.findAll('.community__card')[0]!
    expect(caique.find('.community__name').text()).toBe('Caique')
    expect(caique.find('a.community__link').exists()).toBe(false)
  })

  it('renderiza links para WhatsApp e Telegram', () => {
    const wrapper = mount(CommunitySection, { global: { stubs } })
    const whatsappLink = wrapper.find('a.community__cta--whatsapp')
    const telegramLink = wrapper.find('a.community__cta--telegram')

    expect(whatsappLink.exists()).toBe(true)
    expect(whatsappLink.attributes('href')).toBe(communityLinks.whatsapp)
    expect(whatsappLink.attributes('target')).toBe('_blank')
    expect(whatsappLink.attributes('rel')).toBe('noopener noreferrer')
    expect(whatsappLink.find('i.ti-brand-whatsapp').exists()).toBe(true)
    expect(whatsappLink.text()).toContain('Suporte no WhatsApp')

    expect(telegramLink.exists()).toBe(true)
    expect(telegramLink.attributes('href')).toBe(communityLinks.telegram)
    expect(telegramLink.attributes('target')).toBe('_blank')
    expect(telegramLink.attributes('rel')).toBe('noopener noreferrer')
    expect(telegramLink.find('i.ti-brand-telegram').exists()).toBe(true)
    expect(telegramLink.text()).toContain('Devs no Telegram')
  })

  it('nao renderiza mais community__spot nem o CTA unico antigos', () => {
    const wrapper = mount(CommunitySection, { global: { stubs } })
    expect(wrapper.find('a.community__spot').exists()).toBe(false)
    expect(wrapper.findAll('a.community__cta').length).toBe(2)
  })
})
