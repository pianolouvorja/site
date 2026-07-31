import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, defineComponent, h } from 'vue'
import TheHeader from '~/components/TheHeader.vue'

// Stub dos auto-imports do Nuxt antes do import do componente
vi.stubGlobal('useI18n', () => ({
  locale: ref('pt-BR'),
  locales: ref([
    { code: 'pt-BR', name: 'Português' },
    { code: 'en', name: 'English' },
  ]),
  setLocale: vi.fn(),
}))

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

const createWrapper = () => {
  return mount(TheHeader, {
    global: {
      mocks: {
        $t: (key: string) => key,
      },
      stubs: {
        NuxtLink,
        Transition: true,
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
})
