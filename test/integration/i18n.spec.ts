import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('i18n integração', async () => {
  await setup({
    rootDir: process.cwd(),
  })

  describe('Locale pt-BR (padrão, sem prefixo)', () => {
    it('renderiza conteúdo em português na rota raiz', async () => {
      const html = await $fetch('/')
      // Título do hero ou nav em pt-BR
      expect(html).toMatch(/Funcionalidades|Plataformas|Como Funciona/i)
    })

    it('define lang="pt-BR" no html', async () => {
      const html = await $fetch('/')
      expect(html).toMatch(/<html[^>]*lang="pt-BR"/i)
    })
  })

  describe('Locale en (prefixo /en)', () => {
    it('renderiza conteúdo em inglês', async () => {
      const html = await $fetch('/en')
      expect(html).toMatch(/Features|Platforms|How It Works/i)
    })

    it('define lang="en" no html', async () => {
      const html = await $fetch('/en')
      expect(html).toMatch(/<html[^>]*lang="en"/i)
    })

    it('traduz página de docs', async () => {
      const html = await $fetch('/en/docs')
      // Conteúdo traduzido deve diferir do pt-BR
      expect(html).toMatch(/Documentation|Docs|Guide/i)
    })

    it('traduz página de contato', async () => {
      const html = await $fetch('/en/contact')
      expect(html).toMatch(/Contact|Get in touch/i)
    })
  })

  describe('Locale es (prefixo /es)', () => {
    it('renderiza conteúdo em espanhol', async () => {
      const html = await $fetch('/es')
      expect(html).toMatch(/Características|Plataformas|Cómo Funciona/i)
    })

    it('define lang="es" no html', async () => {
      const html = await $fetch('/es')
      expect(html).toMatch(/<html[^>]*lang="es"/i)
    })

    it('traduz página de docs', async () => {
      const html = await $fetch('/es/docs')
      expect(html).toMatch(/Documentación|Documentacion|Guía|Guia/i)
    })

    it('traduz página de contato', async () => {
      const html = await $fetch('/es/contact')
      expect(html).toMatch(/Contacto|Contáctanos|Contactanos/i)
    })
  })

  describe('hreflang tags', () => {
    it('inclui hreflang para pt-BR na home', async () => {
      const html = await $fetch('/')
      expect(html).toMatch(/hreflang="pt-BR"/i)
    })

    it('inclui hreflang para en', async () => {
      const html = await $fetch('/')
      expect(html).toMatch(/hreflang="en"/i)
    })

    it('inclui hreflang para es', async () => {
      const html = await $fetch('/')
      expect(html).toMatch(/hreflang="es"/i)
    })

    it('inclui canonical URL', async () => {
      const html = await $fetch('/')
      expect(html).toMatch(/rel="canonical"/i)
    })
  })
})
