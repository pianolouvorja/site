import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TheFooter from '~/components/TheFooter.vue'

describe('TheFooter', () => {
  it('renderiza rodape', () => {
    const wrapper = mount(TheFooter)
    expect(wrapper.find('footer').exists()).toBe(true)
  })

  it('tem link do portfolio do autor', () => {
    const wrapper = mount(TheFooter)
    const portfolio = wrapper.find('[data-testid="footer-portfolio"]')
    expect(portfolio.exists()).toBe(true)
    expect(portfolio.attributes('href')).toBe('https://portfoliodev-blush-pi.vercel.app/')
  })

  it('tem ano atual no copyright', () => {
    const wrapper = mount(TheFooter)
    const year = new Date().getFullYear()
    expect(wrapper.text()).toContain(String(year))
  })
})
