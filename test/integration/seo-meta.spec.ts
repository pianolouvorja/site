import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('SEO e meta tags integração', async () => {
  await setup({
    rootDir: process.cwd(),
  })

  describe('Open Graph', () => {
    it('inclui og:title na home', async () => {
      const html = await $fetch('/')
      expect(html).toMatch(/property="og:title"/i)
    })

    it('inclui og:description na home', async () => {
      const html = await $fetch('/')
      expect(html).toMatch(/property="og:description"/i)
    })

    it('inclui og:image na home', async () => {
      const html = await $fetch('/')
      expect(html).toMatch(/property="og:image"/i)
    })

    it('inclui og:url na home', async () => {
      const html = await $fetch('/')
      expect(html).toMatch(/property="og:url"/i)
    })
  })

  describe('Twitter Card', () => {
    it('inclui twitter:card', async () => {
      const html = await $fetch('/')
      expect(html).toMatch(/name="twitter:card"/i)
    })

    it('inclui twitter:title', async () => {
      const html = await $fetch('/')
      expect(html).toMatch(/name="twitter:title"/i)
    })
  })

  describe('JSON-LD', () => {
    it('inclui structured data JSON-LD na home', async () => {
      const html = await $fetch('/')
      expect(html).toMatch(/application\/ld\+json/i)
    })
  })

  describe('Meta tags por página', () => {
    it('home tem title com nome do app', async () => {
      const html = await $fetch('/')
      expect(html).toMatch(/<title[^>]*>[^<]*PIANO LouvorJA/i)
    })

    it('docs tem title próprio', async () => {
      const html = await $fetch('/docs')
      expect(html).toMatch(/<title[^>]*>[^<]*(Docs|Documenta|Documenta)/i)
    })

    it('contact tem title próprio', async () => {
      const html = await $fetch('/contact')
      expect(html).toMatch(/<title[^>]*>[^<]*(Contato|Contact|Contacto)/i)
    })

    it('privacy tem title próprio', async () => {
      const html = await $fetch('/privacy')
      expect(html).toMatch(/<title[^>]*>[^<]*(Privacidade|Privacy|Privacidad)/i)
    })

    it('terms tem title próprio', async () => {
      const html = await $fetch('/terms')
      expect(html).toMatch(/<title[^>]*>[^<]*(Termos|Terms|Términos)/i)
    })
  })

  describe('hreflang e canonical em rotas i18n', () => {
    it('página /en tem hreflang alternates', async () => {
      const html = await $fetch('/en')
      expect(html).toMatch(/hreflang="pt-BR"/i)
      expect(html).toMatch(/hreflang="en"/i)
      expect(html).toMatch(/hreflang="es"/i)
    })

    it('página /es tem canonical', async () => {
      const html = await $fetch('/es')
      expect(html).toMatch(/rel="canonical"/i)
    })

    it('página /en/docs tem canonical próprio', async () => {
      const html = await $fetch('/en/docs')
      expect(html).toMatch(/rel="canonical"/i)
      expect(html).toMatch(/\/en\/docs/i)
    })
  })
})
