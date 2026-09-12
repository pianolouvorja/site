import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CommunitySection from '~/components/CommunitySection.vue'
import { communityJoinUrl } from '~/data/community'

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

  it('renderiza CTA para entrar na comunidade', () => {
    const wrapper = mount(CommunitySection, { global: { stubs } })
    const cta = wrapper.find('a.community__cta')
    expect(cta.exists()).toBe(true)
    expect(cta.attributes('href')).toMatch(/^https?:\/\//)
    expect(cta.text().length).toBeGreaterThan(5)
  })

  it('renderiza card de vaga aberta apos os membros', () => {
    const wrapper = mount(CommunitySection, { global: { stubs } })
    const spot = wrapper.find('a.community__spot')
    expect(spot.exists()).toBe(true)
    expect(spot.attributes('href')).toBe(communityJoinUrl)
    expect(spot.attributes('target')).toBe('_blank')
    expect(spot.attributes('rel')).toBe('noopener noreferrer')
    const cards = wrapper.findAll('.community__card, .community__spot')
    const spotIndex = cards.findIndex((c) => c.classes().includes('community__spot'))
    expect(spotIndex).toBe(cards.length - 1)
  })
})

describe('CommunitySection — canais de comunidade', () => {
  it('renderiza link do grupo de suporte WhatsApp com url personalizada', () => {
    const wrapper = mount(CommunitySection, { global: { stubs } })
    const wa = wrapper.find('a.community__channel[href*="chat.whatsapp.com"]')
    expect(wa.exists()).toBe(true)
    expect(wa.attributes('target')).toBe('_blank')
    expect(wa.attributes('rel')).toContain('noopener')
    expect(wa.text().length).toBeGreaterThan(3)
  })

  it('renderiza link do grupo de devs Telegram com url personalizada', () => {
    const wrapper = mount(CommunitySection, { global: { stubs } })
    const tg = wrapper.find('a.community__channel[href*="t.me/"]')
    expect(tg.exists()).toBe(true)
    expect(tg.attributes('target')).toBe('_blank')
    expect(tg.attributes('rel')).toContain('noopener')
    expect(tg.text().length).toBeGreaterThan(3)
  })
})
