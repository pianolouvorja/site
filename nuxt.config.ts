export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },

  modules: ['@nuxtjs/i18n'],

  i18n: {
    locales: [
      { code: 'pt-BR', language: 'pt-BR', name: 'Portugues', file: 'pt-BR.json' },
      { code: 'en', language: 'en', name: 'English', file: 'en.json' },
      { code: 'es', language: 'es', name: 'Espanol', file: 'es.json' },
    ],
    defaultLocale: 'pt-BR',
    strategy: 'prefix_except_default',
    langDir: '',

    bundle: {
      compositionOnly: false,
    },
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'piano_lang',
      redirectOn: 'root',
      alwaysRedirect: true,
      fallbackLocale: 'pt-BR',
    },
  },

  ssr: true,

  css: ['@tabler/icons-webfont/dist/tabler-icons.min.css', '~/assets/css/main.scss'],

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/', '/en', '/es', '/200.html', '/404.html'],
    },
  },

  vite: {
    server: {
      allowedHosts: true,
    },
  },

  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/ico/favicon.svg' },
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
        { rel: 'apple-touch-icon', href: '/ico/favicon.png' },
      ],
    },
  },

  typescript: {
    strict: true,
  },

  runtimeConfig: {
    public: {
      web3formsKey: process.env.WEB3FORMS_ACCESS_KEY || '',
      buttondownApiKey: process.env.BUTTONDOWN_API_KEY || '',
      buttondownEndpoint: 'https://api.buttondown.com/api/v1/subscribers',
    },
  },
})
