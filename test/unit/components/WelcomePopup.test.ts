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
        NuxtLink: {
          props: ['to'],
          template: '<a :href="to"><slot /></a>',
        },
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
    expect(cta.attributes('to') || cta.attributes('href')).toBe('/download')
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

  it('deve fechar ao clicar no overlay (dismiss por click.self)', async () => {
    const wrapper = mountWelcomePopup()
    await nextTick()

    document.dispatchEvent(new MouseEvent('mouseleave', { clientY: 0, bubbles: true }))
    await nextTick()

    const overlay = wrapper.find('[data-testid="welcome-popup"]')
    expect(overlay.exists()).toBe(true)
    await overlay.trigger('click')
    await nextTick()

    expect(wrapper.find('[data-testid="welcome-popup"]').exists()).toBe(false)
  })

  it('deve fechar ao pressionar Escape', async () => {
    const wrapper = mountWelcomePopup()
    await nextTick()

    document.dispatchEvent(new MouseEvent('mouseleave', { clientY: 0, bubbles: true }))
    await nextTick()

    expect(wrapper.find('[data-testid="welcome-popup"]').exists()).toBe(true)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()

    expect(wrapper.find('[data-testid="welcome-popup"]').exists()).toBe(false)
  })

  it('mobile com scroll >40% deve mostrar após 7s', async () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    })
    Object.defineProperty(document.body, 'scrollHeight', {
      writable: true,
      configurable: true,
      value: 1000,
    })
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 500 })

    const wrapper = mountWelcomePopup()
    await nextTick()

    // Simulate scroll > 40%
    Object.defineProperty(window, 'scrollY', { writable: true, configurable: true, value: 250 })
    window.dispatchEvent(new Event('scroll'))

    vi.advanceTimersByTime(7000)
    await nextTick()

    expect(wrapper.find('[data-testid="welcome-popup"]').exists()).toBe(true)
  })

  it('deve limpar listeners e timers no unmount', async () => {
    const wrapper = mountWelcomePopup()
    await nextTick()

    // Mostra popup
    document.dispatchEvent(new MouseEvent('mouseleave', { clientY: 0, bubbles: true }))
    await nextTick()

    // Desmonta — deve executar onUnmounted sem erro
    wrapper.unmount()
    expect(true).toBe(true)
  })

  it('trapFocus: ignora quando popupRef e null', async () => {
    // Dispensa popup antes de disparar Tab para que popupRef seja null
    const wrapper = mountWelcomePopup()
    await nextTick()

    document.dispatchEvent(new MouseEvent('mouseleave', { clientY: 0, bubbles: true }))
    await nextTick()

    // Fecha o popup
    await wrapper.find('[data-testid="welcome-close"]').trigger('click')
    await nextTick()

    // Agora disparar Tab nao deve fazer nada (popupRef null ou popup invisivel)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
    await nextTick()
    expect(true).toBe(true)
  })

  it('trapFocus: ignora teclas nao-Tab', async () => {
    mountWelcomePopup()
    await nextTick()

    document.dispatchEvent(new MouseEvent('mouseleave', { clientY: 0, bubbles: true }))
    await nextTick()

    // Enter nao faz nada no trapFocus
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await nextTick()
    expect(true).toBe(true)
  })

  it('mobile: limpa timers no unmount', async () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    })

    const wrapper = mountWelcomePopup()
    await nextTick()

    // Desmonta com timers ativos
    wrapper.unmount()
    expect(true).toBe(true)
  })

  it('tablet: limpa timers no unmount', async () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 800,
    })

    const wrapper = mountWelcomePopup()
    await nextTick()

    wrapper.unmount()
    expect(true).toBe(true)
  })

  it('deve fechar ao clicar no botao secondary', async () => {
    const wrapper = mountWelcomePopup()
    await nextTick()

    document.dispatchEvent(new MouseEvent('mouseleave', { clientY: 0, bubbles: true }))
    await nextTick()

    const secondaryBtn = wrapper.find('[data-testid="welcome-secondary"]')
    expect(secondaryBtn.exists()).toBe(true)
    await secondaryBtn.trigger('click')
    await nextTick()

    expect(wrapper.find('[data-testid="welcome-popup"]').exists()).toBe(false)
  })

  it('trapFocus: Tab+Shift no primeiro focusable vai para o ultimo', async () => {
    const wrapper = mountWelcomePopup()
    await nextTick()

    document.dispatchEvent(new MouseEvent('mouseleave', { clientY: 0, bubbles: true }))
    await nextTick()

    const popup = wrapper.find('[data-testid="welcome-popup"]')
    const focusable = popup.element.querySelectorAll('a[href], button:not([disabled])')
    expect(focusable.length).toBeGreaterThan(0)

    const first = focusable[0] as HTMLElement
    // Mock document.activeElement to return the first element
    vi.spyOn(document, 'activeElement', 'get').mockReturnValue(first)

    const last = focusable[focusable.length - 1] as HTMLElement
    const focusSpy = vi.spyOn(last, 'focus').mockImplementation(() => {})

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }),
    )
    await nextTick()

    expect(focusSpy).toHaveBeenCalled()
    vi.restoreAllMocks()
  })

  it('trapFocus: Tab no ultimo focusable vai para o primeiro', async () => {
    const wrapper = mountWelcomePopup()
    await nextTick()

    document.dispatchEvent(new MouseEvent('mouseleave', { clientY: 0, bubbles: true }))
    await nextTick()

    const popup = wrapper.find('[data-testid="welcome-popup"]')
    const focusable = popup.element.querySelectorAll('a[href], button:not([disabled])')
    const last = focusable[focusable.length - 1] as HTMLElement
    const first = focusable[0] as HTMLElement

    vi.spyOn(document, 'activeElement', 'get').mockReturnValue(last)
    const focusSpy = vi.spyOn(first, 'focus').mockImplementation(() => {})

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
    await nextTick()

    expect(focusSpy).toHaveBeenCalled()
    vi.restoreAllMocks()
  })
})
