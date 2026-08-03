import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DonateButton from '~/components/DonateButton.vue'

describe('DonateButton.vue', () => {
  const createWrapper = (props = {}) => {
    return mount(DonateButton, {
      props,
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: {
          transition: false,
        },
      },
    })
  }

  it('renderiza o título', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('donate.title')
  })

  it('renderiza botões de paypal e pix', () => {
    const wrapper = createWrapper()
    const paypalBtn = wrapper.find('[data-testid="donate-paypal"]')
    const pixBtn = wrapper.find('[data-testid="donate-pix"]')

    expect(paypalBtn.exists()).toBe(true)
    expect(pixBtn.exists()).toBe(true)

    expect(paypalBtn.text()).toContain('donate.paypal')
    expect(pixBtn.text()).toContain('donate.pix')
  })

  it('aplica classe de variante corretamente', () => {
    const wrapperInline = createWrapper({ variant: 'inline' })
    const wrapperCard = createWrapper({ variant: 'card' })

    expect(wrapperInline.classes()).toContain('donate-button--inline')
    expect(wrapperCard.classes()).toContain('donate-button--card')
  })
})
