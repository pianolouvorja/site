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

  it('expoe a camada de pessoas com dados publicos do GitHub', () => {
    const wrapper = mount(TeamSection, { global: { stubs: ['i'] } })
    const people = wrapper.findAll('.team__person')
    expect(people).toHaveLength(5)

    const names = people.map((p) => p.find('.team__person-name').text())
    expect(names).toEqual(
      expect.arrayContaining([
        'Ezequias Fonseca',
        'Rafael Dias Zendron',
        'Rafael Barbosa Silva',
        'Eduardo Charquero',
      ]),
    )
  })

  it('cada pessoa tem avatar do GitHub, papel via i18n, sem link externo no card', () => {
    const wrapper = mount(TeamSection, { global: { stubs: ['i'] } })
    wrapper.findAll('.team__person').forEach((person) => {
      const card = person.find('div.team__person-card')
      expect(card.exists()).toBe(true)
      // cards nao tem link — info completa fica no modal
      expect(card.find('a').exists()).toBe(false)

      const avatar = person.find('img.team__avatar')
      expect(avatar.exists()).toBe(true)
      expect(avatar.attributes('src')).toMatch(/^https:\/\/github\.com\/[A-Za-z]+\.png/)
      expect(avatar.attributes('alt')?.length).toBeGreaterThan(3)
      expect(avatar.attributes('loading')).toBe('lazy')

      expect(person.find('.team__person-role').text().length).toBeGreaterThan(3)
    })
  })

  it('renderiza o bloco de como trabalhamos', () => {
    const wrapper = mount(TeamSection, { global: { stubs: ['i'] } })
    expect(wrapper.find('.team__work-title').text().length).toBeGreaterThan(3)
    expect(wrapper.find('.team__work-text').text().length).toBeGreaterThan(30)
  })

  it('renderiza o CTA de contribuicao com 4 formas de ajudar', () => {
    const wrapper = mount(TeamSection, { global: { stubs: ['i'] } })
    expect(wrapper.find('.team__contribute').exists()).toBe(true)
    expect(wrapper.find('.team__contribute-title').text().length).toBeGreaterThan(3)
    expect(wrapper.find('.team__contribute-text').text().length).toBeGreaterThan(30)
    expect(wrapper.findAll('.team__contribute-way')).toHaveLength(4)
  })

  it('botao de contribuicao linka para a org no GitHub', () => {
    const wrapper = mount(TeamSection, { global: { stubs: ['i'] } })
    const btn = wrapper.find('a.team__contribute-btn')
    expect(btn.exists()).toBe(true)
    expect(btn.attributes('href')).toBe('https://github.com/pianolouvorja')
    expect(btn.attributes('target')).toBe('_blank')
    expect(btn.text().length).toBeGreaterThan(5)
  })

  it('bloco de como trabalhamos nao tem link, o CTA e separado', () => {
    const wrapper = mount(TeamSection, { global: { stubs: ['i'] } })
    expect(wrapper.find('.team__work a').exists()).toBe(false)
  })

  it('cada pessoa tem botao saiba mais que abre o modal', async () => {
    const wrapper = mount(TeamSection, { global: { stubs: ['i'] } })
    const buttons = wrapper.findAll('button.team__person-more')
    expect(buttons).toHaveLength(5)

    expect(wrapper.find('.team-modal').exists()).toBe(false)
    await buttons[0].trigger('click')
    expect(wrapper.find('.team-modal').exists()).toBe(true)
  })

  it('modal exibe nome, papel, bio e links do membro', async () => {
    const wrapper = mount(TeamSection, { global: { stubs: ['i'] } })
    await wrapper.findAll('button.team__person-more')[0].trigger('click')

    const modal = wrapper.find('.team-modal')
    expect(modal.attributes('role')).toBe('dialog')
    expect(modal.attributes('aria-modal')).toBe('true')
    expect(modal.attributes('aria-label')?.length).toBeGreaterThan(3)
    expect(modal.find('.team-modal__name').text().length).toBeGreaterThan(3)
    expect(modal.find('.team-modal__role').text().length).toBeGreaterThan(3)
    expect(modal.find('.team-modal__bio').text().length).toBeGreaterThan(30)
    expect(modal.find('a.team-modal__profile').attributes('href')).toMatch(
      /^https:\/\/github\.com\/[a-z]+$/,
    )
  })

  it('modal exibe links extras do membro quando existem', async () => {
    const wrapper = mount(TeamSection, { global: { stubs: ['i'] } })
    // index 2 = rafaelji, unico membro com links definidos em app/data/team.ts
    const buttons = wrapper.findAll('button.team__person-more')
    await buttons[2]!.trigger('click')

    // Deve ter pelo menos 2 links (GitHub + LinkedIn) para o membro com links
    const allLinks = wrapper.findAll('a.team-modal__profile')
    expect(allLinks.length).toBeGreaterThanOrEqual(2)

    // Deve conter link do LinkedIn
    const linkedin = allLinks.find((l) => l.attributes('href')?.includes('linkedin.com'))
    expect(linkedin).toBeTruthy()
  })

  it('modal nao fecha ao pressionar tecla que nao seja Escape', async () => {
    const wrapper = mount(TeamSection, { global: { stubs: ['i'] } })
    await wrapper.findAll('button.team__person-more')[0].trigger('click')

    const modal = wrapper.find('.team-modal')
    await modal.trigger('keydown', { key: 'Enter' })
    expect(wrapper.find('.team-modal').exists()).toBe(true)

    await modal.trigger('keydown', { key: 'Escape' })
    expect(wrapper.find('.team-modal').exists()).toBe(false)
  })

  it('modal fecha ao clicar no botao fechar', async () => {
    const wrapper = mount(TeamSection, { global: { stubs: ['i'] } })
    await wrapper.findAll('button.team__person-more')[0].trigger('click')
    await wrapper.find('button.team-modal__close').trigger('click')
    expect(wrapper.find('.team-modal').exists()).toBe(false)
  })

  it('modal fecha ao pressionar Escape', async () => {
    const wrapper = mount(TeamSection, { global: { stubs: ['i'] } })
    await wrapper.findAll('button.team__person-more')[0].trigger('click')
    await wrapper.find('.team-modal').trigger('keydown', { key: 'Escape' })
    expect(wrapper.find('.team-modal').exists()).toBe(false)
  })

  it('modal fecha ao clicar no overlay', async () => {
    const wrapper = mount(TeamSection, { global: { stubs: ['i'] } })
    await wrapper.findAll('button.team__person-more')[0].trigger('click')
    await wrapper.find('.team-modal__overlay').trigger('click')
    expect(wrapper.find('.team-modal').exists()).toBe(false)
  })

  it('abrir outro membro substitui o conteudo do modal', async () => {
    const wrapper = mount(TeamSection, { global: { stubs: ['i'] } })
    await wrapper.findAll('button.team__person-more')[0].trigger('click')
    const first = wrapper.find('.team-modal__name').text()
    await wrapper.findAll('button.team__person-more')[1].trigger('click')
    expect(wrapper.find('.team-modal').exists()).toBe(true)
    expect(wrapper.find('.team-modal__name').text()).not.toBe(first)
  })
})
