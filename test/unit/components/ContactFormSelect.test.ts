import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ContactFormSelect from '~/components/ContactFormSelect.vue'

const fetchMock = vi.fn()

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('$fetch', fetchMock)
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:http://local/file')
})

async function pickType(wrapper: ReturnType<typeof mount>, value: string) {
  await wrapper.get('[data-testid="contact-type-select"]').setValue(value)
}

async function setFile(wrapper: ReturnType<typeof mount>, selector: string, file: File | null) {
  const input = wrapper.get(selector)
  Object.defineProperty(input.element, 'files', { configurable: true, value: file ? [file] : [] })
  await input.trigger('change')
}

describe('ContactFormSelect', () => {
  const mountForm = () => mount(ContactFormSelect, { global: { stubs: { i: true } } })
  it('nao envia o formulario geral invalido', async () => {
    const wrapper = mountForm()
    expect(wrapper.get('[data-testid="contact-submit-btn"]').attributes('disabled')).toBeDefined()
    await wrapper.get('form').trigger('submit')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('envia o formulario geral e reseta no sucesso', async () => {
    fetchMock.mockResolvedValue({ ok: true })
    const wrapper = mountForm()
    await wrapper.get('#contact-name').setValue('Ana')
    await wrapper.get('#contact-email').setValue('ana@example.com')
    await wrapper.get('#contact-subject').setValue('Assunto')
    await wrapper.get('#contact-message').setValue('mensagem longa o bastante')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/community/register',
      expect.objectContaining({
        method: 'POST',
        body: expect.objectContaining({ type: 'general', subject: 'Assunto' }),
      }),
    )
    expect(wrapper.get('[role="status"]').isVisible()).toBe(true)
    await wrapper.get('button.contact-form-select__reset-btn').trigger('click')
    expect(wrapper.find('[data-testid="contact-form-general"]').exists()).toBe(true)
  })

  it('mostra erro quando a API recusa ou lanca', async () => {
    const wrapper = mountForm()
    await wrapper.get('#contact-name').setValue('Ana')
    await wrapper.get('#contact-email').setValue('ana@example.com')
    await wrapper.get('#contact-subject').setValue('Assunto')
    await wrapper.get('#contact-message').setValue('mensagem longa o bastante')

    fetchMock.mockResolvedValue({ ok: false, success: false })
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(wrapper.get('[role="alert"]').isVisible()).toBe(true)

    await pickType(wrapper, 'general')
    fetchMock.mockRejectedValue(new Error('down'))
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(wrapper.get('[role="alert"]').isVisible()).toBe(true)
  })

  it('ignora um segundo envio enquanto o primeiro ainda esta em curso', async () => {
    let resolveFetch: (value: { ok: boolean }) => void = () => {}
    fetchMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve
        }),
    )
    const wrapper = mountForm()
    await wrapper.get('#contact-name').setValue('Ana')
    await wrapper.get('#contact-email').setValue('ana@example.com')
    await wrapper.get('#contact-subject').setValue('Assunto')
    await wrapper.get('#contact-message').setValue('mensagem longa o bastante')
    const form = wrapper.get('form')
    const first = form.trigger('submit')
    await form.trigger('submit')
    resolveFetch({ ok: true })
    await first
    await flushPromises()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('cadastra testador com avatar e remove o arquivo', async () => {
    fetchMock.mockResolvedValue({ success: true })
    const wrapper = mountForm()
    await pickType(wrapper, 'tester')
    await wrapper.get('#tester-name').setValue('Ana')
    await wrapper.get('#tester-email').setValue('ana@example.com')
    await wrapper.get('input[value="qa"]').setValue(true)
    await wrapper.get('#tester-bio').setValue('bio com mais de dez')
    await wrapper.get('#tester-links').setValue('blob:http://local/keep')
    await setFile(wrapper, '[data-testid="tester-avatar-input"]', null)
    await setFile(wrapper, '[data-testid="tester-avatar-input"]', new File(['x'], 'a.png'))
    expect(wrapper.find('.contact-form-select__file-preview').exists()).toBe(true)
    await wrapper.get('.contact-form-select__file-remove').trigger('click')
    expect(wrapper.find('.contact-form-select__file-placeholder').exists()).toBe(true)
    await setFile(wrapper, '[data-testid="tester-avatar-input"]', new File(['x'], 'a.png'))
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(fetchMock.mock.calls[0][1].body.focus).toContain('qa')
  })

  it('cadastra desenvolvedor', async () => {
    fetchMock.mockResolvedValue({ ok: true })
    const wrapper = mountForm()
    await pickType(wrapper, 'developer')
    await wrapper.get('#dev-name').setValue('Ana')
    await wrapper.get('#dev-email').setValue('ana@example.com')
    await wrapper.get('#dev-bio').setValue('bio com mais de dez')
    await wrapper.get('#dev-github').setValue('https://github.com/ana')
    await wrapper.get('#dev-portfolio').setValue('https://ana.dev')
    await wrapper.get('input[value="API"]').setValue(true)
    await wrapper.get('#dev-availability').setValue('noites')
    await wrapper.get('#dev-stack').setValue('vue')
    await wrapper.get('#dev-motivation').setValue('quero contribuir com o projeto')
    await setFile(wrapper, '[data-testid="dev-avatar-input"]', new File(['x'], 'a.png'))
    await wrapper.get('.contact-form-select__file-remove').trigger('click')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(fetchMock.mock.calls[0][1].body.areas).toBe('API')
  })

  it('envia bug com e sem e-mail de testador e com anexo', async () => {
    fetchMock.mockResolvedValue({ ok: true })
    const wrapper = mountForm()
    await pickType(wrapper, 'bug')
    await wrapper.get('#bug-email').setValue('ana@example.com')
    await wrapper.get('#bug-version').setValue('1.3.0')
    await wrapper.get('#bug-module').setValue('contato')
    await wrapper.get('#bug-description').setValue('descricao longa o bastante aqui')
    await wrapper.get('#bug-steps').setValue('1. abrir')
    await setFile(wrapper, '[data-testid="bug-attachment-input"]', new File(['x'], 'log.txt'))
    expect(wrapper.find('.contact-form-select__file-name').text()).toBe('log.txt')
    await wrapper.get('.contact-form-select__file-remove').trigger('click')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(fetchMock.mock.calls[0][1].body.testerEmail).toBeUndefined()

    await wrapper.get('button.contact-form-select__reset-btn').trigger('click')
    await wrapper.get('#bug-type').setValue('bug')
    await wrapper.get('#bug-tester-email').setValue('tester@example.com')
    await wrapper.get('#bug-email').setValue('')
    await wrapper.get('#bug-version').setValue('1.3.0')
    await wrapper.get('#bug-module').setValue('contato')
    await wrapper.get('#bug-description').setValue('descricao longa o bastante aqui')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(fetchMock.mock.calls[1][1].body.testerEmail).toBe('tester@example.com')
  })

  it('cai no default quando o tipo nao e conhecido', async () => {
    const wrapper = mountForm()
    await pickType(wrapper, 'outro')
    expect(wrapper.get('[data-testid="contact-submit-btn"]').attributes('disabled')).toBeDefined()
  })
})
