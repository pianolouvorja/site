import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
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

  const createWrapper = () => {
    return mount(TheFooter, {
      global: {
        stubs: {
          NuxtLink: true,
          DonateButton: true,
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

  it('tem link do GitHub do projeto', () => {
    const wrapper = createWrapper()
    const github = wrapper.find('[aria-label="GitHub"]')
    expect(github.exists()).toBe(true)
    expect(github.attributes('href')).toBe('https://github.com/pianolouvorja')
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

  it('links de privacy e terms usam localePath', () => {
    const wrapper = createWrapper()
    const privacyLink = wrapper.find('a[href="/privacy"]')
    expect(privacyLink.exists()).toBe(true)
    const termsLink = wrapper.find('a[href="/terms"]')
    expect(termsLink.exists()).toBe(true)
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
