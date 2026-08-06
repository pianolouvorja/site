import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'

const mockStatus = ref<string>('idle')
const mockErrorMessage = ref<string>('')
const mockValidateEmail = vi.fn((v: string) => /^[^@]+@[^@]+\.[^@]+$/.test(v))
const mockSubscribe = vi.fn(async (v: string) => {
  void v
  mockStatus.value = 'success'
})
const mockReset = vi.fn(() => {
  mockStatus.value = 'idle'
  mockErrorMessage.value = ''
})

vi.mock('~/composables/useNewsletter', () => ({
  useNewsletter: () => ({
    status: mockStatus,
    errorMessage: mockErrorMessage,
    validateEmail: mockValidateEmail,
    subscribe: mockSubscribe,
    reset: mockReset,
  }),
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => {
      const keys: Record<string, string> = {
        'notifyModal.title': 'Notificações',
        'notifyModal.subtitle': 'Inscreva-se',
        'notifyModal.placeholder': 'Seu e-mail',
        'notifyModal.button': 'Inscrever',
        'notifyModal.loading': 'Enviando...',
        'notifyModal.success': 'Inscrição confirmada!',
      }
      return keys[key] || key
    },
  }),
}))

import NotifyModal from '~/components/NotifyModal.vue'

function mountModal(props = { modelValue: true }) {
  return mount(NotifyModal, {
    props,
    global: {
      stubs: { Teleport: true, Transition: true, i: true },
    },
  })
}

describe('NotifyModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStatus.value = 'idle'
    mockErrorMessage.value = ''
  })

  it('renders backdrop when modelValue is true', () => {
    const wrapper = mountModal()
    expect(wrapper.find('[data-testid="notify-modal-backdrop"]').exists()).toBe(true)
  })

  it('does not render when modelValue is false', () => {
    const wrapper = mountModal({ modelValue: false })
    expect(wrapper.find('[data-testid="notify-modal-backdrop"]').exists()).toBe(false)
  })

  it('closes on close button click', async () => {
    const wrapper = mountModal()
    await wrapper.find('[data-testid="notify-modal-close"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([false])
  })

  it('closes on backdrop click', async () => {
    const wrapper = mountModal()
    await wrapper.find('[data-testid="notify-modal-backdrop"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([false])
  })

  it('does NOT close when clicking inside the modal (not backdrop)', async () => {
    const wrapper = mountModal()
    await wrapper.find('[data-testid="notify-modal"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })

  it('subscribes with valid email', async () => {
    const wrapper = mountModal()
    await wrapper.find('[data-testid="notify-modal-email"]').setValue('test@example.com')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()
    expect(mockSubscribe).toHaveBeenCalledWith('test@example.com')
  })

  it('does NOT subscribe with invalid email', async () => {
    const wrapper = mountModal()
    await wrapper.find('[data-testid="notify-modal-email"]').setValue('invalid')
    await wrapper.find('form').trigger('submit.prevent')
    expect(mockSubscribe).not.toHaveBeenCalled()
  })

  it('does NOT subscribe with empty email', async () => {
    const wrapper = mountModal()
    await wrapper.find('form').trigger('submit.prevent')
    expect(mockSubscribe).not.toHaveBeenCalled()
  })

  it('does NOT subscribe when loading', async () => {
    mockStatus.value = 'loading'
    const wrapper = mountModal()
    await wrapper.find('[data-testid="notify-modal-email"]').setValue('test@example.com')
    await wrapper.find('form').trigger('submit.prevent')
    expect(mockSubscribe).not.toHaveBeenCalled()
  })

  it('shows success state after subscription', async () => {
    const wrapper = mountModal()
    await wrapper.find('[data-testid="notify-modal-email"]').setValue('test@example.com')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()
    expect(wrapper.find('[data-testid="notify-modal-success"]').exists()).toBe(true)
  })

  it('resets state when modal closes', async () => {
    const wrapper = mountModal()
    await wrapper.setProps({ modelValue: false })
    await wrapper.vm.$nextTick()
    expect(mockReset).toHaveBeenCalled()
  })

  // --- KILL SURVIVING MUTANTS ---

  it('trims email before subscribing', async () => {
    const wrapper = mountModal()
    await wrapper.find('[data-testid="notify-modal-email"]').setValue('  test@example.com  ')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()
    expect(mockSubscribe).toHaveBeenCalledWith('test@example.com')
  })

  it('does NOT subscribe with whitespace-only email', async () => {
    const wrapper = mountModal()
    await wrapper.find('[data-testid="notify-modal-email"]').setValue('   ')
    await wrapper.find('form').trigger('submit.prevent')
    expect(mockSubscribe).not.toHaveBeenCalled()
  })

  it('submit button is disabled when loading', async () => {
    mockStatus.value = 'loading'
    const wrapper = mountModal()
    const btn = wrapper.find('[data-testid="notify-modal-submit"]')
    expect(btn.attributes('disabled')).toBeDefined()
  })

  it('email input is disabled when loading', async () => {
    mockStatus.value = 'loading'
    const wrapper = mountModal()
    const input = wrapper.find('[data-testid="notify-modal-email"]')
    expect(input.attributes('disabled')).toBeDefined()
  })

  it('shows error message with errorMessage when status is error', async () => {
    mockStatus.value = 'error'
    mockErrorMessage.value = 'Algo deu errado'
    const wrapper = mountModal()
    await flushPromises()
    expect(wrapper.find('[data-testid="notify-modal-error"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Algo deu errado')
  })

  it('does NOT reset when modal opens (only on close)', async () => {
    const wrapper = mount(NotifyModal, {
      props: { modelValue: false },
      global: { stubs: { Teleport: true, Transition: true, i: true } },
    })
    mockReset.mockClear()
    await wrapper.setProps({ modelValue: true })
    await wrapper.vm.$nextTick()
    expect(mockReset).not.toHaveBeenCalled()
  })

  it('clears email when modal closes then reopens', async () => {
    const wrapper = mountModal()
    await wrapper.find('[data-testid="notify-modal-email"]').setValue('test@example.com')
    await wrapper.setProps({ modelValue: false })
    await wrapper.vm.$nextTick()
    await wrapper.setProps({ modelValue: true })
    await wrapper.vm.$nextTick()
    const input = wrapper.find('[data-testid="notify-modal-email"]')
    expect((input.element as HTMLInputElement).value).toBe('')
  })

  it('submit button disabled when success', async () => {
    mockStatus.value = 'success'
    const wrapper = mountModal()
    // No form visible (v-if="!isSuccess"), success body shown
    expect(wrapper.find('[data-testid="notify-modal-success"]').exists()).toBe(true)
    expect(wrapper.find('form').exists()).toBe(false)
  })

  // --- KILL REMAINING MUTANTS ---

  it('email input starts empty', () => {
    const wrapper = mountModal()
    const input = wrapper.find('[data-testid="notify-modal-email"]')
    expect((input.element as HTMLInputElement).value).toBe('')
  })

  it('does NOT show error message when idle', () => {
    const wrapper = mountModal()
    expect(wrapper.find('[data-testid="notify-modal-error"]').exists()).toBe(false)
  })

  it('submit button is NOT disabled when idle', () => {
    const wrapper = mountModal()
    const btn = wrapper.find('[data-testid="notify-modal-submit"]')
    expect(btn.attributes('disabled')).toBeUndefined()
  })
})
