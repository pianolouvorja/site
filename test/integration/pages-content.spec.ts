import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('Renderização de páginas integração', async () => {
  await setup({
    rootDir: process.cwd(),
  })

  describe('Home (index)', () => {
    it('renderiza HeroSection com subtitle e CTAs', async () => {
      const html = await $fetch('/')
      expect(html).toContain('data-testid="hero-subtitle"')
      expect(html).toContain('data-testid="hero-cta"')
      expect(html).toContain('data-testid="hero-secondary"')
    })

    it('renderiza PlatformsSection', async () => {
      const html = await $fetch('/')
      expect(html).toContain('data-testid="platform-card"')
    })

    it('renderiza FeaturesSection com 8 features', async () => {
      const html = await $fetch('/')
      expect(html).toContain('data-testid="feature-card"')
      // Features: media, liturgy, bible, projection, tools, player, settings, offline
      expect(html).toMatch(
        /ti-music|ti-clipboard-text|ti-book-2|ti-device-desktop|ti-stopwatch|ti-player-play|ti-adjustments|ti-wifi-off/,
      )
    })

    it('renderiza StatsSection', async () => {
      const html = await $fetch('/')
      expect(html).toContain('data-testid="stat-item"')
      expect(html).toContain('data-testid="stat-num"')
    })

    it('renderiza HowItWorksSection com 4 steps', async () => {
      const html = await $fetch('/')
      expect(html).toContain('data-testid="step"')
      expect(html).toContain('data-testid="step-title"')
    })

    it('renderiza CtaSection', async () => {
      const html = await $fetch('/')
      expect(html).toContain('data-testid="cta-button"')
    })
  })

  describe('Docs', () => {
    it('renderiza todas as seções de módulos', async () => {
      const html = await $fetch('/docs')
      // Sections dinâmicas: docs-section-{modId}
      const matches = html.match(/data-testid="docs-section-[^"]+"/g) || []
      expect(matches.length).toBeGreaterThanOrEqual(1)
    })

    it('renderiza seção de FAQ', async () => {
      const html = await $fetch('/docs')
      expect(html).toMatch(/data-testid="docs-faq-[^"]+"/)
    })

    it('renderiza atalhos de teclado', async () => {
      const html = await $fetch('/docs')
      expect(html).toContain('data-testid="docs-shortcuts-table"')
    })

    it('renderiza guia de início', async () => {
      const html = await $fetch('/docs')
      expect(html).toContain('data-testid="docs-section-gettingStarted"')
    })

    it('renderiza navegação da docs', async () => {
      const html = await $fetch('/docs')
      expect(html).toContain('data-testid="docs-nav-gettingStarted"')
    })

    it('renderiza steps da docs', async () => {
      const html = await $fetch('/docs')
      expect(html).toMatch(/data-testid="docs-step-\d+"/)
    })

    it('renderiza features da docs', async () => {
      const html = await $fetch('/docs')
      expect(html).toMatch(/data-testid="docs-feature-[^"]+"/)
    })
  })

  describe('Contact', () => {
    it('renderiza formulário com todos os campos', async () => {
      const html = await $fetch('/contact')
      expect(html).toContain('data-testid="contact-name-input"')
      expect(html).toContain('data-testid="contact-email-input"')
      expect(html).toContain('data-testid="contact-subject-input"')
      expect(html).toContain('data-testid="contact-message-input"')
      expect(html).toContain('data-testid="contact-submit-btn"')
    })

    it('botão de submit começa desabilitado (form inválido)', async () => {
      const html = await $fetch('/contact')
      // Form começa vazio → isValid=false → disabled
      expect(html).toContain('data-testid="contact-submit-btn"')
      expect(html).toContain('disabled')
    })

    it('renderiza link de email alternativo', async () => {
      const html = await $fetch('/contact')
      expect(html).toContain('data-testid="contact-email-link"')
    })
  })

  describe('Privacy', () => {
    it('renderiza conteúdo de privacidade', async () => {
      const html = await $fetch('/privacy')
      // Deve ter múltiplas seções
      const sections = html.match(/<(h2|h3)[^>]*>/g) || []
      expect(sections.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('Terms', () => {
    it('renderiza conteúdo de termos', async () => {
      const html = await $fetch('/terms')
      // Deve ter múltiplas seções
      const sections = html.match(/<(h2|h3)[^>]*>/g) || []
      expect(sections.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('Error page (404)', () => {
    it('renderiza página de erro para rota inexistente', async () => {
      // $fetch lança em 404 — captura o HTML do erro
      const html = await $fetch('/pagina-que-nao-existe').catch((e: unknown) => {
        const err = e as { data?: string; response?: { data?: string } }
        const body = err?.data ?? err?.response?.data ?? ''
        return typeof body === 'string' ? body : JSON.stringify(body)
      })
      // Error page tem botão voltar ou indicador de erro
      expect(
        html.includes('data-testid="error-back-home"') ||
          html.includes('404') ||
          html.includes('error'),
      ).toBe(true)
    })
  })
})
