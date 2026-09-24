import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import IconPix from '~/components/IconPix.vue'

describe('IconPix', () => {
  it('usa 1em quando size nao e informado', () => {
    const wrapper = mount(IconPix)
    const svg = wrapper.find('svg')
    expect(svg.attributes('width')).toBe('1em')
    expect(svg.attributes('height')).toBe('1em')
    expect(svg.attributes('aria-label')).toBe('Pix')
  })

  it('aplica o size informado', () => {
    const wrapper = mount(IconPix, { props: { size: 24 } })
    expect(wrapper.find('svg').attributes('width')).toBe('24')
    expect(wrapper.find('svg').attributes('height')).toBe('24')
  })
})
