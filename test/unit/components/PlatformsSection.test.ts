import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PlatformsSection from '~/components/PlatformsSection.vue'

const mountPlatform = () =>
  mount(PlatformsSection, {
    global: {
      stubs: {
        ClientOnly: { template: '<slot />' },
        NotifyModal: { template: '<div class="stub-notify" />' },
      },
    },
  })

describe('PlatformsSection', () => {
  it('renderiza o titulo da secao', () => {
    const wrapper = mountPlatform()
    expect(wrapper.text()).toContain('Disponível onde você precisa')
  })

  it('renderiza o eyebrow da secao', () => {
    const wrapper = mountPlatform()
    expect(wrapper.text()).toContain('Multiplataforma')
  })

  it('renderiza 3 cards de plataforma', () => {
    const wrapper = mountPlatform()
    const cards = wrapper.findAll('[data-testid="platform-card"]')
    expect(cards.length).toBe(3)
  })

  it('cada card tem titulo, descricao e CTA', () => {
    const wrapper = mountPlatform()
    const cards = wrapper.findAll('[data-testid="platform-card"]')
    cards.forEach((card) => {
      expect(card.text().length).toBeGreaterThan(0)
      expect(card.find('a').exists()).toBe(true)
    })
  })

  it('card desktop aponta para #download', () => {
    const wrapper = mountPlatform()
    const cards = wrapper.findAll('[data-testid="platform-card"]')
    const desktopCard = cards[0]
    const cta = desktopCard.find('a')
    expect(cta.attributes('href')).toBe('#download')
  })

  it('card web aponta para a URL do app', () => {
    const wrapper = mountPlatform()
    const cards = wrapper.findAll('[data-testid="platform-card"]')
    const webCard = cards[1]
    const cta = webCard.find('a')
    expect(cta.attributes('href')).toMatch(/^https:\/\//)
  })

  it('card mobile abre modal de notificacao', async () => {
    const NotifyModalStub = {
      name: 'NotifyModal',
      props: ['modelValue'],
      template: '<div v-if="modelValue" data-testid="notify-modal" />',
    }
    const wrapper = mount(PlatformsSection, {
      global: {
        stubs: {
          ClientOnly: { name: 'ClientOnly', template: '<slot />' },
          NotifyModal: NotifyModalStub,
        },
      },
    })
    const cards = wrapper.findAll('[data-testid="platform-card"]')
    const mobileCard = cards[2]
    const cta = mobileCard.find('[data-testid="mobile-notify-trigger"]')
    expect(cta.exists()).toBe(true)
    await cta.trigger('click')
    expect(wrapper.find('[data-testid="notify-modal"]').exists()).toBe(true)
  })

  it('openNotifyModal define showNotifyModal como true', () => {
    const wrapper = mountPlatform()
    // Chama a funcao diretamente para garantir coverage da funcao
    wrapper.vm.openNotifyModal()
    expect(wrapper.vm.showNotifyModal).toBe(true)
  })

  it('showNotifyModal inicia como false', () => {
    const wrapper = mountPlatform()
    expect(wrapper.vm.showNotifyModal).toBe(false)
  })

  it('v-model update:modelValue fecha o modal', async () => {
    const NotifyModalStub = {
      name: 'NotifyModal',
      props: ['modelValue'],
      emits: ['update:modelValue'],
      template: '<div data-testid="notify-stub" />',
    }
    const wrapper = mount(PlatformsSection, {
      global: {
        stubs: {
          ClientOnly: { name: 'ClientOnly', template: '<slot />' },
          NotifyModal: NotifyModalStub,
        },
      },
    })
    wrapper.vm.openNotifyModal()
    expect(wrapper.vm.showNotifyModal).toBe(true)
    // Simula NotifyModal emitindo update:modelValue=false (fechar)
    wrapper.findComponent({ name: 'NotifyModal' }).vm.$emit('update:modelValue', false)
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.showNotifyModal).toBe(false)
  })
})
