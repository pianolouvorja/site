import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import WelcomePopup from '../../../app/components/WelcomePopup.vue'
import { nextTick } from 'vue'

// Mocking Nuxt 3 useCookie globally
const mockCookieValue = { value: false }
vi.stubGlobal('useCookie', () => mockCookieValue)

// Mock do i18n configurado globalmente no test/setup.ts
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
    mockCookieValue.value = false // Reseta o estado do cookie mockado
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('não deve renderizar imediatamente (deve aguardar 5 segundos)', () => {
    const wrapper = mountWelcomePopup()
    expect(wrapper.find('[data-testid="welcome-popup"]').exists()).toBe(false)
  })

  it('deve renderizar após 5 segundos se o cookie não existir', async () => {
    const wrapper = mountWelcomePopup()

    // Avança 5 segundos (5000ms)
    vi.advanceTimersByTime(5000)
    await nextTick()

    expect(wrapper.find('[data-testid="welcome-popup"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Bem-vindo ao PianoLouvorJA')
  })

  it('não deve renderizar mesmo após 5s se o cookie já estiver setado', async () => {
    mockCookieValue.value = true // Simula visitante retornando
    const wrapper = mountWelcomePopup()

    vi.advanceTimersByTime(5000)
    await nextTick()

    expect(wrapper.find('[data-testid="welcome-popup"]').exists()).toBe(false)
  })

  it('deve fechar o popup ao clicar em fechar e definir o cookie', async () => {
    const wrapper = mountWelcomePopup()

    vi.advanceTimersByTime(5000)
    await nextTick()

    expect(wrapper.find('[data-testid="welcome-popup"]').exists()).toBe(true)

    // Simula clique de fechamento
    const closeBtn = wrapper.find('[data-testid="welcome-close"]')
    await closeBtn.trigger('click')

    expect(wrapper.find('[data-testid="welcome-popup"]').exists()).toBe(false)
    expect(mockCookieValue.value).toBe('true') // Confirma state setter logic
  })
})
