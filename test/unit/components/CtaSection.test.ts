import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CtaSection from '~/components/CtaSection.vue'

describe('CtaSection', () => {
  it('renderiza titulo da CTA', () => {
    const wrapper = mount(CtaSection)
    expect(wrapper.text()).toContain('Pronto para começar?')
  })

  it('renderiza subtitulo da CTA', () => {
    const wrapper = mount(CtaSection)
    expect(wrapper.text()).toContain('Abra o PIANO LouvorJA agora')
  })

  it('tem botao CTA com link do app', () => {
    const wrapper = mount(CtaSection)
    const btn = wrapper.find('[data-testid="cta-button"]')
    expect(btn.exists()).toBe(true)
    expect(btn.attributes('href')).toMatch(/^https:\/\//)
  })

  it('renderiza 3 meta items (free, noInstall, openSource)', () => {
    const wrapper = mount(CtaSection)
    const meta = wrapper.find('.cta__meta')
    expect(meta.exists()).toBe(true)
    const spans = meta.findAll('span')
    expect(spans.length).toBe(3)
    expect(meta.text()).toContain('100% Gratuito')
    expect(meta.text()).toContain('Sem instalação')
    expect(meta.text()).toContain('Código aberto')
  })
})
