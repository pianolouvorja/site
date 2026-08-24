import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'

// Global setup.ts already stubs useRuntimeConfig/useI18n — override per-test below.
import DonateButton from '~/components/DonateButton.vue'

const mockConfig = {
  public: {
    firebaseApiKey: 'x',
    asaasDonateUrl: '',
  },
}

describe('DonateButton', () => {
  beforeEach(() => {
    vi.stubGlobal('useRuntimeConfig', () => mockConfig)
    mockConfig.public.asaasDonateUrl = ''
  })

  it('renders nothing when no donate URL is configured', () => {
    const wrapper = mount(DonateButton)
    expect(wrapper.find('[data-testid="donate-button"]').exists()).toBe(false)
  })

  it('renders the donate button when URL is configured', () => {
    mockConfig.public.asaasDonateUrl = 'https://sandbox.asaas.com/pay/link'
    const wrapper = mount(DonateButton)
    const btn = wrapper.find('[data-testid="donate-button"]')
    expect(btn.exists()).toBe(true)
    expect(btn.attributes('href')).toBe('https://sandbox.asaas.com/pay/link')
    expect(btn.attributes('target')).toBe('_blank')
    expect(btn.attributes('rel')).toBe('noopener noreferrer')
  })

  it('shows payment method badges (Pix, Boleto, Cartão)', () => {
    mockConfig.public.asaasDonateUrl = 'https://sandbox.asaas.com/pay/link'
    const wrapper = mount(DonateButton)
    expect(wrapper.find('[data-testid="donate-method-pix"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="donate-method-boleto"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="donate-method-card"]').exists()).toBe(true)
  })

  it('has accessible label and icon', () => {
    mockConfig.public.asaasDonateUrl = 'https://sandbox.asaas.com/pay/link'
    const wrapper = mount(DonateButton)
    const btn = wrapper.find('[data-testid="donate-button"]')
    // pt-BR.json key donate.title
    expect(btn.attributes('aria-label')).toBeTruthy()
    expect(btn.find('i').exists()).toBe(true)
  })
})
