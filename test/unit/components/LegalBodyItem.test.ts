import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LegalBodyItem from '~/components/LegalBodyItem.vue'

describe('LegalBodyItem', () => {
  it('renderiza texto simples como <p>', () => {
    const wrapper = mount(LegalBodyItem, {
      props: { message: 'Texto simples sem link' },
    })
    expect(wrapper.find('p').exists()).toBe(true)
    expect(wrapper.text()).toContain('Texto simples sem link')
  })

  it('nao renderiza <a> quando nao ha placeholder {link}', () => {
    const wrapper = mount(LegalBodyItem, {
      props: { message: 'Sem link aqui' },
    })
    expect(wrapper.find('a').exists()).toBe(false)
  })

  it('renderiza <a> quando message tem placeholder {link}', () => {
    const wrapper = mount(LegalBodyItem, {
      props: {
        message: 'Texto antes {link} texto depois',
        linkUrl: 'https://exemplo.com',
        linkText: 'Clique aqui',
      },
    })
    const link = wrapper.find('a')
    expect(link.exists()).toBe(true)
    expect(link.attributes('href')).toBe('https://exemplo.com')
    expect(link.text()).toBe('Clique aqui')
  })

  it('adiciona target=_blank e rel=noopener quando external=true', () => {
    const wrapper = mount(LegalBodyItem, {
      props: {
        message: 'Visite {link} para mais',
        linkUrl: 'https://exemplo.com',
        linkText: 'site externo',
        external: true,
      },
    })
    const link = wrapper.find('a')
    expect(link.attributes('target')).toBe('_blank')
    expect(link.attributes('rel')).toBe('noopener')
  })

  it('nao adiciona target=_blank quando external nao definido', () => {
    const wrapper = mount(LegalBodyItem, {
      props: {
        message: 'Veja {link}',
        linkUrl: '/interno',
        linkText: 'link interno',
      },
    })
    const link = wrapper.find('a')
    expect(link.attributes('target')).toBeUndefined()
  })

  it('aplica class legal-page__subsection para numeros no inicio (ex: 1.2)', () => {
    const wrapper = mount(LegalBodyItem, {
      props: { message: '1.2 Algum titulo de subsecao' },
    })
    expect(wrapper.find('.legal-page__subsection').exists()).toBe(true)
  })

  it('nao aplica class subsection para texto normal', () => {
    const wrapper = mount(LegalBodyItem, {
      props: { message: 'Texto normal sem numeracao' },
    })
    expect(wrapper.find('.legal-page__subsection').exists()).toBe(false)
  })

  it('usa paragraphClass customizado quando fornecido', () => {
    const wrapper = mount(LegalBodyItem, {
      props: { message: 'Texto', paragraphClass: 'minha-classe' },
    })
    expect(wrapper.find('.minha-classe').exists()).toBe(true)
  })

  it('renderiza mensagem vazia sem quebrar', () => {
    const wrapper = mount(LegalBodyItem, {
      props: { message: '' },
    })
    expect(wrapper.find('p').exists()).toBe(true)
  })
})
