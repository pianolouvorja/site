import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'

// --- Mocks ---

const mockStatus = ref<string>('idle')
const mockErrorMessage = ref<string>('')
const mockSubscribe = vi.fn()
const mockValidateEmail = vi.fn()
const mockReset = vi.fn()

vi.mock('~/composables/useNewsletter', () => ({
  useNewsletter: () => ({
    status: mockStatus,
    errorMessage: mockErrorMessage,
    validateEmail: mockValidateEmail,
    subscribe: mockSubscribe,
    reset: mockReset,
  }),
}))

// --- i18n mock ---
// In Nuxt, $t() is provided via app.provide, so we must mock it via global.mocks
// on mount(), not via vi.stubGlobal which only covers composition API useI18n().

const I18N_MOCK = {
  $t: (key: string) => {
    const translations: Record<string, string> = {
      'newsletter.title': 'Receba novidades',
      'newsletter.subtitle': 'Inscreva-se para atualizações',
      'newsletter.placeholder': 'Seu e-mail',
      'newsletter.button': 'Inscrever',
      'newsletter.loading': 'Enviando...',
      'newsletter.success': 'Inscrição confirmada!',
      'newsletter.errorInvalid': 'E-mail inválido',
      'newsletter.errorGeneric': 'Erro ao inscrever',
    }
    return translations[key] ?? key
  },
}

// Import AFTER mocks
import NewsletterForm from '~/components/NewsletterForm.vue'

function mountNewsletter() {
  return mount(NewsletterForm, { global: { mocks: I18N_MOCK } })
}

describe('NewsletterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStatus.value = 'idle'
    mockErrorMessage.value = ''
  })

  describe('renderização', () => {
    it('renderiza o título da newsletter', () => {
      const wrapper = mountNewsletter()
      expect(wrapper.text()).toContain('Receba novidades')
    })

    it('renderiza o subtítulo da newsletter', () => {
      const wrapper = mountNewsletter()
      expect(wrapper.text()).toContain('Seja avisado sobre')
    })

    it('tem um campo de input de email', () => {
      const wrapper = mountNewsletter()
      const input = wrapper.find('[data-testid="newsletter-email"]')
      expect(input.exists()).toBe(true)
      expect(input.attributes('type')).toBe('email')
    })

    it('tem um botão de submit', () => {
      const wrapper = mountNewsletter()
      const btn = wrapper.find('[data-testid="newsletter-submit"]')
      expect(btn.exists()).toBe(true)
    })

    it('renderiza o placeholder no input', () => {
      const wrapper = mountNewsletter()
      const input = wrapper.find('[data-testid="newsletter-email"]')
      expect(input.attributes('placeholder')).toBe('Seu melhor e-mail')
    })
  })

  describe('estados visuais', () => {
    it('mostra texto "Inscrever" no botão quando idle', () => {
      const wrapper = mountNewsletter()
      const btn = wrapper.find('[data-testid="newsletter-submit"]')
      expect(btn.text()).toContain('Inscrever')
    })

    it('mostra texto de loading quando status é loading', async () => {
      mockStatus.value = 'loading'
      const wrapper = mountNewsletter()
      await flushPromises()
      const btn = wrapper.find('[data-testid="newsletter-submit"]')
      expect(btn.text()).toContain('Inscrevendo...')
    })

    it('mostra mensagem de sucesso quando status é success', async () => {
      mockStatus.value = 'success'
      const wrapper = mountNewsletter()
      await flushPromises()
      expect(wrapper.text()).toContain('Inscrição confirmada!')
    })

    it('mostra mensagem de erro quando status é error', async () => {
      mockStatus.value = 'error'
      mockErrorMessage.value = 'Email already subscribed.'
      const wrapper = mountNewsletter()
      await flushPromises()
      expect(wrapper.text()).toContain('Email already subscribed.')
    })

    it('desabilita o botão quando status é loading', async () => {
      mockStatus.value = 'loading'
      const wrapper = mountNewsletter()
      await flushPromises()
      const btn = wrapper.find('[data-testid="newsletter-submit"]')
      expect(btn.attributes('disabled')).toBeDefined()
    })
  })

  describe('interação', () => {
    it('chama subscribe ao submeter email válido', async () => {
      mockValidateEmail.mockReturnValue(true)
      mockSubscribe.mockResolvedValue(undefined)
      const wrapper = mountNewsletter()

      const input = wrapper.find('[data-testid="newsletter-email"]')
      await input.setValue('user@example.com')

      const form = wrapper.find('form')
      await form.trigger('submit.prevent')

      expect(mockSubscribe).toHaveBeenCalledWith('user@example.com')
    })

    it('não chama subscribe quando email é inválido', async () => {
      mockValidateEmail.mockReturnValue(false)
      const wrapper = mountNewsletter()

      const input = wrapper.find('[data-testid="newsletter-email"]')
      await input.setValue('invalid')

      const form = wrapper.find('form')
      await form.trigger('submit.prevent')

      expect(mockSubscribe).not.toHaveBeenCalled()
    })

    it('não chama subscribe com email vazio', async () => {
      mockValidateEmail.mockReturnValue(false)
      const wrapper = mountNewsletter()

      const form = wrapper.find('form')
      await form.trigger('submit.prevent')

      expect(mockSubscribe).not.toHaveBeenCalled()
    })

    it('não chama subscribe quando já está loading', async () => {
      mockValidateEmail.mockReturnValue(true)
      mockSubscribe.mockResolvedValue(undefined)
      mockStatus.value = 'loading'
      const wrapper = mountNewsletter()

      const input = wrapper.find('[data-testid="newsletter-email"]')
      await input.setValue('user@example.com')

      const form = wrapper.find('form')
      await form.trigger('submit.prevent')

      expect(mockSubscribe).not.toHaveBeenCalled()
    })
  })

  describe('após sucesso', () => {
    it('permite nova inscrição após sucesso (reset)', async () => {
      mockValidateEmail.mockReturnValue(true)
      mockSubscribe.mockResolvedValue(undefined)
      const wrapper = mountNewsletter()

      const input = wrapper.find('[data-testid="newsletter-email"]')

      await input.setValue('user@example.com')
      const form = wrapper.find('form')
      await form.trigger('submit.prevent')

      // Simula sucesso
      mockStatus.value = 'success'

      // Limpa o input e faz nova inscrição
      await input.setValue('')
      await input.setValue('other@example.com')
      await form.trigger('submit.prevent')

      expect(mockSubscribe).toHaveBeenCalledTimes(2)
    })
  })
})
