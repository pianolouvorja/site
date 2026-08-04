import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import CookieBanner from '../../../app/components/CookieBanner.vue'

// Mock de i18n real para retornar a key de pt-BR fallback para que o test passe
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => {
      const keys = {
        'cookieBanner.message':
          'Nós utilizamos cookies para melhorar sua experiência. Ao continuar navegando, você concorda com a nossa Política de Privacidade.',
        'cookieBanner.accept': 'Entendi e Aceito',
        'cookieBanner.privacyLink': 'Ler Política de Privacidade',
      }
      return keys[key] || key
    },
  }),
}))

const cookieValue: string | undefined = undefined
let mockCookieRef = { value: cookieValue }

// Mock global do nuxt hook useCookie
vi.stubGlobal('useCookie', () => {
  return mockCookieRef
})

// Mock useLocalePath — returns the path as-is (default locale has no prefix)
vi.stubGlobal('useLocalePath', () => (path: string) => path)

describe('CookieBanner.vue', () => {
  beforeEach(() => {
    mockCookieRef = { value: undefined }
  })

  it('renders when cookie is undefined', () => {
    const wrapper = mount(CookieBanner)
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('Nós utilizamos cookies')
    expect(wrapper.text()).toContain('Entendi e Aceito')
    expect(wrapper.text()).toContain('Ler Política de Privacidade')
  })

  it('does not render if cookie is already set (user accepted before)', async () => {
    mockCookieRef.value = 'true'
    // Como o onMounted pega o valor, a reatividade e setup() já verão ele mockado.
    const wrapper = mount(CookieBanner)
    await wrapper.vm.$nextTick()
    expect(wrapper.html()).toBe('<!--v-if-->') // Vue 3 empty DOM / false v-if condition
  })

  it('sets cookie and hides banner when accept button is clicked', async () => {
    const wrapper = mount(CookieBanner)

    expect(wrapper.exists()).toBe(true)

    const acceptBtn = wrapper.find('button[data-testid="accept-cookie-btn"]')
    expect(acceptBtn.exists()).toBe(true)

    await acceptBtn.trigger('click')

    // Cookie deve ter sido populado.
    expect(mockCookieRef.value).toBe('true')

    await wrapper.vm.$nextTick()
    expect(wrapper.html()).toBe('<!--v-if-->')
  })
})
