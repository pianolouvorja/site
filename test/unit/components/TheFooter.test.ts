import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { RouterLinkStub } from '@vue/test-utils'
import TheFooter from '~/components/TheFooter.vue'

describe('TheFooter', () => {
  let mockRoute: any
  let mockLocalePath: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockRoute = { path: '/' }
    mockLocalePath = vi.fn((path: string) => path)
    vi.stubGlobal('useRoute', () => mockRoute)
    vi.stubGlobal('useLocalePath', () => mockLocalePath)
  })

  const createWrapper = (donateUrl = '') => {
    vi.stubGlobal('useRuntimeConfig', () => ({
      public: { asaasDonateUrl: donateUrl },
    }))
    return mount(TheFooter, {
      global: {
        stubs: {
          NuxtLink: RouterLinkStub,
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
    })
  }

  it('renderiza rodape', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('footer').exists()).toBe(true)
  })

  it('nao renderiza botao de doacao sem url configurada', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('[data-testid="footer-donate-button"]').exists()).toBe(false)
  })

  it('renderiza botao de doacao com link do Asaas quando configurado', () => {
    const wrapper = createWrapper('https://www.asaas.com/pay/test-link')
    const donate = wrapper.find('[data-testid="footer-donate-button"]')
    expect(donate.exists()).toBe(true)
    expect(donate.attributes('href')).toBe('https://www.asaas.com/pay/test-link')
    expect(donate.attributes('target')).toBe('_blank')
  })

  it('tem link do GitHub do projeto', () => {
    const wrapper = createWrapper()
    const github = wrapper.find('[aria-label="GitHub"]')
    expect(github.exists()).toBe(true)
    expect(github.attributes('href')).toBe('https://github.com/pianolouvorja')
  })

  it('tem link do YouTube do projeto', () => {
    const wrapper = createWrapper()
    const youtube = wrapper.find('[aria-label="YouTube"]')
    expect(youtube.exists()).toBe(true)
    expect(youtube.attributes('href')).toBe('https://www.youtube.com/@pianolouvorja')
  })

  it('tem link do grupo de suporte do WhatsApp', () => {
    const wrapper = createWrapper()
    const whatsapp = wrapper.find('[aria-label="WhatsApp"]')
    expect(whatsapp.exists()).toBe(true)
    expect(whatsapp.attributes('href')).toBe(
      'https://chat.whatsapp.com/LBcTv5rQDZw3OU56QmUahc',
    )
  })

  it('tem link do grupo de desenvolvedores no Telegram', () => {
    const wrapper = createWrapper()
    const telegram = wrapper.find('[aria-label="Telegram"]')
    expect(telegram.exists()).toBe(true)
    expect(telegram.attributes('href')).toBe('https://t.me/c/4390408870/6')
  })

  it('tem ano atual no copyright', () => {
    const wrapper = createWrapper()
    const year = new Date().getFullYear()
    expect(wrapper.text()).toContain(String(year))
  })

  it('navHref usa localePath para rotas internas', () => {
    const wrapper = createWrapper()
    // /privacy passa pelo localePath
    const result = wrapper.vm.navHref('/privacy')
    expect(result).toBe('/privacy')
    expect(mockLocalePath).toHaveBeenCalledWith('/privacy')
  })

  it('navHref remove trailing slash do path para verificar isHomePage', () => {
    mockRoute.path = '/en/'
    const wrapper = createWrapper()
    // path '/en/' deve ser tratado como home após remover trailing slash
    expect(wrapper.vm.navHref('#features')).toBe('#features')
  })

  it('navHref reconhece /en como home', () => {
    mockRoute.path = '/en'
    const wrapper = createWrapper()
    expect(wrapper.vm.navHref('#features')).toBe('#features')
  })

  it('navHref reconhece /es como home', () => {
    mockRoute.path = '/es'
    const wrapper = createWrapper()
    expect(wrapper.vm.navHref('#features')).toBe('#features')
  })

  it('navHref chama localePath com / ao prefixar hash fora da home', () => {
    mockRoute.path = '/docs'
    mockLocalePath.mockReturnValue('/pt-BR')
    const wrapper = createWrapper()
    wrapper.vm.navHref('#features')
    expect(mockLocalePath).toHaveBeenCalledWith('/')
  })

  it('testa icone do github', () => {
    const wrapper = createWrapper()
    const icon = wrapper.find('i.ti.ti-brand-github')
    expect(icon.exists()).toBe(true)
  })

  it('navHref preserva hash quando esta na home', () => {
    mockRoute.path = '/'
    const wrapper = createWrapper()
    expect(wrapper.vm.navHref('#features')).toBe('#features')
  })

  it('navHref adiciona localePath quando nao esta na home', () => {
    mockRoute.path = '/docs'
    const wrapper = createWrapper()
    // Como nao estamos na home, deve retornar localePath('/') + '#features'
    mockLocalePath.mockReturnValue('/en')
    const result = wrapper.vm.navHref('#features')
    expect(result).toBe('/en#features')
  })

  it('renderiza links de navegacao primaria', () => {
    const wrapper = createWrapper()
    const links = wrapper.findAllComponents(RouterLinkStub)
    expect(links.length).toBeGreaterThan(0)
  })

  it('renderiza links de privacy e terms com localePath', () => {
    const wrapper = createWrapper()
    const links = wrapper.findAllComponents(RouterLinkStub)
    const hrefs = links.map((l) => l.props('to'))
    expect(hrefs).toContain('/privacy')
    expect(hrefs).toContain('/terms')
  })

  it('navHref processa /#hash quando esta na home', () => {
    mockRoute.path = '/'
    const wrapper = createWrapper()
    expect(wrapper.vm.navHref('/#features')).toBe('#features')
  })

  it('navHref processa /#hash quando NAO esta na home', () => {
    mockRoute.path = '/docs'
    const wrapper = createWrapper()
    mockLocalePath.mockReturnValue('/pt-BR')
    expect(wrapper.vm.navHref('/#features')).toBe('/pt-BR#features')
  })

  it('navHref passa exatamente / para localePath ao prefixar /#hash fora da home', () => {
    mockRoute.path = '/docs'
    const wrapper = createWrapper()
    // Sem mockReturnValue override — mock identity retorna o argumento recebido.
    // localePath("/") retorna "/", distinguindo de localePath("") que retornaria "".
    const result = wrapper.vm.navHref('/#features')
    expect(result).toBe('/#features')
    expect(mockLocalePath).toHaveBeenLastCalledWith('/')
  })
})
