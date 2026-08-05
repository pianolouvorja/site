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
    it('chama $fetch com endpoint, headers e body corretos', async () => {
      mockFetch.mockResolvedValueOnce({ id: '123' })
      const { subscribe } = useNewsletter()

      await subscribe('user@example.com')

      expect(mockFetch).toHaveBeenCalledWith('https://api.buttondown.com/api/v1/subscribers', {
        method: 'POST',
        headers: {
          Authorization: 'Token bd_test_key',
          'Content-Type': 'application/json',
        },
        body: { email: 'user@example.com' },
      })
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
      expect(errorMessage.value).toBeTruthy()
    })

    it('define status error e errorMessage quando API retorna erro', async () => {
      mockFetch.mockRejectedValueOnce({
        data: { detail: 'Email already subscribed.' },
      })
      const { subscribe, status, errorMessage } = useNewsletter()

      await subscribe('user@example.com')

      expect(status.value).toBe('error')
      expect(errorMessage.value).toContain('already subscribed')
    })

    it('define status error quando API rejeita com Error generico', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))
      const { subscribe, status, errorMessage } = useNewsletter()

      await subscribe('user@example.com')

      expect(status.value).toBe('error')
      expect(errorMessage.value).toBeTruthy()
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

      expect(errorMessage.value).toBe('Invalid email format.')
    })

    it('define errorMessage como unknown-error quando erro nao tem detail nem message', async () => {
      mockFetch.mockRejectedValueOnce({})
      const { subscribe, errorMessage } = useNewsletter()

      await subscribe('user@example.com')

      expect(errorMessage.value).toBe('unknown-error')
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
