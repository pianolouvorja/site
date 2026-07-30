export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },

  // Static Site Generation
  ssr: true,

  // Global CSS
  css: ['@tabler/icons-webfont/dist/tabler-icons.min.css', '~/assets/css/main.scss'],
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/'],
    },
  },

  // Allow tunnel hosts (cloudflare quick tunnels)
  vite: {
    server: {
      allowedHosts: true,
    },
  },

  // Meta tags SEO
  app: {
    head: {
      htmlAttrs: { lang: 'pt-BR' },
      title: 'PIANO LouvorJA — Gerenciador de Culto Web',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Plataforma web para gerenciamento de cultos: hinario, biblia, liturgia, projecao multi-tela e mais.',
        },
        { property: 'og:title', content: 'PIANO LouvorJA' },
        {
          property: 'og:description',
          content: 'Gerenciamento de culto na web. Simples, rapido, completo.',
        },
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'pt_BR' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },

  typescript: {
    strict: true,
  },
})
