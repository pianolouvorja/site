import type { Meta, StoryObj } from '@storybook/vue3'
import { setup } from '@storybook/vue3'
import { defineComponent, h, ref } from 'vue'
import TheHeader from './TheHeader.vue'

// Mock NuxtLink as a plain <a> tag
const NuxtLink = defineComponent({
  name: 'NuxtLink',
  props: { to: { type: String, default: '#' } },
  setup(props, { slots }) {
    return () => h('a', { href: props.to }, slots.default?.())
  },
})

// Mock useI18n, useRoute, useLocalePath (Nuxt auto-imports)
const nuxtMocks = {
  install(app: any) {
    app.config.globalProperties.$t = (key: string) => key
    app.component('NuxtLink', NuxtLink)
  },
}

setup((app) => {
  app.use(nuxtMocks)
  // Stub Nuxt auto-import composables on window/globalThis
  const mockLocale = ref('pt-BR')
  const mockLocales = ref([
    { code: 'pt-BR', name: 'Português' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
  ])
  // @ts-expect-error Storybook global stub
  globalThis.useI18n = () => ({
    locale: mockLocale,
    locales: mockLocales,
    setLocale: (code: string) => {
      mockLocale.value = code
    },
  })
  // @ts-expect-error Storybook global stub
  globalThis.useRoute = () => ({ path: '/' })
  // @ts-expect-error Storybook global stub
  globalThis.useLocalePath = () => (path: string) => path
})

const meta = {
  title: 'Layout/TheHeader',
  component: TheHeader,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Sticky site header with logo, nav links, language switcher (pt-BR/en/es), and CTA button. Mobile hamburger menu at <=768px.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TheHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Scrolled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Header with `isScrolled` state — darker background after scrolling 20px+. (Visual only — interact by scrolling the canvas.)',
      },
    },
  },
}
