import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DonateButton from '~/components/DonateButton.vue'

describe('DonateButton.vue', () => {
  const createWrapper = (props = {}) => {
    return mount(DonateButton, {
      props,
      global: {
        stubs: {
          transition: false,
        },
      },
    })
  }

  it('renderiza o título', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('Apoie o Projeto')
  })

  it('renderiza botões de paypal e pix', () => {
    const wrapper = createWrapper()
    const paypalBtn = wrapper.find('[data-testid="donate-paypal"]')
    const pixBtn = wrapper.find('[data-testid="donate-pix"]')

    expect(paypalBtn.exists()).toBe(true)
    expect(pixBtn.exists()).toBe(true)

    expect(paypalBtn.text()).toContain('Doar via PayPal')
    expect(pixBtn.text()).toContain('Doar via PIX')
  })

  it('aplica classe de variante corretamente', () => {
    const wrapperInline = createWrapper({ variant: 'inline' })
    const wrapperCard = createWrapper({ variant: 'card' })

    expect(wrapperInline.classes()).toContain('donate-button--inline')
    expect(wrapperCard.classes()).toContain('donate-button--card')
  })
})
