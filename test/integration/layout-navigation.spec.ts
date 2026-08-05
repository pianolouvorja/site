import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('Layout e navegação integração', async () => {
  await setup({
    rootDir: process.cwd(),
  })

  describe('Layout default (todas as páginas)', () => {
    it('renderiza header em todas as páginas', async () => {
      const pages = ['/', '/docs', '/contact', '/privacy', '/terms']
      for (const page of pages) {
        const html = await $fetch(page)
        expect(html).toContain('class="header"')
      }
    })

    it('renderiza footer em todas as páginas', async () => {
      const pages = ['/', '/docs', '/contact', '/privacy', '/terms']
      for (const page of pages) {
        const html = await $fetch(page)
        // Footer contém o nome do app
        expect(html).toMatch(/PIANO LouvorJA/i)
      }
    })

    it('renderiza skip-link para acessibilidade', async () => {
      const html = await $fetch('/')
      expect(html).toContain('href="#main-content"')
      expect(html).toContain('skip-link')
    })

    it('renderiza main com id main-content e tabindex', async () => {
      const html = await $fetch('/')
      expect(html).toContain('id="main-content"')
      expect(html).toContain('tabindex="-1"')
    })

    it('renderiza conteúdo no body (SSR hidratável)', async () => {
      const html = await $fetch('/')
      // __NUXT_DATA__ é injetado pelo SSR do Nuxt
      expect(html).toContain('__NUXT_DATA__')
    })
  })

  describe('Navegação do header', () => {
    it('renderiza links de navegação desktop', async () => {
      const html = await $fetch('/')
      expect(html).toContain('class="header__nav-desktop"')
      // Links de hash
      expect(html).toContain('#features')
      expect(html).toContain('#platforms')
      expect(html).toContain('#how-it-works')
      expect(html).toContain('#about')
      // Links internos
      expect(html).toMatch(/href="\/docs"/)
      expect(html).toMatch(/href="\/contact"/)
    })

    it('links de hash apontam para âncoras na home', async () => {
      const html = await $fetch('/')
      expect(html).toContain('#features')
      expect(html).toContain('#platforms')
      expect(html).toContain('#how-it-works')
    })

    it('links internos apontam para rotas', async () => {
      const html = await $fetch('/')
      expect(html).toMatch(/href="\/docs"/)
      expect(html).toMatch(/href="\/contact"/)
    })

    it('botão do menu mobile está presente', async () => {
      const html = await $fetch('/')
      expect(html).toContain('data-testid="header-menu-toggle"')
    })

    it('seletor de idioma está presente', async () => {
      const html = await $fetch('/')
      expect(html).toContain('data-testid="header-lang-toggle"')
    })
  })

  describe('Footer', () => {
    it('renderiza ano atual no copyright', async () => {
      const html = await $fetch('/')
      const year = new Date().getFullYear().toString()
      expect(html).toContain(year)
    })

    it('renderiza link do GitHub social', async () => {
      const html = await $fetch('/')
      expect(html).toMatch(/github\.com/i)
    })
  })

  describe('Navegação entre páginas (hash links fora da home)', () => {
    it('links de hash em /docs apontam de volta para home', async () => {
      const html = await $fetch('/docs')
      // Em páginas internas, hash links devem prefixed com /
      expect(html).toMatch(/href="[^"]*\/?#features"/)
    })

    it('links de hash em /contact apontam de volta para home', async () => {
      const html = await $fetch('/contact')
      expect(html).toMatch(/href="[^"]*\/?#features"/)
    })
  })
})
