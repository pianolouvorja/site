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

  it('renderiza string vazia quando message nao e fornecida', () => {
    const wrapper = mount(LegalBodyItem, {
      props: {},
    })
    expect(wrapper.find('p').exists()).toBe(true)
    expect(wrapper.text()).toBe('')
  })

  it('divide corretamente texto antes e depois do placeholder {link}', () => {
    const wrapper = mount(LegalBodyItem, {
      props: {
        message: 'Antes {link} Depois',
        linkUrl: 'https://exemplo.com',
        linkText: 'link',
      },
    })
    const p = wrapper.find('p')
    // before: exatos 6 chars "Antes "
    expect(p.text()).toContain('Antes ')
    // after: exato " Depois"
    expect(p.text()).toContain(' Depois')
    expect(wrapper.find('a').text()).toBe('link')
  })

  it('preserva texto antes do link exatamente (sem truncar)', () => {
    const wrapper = mount(LegalBodyItem, {
      props: {
        message: 'ABCDEFGH {link} XYZ',
        linkUrl: 'https://exemplo.com',
        linkText: 'lnk',
      },
    })
    const p = wrapper.find('p')
    // before do <a> deve ser exatamente "ABCDEFGH "
    expect(p.text()).not.toMatch(/\{link\}/)
    // after do <a> deve ser exatamente " XYZ"
    const link = wrapper.find('a')
    const fullText = p.text()
    const linkText = link.text()
    const beforeText = fullText.slice(0, fullText.indexOf(linkText))
    const afterText = fullText.slice(fullText.indexOf(linkText) + linkText.length)
    expect(beforeText).toBe('ABCDEFGH ')
    expect(afterText).toBe(' XYZ')
  })

  it('detecta subsection com multiplos digitos (ex: 10.15)', () => {
    const wrapper = mount(LegalBodyItem, {
      props: { message: '10.15 Titulo numerado grande' },
    })
    expect(wrapper.find('.legal-page__subsection').exists()).toBe(true)
  })

  it('nao detecta subsection para texto com numeros no meio', () => {
    const wrapper = mount(LegalBodyItem, {
      props: { message: 'Texto 123 com numeros no meio' },
    })
    expect(wrapper.find('.legal-page__subsection').exists()).toBe(false)
  })

  it('detecta subsection com digito unico (ex: 1.1)', () => {
    const wrapper = mount(LegalBodyItem, {
      props: { message: '1.1 Subsecao simples' },
    })
    expect(wrapper.find('.legal-page__subsection').exists()).toBe(true)
  })

  it('renderiza link quando {link} esta no inicio do texto', () => {
    const wrapper = mount(LegalBodyItem, {
      props: {
        message: '{link} texto depois',
        linkUrl: 'https://exemplo.com',
        linkText: 'Inicio',
      },
    })
    const link = wrapper.find('a')
    expect(link.exists()).toBe(true)
    expect(link.text()).toBe('Inicio')
  })

  it('renderiza link quando {link} esta no final do texto', () => {
    const wrapper = mount(LegalBodyItem, {
      props: {
        message: 'texto antes {link}',
        linkUrl: 'https://exemplo.com',
        linkText: 'Fim',
      },
    })
    const link = wrapper.find('a')
    expect(link.exists()).toBe(true)
    expect(link.text()).toBe('Fim')
  })

  it('nao renderiza <a> para texto simples sem {link}', () => {
    const wrapper = mount(LegalBodyItem, {
      props: { message: 'Texto completamente sem link' },
    })
    expect(wrapper.find('a').exists()).toBe(false)
    expect(wrapper.find('p').exists()).toBe(true)
  })
})
