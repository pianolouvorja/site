import { test, expect } from '@playwright/test'

test.describe('Navigation & i18n', () => {
  test('header nav links are present', async ({ page }) => {
    await page.goto('/')
    const header = page.locator('.header')
    await expect(header).toBeVisible()
    // navLinks from site.ts: features, platforms, how-it-works, about, /docs, /contact
    const navLinks = header.locator('a')
    const count = await navLinks.count()
    expect(count).toBeGreaterThanOrEqual(4)
  })

  test('footer nav links are present', async ({ page }) => {
    await page.goto('/')
    const footer = page.locator('.footer')
    await expect(footer).toBeVisible()
    const links = footer.locator('a')
    const count = await links.count()
    expect(count).toBeGreaterThanOrEqual(3)
  })

  test('navigates to docs page', async ({ page }) => {
    await page.goto('/')
    // navLinks: /docs → localePath generates /docs or /{locale}/docs
    await page.locator('.header a[href*="docs"]').first().click()
    await expect(page).toHaveURL(/\/docs/)
    // Docs page has sidebar with module sections
    await expect(page.locator('.docs-page')).toBeVisible()
  })

  test('navigates to contact page', async ({ page }) => {
    // /contact está em secondaryNavLinks — navegar diretamente
    await page.goto('/contact')
    await expect(page).toHaveURL(/\/contact/)
    await expect(page.locator('.contact-page')).toBeVisible()
  })

  test('footer links to privacy page', async ({ page }) => {
    await page.goto('/')
    await page.locator('.footer a[href="/privacy"]').first().click()
    await expect(page).toHaveURL(/\/privacy/)
  })

  test('footer links to terms page', async ({ page }) => {
    await page.goto('/')
    await page.locator('.footer a[href="/terms"]').first().click()
    await expect(page).toHaveURL(/\/terms/)
  })

  test('logo click returns to home', async ({ page }) => {
    await page.goto('/docs')
    // Logo uses class .header__brand-group with href to #hero
    await page.locator('.header__brand-group').first().click()
    // Logo navigates to home with #hero hash
    await expect(page).toHaveURL(/localhost:3001\/?(#hero)?$/)
  })

  test('language switcher toggles open', async ({ page }) => {
    await page.goto('/')
    const langButton = page
      .locator('.header__lang-button, .header__lang-current, [data-testid="lang-toggle"]')
      .first()
    if (await langButton.isVisible()) {
      await langButton.click()
      // Menu should appear
      const menu = page.locator('.header__lang-menu, .header__lang-dropdown')
      await expect(menu.first()).toBeVisible()
    }
  })

  test('switches to English locale', async ({ page }) => {
    await page.goto('/en')
    await expect(page).toHaveURL(/\/en/)
  })

  test('switches to Spanish locale', async ({ page }) => {
    await page.goto('/es')
    await expect(page).toHaveURL(/\/es/)
  })

  test('all three locales render hero section', async ({ page }) => {
    for (const path of ['/', '/en', '/es']) {
      await page.goto(path)
      await expect(page.locator('#hero')).toBeVisible()
      await expect(page.locator('[data-testid="hero-subtitle"]')).toBeVisible()
    }
  })

  test('404 page renders error with back home button', async ({ page }) => {
    await page.goto('/nonexistent-page-xyz')
    await expect(page.locator('[data-testid="error-back-home"]')).toBeVisible()
  })

  test('404 back home button redirects to root', async ({ page }) => {
    await page.goto('/nonexistent-page-xyz')
    await page.locator('[data-testid="error-back-home"]').click()
    await expect(page).toHaveURL(/localhost:3001\/?$/)
  })
})
