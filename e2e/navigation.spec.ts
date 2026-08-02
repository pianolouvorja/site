import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('header nav links scroll to sections on landing', async ({ page }) => {
    await page.goto('/')

    // Click on features nav link
    const featuresLink = page
      .locator('.header__nav-link')
      .filter({ hasText: /Funcionalidades|Features/ })
    await featuresLink.click()
    await expect(page.locator('#features')).toBeVisible()
  })

  test('navigates to docs page', async ({ page }) => {
    await page.goto('/')

    // Find docs nav link and click
    const docsLink = page.locator('.header__nav-link').filter({ hasText: /Documenta|Docs/ })
    await docsLink.click()

    await expect(page).toHaveURL(/\/docs/)
    await expect(page.locator('.docs-hero__title')).toBeVisible()
  })

  test('navigates to contact page', async ({ page }) => {
    await page.goto('/')

    const contactLink = page.locator('.header__nav-link').filter({ hasText: /Contato|Contact/ })
    await contactLink.click()

    await expect(page).toHaveURL(/\/contact/)
    await expect(page.locator('.contact-hero__title')).toBeVisible()
  })

  test('footer privacy link navigates to privacy page', async ({ page }) => {
    await page.goto('/')

    const privacyLink = page.locator('.footer__nav a').filter({ hasText: /Privacidade|Privacy/ })
    await privacyLink.click()

    await expect(page).toHaveURL(/\/privacy/)
    await expect(page.locator('.legal-page__title')).toBeVisible()
  })

  test('footer terms link navigates to terms page', async ({ page }) => {
    await page.goto('/')

    const termsLink = page.locator('.footer__nav a').filter({ hasText: /Termos|Terms/ })
    await termsLink.click()

    await expect(page).toHaveURL(/\/terms/)
    await expect(page.locator('.legal-page__title')).toBeVisible()
  })

  test('header brand link returns to home', async ({ page }) => {
    await page.goto('/docs')

    await page.locator('.header__brand-group').click()
    await expect(page).toHaveURL(/#hero$/)
  })

  test('skip-to-content link is present and focusable', async ({ page }) => {
    await page.goto('/')

    const skipLink = page.locator('.skip-link')
    await expect(skipLink).toBeAttached()
    // Focus it via keyboard
    await page.focus('.skip-link')
    await expect(skipLink).toBeFocused()
  })

  test('404 page shows error and back-home button', async ({ page }) => {
    await page.goto('/nonexistent-page-12345')

    // Should show error page
    await expect(page.locator('.error-page')).toBeVisible()
    await expect(page.locator('[data-testid="error-back-home"]')).toBeVisible()
  })

  test('404 back-home button redirects to landing', async ({ page }) => {
    await page.goto('/nonexistent-page-12345')

    await page.locator('[data-testid="error-back-home"]').click()
    await expect(page).toHaveURL(/\/$/)
  })
})
