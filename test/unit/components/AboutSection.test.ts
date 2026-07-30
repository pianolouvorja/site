import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AboutSection from '~/components/AboutSection.vue'

describe('AboutSection', () => {
  it('renderiza a secao com id about', () => {
    const wrapper = mount(AboutSection)
    expect(wrapper.find('#about').exists()).toBe(true)
  })

  it('renderiza texto sobre o projeto', () => {
    const wrapper = mount(AboutSection)
    expect(wrapper.text().length).toBeGreaterThan(50)
  })
})
