import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import ErrorPage from '~/error.vue'

describe('error.vue', () => {
  const globalMountOptions = {
    mocks: {
      $t: (msg: string) => msg,
    },
    stubs: {
      NuxtLink: { template: '<a><slot /></a>' },
    },
  }

  it('renderiza pagina de erro 404', () => {
    const wrapper = mount(ErrorPage, {
      props: { error: { statusCode: 404, message: 'Not Found' } },
      global: globalMountOptions,
    })
    expect(wrapper.find('.error-page').exists()).toBe(true)
    expect(wrapper.text()).toContain('404')
  })

  it('renderiza pagina de erro 500', () => {
    const wrapper = mount(ErrorPage, {
      props: { error: { statusCode: 500, message: 'Internal Server Error' } },
      global: globalMountOptions,
    })
    expect(wrapper.text()).toContain('500')
  })

  it('mostra botao voltar para home', () => {
    const wrapper = mount(ErrorPage, {
      props: { error: { statusCode: 404, message: 'Not Found' } },
      global: globalMountOptions,
    })
    const btn = wrapper.find('[data-testid="error-back-home"]')
    expect(btn.exists()).toBe(true)
  })

  it('clicar em voltar chama clearError', async () => {
    const clearErrorSpy = vi.fn()
    const originalClearError = globalThis.clearError
    globalThis.clearError = clearErrorSpy

    const wrapper = mount(ErrorPage, {
      props: { error: { statusCode: 404, message: 'Not Found' } },
      global: globalMountOptions,
    })
    await wrapper.find('[data-testid="error-back-home"]').trigger('click')

    expect(clearErrorSpy).toHaveBeenCalledWith({ redirect: '/' })
    globalThis.clearError = originalClearError
  })

  it('erro 500 mostra link para reportar', () => {
    const wrapper = mount(ErrorPage, {
      props: { error: { statusCode: 500, message: 'Internal Server Error' } },
      global: globalMountOptions,
    })
    const reportLink = wrapper.find('a[href^="mailto:contato@pianolouvorja.com.br"]')
    expect(reportLink.exists()).toBe(true)
  })

  it('erro 404 nao mostra link de reportar', () => {
    const wrapper = mount(ErrorPage, {
      props: { error: { statusCode: 404, message: 'Not Found' } },
      global: globalMountOptions,
    })
    const reportLink = wrapper.find('a[href^="mailto:contato@pianolouvorja.com.br"]')
    expect(reportLink.exists()).toBe(false)
  })

  it('renderiza corretamente sem props error definidas', () => {
    const wrapper = mount(ErrorPage, {
      props: { error: {} as any },
      global: globalMountOptions,
    })
    expect(wrapper.text()).toContain('500')
  })

  it('exibe stack trace em modo dev', () => {
    const wrapper = mount(ErrorPage, {
      props: { error: { statusCode: 500, message: 'Server Error', stack: 'Fake Stack Trace' } },
      global: globalMountOptions,
    })
    expect(wrapper.text()).toContain('Fake Stack Trace')
  })

  it('oculta stack trace em modo producao', () => {
    const originalNodeEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    try {
      const wrapper = mount(ErrorPage, {
        props: { error: { statusCode: 500, message: 'Server Error', stack: 'Secret Stack Trace' } },
        global: globalMountOptions,
      })
      expect(wrapper.text()).not.toContain('Secret Stack Trace')
    } finally {
      process.env.NODE_ENV = originalNodeEnv
    }
  })
})
