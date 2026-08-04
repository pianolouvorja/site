import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import WelcomePopup from '../../../app/components/WelcomePopup.vue'
import { nextTick } from 'vue'

// Mock sessionStorage
const sessionStore: Record<string, string> = {}
vi.stubGlobal('sessionStorage', {
  getItem: (key: string) => sessionStore[key] ?? null,
  setItem: (key: string, val: string) => {
    sessionStore[key] = val
  },
  removeItem: (key: string) => {
    delete sessionStore[key]
  },
})

// Mock useCookie
const mockCookieValue = { value: null as string | null }
vi.stubGlobal('useCookie', () => mockCookieValue)

// Mock useI18n to return t function
const mockT = (key: string) => {
  const translations: Record<string, string> = {
    'welcomePopup.title': 'Baixe o PianoLouvorJA grátis',
    'welcomePopup.description': 'Acompanhe hinários da Igreja Adventista',
    'welcomePopup.close': 'Fechar',
    'welcomePopup.cta': 'Ver opções de download',
    'welcomePopup.secondaryCta': 'Continuar navegando',
  }
  return translations[key] ?? key
}
vi.stubGlobal('useI18n', () => ({ t: mockT }))

// Mock useLocalePath — returns the path as-is (default locale has no prefix)
vi.stubGlobal('useLocalePath', () => (path: string) => path)

// Mock import.meta.client
vi.stubGlobal('import', { meta: { env: {} } })
;(globalThis as Record<string, unknown>).import = { meta: { client: false } }

// Mock window.innerWidth (desktop by default)
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
})

const mountWelcomePopup = () => {
  return mount(WelcomePopup, {
    global: {
      stubs: {
        NuxtLink: true,
        Teleport: true,
        Transition: true,
      },
    },
  })
}

describe('WelcomePopup', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockCookieValue.value = null
    // Clear sessionStorage
    Object.keys(sessionStore).forEach((k) => delete sessionStore[k])
    // Reset to desktop width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
    // Clean up event listeners
    document.body.innerHTML = ''
  })

  it('não deve renderizar imediatamente', () => {
    const wrapper = mountWelcomePopup()
    expect(wrapper.find('[data-testid="welcome-popup"]').exists()).toBe(false)
  })

  it('não deve renderizar no desktop sem exit intent', async () => {
    const wrapper = mountWelcomePopup()
    // Avança tempo — desktop só mostra no mouseleave
    vi.advanceTimersByTime(30000)
    await nextTick()
    expect(wrapper.find('[data-testid="welcome-popup"]').exists()).toBe(false)
  })

  it('deve renderizar no desktop quando mouse sai do topo (exit intent)', async () => {
    const wrapper = mountWelcomePopup()
    await nextTick()

    // Simula mouseleave para cima (exit intent)
    const event = new MouseEvent('mouseleave', {
      clientY: 0,
      bubbles: true,
    })
    document.dispatchEvent(event)
    await nextTick()

    expect(wrapper.find('[data-testid="welcome-popup"]').exists()).toBe(true)
  })

  it('não deve renderizar se o cookie já existe (visitante retornando)', async () => {
    mockCookieValue.value = 'true'
    const wrapper = mountWelcomePopup()
    await nextTick()

    const event = new MouseEvent('mouseleave', {
      clientY: 0,
      bubbles: true,
    })
    document.dispatchEvent(event)
    await nextTick()

    expect(wrapper.find('[data-testid="welcome-popup"]').exists()).toBe(false)
  })

  it('deve fechar ao clicar no botão fechar e setar cookie', async () => {
    const wrapper = mountWelcomePopup()
    await nextTick()

    // Trigger exit intent
    const event = new MouseEvent('mouseleave', {
      clientY: 0,
      bubbles: true,
    })
    document.dispatchEvent(event)
    await nextTick()

    expect(wrapper.find('[data-testid="welcome-popup"]').exists()).toBe(true)

    // Click close
    const closeBtn = wrapper.find('[data-testid="welcome-close"]')
    await closeBtn.trigger('click')
    await nextTick()

    expect(wrapper.find('[data-testid="welcome-popup"]').exists()).toBe(false)
    expect(mockCookieValue.value).toBe('true')
  })

  it('deve ter botão CTA apontando para /download', async () => {
    const wrapper = mountWelcomePopup()
    await nextTick()

    // Trigger exit intent
    const event = new MouseEvent('mouseleave', {
      clientY: 0,
      bubbles: true,
    })
    document.dispatchEvent(event)
    await nextTick()

    const cta = wrapper.find('[data-testid="welcome-cta"]')
    expect(cta.exists()).toBe(true)
    expect(cta.attributes('to')).toBe('/download')
  })

  it('mobile: deve mostrar após 20s', async () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    })

    const wrapper = mountWelcomePopup()
    await nextTick()

    vi.advanceTimersByTime(20000)
    await nextTick()

    expect(wrapper.find('[data-testid="welcome-popup"]').exists()).toBe(true)
  })

  it('mobile: não deve mostrar antes de 20s sem scroll', async () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    })

    const wrapper = mountWelcomePopup()
    await nextTick()

    vi.advanceTimersByTime(7000)
    await nextTick()

    expect(wrapper.find('[data-testid="welcome-popup"]').exists()).toBe(false)
  })

  it('tablet: deve mostrar após 10s', async () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 800,
    })

    const wrapper = mountWelcomePopup()
    await nextTick()

    vi.advanceTimersByTime(10000)
    await nextTick()

    expect(wrapper.find('[data-testid="welcome-popup"]').exists()).toBe(true)
  })

  it('não deve mostrar duas vezes na mesma sessão', async () => {
    const wrapper = mountWelcomePopup()
    await nextTick()

    // First exit intent — shows popup
    document.dispatchEvent(new MouseEvent('mouseleave', { clientY: 0, bubbles: true }))
    await nextTick()
    expect(wrapper.find('[data-testid="welcome-popup"]').exists()).toBe(true)

    // Dismiss
    await wrapper.find('[data-testid="welcome-close"]').trigger('click')
    await nextTick()

    // Session flag should prevent showing again
    // Create new instance in same session
    const wrapper2 = mountWelcomePopup()
    await nextTick()

    document.dispatchEvent(new MouseEvent('mouseleave', { clientY: 0, bubbles: true }))
    await nextTick()

    expect(wrapper2.find('[data-testid="welcome-popup"]').exists()).toBe(false)
  })
})
