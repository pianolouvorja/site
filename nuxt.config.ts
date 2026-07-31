export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },

  modules: ['@nuxtjs/i18n'],

  i18n: {
    locales: [
      { code: 'pt-BR', language: 'pt-BR', name: 'Português', file: 'pt-BR.json' },
      { code: 'en', language: 'en', name: 'English', file: 'en.json' },
      { code: 'es', language: 'es', name: 'Español', file: 'es.json' },
    ],
    defaultLocale: 'pt-BR',
    strategy: 'no_prefix',
    langDir: 'locales',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'piano_lang',
      redirectOn: 'root',
    },
  },

  // Static Site Generation
  ssr: true,

  // Global CSS
  css: ['@tabler/icons-webfont/dist/tabler-icons.min.css', '~/assets/css/main.scss'],
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/', '/200.html', '/404.html'],
    },
  },

  // Allow tunnel hosts (cloudflare quick tunnels)
  vite: {
    server: {
      allowedHosts: true,
    },
  },

  // Favicon and icons only — SEO meta handled by useAppHead composable
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
})
