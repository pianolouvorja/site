import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'

const mockStatus = ref<string>('idle')
const mockErrorMessage = ref<string>('')
const mockSubscribe = vi.fn()
const mockValidateEmail = vi.fn()

vi.mock('~/composables/useNewsletter', () => ({
  useNewsletter: () => ({
    status: mockStatus,
    errorMessage: mockErrorMessage,
    validateEmail: mockValidateEmail,
    subscribe: mockSubscribe,
  }),
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => {
      const keys: Record<string, string> = {
        'newsletter.title': 'Receba novidades',
        'newsletter.subtitle': 'Inscreva-se para atualizações',
        'newsletter.placeholder': 'Seu melhor e-mail',
        'newsletter.button': 'Inscrever',
        'newsletter.loading': 'Inscrevendo...',
        'newsletter.success': 'Inscrição confirmada!',
        'newsletter.errors.invalidEmail': 'E-mail inválido',
        'newsletter.errors.alreadySubscribed': 'Já inscrito',
        'newsletter.errors.generic': 'Erro ao inscrever',
        'newsletter.errors.rateLimited': 'Muitas tentativas',
        'newsletter.errors.serviceUnavailable': 'Serviço indisponível',
        'newsletter.errors.unknownError': 'Erro desconhecido',
      }
      return keys[key] ?? key
    },
  }),
}))

import NewsletterForm from '~/components/NewsletterForm.vue'

describe('NewsletterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStatus.value = 'idle'
    mockErrorMessage.value = ''
  })

  it('renders title', () => {
    const wrapper = mount(NewsletterForm)
    expect(wrapper.text()).toContain('Receba novidades')
  })

  it('renders email input', () => {
    const wrapper = mount(NewsletterForm)
    expect(wrapper.find('[data-testid="newsletter-email"]').exists()).toBe(true)
  })

  it('renders submit button', () => {
    const wrapper = mount(NewsletterForm)
    expect(wrapper.find('[data-testid="newsletter-submit"]').exists()).toBe(true)
  })

  it('placeholder is from i18n', () => {
    const wrapper = mount(NewsletterForm)
    const input = wrapper.find('[data-testid="newsletter-email"]')
    expect(input.attributes('placeholder')).toBe('Seu melhor e-mail')
  })

  it('subscribes with valid email', async () => {
    mockValidateEmail.mockReturnValue(true)
    mockSubscribe.mockResolvedValue(undefined)
    const wrapper = mount(NewsletterForm)
    await wrapper.find('[data-testid="newsletter-email"]').setValue('user@example.com')
    await wrapper.find('form').trigger('submit.prevent')
    expect(mockSubscribe).toHaveBeenCalledWith('user@example.com')
  })

  it('does NOT subscribe with invalid email', async () => {
    mockValidateEmail.mockReturnValue(false)
    const wrapper = mount(NewsletterForm)
    await wrapper.find('[data-testid="newsletter-email"]').setValue('invalid')
    await wrapper.find('form').trigger('submit.prevent')
    expect(mockSubscribe).not.toHaveBeenCalled()
  })

  it('does NOT subscribe with empty email', async () => {
    mockValidateEmail.mockReturnValue(false)
    const wrapper = mount(NewsletterForm)
    await wrapper.find('form').trigger('submit.prevent')
    expect(mockSubscribe).not.toHaveBeenCalled()
  })

  it('does NOT subscribe when loading', async () => {
    mockValidateEmail.mockReturnValue(true)
    mockSubscribe.mockResolvedValue(undefined)
    mockStatus.value = 'loading'
    const wrapper = mount(NewsletterForm)
    await wrapper.find('[data-testid="newsletter-email"]').setValue('user@example.com')
    await wrapper.find('form').trigger('submit.prevent')
    expect(mockSubscribe).not.toHaveBeenCalled()
  })

  it('shows loading text when loading', async () => {
    mockStatus.value = 'loading'
    const wrapper = mount(NewsletterForm)
    await flushPromises()
    const btn = wrapper.find('[data-testid="newsletter-submit"]')
    expect(btn.text()).toContain('Inscrevendo...')
  })

  it('shows success message when success', async () => {
    mockStatus.value = 'success'
    const wrapper = mount(NewsletterForm)
    await flushPromises()
    expect(wrapper.find('[data-testid="newsletter-success"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Inscrição confirmada!')
  })

  it('shows translated error message for already-subscribed', async () => {
    mockStatus.value = 'error'
    mockErrorMessage.value = 'already-subscribed'
    const wrapper = mount(NewsletterForm)
    await flushPromises()
    expect(wrapper.find('[data-testid="newsletter-error"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Este e-mail já está inscrito')
  })

  it('shows translated error message for invalid-email', async () => {
    mockStatus.value = 'error'
    mockErrorMessage.value = 'invalid-email'
    const wrapper = mount(NewsletterForm)
    await flushPromises()
    expect(wrapper.text()).toContain('E-mail inválido')
  })

  it('shows translated error message for rate-limited', async () => {
    mockStatus.value = 'error'
    mockErrorMessage.value = 'rate-limited'
    const wrapper = mount(NewsletterForm)
    await flushPromises()
    expect(wrapper.text()).toContain('Muitas tentativas')
  })

  it('shows translated error message for service-unavailable', async () => {
    mockStatus.value = 'error'
    mockErrorMessage.value = 'service-unavailable'
    const wrapper = mount(NewsletterForm)
    await flushPromises()
    expect(wrapper.text()).toContain('Servico indisponivel')
  })

  it('shows translated error message for subscribe-failed (generic)', async () => {
    mockStatus.value = 'error'
    mockErrorMessage.value = 'subscribe-failed'
    const wrapper = mount(NewsletterForm)
    await flushPromises()
    expect(wrapper.text()).toContain('Erro ao inscrever')
  })

  it('shows translated error message for unknown-error (generic)', async () => {
    mockStatus.value = 'error'
    mockErrorMessage.value = 'unknown-error'
    const wrapper = mount(NewsletterForm)
    await flushPromises()
    expect(wrapper.text()).toContain('Erro ao inscrever')
  })

  it('falls back to generic for unmapped error code', async () => {
    mockStatus.value = 'error'
    mockErrorMessage.value = 'some-future-error-code'
    const wrapper = mount(NewsletterForm)
    await flushPromises()
    expect(wrapper.text()).toContain('Erro ao inscrever')
  })

  // --- KILL SURVIVING MUTANTS ---

  it('submit button disabled when loading', async () => {
    mockStatus.value = 'loading'
    const wrapper = mount(NewsletterForm)
    await flushPromises()
    expect(wrapper.find('[data-testid="newsletter-submit"]').attributes('disabled')).toBeDefined()
  })

  it('submit button disabled when success', async () => {
    mockStatus.value = 'success'
    const wrapper = mount(NewsletterForm)
    await flushPromises()
    // Form is hidden (v-if="!isSuccess"), so submit button doesn't exist
    expect(wrapper.find('[data-testid="newsletter-submit"]').exists()).toBe(false)
  })

  it('email input disabled when loading', async () => {
    mockStatus.value = 'loading'
    const wrapper = mount(NewsletterForm)
    await flushPromises()
    expect(wrapper.find('[data-testid="newsletter-email"]').attributes('disabled')).toBeDefined()
  })

  it('form hidden when success', async () => {
    mockStatus.value = 'success'
    const wrapper = mount(NewsletterForm)
    await flushPromises()
    expect(wrapper.find('form').exists()).toBe(false)
  })

  it('trims email before subscribing', async () => {
    mockValidateEmail.mockReturnValue(true)
    mockSubscribe.mockResolvedValue(undefined)
    const wrapper = mount(NewsletterForm)
    await wrapper.find('[data-testid="newsletter-email"]').setValue('  user@example.com  ')
    await wrapper.find('form').trigger('submit.prevent')
    expect(mockSubscribe).toHaveBeenCalledWith('user@example.com')
  })

  it('does NOT subscribe with whitespace-only email', async () => {
    mockValidateEmail.mockReturnValue(false)
    const wrapper = mount(NewsletterForm)
    await wrapper.find('[data-testid="newsletter-email"]').setValue('   ')
    await wrapper.find('form').trigger('submit.prevent')
    expect(mockSubscribe).not.toHaveBeenCalled()
  })

  it('idle button text is "Inscrever"', () => {
    const wrapper = mount(NewsletterForm)
    const btn = wrapper.find('[data-testid="newsletter-submit"]')
    expect(btn.text()).toContain('Inscrever')
  })

  // --- KILL REMAINING MUTANTS ---

  it('email input starts empty', () => {
    const wrapper = mount(NewsletterForm)
    expect(wrapper.find('[data-testid="newsletter-email"]').element.value).toBe('')
  })

  it('error message NOT visible when idle', () => {
    const wrapper = mount(NewsletterForm)
    expect(wrapper.find('[data-testid="newsletter-error"]').exists()).toBe(false)
  })

  it('displayError returns empty when errorMessage is empty (branch coverage)', async () => {
    // Status is 'error' but errorMessage is '' — forces computed evaluation
    mockStatus.value = 'error'
    mockErrorMessage.value = ''
    const wrapper = mount(NewsletterForm)
    await flushPromises()
    // The error <p> exists (isError=true) but displayError is ''
    const errorEl = wrapper.find('[data-testid="newsletter-error"]')
    expect(errorEl.exists()).toBe(true)
    // displayError computed returned '' — no translated text rendered
    expect(errorEl.text()).toBe('')
  })

  it('submit button NOT disabled when idle', () => {
    const wrapper = mount(NewsletterForm)
    expect(wrapper.find('[data-testid="newsletter-submit"]').attributes('disabled')).toBeUndefined()
  })

  it('subscribe called with trimmed email (no surrounding spaces)', async () => {
    mockValidateEmail.mockReturnValue(true)
    mockSubscribe.mockResolvedValue(undefined)
    const wrapper = mount(NewsletterForm)
    await wrapper.find('[data-testid="newsletter-email"]').setValue('  user@example.com  ')
    await wrapper.find('form').trigger('submit.prevent')
    expect(mockSubscribe).toHaveBeenCalledWith('user@example.com')
    // Explicitly verify the argument does NOT have spaces
    const callArg = mockSubscribe.mock.calls[0]?.[0]
    expect(callArg).not.toContain(' ')
  })

  it('does NOT call subscribe when loading even with valid email', async () => {
    mockValidateEmail.mockReturnValue(true)
    mockSubscribe.mockResolvedValue(undefined)
    mockStatus.value = 'loading'
    const wrapper = mount(NewsletterForm)
    await wrapper.find('[data-testid="newsletter-email"]').setValue('user@example.com')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()
    expect(mockSubscribe).not.toHaveBeenCalled()
  })
})
