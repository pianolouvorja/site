import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, defineComponent, h, nextTick } from 'vue'
import TheHeader from '~/components/TheHeader.vue'

const mockSetLocale = vi.fn()
const mockLocale = ref('pt-BR')
const mockLocales = ref([
  { code: 'pt-BR', name: 'Português' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
])

beforeEach(() => {
  mockSetLocale.mockClear()
  mockLocale.value = 'pt-BR'
  vi.stubGlobal('useI18n', () => ({
    locale: mockLocale,
    locales: mockLocales,
    setLocale: mockSetLocale,
  }))
})

vi.stubGlobal('useRoute', () => ({ path: '/' }))

vi.stubGlobal('useLocalePath', () => (path: string) => path)

// Stub NuxtLink para nao quebrar render
const NuxtLink = defineComponent({
  name: 'NuxtLink',
  props: { to: { type: String, default: '' } },
  setup(props, { slots }) {
    return () => h('a', { href: props.to }, slots.default?.())
  },
})

// Transition stub que renderiza o slot (sem animacao)
const TransitionStub = defineComponent({
  name: 'Transition',
  setup(_, { slots }) {
    return () => slots.default?.()
  },
})

const createWrapper = () => {
  return mount(TheHeader, {
    global: {
      mocks: {
        $t: (key: string) => key,
      },
      stubs: {
        NuxtLink,
        Transition: TransitionStub,
      },
    },
  })
}

describe('TheHeader', () => {
  it('renderiza o logo/nome do site', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('Louvor')
    expect(wrapper.find('.header__logo').exists()).toBe(true)
  })

  it('renderiza links de navegacao', () => {
    const wrapper = createWrapper()
    const links = wrapper.findAll('a')
    expect(links.length).toBeGreaterThanOrEqual(3)
  })

  it('tem botao CTA para acessar o app', () => {
    const wrapper = createWrapper()
    const cta = wrapper.find('[data-testid="header-cta"]')
    expect(cta.exists()).toBe(true)
    expect(cta.attributes('href')).toMatch(/^https:\/\//)
  })

  it('menu mobile inicia fechado com aria-expanded false', () => {
    const wrapper = createWrapper()
    const toggle = wrapper.find('[data-testid="header-menu-toggle"]')
    expect(toggle.exists()).toBe(true)
    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('[data-testid="header-nav-mobile"]').exists()).toBe(false)
  })

  it('clicar no botao toggle abre o menu mobile', async () => {
    const wrapper = createWrapper()
    const toggle = wrapper.find('[data-testid="header-menu-toggle"]')
    await toggle.trigger('click')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(wrapper.find('[data-testid="header-nav-mobile"]').exists()).toBe(true)
  })

  it('clicar no botao toggle novamente fecha o menu mobile', async () => {
    const wrapper = createWrapper()
    const toggle = wrapper.find('[data-testid="header-menu-toggle"]')
    await toggle.trigger('click')
    await toggle.trigger('click')
    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('[data-testid="header-nav-mobile"]').exists()).toBe(false)
  })

  it('clicar em um link do menu mobile fecha o menu', async () => {
    const wrapper = createWrapper()
    const toggle = wrapper.find('[data-testid="header-menu-toggle"]')
    await toggle.trigger('click')
    const mobileLink = wrapper.find('[data-testid="header-nav-mobile"] a')
    await mobileLink.trigger('click')
    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('[data-testid="header-nav-mobile"]').exists()).toBe(false)
  })

  it('troca o idioma ao clicar num botao do switcher mobile', async () => {
    const setLocaleSpy = (globalThis as any).useI18n().setLocale
    setLocaleSpy.mockClear()
    const wrapper = createWrapper()
    // Abre o menu mobile para revelar o language switcher mobile
    const toggle = wrapper.find('[data-testid="header-menu-toggle"]')
    await toggle.trigger('click')
    // O switcher mobile tem botoes com classe header__lang-mobile-btn
    const mobileLangBtns = wrapper.findAll('.header__lang-mobile-btn')
    expect(mobileLangBtns.length).toBeGreaterThan(0)
    // Clica no botao "en"
    const enBtn = mobileLangBtns.find((btn) => btn.text().includes('English'))
    expect(enBtn).toBeDefined()
    await enBtn!.trigger('click')
    expect(setLocaleSpy).toHaveBeenCalledWith('en')
  })

  it('abre o menu de idiomas ao clicar no toggle', async () => {
    const wrapper = createWrapper()
    const langToggle = wrapper.find('[data-testid="header-lang-toggle"]')
    expect(langToggle.attributes('aria-expanded')).toBe('false')
    await langToggle.trigger('click')
    expect(langToggle.attributes('aria-expanded')).toBe('true')
    expect(wrapper.find('[data-testid="header-lang-menu"]').exists()).toBe(true)
  })

  it('fecha o menu de idiomas ao clicar novamente', async () => {
    const wrapper = createWrapper()
    const langToggle = wrapper.find('[data-testid="header-lang-toggle"]')
    await langToggle.trigger('click')
    await langToggle.trigger('click')
    expect(langToggle.attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('[data-testid="header-lang-menu"]').exists()).toBe(false)
  })

  it('troca o idioma ao clicar numa opcao do menu de idiomas', async () => {
    const setLocaleSpy = (globalThis as any).useI18n().setLocale
    setLocaleSpy.mockClear()
    const wrapper = createWrapper()
    const langToggle = wrapper.find('[data-testid="header-lang-toggle"]')
    await langToggle.trigger('click')
    const langOption = wrapper.find('[data-testid="header-lang-en"]')
    expect(langOption.exists()).toBe(true)
    await langOption.trigger('click')
    expect(setLocaleSpy).toHaveBeenCalledWith('en')
  })

  it('fecha o menu de idiomas ao clicar fora (.header__lang)', async () => {
    const docSpy = vi.spyOn(document, 'addEventListener')
    const wrapper = createWrapper()
    // Pega o listener registrado pelo onMounted
    const clickListener = docSpy.mock.calls.find(([event]) => event === 'click')?.[1] as
      EventListener | undefined
    expect(clickListener).toBeDefined()

    // Abre o menu de idiomas
    const langToggle = wrapper.find('[data-testid="header-lang-toggle"]')
    await langToggle.trigger('click')
    expect(wrapper.find('[data-testid="header-lang-menu"]').exists()).toBe(true)

    // Simula click outside — target fora de .header__lang
    const fakeEvent = { target: document.createElement('div') } as unknown as MouseEvent
    clickListener!(fakeEvent)
    await nextTick()
    expect(wrapper.find('[data-testid="header-lang-menu"]').exists()).toBe(false)
    docSpy.mockRestore()
  })

  it('nao fecha o menu de idiomas ao clicar dentro de .header__lang', async () => {
    const docSpy = vi.spyOn(document, 'addEventListener')
    const wrapper = createWrapper()
    const clickListener = docSpy.mock.calls.find(([event]) => event === 'click')?.[1] as
      EventListener | undefined
    expect(clickListener).toBeDefined()

    // Abre o menu de idiomas
    const langToggle = wrapper.find('[data-testid="header-lang-toggle"]')
    await langToggle.trigger('click')
    expect(wrapper.find('[data-testid="header-lang-menu"]').exists()).toBe(true)

    // Simula click inside — target dentro de .header__lang
    const insideEl = document.createElement('div')
    insideEl.className = 'header__lang'
    const fakeEvent = { target: insideEl } as unknown as MouseEvent
    clickListener!(fakeEvent)
    await nextTick()
    expect(wrapper.find('[data-testid="header-lang-menu"]').exists()).toBe(true)
    docSpy.mockRestore()
  })

  it('detecta scroll da pagina para aplicar estilo header--scrolled', async () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.header').classes()).not.toContain('header--scrolled')
    // Simula scroll > 20px
    Object.defineProperty(window, 'scrollY', { value: 100, writable: true })
    window.dispatchEvent(new Event('scroll'))
    await nextTick()
    expect(wrapper.find('.header').classes()).toContain('header--scrolled')
    // Volta scroll para 0
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true })
    window.dispatchEvent(new Event('scroll'))
    await nextTick()
    expect(wrapper.find('.header').classes()).not.toContain('header--scrolled')
  })

  it('remove event listeners ao desmontar', async () => {
    const winRemoveSpy = vi.spyOn(window, 'removeEventListener')
    const docRemoveSpy = vi.spyOn(document, 'removeEventListener')
    const wrapper = createWrapper()
    wrapper.unmount()
    expect(winRemoveSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
    expect(docRemoveSpy).toHaveBeenCalledWith('click', expect.any(Function))
    winRemoveSpy.mockRestore()
    docRemoveSpy.mockRestore()
  })

  it('navHref processa /#hash quando esta na home', () => {
    const wrapper = createWrapper()
    expect(wrapper.vm.navHref('/#features')).toBe('#features')
  })

  it('navHref processa /#hash quando NAO esta na home', () => {
    vi.stubGlobal('useRoute', () => ({ path: '/docs' }))
    const wrapper = createWrapper()
    expect(wrapper.vm.navHref('/#features')).toBe('/#features')
    vi.stubGlobal('useRoute', () => ({ path: '/' }))
  })

  it('navHref processa #hash puro quando esta na home', () => {
    const wrapper = createWrapper()
    expect(wrapper.vm.navHref('#features')).toBe('#features')
  })

  it('navHref processa #hash puro quando NAO esta na home', () => {
    vi.stubGlobal('useRoute', () => ({ path: '/docs' }))
    const wrapper = createWrapper()
    expect(wrapper.vm.navHref('#features')).toBe('/#features')
    vi.stubGlobal('useRoute', () => ({ path: '/' }))
  })

  it('navHref reconhece path com trailing slash como home', () => {
    vi.stubGlobal('useRoute', () => ({ path: '/en/' }))
    const wrapper = createWrapper()
    expect(wrapper.vm.navHref('#features')).toBe('#features')
    vi.stubGlobal('useRoute', () => ({ path: '/' }))
  })

  it('navHref reconhece /en como home', () => {
    vi.stubGlobal('useRoute', () => ({ path: '/en' }))
    const wrapper = createWrapper()
    expect(wrapper.vm.navHref('#features')).toBe('#features')
    vi.stubGlobal('useRoute', () => ({ path: '/' }))
  })

  it('navHref reconhece /es como home', () => {
    vi.stubGlobal('useRoute', () => ({ path: '/es' }))
    const wrapper = createWrapper()
    expect(wrapper.vm.navHref('#features')).toBe('#features')
    vi.stubGlobal('useRoute', () => ({ path: '/' }))
  })

  it('navHref processa rota interna via localePath', () => {
    const wrapper = createWrapper()
    expect(wrapper.vm.navHref('/privacy')).toBe('/privacy')
  })

  it('availableLocales exclui o locale atual', () => {
    const wrapper = createWrapper()
    const available = (wrapper.vm as any).availableLocales
    expect(available.length).toBe(2)
    expect(available.every((l: any) => l.code !== 'pt-BR')).toBe(true)
  })

  it('detecta scroll no limite exato (20px nao ativa, 21px ativa)', async () => {
    const wrapper = createWrapper()
    // scrollY = 20 NAO deve ativar (condicao e > 20, nao >= 20)
    Object.defineProperty(window, 'scrollY', { value: 20, writable: true })
    window.dispatchEvent(new Event('scroll'))
    await nextTick()
    expect(wrapper.find('.header').classes()).not.toContain('header--scrolled')
    // scrollY = 21 DEVE ativar
    Object.defineProperty(window, 'scrollY', { value: 21, writable: true })
    window.dispatchEvent(new Event('scroll'))
    await nextTick()
    expect(wrapper.find('.header').classes()).toContain('header--scrolled')
  })

  it('registra scroll listener com opcao passive true', () => {
    const winSpy = vi.spyOn(window, 'addEventListener')
    createWrapper()
    const scrollCall = winSpy.mock.calls.find(([event]) => event === 'scroll')
    expect(scrollCall).toBeDefined()
    expect(scrollCall![2]).toEqual({ passive: true })
    winSpy.mockRestore()
  })
})
