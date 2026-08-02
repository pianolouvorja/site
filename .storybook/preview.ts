import type { Preview } from '@storybook/vue3'
import { setup } from '@storybook/vue3'
import { h } from 'vue'

// Mock i18n $t — returns the key itself so stories render without full Nuxt i18n
const i18nPlugin = {
  install(app: any) {
    app.config.globalProperties.$t = (key: string) => key
  },
}

setup((app) => {
  app.use(i18nPlugin)
})

// Wrapper decorator that provides $t for components that use it in template
const withI18n = (Story: any) => ({
  components: { Story },
  setup() {
    return () =>
      h(
        'div',
        {
          style:
            'min-height: 100vh; background: #0a0a0f; color: #e0e0e0; font-family: system-ui, sans-serif;',
        },
        [h(Story)],
      )
  },
})

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#0a0a0f' },
        { name: 'light', value: '#ffffff' },
      ],
    },
  },
  decorators: [withI18n],
}

export default preview
