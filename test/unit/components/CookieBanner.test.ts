import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import CookieBanner from '../../../app/components/CookieBanner.vue'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => {
      const keys: Record<string, string> = {
        'cookieBanner.message': 'Nós utilizamos cookies para melhorar sua experiência.',
        'cookieBanner.accept': 'Entendi e Aceito',
        'cookieBanner.reject': 'Recusar',
        'cookieBanner.privacyLink': 'Ler Política de Privacidade',
      }
      return keys[key] || key
    },
  }),
}))

let mockCookieRef: { value: string | undefined } = { value: undefined }
let useCookieArgs: { name?: string; options?: Record<string, unknown> } = {}

vi.stubGlobal('useCookie', (name: string, options?: Record<string, unknown>) => {
  useCookieArgs = { name, options }
  return mockCookieRef
})
vi.stubGlobal('useLocalePath', () => (path: string) => path)

describe('CookieBanner.vue', () => {
  beforeEach(() => {
    mockCookieRef = { value: undefined }
    delete (window as Record<string, unknown>).gtag
  })

  it('renders when cookie is undefined', () => {
    const wrapper = mount(CookieBanner)
    expect(wrapper.find('.cookie-banner').exists()).toBe(true)
    expect(wrapper.text()).toContain('Nós utilizamos cookies')
  })

  it('renders accept and reject buttons', () => {
    const wrapper = mount(CookieBanner)
    expect(wrapper.find('[data-testid="accept-cookie-btn"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="reject-cookie-btn"]').exists()).toBe(true)
  })

  it('hides banner on mount when cookie is "true"', async () => {
    mockCookieRef.value = 'true'
    const wrapper = mount(CookieBanner)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.cookie-banner').exists()).toBe(false)
  })

  it('hides banner on mount when cookie is "false"', async () => {
    mockCookieRef.value = 'false'
    const wrapper = mount(CookieBanner)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.cookie-banner').exists()).toBe(false)
  })

  it('sets cookie to "true" and hides on accept', async () => {
    const wrapper = mount(CookieBanner)
    await wrapper.find('[data-testid="accept-cookie-btn"]').trigger('click')
    expect(mockCookieRef.value).toBe('true')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.cookie-banner').exists()).toBe(false)
  })

  it('sets cookie to "false" and hides on reject', async () => {
    const wrapper = mount(CookieBanner)
    await wrapper.find('[data-testid="reject-cookie-btn"]').trigger('click')
    expect(mockCookieRef.value).toBe('false')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.cookie-banner').exists()).toBe(false)
  })

  it('renders privacy link', () => {
    const wrapper = mount(CookieBanner)
    const link = wrapper.find('.cookie-banner__link')
    expect(link.exists()).toBe(true)
  })

  // --- KILL SURVIVING MUTANTS ---

  it('gtag consent update on accept: analytics_storage=granted, ad_storage=denied', async () => {
    const gtagSpy = vi.fn()
    ;(window as Record<string, unknown>).gtag = gtagSpy

    const wrapper = mount(CookieBanner)
    await wrapper.find('[data-testid="accept-cookie-btn"]').trigger('click')

    const consentArg = gtagSpy.mock.calls[0][2] as Record<string, string>
    expect(consentArg.analytics_storage).toBe('granted')
    expect(consentArg.ad_storage).toBe('denied')
    expect(consentArg.ad_user_data).toBe('denied')
    expect(consentArg.ad_personalization).toBe('denied')

    delete (window as Record<string, unknown>).gtag
  })

  it('gtag consent update on reject: ALL denied including analytics_storage', async () => {
    const gtagSpy = vi.fn()
    ;(window as Record<string, unknown>).gtag = gtagSpy

    const wrapper = mount(CookieBanner)
    await wrapper.find('[data-testid="reject-cookie-btn"]').trigger('click')

    const consentArg = gtagSpy.mock.calls[0][2] as Record<string, string>
    expect(consentArg.analytics_storage).toBe('denied')
    expect(consentArg.ad_storage).toBe('denied')
    expect(consentArg.ad_user_data).toBe('denied')
    expect(consentArg.ad_personalization).toBe('denied')

    delete (window as Record<string, unknown>).gtag
  })

  it('does not throw when gtag is undefined on accept', async () => {
    delete (window as Record<string, unknown>).gtag
    const wrapper = mount(CookieBanner)
    await expect(
      wrapper.find('[data-testid="accept-cookie-btn"]').trigger('click'),
    ).resolves.toBeUndefined()
    expect(mockCookieRef.value).toBe('true')
  })

  it('does not throw when gtag is undefined on reject', async () => {
    delete (window as Record<string, unknown>).gtag
    const wrapper = mount(CookieBanner)
    await expect(
      wrapper.find('[data-testid="reject-cookie-btn"]').trigger('click'),
    ).resolves.toBeUndefined()
    expect(mockCookieRef.value).toBe('false')
  })

  it('accept button calls updateConsent with granted=true', async () => {
    const gtagSpy = vi.fn()
    ;(window as Record<string, unknown>).gtag = gtagSpy

    const wrapper = mount(CookieBanner)
    await wrapper.find('[data-testid="accept-cookie-btn"]').trigger('click')

    // granted = true → analytics_storage must be 'granted' (not 'denied')
    const consentArg = gtagSpy.mock.calls[0][2] as Record<string, string>
    expect(consentArg.analytics_storage).toBe('granted')

    delete (window as Record<string, unknown>).gtag
  })

  it('reject button calls updateConsent with granted=false', async () => {
    const gtagSpy = vi.fn()
    ;(window as Record<string, unknown>).gtag = gtagSpy

    const wrapper = mount(CookieBanner)
    await wrapper.find('[data-testid="reject-cookie-btn"]').trigger('click')

    // granted = false → analytics_storage must be 'denied' (not 'granted')
    const consentArg = gtagSpy.mock.calls[0][2] as Record<string, string>
    expect(consentArg.analytics_storage).toBe('denied')

    delete (window as Record<string, unknown>).gtag
  })

  it('hasConsented is false initially when cookie is undefined', () => {
    const wrapper = mount(CookieBanner)
    expect(wrapper.vm.hasConsented).toBe(false)
  })

  it('hasConsented becomes true after accept', async () => {
    const wrapper = mount(CookieBanner)
    await wrapper.find('[data-testid="accept-cookie-btn"]').trigger('click')
    expect(wrapper.vm.hasConsented).toBe(true)
  })

  it('hasConsented becomes true after reject', async () => {
    const wrapper = mount(CookieBanner)
    await wrapper.find('[data-testid="reject-cookie-btn"]').trigger('click')
    expect(wrapper.vm.hasConsented).toBe(true)
  })

  it('onMounted with cookie "true" sets hasConsented and calls updateConsent(true)', async () => {
    mockCookieRef.value = 'true'
    const gtagSpy = vi.fn()
    ;(window as Record<string, unknown>).gtag = gtagSpy

    const wrapper = mount(CookieBanner)
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.hasConsented).toBe(true)
    // onMounted calls updateConsent(true) → analytics_storage 'granted'
    expect(gtagSpy).toHaveBeenCalledWith(
      'consent',
      'update',
      expect.objectContaining({ analytics_storage: 'granted' }),
    )

    delete (window as Record<string, unknown>).gtag
  })

  it('onMounted with cookie "false" sets hasConsented and calls updateConsent(false)', async () => {
    mockCookieRef.value = 'false'
    const gtagSpy = vi.fn()
    ;(window as Record<string, unknown>).gtag = gtagSpy

    const wrapper = mount(CookieBanner)
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.hasConsented).toBe(true)
    expect(gtagSpy).toHaveBeenCalledWith(
      'consent',
      'update',
      expect.objectContaining({ analytics_storage: 'denied' }),
    )

    delete (window as Record<string, unknown>).gtag
  })

  // --- KILL COOKIE NAME AND OPTIONS MUTANTS ---

  it('useCookie is called with correct cookie name "piano_cookie_consent"', () => {
    useCookieArgs = {}
    mount(CookieBanner)
    expect(useCookieArgs.name).toBe('piano_cookie_consent')
  })

  it('useCookie is called with maxAge option of 1 year (31536000 seconds)', () => {
    useCookieArgs = {}
    mount(CookieBanner)
    expect(useCookieArgs.options).toEqual({ maxAge: 31536000 })
  })
})
