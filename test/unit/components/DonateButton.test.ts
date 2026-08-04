import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import DonateButton from '~/components/DonateButton.vue'

describe('DonateButton.vue', () => {
  const createWrapper = (props = {}) => {
    return mount(DonateButton, {
      props,
      global: {
        stubs: {
          teleport: true,
          Transition: {
            template: '<slot />',
          },
        },
      },
    })
  }

  it('renderiza o título', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('Apoie o Projeto')
  })

  it('renderiza botão PIX', () => {
    const wrapper = createWrapper()
    const pixBtn = wrapper.find('[data-testid="donate-pix"]')

    expect(pixBtn.exists()).toBe(true)
    expect(pixBtn.text()).toContain('Doar via PIX')
  })

  it('não renderiza PayPal', () => {
    const wrapper = createWrapper()
    const paypalBtn = wrapper.find('[data-testid="donate-paypal"]')

    expect(paypalBtn.exists()).toBe(false)
  })

  it('aplica classe de variante corretamente', () => {
    const wrapperInline = createWrapper({ variant: 'inline' })
    const wrapperCard = createWrapper({ variant: 'card' })

    expect(wrapperInline.classes()).toContain('donate-button--inline')
    expect(wrapperCard.classes()).toContain('donate-button--card')
  })

  it('abre modal ao clicar no botão PIX', async () => {
    const wrapper = createWrapper()

    // Modal não existe antes do clique
    expect(wrapper.find('[data-testid="pix-overlay"]').exists()).toBe(false)

    // Clica no botão PIX
    await wrapper.find('[data-testid="donate-pix"]').trigger('click')

    // Modal aparece
    expect(wrapper.find('[data-testid="pix-overlay"]').exists()).toBe(true)
    const donateInput = wrapper.find('#donate-amount')
    expect(donateInput.exists()).toBe(true)
  })

  it('fecha modal ao clicar no botão de fechar', async () => {
    const wrapper = createWrapper()

    // Abre o modal
    await wrapper.find('[data-testid="donate-pix"]').trigger('click')
    expect(wrapper.find('[data-testid="pix-overlay"]').exists()).toBe(true)

    // Clica no X
    await wrapper.find('[data-testid="pix-close"]').trigger('click')
    await nextTick()

    // Modal some
    expect(wrapper.find('[data-testid="pix-overlay"]').exists()).toBe(false)
  })
})
