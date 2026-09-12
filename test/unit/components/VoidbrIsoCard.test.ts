import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VoidbrIsoCard from '~/components/VoidbrIsoCard.vue'

const stubs = { i: true }

const availableIso = {
  available: true,
  fileName: 'voidbr-live-louvorja-piano-x86_64-20260911-1200.iso',
  url: 'https://voidbr.org/iso/current/voidbr-live-louvorja-piano-x86_64-20260911-1200.iso',
  sizeBytes: 3.4 * 1024 ** 3,
  builtAt: '2026-09-11',
}

describe('VoidbrIsoCard', () => {
  it('renderiza titulo, descricao e features da ISO', () => {
    const wrapper = mount(VoidbrIsoCard, {
      props: { iso: availableIso },
      global: { stubs },
    })
    expect(wrapper.find('.voidbr-iso__title').text().length).toBeGreaterThan(3)
    expect(wrapper.find('.voidbr-iso__desc').text().length).toBeGreaterThan(10)
    expect(wrapper.findAll('.voidbr-iso__features li')).toHaveLength(3)
  })

  it('mostra botao de download quando ISO esta disponivel', () => {
    const wrapper = mount(VoidbrIsoCard, {
      props: { iso: availableIso },
      global: { stubs },
    })
    const btn = wrapper.find('a.voidbr-iso__btn')
    expect(btn.exists()).toBe(true)
    expect(btn.attributes('href')).toBe(availableIso.url)
    expect(btn.attributes('rel')).toBe('noopener')
    expect(btn.classes()).not.toContain('voidbr-iso__btn--disabled')
  })

  it('mostra tamanho e data de build quando disponiveis', () => {
    const wrapper = mount(VoidbrIsoCard, {
      props: { iso: availableIso },
      global: { stubs },
    })
    const meta = wrapper.find('.voidbr-iso__meta')
    expect(meta.exists()).toBe(true)
    expect(meta.text()).toContain('3.4 GB')
    expect(meta.text()).toContain('2026-09-11')
  })

  it('mostra indisponivel quando iso e null', () => {
    const wrapper = mount(VoidbrIsoCard, {
      props: { iso: null },
      global: { stubs },
    })
    expect(wrapper.find('a.voidbr-iso__btn').exists()).toBe(false)
    expect(wrapper.find('.voidbr-iso__btn--disabled').exists()).toBe(true)
    expect(wrapper.find('.voidbr-iso__meta').exists()).toBe(false)
  })

  it('mostra indisponivel quando available=false', () => {
    const wrapper = mount(VoidbrIsoCard, {
      props: {
        iso: {
          available: false,
          fileName: null,
          url: null,
          sizeBytes: null,
          builtAt: null,
        },
      },
      global: { stubs },
    })
    expect(wrapper.find('.voidbr-iso__btn--disabled').exists()).toBe(true)
    expect(wrapper.find('.voidbr-iso__meta').exists()).toBe(false)
  })

  it('esconde tamanho quando sizeBytes esta ausente mas mantem builtAt', () => {
    const wrapper = mount(VoidbrIsoCard, {
      props: {
        iso: {
          available: true,
          fileName: 'file.iso',
          url: 'https://voidbr.org/iso/current/file.iso',
          sizeBytes: null,
          builtAt: '2026-09-01',
        },
      },
      global: { stubs },
    })
    const meta = wrapper.find('.voidbr-iso__meta')
    expect(meta.exists()).toBe(true)
    expect(meta.text()).not.toMatch(/GB/)
    expect(meta.text()).toContain('2026-09-01')
  })

  it('trata sizeBytes 0 como ausente', () => {
    const wrapper = mount(VoidbrIsoCard, {
      props: {
        iso: {
          available: true,
          fileName: 'file.iso',
          url: 'https://voidbr.org/iso/current/file.iso',
          sizeBytes: 0,
          builtAt: null,
        },
      },
      global: { stubs },
    })
    expect(wrapper.find('.voidbr-iso__meta').exists()).toBe(true)
    expect(wrapper.find('.voidbr-iso__meta').text()).not.toMatch(/GB/)
  })

  it('link da comunidade VoidBR sempre presente', () => {
    const wrapper = mount(VoidbrIsoCard, {
      props: { iso: null },
      global: { stubs },
    })
    const link = wrapper.find('a.voidbr-iso__link')
    expect(link.exists()).toBe(true)
    expect(link.attributes('href')).toBe('https://voidbr.org')
    expect(link.attributes('rel')).toBe('noopener')
  })
})
