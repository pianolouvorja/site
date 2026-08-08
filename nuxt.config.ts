export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },

  modules: ['@nuxtjs/i18n', 'nuxt-gtag'],

  gtag: {
    id: process.env.GOOGLE_ANALYTICS_ID || '',
    loadingStrategy: 'async',
  },

  i18n: {
    locales: [
      { code: 'pt-BR', language: 'pt-BR', name: 'Portugues', file: 'pt-BR.json' },
      { code: 'en', language: 'en', name: 'English', file: 'en.json' },
      { code: 'es', language: 'es', name: 'Espanol', file: 'es.json' },
    ],
    defaultLocale: 'pt-BR',
    strategy: 'prefix_except_default',
    langDir: '../i18n',

    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'piano_lang',
      redirectOn: 'root',
      alwaysRedirect: false,
      fallbackLocale: 'pt-BR',
    },
  },

  ssr: true,

  css: ['@tabler/icons-webfont/dist/tabler-icons.min.css', '~/assets/css/main.scss'],

  routeRules: {
    // Admin pages are client-only (Firebase Auth)
    '/admin/**': { ssr: false },
  },

  nitro: {
    prerender: {
      // Ignore admin routes — they're client-only (Firebase Auth)
      ignore: ['/admin', '/admin/**'],
      crawlLinks: false,
      routes: [
        '/',
        '/en',
        '/es',
        '/200.html',
        '/404.html',
        // GitHub API — pré-renderizado como JSON estático (sem servidor Node em produção)
        // Pular durante testes (VITEST) para evitar rate limit da API do GitHub
        ...(!process.env.VITEST ? ['/api/github/contributors', '/api/github/releases'] : []),
      ],
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
    // Server-only secrets
    abacatePayApiKey: process.env.ABACATEPAY_API_KEY || '',
    firebaseServiceAccount: process.env.FIREBASE_SERVICE_ACCOUNT || '',

    // SMTP (Hostinger) — Newsletter manager
    smtpHost: process.env.SMTP_HOST || '',
    smtpPort: parseInt(process.env.SMTP_PORT || '465'),
    smtpSecure: process.env.SMTP_SECURE !== 'false',
    smtpUser: process.env.SMTP_USER || '',
    smtpPass: process.env.SMTP_PASS || '',
    smtpFromName: process.env.SMTP_FROM_NAME || 'Piano LouvorJA',
    smtpFromEmail: process.env.SMTP_FROM_EMAIL || '',
    buttondownApiKey: process.env.BUTTONDOWN_API_KEY || '',
    llmApiKey: process.env.LLM_API_KEY || '',
    llmModel: process.env.LLM_MODEL || 'glm-4-flash',

    public: {
      web3formsKey: process.env.WEB3FORMS_ACCESS_KEY || '',
      buttondownApiKey: process.env.BUTTONDOWN_API_KEY || '',
      buttondownEndpoint: 'https://api.buttondown.com/api/v1/subscribers',

      // GA4
      googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID || '',

      // Firebase public config (client-side)
      firebaseApiKey: process.env.FIREBASE_API_KEY || '',
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID || '',
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
      firebaseAppId: process.env.FIREBASE_APP_ID || '',

      // Admin authorization (comma-separated emails)
      adminEmails: process.env.ADMIN_EMAILS || '',
    },
  },
})
