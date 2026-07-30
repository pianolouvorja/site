import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TheHeader from '~/components/TheHeader.vue'

describe('TheHeader', () => {
  it('renderiza o logo/nome do site', () => {
    const wrapper = mount(TheHeader)
    expect(wrapper.text()).toContain('PIANO')
    expect(wrapper.text()).toContain('LouvorJA')
  })

  it('renderiza links de navegacao', () => {
    const wrapper = mount(TheHeader)
    const links = wrapper.findAll('a')
    expect(links.length).toBeGreaterThanOrEqual(3)
  })

  it('tem botao CTA para acessar o app', () => {
    const wrapper = mount(TheHeader)
    const cta = wrapper.find('[data-testid="header-cta"]')
    expect(cta.exists()).toBe(true)
    expect(cta.attributes('href')).toMatch(/^https:\/\//)
  })

  it('menu mobile inicia fechado com aria-expanded false', () => {
    const wrapper = mount(TheHeader)
    const toggle = wrapper.find('[data-testid="header-menu-toggle"]')
    expect(toggle.exists()).toBe(true)
    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('[data-testid="header-nav-mobile"]').exists()).toBe(false)
  })

  it('clicar no botao toggle abre o menu mobile', async () => {
    const wrapper = mount(TheHeader)
    const toggle = wrapper.find('[data-testid="header-menu-toggle"]')
    await toggle.trigger('click')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(wrapper.find('[data-testid="header-nav-mobile"]').exists()).toBe(true)
  })

  it('clicar no botao toggle novamente fecha o menu mobile', async () => {
    const wrapper = mount(TheHeader)
    const toggle = wrapper.find('[data-testid="header-menu-toggle"]')
    await toggle.trigger('click')
    await toggle.trigger('click')
    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('[data-testid="header-nav-mobile"]').exists()).toBe(false)
  })

  it('clicar em um link do menu mobile fecha o menu', async () => {
    const wrapper = mount(TheHeader)
    const toggle = wrapper.find('[data-testid="header-menu-toggle"]')
    await toggle.trigger('click')
    const mobileLink = wrapper.find('[data-testid="header-nav-mobile"] a')
    await mobileLink.trigger('click')
    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('[data-testid="header-nav-mobile"]').exists()).toBe(false)
  })
})
