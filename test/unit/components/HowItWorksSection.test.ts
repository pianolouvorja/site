import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HowItWorksSection from '~/components/HowItWorksSection.vue'

describe('HowItWorksSection', () => {
  it('renderiza a secao com id how-it-works', () => {
    const wrapper = mount(HowItWorksSection)
    expect(wrapper.find('#how-it-works').exists()).toBe(true)
  })

  it('renderiza passos', () => {
    const wrapper = mount(HowItWorksSection)
    const steps = wrapper.findAll('[data-testid="step"]')
    expect(steps.length).toBeGreaterThanOrEqual(3)
  })

  it('cada passo tem titulo', () => {
    const wrapper = mount(HowItWorksSection)
    const steps = wrapper.findAll('[data-testid="step"]')
    steps.forEach((step) => {
      expect(step.find('[data-testid="step-title"]').exists()).toBe(true)
    })
  })
})
