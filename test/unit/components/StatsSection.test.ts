import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StatsSection from '~/components/StatsSection.vue'

describe('StatsSection', () => {
  it('renderiza 4 stat items', () => {
    const wrapper = mount(StatsSection)
    const items = wrapper.findAll('[data-testid="stat-item"]')
    expect(items.length).toBe(4)
  })

  it('renderiza os numeros corretos', () => {
    const wrapper = mount(StatsSection)
    const nums = wrapper.findAll('[data-testid="stat-num"]')
    expect(nums[0].text()).toBe('8+')
    expect(nums[1].text()).toBe('100%')
    expect(nums[2].text()).toBe('0')
    expect(nums[3].text()).toBe('PWA')
  })

  it('renderiza as labels i18n para cada stat', () => {
    const wrapper = mount(StatsSection)
    const text = wrapper.text()
    expect(text).toContain('Funcionalidades')
    expect(text).toContain('Gratuito')
    expect(text).toContain('Instalações')
    expect(text).toContain('Funciona offline')
  })
})
