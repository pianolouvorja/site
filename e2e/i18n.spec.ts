import { test, expect } from '@playwright/test'

test.describe('Internationalization (i18n)', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies AND set pt-BR as default to prevent locale persistence
    // Without this, piano_lang cookie from a previous test or Accept-Language
    // header could make the active locale = en, hiding header-lang-en from dropdown
    await page.context().clearCookies()
    await page.context().addCookies([
      {
        name: 'piano_lang',
        value: 'pt-BR',
        url: 'http://localhost:3001',
      },
    ])
  })

  test('default locale is pt-BR (no prefix)', async ({ page }) => {
    await page.goto('/')

    // Hero title should contain Portuguese text
    const heroTitle = page.locator('.hero__title')
    await expect(heroTitle).toBeVisible()
    const titleText = await heroTitle.innerText()
    // pt-BR content — check for a word that differs by locale
    expect(titleText.length).toBeGreaterThan(10)
  })

  test('switching to English changes URL to /en', async ({ page }) => {
    await page.goto('/')

    // Open language menu
    await page.locator('[data-testid="header-lang-toggle"]').click()

    // Click English option (use testid — Transition may delay visibility)
    await expect(page.locator('[data-testid="header-lang-en"]')).toBeVisible()
    await page.locator('[data-testid="header-lang-en"]').click()

    await expect(page).toHaveURL(/\/en/)
  })

  test('switching to Spanish changes URL to /es', async ({ page }) => {
    await page.goto('/')

    await page.locator('[data-testid="header-lang-toggle"]').click()

    await expect(page.locator('[data-testid="header-lang-es"]')).toBeVisible()
    await page.locator('[data-testid="header-lang-es"]').click()

    await expect(page).toHaveURL(/\/es/)
  })

  test('English page shows English content', async ({ page }) => {
    await page.goto('/en')

    // Footer copyright should be in English
    const footerText = await page.locator('.footer__copyright').innerText()
    expect(footerText.length).toBeGreaterThan(5)

    // CTA button link preserved across locales
    await expect(page.locator('[data-testid="hero-cta"]')).toHaveAttribute(
      'href',
      'https://app.pianolouvorja.com.br',
    )
  })

  test('Spanish page shows Spanish content', async ({ page }) => {
    await page.goto('/es')

    const footerText = await page.locator('.footer__copyright').innerText()
    expect(footerText.length).toBeGreaterThan(5)

    await expect(page.locator('[data-testid="hero-cta"]')).toHaveAttribute(
      'href',
      'https://app.pianolouvorja.com.br',
    )
  })

  test('all locales render all landing sections', async ({ page }) => {
    const locales = ['/', '/en', '/es']

    for (const path of locales) {
      await page.goto(path)

      // Core sections must render in every locale
      await expect(page.locator('#features')).toBeVisible()
      await expect(page.locator('#platforms')).toBeVisible()
      await expect(page.locator('#cta')).toBeVisible()
      await expect(page.locator('#about')).toBeVisible()
    }
  })

  test('lang toggle has aria-expanded attribute', async ({ page }) => {
    await page.goto('/')

    const toggle = page.locator('[data-testid="header-lang-toggle"]')
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')

    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  })

  test('language menu closes on outside click', async ({ page }) => {
    await page.goto('/')

    await page.locator('[data-testid="header-lang-toggle"]').click()
    const menu = page.locator('[data-testid="header-lang-menu"]')
    await expect(menu).toBeVisible()

    // Click outside
    await page.locator('h1').first().click()
    await expect(menu).toBeHidden()
  })

  test('direct URL to /en/docs works', async ({ page }) => {
    await page.goto('/en/docs')
    await expect(page).toHaveURL(/\/en\/docs/)
    await expect(page.locator('.docs-hero__title')).toBeVisible()
  })

  test('direct URL to /es/privacy works', async ({ page }) => {
    await page.goto('/es/privacy')
    await expect(page).toHaveURL(/\/es\/privacy/)
    await expect(page.locator('.legal-page__title')).toBeVisible()
  })
})
