import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('SSR rendering das páginas', async () => {
  await setup({
    rootDir: process.cwd(),
  })

  describe('Página inicial (index)', () => {
    it('renderiza HTML no SSR', async () => {
      const html = await $fetch('/')
      expect(html).toContain('<!DOCTYPE html>')
    })

    it('renderiza o título da página', async () => {
      const html = await $fetch('/')
      expect(html).toMatch(/PIANO LouvorJA/i)
    })

    it('renderiza hero subtitle', async () => {
      const html = await $fetch('/')
      expect(html).toContain('data-testid="hero-subtitle"')
    })

    it('renderiza hero CTA', async () => {
      const html = await $fetch('/')
      expect(html).toContain('data-testid="hero-cta"')
    })

    it('renderiza section de plataformas', async () => {
      const html = await $fetch('/')
      expect(html).toContain('data-testid="platform-card"')
    })

    it('renderiza section de features', async () => {
      const html = await $fetch('/')
      expect(html).toContain('data-testid="feature-card"')
    })

    it('renderiza section de stats', async () => {
      const html = await $fetch('/')
      expect(html).toContain('data-testid="stat-item"')
      expect(html).toContain('data-testid="stat-num"')
    })

    it('renderiza section de como funciona', async () => {
      const html = await $fetch('/')
      expect(html).toContain('data-testid="step"')
      expect(html).toContain('data-testid="step-title"')
    })

    it('renderiza CTA final', async () => {
      const html = await $fetch('/')
      expect(html).toContain('data-testid="cta-button"')
    })
  })

  describe('Página de documentação', () => {
    it('renderiza no SSR', async () => {
      const html = await $fetch('/docs')
      expect(html).toContain('<!DOCTYPE html>')
    })

    it('renderiza navegação da docs', async () => {
      const html = await $fetch('/docs')
      expect(html).toContain('data-testid="docs-nav-gettingStarted"')
    })

    it('renderiza seções da docs', async () => {
      const html = await $fetch('/docs')
      expect(html).toContain('data-testid="docs-section-gettingStarted"')
    })

    it('renderiza passos da docs', async () => {
      const html = await $fetch('/docs')
      expect(html).toMatch(/data-testid="docs-step-\d+"/)
    })

    it('renderiza features da docs', async () => {
      const html = await $fetch('/docs')
      expect(html).toMatch(/data-testid="docs-feature-[^"]+"/)
    })

    it('renderiza FAQs da docs', async () => {
      const html = await $fetch('/docs')
      expect(html).toMatch(/data-testid="docs-faq-[^"]+"/)
    })
  })

  describe('Página de contato', () => {
    it('renderiza no SSR', async () => {
      const html = await $fetch('/contact')
      expect(html).toContain('<!DOCTYPE html>')
    })

    it('renderiza o formulário com todos os campos', async () => {
      const html = await $fetch('/contact')
      expect(html).toContain('data-testid="contact-name-input"')
      expect(html).toContain('data-testid="contact-email-input"')
      expect(html).toContain('data-testid="contact-subject-input"')
      expect(html).toContain('data-testid="contact-message-input"')
      expect(html).toContain('data-testid="contact-submit-btn"')
    })

    it('renderiza o link de email alternativo', async () => {
      const html = await $fetch('/contact')
      expect(html).toContain('data-testid="contact-email-link"')
    })
  })

  describe('Página de privacidade', () => {
    it('renderiza no SSR', async () => {
      const html = await $fetch('/privacy')
      expect(html).toContain('<!DOCTYPE html>')
    })

    it('contém conteúdo de privacidade', async () => {
      const html = await $fetch('/privacy')
      expect(html).toMatch(/privacidade|privacy/i)
    })
  })

  describe('Página de termos', () => {
    it('renderiza no SSR', async () => {
      const html = await $fetch('/terms')
      expect(html).toContain('<!DOCTYPE html>')
    })

    it('contém conteúdo de termos', async () => {
      const html = await $fetch('/terms')
      expect(html).toMatch(/termos|terms/i)
    })
  })
})
