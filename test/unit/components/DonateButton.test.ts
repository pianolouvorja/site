import { describe, it, expect } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
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
    const title = wrapper.find('.donate-button__title')
    expect(title.exists()).toBe(true)
    expect(title.text()).toBe('Apoie o Projeto')
  })

  it('renderiza botão único', () => {
    const wrapper = createWrapper()
    const pixBtn = wrapper.find('[data-testid="donate-button"]')

    expect(pixBtn.exists()).toBe(true)
    expect(pixBtn.text()).toContain('Doar (PIX / Boleto)')
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

  it('abre modal ao clicar no botão único', async () => {
    const wrapper = createWrapper()

    // Modal não existe antes do clique
    expect(wrapper.find('[data-testid="pix-overlay"]').exists()).toBe(false)

    // Clica no botão PIX
    await wrapper.find('[data-testid="donate-button"]').trigger('click')

    // Modal aparece
    expect(wrapper.find('[data-testid="pix-overlay"]').exists()).toBe(true)
    const donateInput = wrapper.find('#donate-amount')
    expect(donateInput.exists()).toBe(true)
  })

  it('fecha modal ao clicar no botão de fechar', async () => {
    const wrapper = createWrapper()

    // Abre o modal
    await wrapper.find('[data-testid="donate-button"]').trigger('click')
    expect(wrapper.find('[data-testid="pix-overlay"]').exists()).toBe(true)

    // Clica no X
    await wrapper.find('[data-testid="pix-close"]').trigger('click')
    await nextTick()

    // Modal some
    expect(wrapper.find('[data-testid="pix-overlay"]').exists()).toBe(false)
  })

  it('processa doação', async () => {
    const wrapper = createWrapper()

    // global mock fetch for checkouturl
    global.$fetch = vi.fn().mockResolvedValue({ checkoutUrl: 'https://pay.abacate.com/123' })

    // open modal
    await wrapper.find('[data-testid="donate-button"]').trigger('click')

    const input = wrapper.find('#donate-amount')
    await input.setValue('10,00')

    const submitBtn = wrapper.find('.card-form__button')
    await submitBtn.trigger('click')

    expect(global.$fetch).toHaveBeenCalledWith('/api/donate/create', {
      method: 'POST',
      body: { amount: 1000 },
    })
  })

  it('mostra erro quando criação de PIX falha via fetch (exceção)', async () => {
    const wrapper = createWrapper()

    // Simulate error throw
    global.$fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    await wrapper.find('[data-testid="donate-button"]').trigger('click')
    await wrapper.find('#donate-amount').setValue('10,00')
    await wrapper.find('.card-form__button').trigger('click')

    // Wait for internal promises to resolve
    await flushPromises()

    // Check if error state was set (or simply coverage has increased)
    expect(wrapper.find('.card-form__error').exists()).toBe(true)
  })

  it('mostra erro quando criação de PIX falha via status da API (sem url)', async () => {
    const wrapper = createWrapper()

    // Simulate API return without URL
    global.$fetch = vi.fn().mockResolvedValue({})

    await wrapper.find('[data-testid="donate-button"]').trigger('click')
    await wrapper.find('#donate-amount').setValue('10,00')
    await wrapper.find('.card-form__button').trigger('click')

    // Wait for internal promises to resolve
    await flushPromises()

    expect(wrapper.find('.card-form__error').exists()).toBe(true)
  })

  it('falha na doação se não tiver valor', async () => {
    const wrapper = createWrapper()

    // open modal
    await wrapper.find('[data-testid="donate-button"]').trigger('click')

    const submitBtn = wrapper.find('.card-form__button')
    // Botão é disabled quando não tem valor (pixAmount vazio/null)
    expect(submitBtn.attributes('disabled')).toBeDefined()
  })

  it('não processa pagamento se o valor for menor que 1', async () => {
    // Clear mock just in case previous tests left it
    vi.clearAllMocks()

    const wrapper = createWrapper()

    await wrapper.find('[data-testid="donate-button"]').trigger('click')

    // Simulate removing disabled programmatically (to test internal func) or call function directly
    // For coverage of line 36: `if (!amountFloat || amountFloat < 1) return`
    const vm = wrapper.vm as any
    vm.pixAmount = '0,50' // set directly on instance to bypass input parsing state issues
    await vm.processPixPayment()

    expect(global.$fetch).not.toHaveBeenCalled()
    expect(vm.pixStatus).toBe('idle')
  })
})
