import { test, expect } from '@playwright/test'

test.describe('Internacionalização — i18n', () => {
  test('página em português por padrão', async ({ page }) => {
    await page.goto('/')
    const html = page.locator('html')
    const lang = await html.getAttribute('lang')
    expect(lang).toContain('pt')
  })

  test('muda para inglês em /en', async ({ page }) => {
    await page.goto('/en')
    const html = page.locator('html')
    const lang = await html.getAttribute('lang')
    expect(lang).toContain('en')
  })

  test('muda para espanhol em /es', async ({ page }) => {
    await page.goto('/es')
    const html = page.locator('html')
    const lang = await html.getAttribute('lang')
    expect(lang).toContain('es')
  })

  test('conteúdo muda entre idiomas', async ({ page }) => {
    await page.goto('/')
    const ptTitle = await page.title()

    await page.goto('/en')
    const enTitle = await page.title()

    // Os títulos devem ser diferentes (traduzidos)
    expect(ptTitle).not.toBe(enTitle)
  })

  test('language selector está visível no header', async ({ page }) => {
    await page.goto('/')
    const header = page.locator('header')
    // Deve haver um botão/link para trocar de idioma
    const langElements = header.locator('text=/EN|ES|PT|English|Español|Português/i')
    const count = await langElements.count()
    expect(count).toBeGreaterThan(0)
  })
})
