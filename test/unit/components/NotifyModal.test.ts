import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'

// Mock useNewsletter
const mockStatus = ref('idle')
const mockErrorMessage = ref('')
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

import NotifyModal from '~/components/NotifyModal.vue'

const defaultProps = { modelValue: true }

function mountModal(props = defaultProps) {
  return mount(NotifyModal, {
    props,
    global: {
      stubs: ['i', 'transition', 'teleport'],
    },
  })
}

describe('NotifyModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStatus.value = 'idle'
    mockErrorMessage.value = ''
  })

  it('renders when modelValue is true', () => {
    const wrapper = mountModal()
    expect(wrapper.find('.notify-modal__backdrop').exists()).toBe(true)
  })

  it('does not render backdrop when modelValue is false', () => {
    const wrapper = mountModal({ modelValue: false })
    expect(wrapper.find('.notify-modal__backdrop').exists()).toBe(false)
  })

  it('closes on close button click and emits update:modelValue', async () => {
    const wrapper = mountModal()
    const closeBtn = wrapper.find('.notify-modal__close')
    await closeBtn.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([false])
  })

  it('closes on backdrop click', async () => {
    const wrapper = mountModal()
    const backdrop = wrapper.find('.notify-modal__backdrop')
    await backdrop.trigger('click')
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([false])
  })

  it('does not close when clicking inside the modal (not the backdrop)', async () => {
    const wrapper = mountModal()
    const modal = wrapper.find('.notify-modal')
    await modal.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })

  it('subscribes with valid email on submit', async () => {
    const wrapper = mountModal()
    const input = wrapper.find('input[type="email"]')
    await input.setValue('test@example.com')
    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await flushPromises()

    expect(mockSubscribe).toHaveBeenCalledWith('test@example.com')
  })

  it('does not subscribe with invalid email', async () => {
    const wrapper = mountModal()
    const input = wrapper.find('input[type="email"]')
    await input.setValue('invalid-email')
    const form = wrapper.find('form')
    await form.trigger('submit.prevent')

    expect(mockSubscribe).not.toHaveBeenCalled()
  })

  it('does not subscribe with empty email', async () => {
    const wrapper = mountModal()
    const form = wrapper.find('form')
    await form.trigger('submit.prevent')

    expect(mockSubscribe).not.toHaveBeenCalled()
  })

  it('does not subscribe when already loading', async () => {
    mockStatus.value = 'loading'
    const wrapper = mountModal()
    const input = wrapper.find('input[type="email"]')
    await input.setValue('test@example.com')
    const form = wrapper.find('form')
    await form.trigger('submit.prevent')

    expect(mockSubscribe).not.toHaveBeenCalled()
  })

  it('shows success state after successful subscription', async () => {
    const wrapper = mountModal()
    const input = wrapper.find('input[type="email"]')
    await input.setValue('test@example.com')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.find('[data-testid="notify-modal-success"]').exists()).toBe(true)
  })

  it('resets email and state when modal closes (watch isOpen)', async () => {
    const wrapper = mountModal()
    await wrapper.setProps({ modelValue: false })
    await wrapper.vm.$nextTick()

    expect(mockReset).toHaveBeenCalled()
  })

  it('trims email before subscribing', async () => {
    const wrapper = mountModal()
    const input = wrapper.find('input[type="email"]')
    await input.setValue('  test@example.com  ')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(mockSubscribe).toHaveBeenCalledWith('test@example.com')
  })

  it('shows error message when subscribe fails', async () => {
    mockStatus.value = 'error'
    mockErrorMessage.value = 'Algo deu errado'

    const wrapper = mountModal()
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-testid="notify-modal-error"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Algo deu errado')
  })

  it('watch isOpen: does nothing when modal opens (only resets on close)', async () => {
    const wrapper = mount(NotifyModal, {
      props: { modelValue: false },
      global: { stubs: { Teleport: true, Transition: true } },
    })

    // Opening the modal should NOT reset (only closing resets)
    await wrapper.setProps({ modelValue: true })
    expect(mockReset).not.toHaveBeenCalled()
  })
})
