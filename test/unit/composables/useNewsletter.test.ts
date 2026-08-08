import { describe, it, expect, beforeEach, vi } from 'vitest'

// --- Mocks ---

const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

// Mock useI18n — returns locale ref that tests can control
const mockLocale = { value: 'pt-BR' }
vi.stubGlobal('useI18n', () => ({ locale: mockLocale }))

// Import AFTER mocks are set up
import { useNewsletter } from '~/composables/useNewsletter'

describe('useNewsletter', () => {
  beforeEach(() => {
    mockFetch.mockReset()
    mockLocale.value = 'pt-BR'
  })

  describe('estado inicial', () => {
    it('inicia com status idle', () => {
      const { status } = useNewsletter()
      expect(status.value).toBe('idle')
    })

    it('inicia com errorMessage vazio', () => {
      const { errorMessage } = useNewsletter()
      expect(errorMessage.value).toBe('')
    })
  })

  describe('validateEmail', () => {
    it('aceita email valido', () => {
      const { validateEmail } = useNewsletter()
      expect(validateEmail('user@example.com')).toBe(true)
    })

    it('rejeita email sem @', () => {
      const { validateEmail } = useNewsletter()
      expect(validateEmail('userexample.com')).toBe(false)
    })

    it('rejeita email sem dominio', () => {
      const { validateEmail } = useNewsletter()
      expect(validateEmail('user@')).toBe(false)
    })

    it('rejeita string vazia', () => {
      const { validateEmail } = useNewsletter()
      expect(validateEmail('')).toBe(false)
    })

    it('rejeita email com espacos', () => {
      const { validateEmail } = useNewsletter()
      expect(validateEmail(' user@example.com ')).toBe(false)
    })
  })

  describe('subscribe', () => {
    it('chama /api/newsletter/subscribe com email e locale', async () => {
      mockFetch.mockResolvedValueOnce({ success: true })
      const { subscribe } = useNewsletter()

      await subscribe('user@example.com')

      expect(mockFetch).toHaveBeenCalledWith('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: {
          email: 'user@example.com',
          metadata: { locale: 'pt-BR' },
        },
      })
    })

    it('envia locale correto quando useI18n retorna en', async () => {
      mockLocale.value = 'en'
      mockFetch.mockResolvedValueOnce({ success: true })
      const { subscribe } = useNewsletter()

      await subscribe('user@example.com')

      const callArgs = mockFetch.mock.calls[0]![1] as { body: Record<string, unknown> }
      expect(callArgs.body.metadata).toEqual({ locale: 'en' })
    })

    it('define status como success apos inscricao bem-sucedida', async () => {
      mockFetch.mockResolvedValueOnce({ success: true })
      const { subscribe, status } = useNewsletter()

      await subscribe('user@example.com')

      expect(status.value).toBe('success')
    })

    it('rejeita email invalido sem chamar $fetch', async () => {
      const { subscribe, status, errorMessage } = useNewsletter()

      await subscribe('invalid')

      expect(mockFetch).not.toHaveBeenCalled()
      expect(status.value).toBe('error')
      expect(errorMessage.value).toBe('invalid-email')
    })

    it('extrai error code de resposta estruturada do servidor', async () => {
      mockFetch.mockRejectedValueOnce({
        data: { code: 'already-subscribed' },
      })
      const { subscribe, status, errorMessage } = useNewsletter()

      await subscribe('user@example.com')

      expect(status.value).toBe('error')
      expect(errorMessage.value).toBe('already-subscribed')
    })

    it('extrai error code service-unavailable de resposta estruturada', async () => {
      mockFetch.mockRejectedValueOnce({
        data: { code: 'service-unavailable' },
      })
      const { subscribe, errorMessage } = useNewsletter()

      await subscribe('user@example.com')

      expect(errorMessage.value).toBe('service-unavailable')
    })

    it('extrai error code rate-limited de resposta estruturada', async () => {
      mockFetch.mockRejectedValueOnce({
        data: { code: 'rate-limited' },
      })
      const { subscribe, errorMessage } = useNewsletter()

      await subscribe('user@example.com')

      expect(errorMessage.value).toBe('rate-limited')
    })

    it('extrai error code invalid-email de resposta estruturada', async () => {
      mockFetch.mockRejectedValueOnce({
        data: { code: 'invalid-email' },
      })
      const { subscribe, errorMessage } = useNewsletter()

      await subscribe('user@example.com')

      expect(errorMessage.value).toBe('invalid-email')
    })

    it('define errorMessage como unknown-error quando erro e null', async () => {
      mockFetch.mockRejectedValueOnce(null)
      const { subscribe, errorMessage } = useNewsletter()

      await subscribe('user@example.com')

      expect(errorMessage.value).toBe('unknown-error')
    })

    it('define errorMessage como unknown-error quando erro e undefined', async () => {
      mockFetch.mockRejectedValueOnce(undefined)
      const { subscribe, errorMessage } = useNewsletter()

      await subscribe('user@example.com')

      expect(errorMessage.value).toBe('unknown-error')
    })

    it('define status como loading durante a requisicao', async () => {
      let resolveFn: (v: unknown) => void
      mockFetch.mockReturnValueOnce(
        new Promise((resolve) => {
          resolveFn = resolve
        }),
      )
      const { subscribe, status } = useNewsletter()

      const promise = subscribe('user@example.com')
      expect(status.value).toBe('loading')

      resolveFn!({ success: true })
      await promise

      expect(status.value).toBe('success')
    })

    it('reseta errorMessage para string vazia ao iniciar nova inscricao valida', async () => {
      const { subscribe, errorMessage } = useNewsletter()
      mockFetch.mockRejectedValueOnce({ data: { code: 'service-unavailable' } })
      await subscribe('user@example.com')
      expect(errorMessage.value).toBe('service-unavailable')

      mockFetch.mockResolvedValueOnce({ success: true })
      await subscribe('user@example.com')
      expect(errorMessage.value).toBe('')
    })

    it('reseta status para idle antes de nova tentativa', async () => {
      mockFetch.mockResolvedValueOnce({ success: true })
      const { subscribe, status } = useNewsletter()

      await subscribe('user@example.com')
      expect(status.value).toBe('success')

      mockFetch.mockResolvedValueOnce({ success: true })
      await subscribe('other@example.com')
      expect(status.value).toBe('success')
    })

    it('define errorMessage como unknown-error quando erro nao tem code nem message', async () => {
      mockFetch.mockRejectedValueOnce({})
      const { subscribe, errorMessage } = useNewsletter()

      await subscribe('user@example.com')

      expect(errorMessage.value).toBe('unknown-error')
    })

    // --- mapErrorToCode: message-based service-unavailable paths ---

    it('define errorMessage como service-unavailable quando erro contem 404', async () => {
      mockFetch.mockRejectedValueOnce(new Error('404 Not Found'))
      const { subscribe, errorMessage } = useNewsletter()

      await subscribe('user@example.com')

      expect(errorMessage.value).toBe('service-unavailable')
    })

    it('define errorMessage como service-unavailable quando erro contem Not Found', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Not Found'))
      const { subscribe, errorMessage } = useNewsletter()

      await subscribe('user@example.com')

      expect(errorMessage.value).toBe('service-unavailable')
    })

    it('define errorMessage como service-unavailable quando erro contem 503', async () => {
      mockFetch.mockRejectedValueOnce(new Error('503 Service Unavailable'))
      const { subscribe, errorMessage } = useNewsletter()

      await subscribe('user@example.com')

      expect(errorMessage.value).toBe('service-unavailable')
    })

    it('define errorMessage como service-unavailable quando erro contem service unavailable', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Service Unavailable'))
      const { subscribe, errorMessage } = useNewsletter()

      await subscribe('user@example.com')

      expect(errorMessage.value).toBe('service-unavailable')
    })

    it('define errorMessage como service-unavailable quando erro contem timeout', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Request timeout'))
      const { subscribe, errorMessage } = useNewsletter()

      await subscribe('user@example.com')

      expect(errorMessage.value).toBe('service-unavailable')
    })

    it('define errorMessage como service-unavailable quando erro contem timed out', async () => {
      mockFetch.mockRejectedValueOnce(new Error('timed out'))
      const { subscribe, errorMessage } = useNewsletter()

      await subscribe('user@example.com')

      expect(errorMessage.value).toBe('service-unavailable')
    })

    it('define errorMessage como service-unavailable quando erro contem network', async () => {
      mockFetch.mockRejectedValueOnce(new Error('network error'))
      const { subscribe, errorMessage } = useNewsletter()

      await subscribe('user@example.com')

      expect(errorMessage.value).toBe('service-unavailable')
    })

    it('define errorMessage como service-unavailable quando erro contem fetch failed', async () => {
      mockFetch.mockRejectedValueOnce(new Error('fetch failed'))
      const { subscribe, errorMessage } = useNewsletter()

      await subscribe('user@example.com')

      expect(errorMessage.value).toBe('service-unavailable')
    })

    it('define errorMessage como service-unavailable quando erro contem ECONNREFUSED', async () => {
      mockFetch.mockRejectedValueOnce(new Error('ECONNREFUSED'))
      const { subscribe, errorMessage } = useNewsletter()

      await subscribe('user@example.com')

      expect(errorMessage.value).toBe('service-unavailable')
    })

    it('define errorMessage como service-unavailable quando erro contem ECONNRESET', async () => {
      mockFetch.mockRejectedValueOnce(new Error('ECONNRESET'))
      const { subscribe, errorMessage } = useNewsletter()

      await subscribe('user@example.com')

      expect(errorMessage.value).toBe('service-unavailable')
    })

    it('define errorMessage como unknown-error quando erro tem message irreconhecivel', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Something went wrong'))
      const { subscribe, errorMessage } = useNewsletter()

      await subscribe('user@example.com')

      expect(errorMessage.value).toBe('unknown-error')
    })
  })

  describe('validateEmail regex', () => {
    it('rejeita email sem extensao de dominio (sem ponto apos @)', () => {
      const { validateEmail } = useNewsletter()
      expect(validateEmail('user@domain')).toBe(false)
    })

    it('rejeita email com ponto mas sem extensao valida', () => {
      const { validateEmail } = useNewsletter()
      expect(validateEmail('a@b.')).toBe(false)
    })

    it('rejeita email que precisa da ancora final $', () => {
      const { validateEmail } = useNewsletter()
      expect(validateEmail('a@b.com trailing')).toBe(false)
    })

    it('rejeita email com espaco apos dominio valido', () => {
      const { validateEmail } = useNewsletter()
      expect(validateEmail('a@b.com ')).toBe(false)
    })

    it('rejeita email com texto antes do email valido (sem ancora inicial ^)', () => {
      const { validateEmail } = useNewsletter()
      expect(validateEmail('xyz a@b.com')).toBe(false)
    })

    it('aceita email com subdominios multiplos', () => {
      const { validateEmail } = useNewsletter()
      expect(validateEmail('user@mail.example.co.uk')).toBe(true)
    })
  })

  describe('reset', () => {
    it('reseta status para idle e errorMessage para vazio', async () => {
      mockFetch.mockResolvedValueOnce({ success: true })
      const { subscribe, reset, status, errorMessage } = useNewsletter()

      await subscribe('user@example.com')
      reset()

      expect(status.value).toBe('idle')
      expect(errorMessage.value).toBe('')
    })
  })
})
