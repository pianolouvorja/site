import { describe, it, expect, beforeEach, vi } from 'vitest'

// --- Mocks ---

const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

vi.stubGlobal('useRuntimeConfig', () => ({
  public: {
    buttondownApiKey: 'bd_test_key',
    buttondownEndpoint: 'https://api.buttondown.com/api/v1/subscribers',
  },
}))

// Mock useI18n — returns locale ref that tests can control
const mockLocale = { value: 'pt-BR' }
vi.stubGlobal('useI18n', () => ({ locale: mockLocale }))

// Import AFTER mocks are set up
import { useNewsletter } from '~/composables/useNewsletter'

describe('useNewsletter', () => {
  beforeEach(() => {
    mockFetch.mockReset()
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
    it('chama $fetch com endpoint, headers e body corretos (inclui locale)', async () => {
      mockFetch.mockResolvedValueOnce({ id: '123' })
      const { subscribe } = useNewsletter()

      await subscribe('user@example.com')

      expect(mockFetch).toHaveBeenCalledWith('https://api.buttondown.com/api/v1/subscribers', {
        method: 'POST',
        headers: {
          Authorization: 'Token bd_test_key',
          'Content-Type': 'application/json',
        },
        body: {
          email: 'user@example.com',
          metadata: { locale: 'pt-BR' },
        },
      })
    })

    it('envia locale correto quando useI18n retorna en', async () => {
      mockLocale.value = 'en'
      mockFetch.mockResolvedValueOnce({ id: '123' })
      const { subscribe } = useNewsletter()

      await subscribe('user@example.com')

      const callArgs = mockFetch.mock.calls[0]![1] as { body: Record<string, unknown> }
      expect(callArgs.body.metadata).toEqual({ locale: 'en' })
      mockLocale.value = 'pt-BR' // reset
    })

    it('define status como success apos inscricao bem-sucedida', async () => {
      mockFetch.mockResolvedValueOnce({ id: '123' })
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

    it('define status error e errorMessage quando API retorna erro', async () => {
      mockFetch.mockRejectedValueOnce({
        data: { detail: 'Email already subscribed.' },
      })
      const { subscribe, status, errorMessage } = useNewsletter()

      await subscribe('user@example.com')

      expect(status.value).toBe('error')
      expect(errorMessage.value).toBe('already-subscribed')
    })

    it('define status error quando API rejeita com Error generico', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Unexpected failure'))
      const { subscribe, status, errorMessage } = useNewsletter()

      await subscribe('user@example.com')

      expect(status.value).toBe('error')
      expect(errorMessage.value).toBe('unknown-error')
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

      resolveFn!({ id: '123' })
      await promise

      expect(status.value).toBe('success')
    })

    it('reseta errorMessage para string vazia ao iniciar nova inscricao valida', async () => {
      const { subscribe, errorMessage } = useNewsletter()
      // Forca um erro primeiro
      mockFetch.mockRejectedValueOnce({ data: { detail: 'Some error' } })
      await subscribe('user@example.com')
      expect(errorMessage.value).toBe('subscribe-failed')

      // Agora sucesso: errorMessage deve ser resetado para '' no inicio
      mockFetch.mockResolvedValueOnce({ id: '123' })
      await subscribe('user@example.com')
      expect(errorMessage.value).toBe('')
    })

    it('reseta status para idle antes de nova tentativa', async () => {
      mockFetch.mockResolvedValueOnce({ id: '123' })
      const { subscribe, status } = useNewsletter()

      await subscribe('user@example.com')
      expect(status.value).toBe('success')

      mockFetch.mockResolvedValueOnce({ id: '456' })
      await subscribe('other@example.com')
      expect(status.value).toBe('success')
    })

    it('extrai detail de erro no formato Buttondown', async () => {
      mockFetch.mockRejectedValueOnce({
        data: { detail: 'Invalid email format.' },
      })
      const { subscribe, errorMessage } = useNewsletter()

      await subscribe('user@example.com')

      expect(errorMessage.value).toBe('invalid-email')
    })

    it('define errorMessage como unknown-error quando erro nao tem detail nem message', async () => {
      mockFetch.mockRejectedValueOnce({})
      const { subscribe, errorMessage } = useNewsletter()

      await subscribe('user@example.com')

      expect(errorMessage.value).toBe('unknown-error')
    })

    it('usa e.message quando erro tem message mas nao data.detail', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Something went wrong'))
      const { subscribe, errorMessage } = useNewsletter()

      await subscribe('user@example.com')

      expect(errorMessage.value).toBe('unknown-error')
    })

    it('usa e.data.detail quando erro tem data.detail', async () => {
      mockFetch.mockRejectedValueOnce({
        data: { detail: 'already subscribed' },
      })
      const { subscribe, errorMessage } = useNewsletter()

      await subscribe('user@example.com')

      expect(errorMessage.value).toBe('already-subscribed')
    })

    it('define errorMessage como rate-limited quando API retorna rate limit', async () => {
      mockFetch.mockRejectedValueOnce({
        data: { detail: 'rate limit exceeded' },
      })
      const { subscribe, errorMessage } = useNewsletter()

      await subscribe('user@example.com')

      expect(errorMessage.value).toBe('rate-limited')
    })

    it('define errorMessage como rate-limited quando erro contem too many', async () => {
      mockFetch.mockRejectedValueOnce({
        data: { detail: 'too many requests' },
      })
      const { subscribe, errorMessage } = useNewsletter()

      await subscribe('user@example.com')

      expect(errorMessage.value).toBe('rate-limited')
    })

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

    // --- mapErrorToCode: message-based service-unavailable paths ---

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

    // --- mapErrorToCode: detail-based already-subscribed variant ---

    it('define errorMessage como already-subscribed quando detail contem already exists', async () => {
      mockFetch.mockRejectedValueOnce({
        data: { detail: 'Subscriber already exists' },
      })
      const { subscribe, errorMessage } = useNewsletter()

      await subscribe('user@example.com')

      expect(errorMessage.value).toBe('already-subscribed')
    })
  })

  describe('validateEmail regex', () => {
    it('rejeita email sem extensao de dominio (sem ponto apos @)', () => {
      const { validateEmail } = useNewsletter()
      // "user@domain" sem ponto - se o regex perde o \. este passa
      expect(validateEmail('user@domain')).toBe(false)
    })

    it('rejeita email com ponto mas sem extensao valida', () => {
      const { validateEmail } = useNewsletter()
      // "a@b." - sem chars apos o ponto
      expect(validateEmail('a@b.')).toBe(false)
    })

    it('rejeita email que precisa da ancora final $', () => {
      const { validateEmail } = useNewsletter()
      // "a@b.com trailing" - sem $ o regex encontraria match parcial
      expect(validateEmail('a@b.com trailing')).toBe(false)
    })

    it('rejeita email com espaco apos dominio valido', () => {
      const { validateEmail } = useNewsletter()
      expect(validateEmail('a@b.com ')).toBe(false)
    })

    it('rejeita email com texto antes do email valido (sem ancora inicial ^)', () => {
      const { validateEmail } = useNewsletter()
      // Sem ^, o regex daria match parcial em "xyz a@b.com"
      expect(validateEmail('xyz a@b.com')).toBe(false)
    })

    it('aceita email com subdominios multiplos', () => {
      const { validateEmail } = useNewsletter()
      expect(validateEmail('user@mail.example.co.uk')).toBe(true)
    })
  })

  describe('reset', () => {
    it('reseta status para idle e errorMessage para vazio', async () => {
      mockFetch.mockResolvedValueOnce({ id: '123' })
      const { subscribe, reset, status, errorMessage } = useNewsletter()

      await subscribe('user@example.com')
      reset()

      expect(status.value).toBe('idle')
      expect(errorMessage.value).toBe('')
    })
  })
})
