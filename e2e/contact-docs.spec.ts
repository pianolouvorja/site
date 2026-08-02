import { test, expect } from '@playwright/test'

test.describe('Contact Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact')
  })

  test('renders contact page', async ({ page }) => {
    await expect(page.locator('.contact-page')).toBeVisible()
  })

  test('has all form fields', async ({ page }) => {
    await expect(page.locator('[data-testid="contact-name-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="contact-email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="contact-subject-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="contact-message-input"]')).toBeVisible()
  })

  test('submit button exists', async ({ page }) => {
    const submitBtn = page.locator('button[type="submit"], .contact-form__submit')
    await expect(submitBtn.first()).toBeVisible()
  })

  test('empty form shows validation or prevents submit', async ({ page }) => {
    const submitBtn = page.locator('button[type="submit"]').first()
    // Fill nothing, try to submit
    await submitBtn.click({ force: true })
    // Should stay on contact page — not navigate away
    await expect(page).toHaveURL(/\/contact/)
  })

  test('valid data fills form correctly', async ({ page }) => {
    await page.locator('[data-testid="contact-name-input"]').fill('Test User')
    await page.locator('[data-testid="contact-email-input"]').fill('test@example.com')
    await page.locator('[data-testid="contact-subject-input"]').fill('Test Subject')
    await page
      .locator('[data-testid="contact-message-input"]')
      .fill('This is a test message that is long enough.')
    // Values should be set
    await expect(page.locator('[data-testid="contact-name-input"]')).toHaveValue('Test User')
  })

  test('renders in English', async ({ page }) => {
    await page.goto('/en/contact')
    await expect(page.locator('.contact-page')).toBeVisible()
  })

  test('renders in Spanish', async ({ page }) => {
    await page.goto('/es/contact')
    await expect(page.locator('.contact-page')).toBeVisible()
  })
})

test.describe('Docs Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/docs')
  })

  test('renders docs page', async ({ page }) => {
    await expect(page.locator('.docs-page')).toBeVisible()
  })

  test('has sidebar navigation', async ({ page }) => {
    const sidebar = page.locator('.docs-page__sidebar, .docs-sidebar')
    if (await sidebar.first().isVisible()) {
      const links = sidebar.locator('a, button')
      const count = await links.count()
      expect(count).toBeGreaterThanOrEqual(3)
    }
  })

  test('has content sections', async ({ page }) => {
    const content = page.locator('.docs-page__content, .docs-content')
    if (await content.first().isVisible()) {
      // Should have multiple sections
      const sections = content.locator('section, [id^="doc-"]')
      const count = await sections.count()
      expect(count).toBeGreaterThanOrEqual(3)
    }
  })

  test('renders in English', async ({ page }) => {
    await page.goto('/en/docs')
    await expect(page.locator('.docs-page')).toBeVisible()
  })

  test('renders in Spanish', async ({ page }) => {
    await page.goto('/es/docs')
    await expect(page.locator('.docs-page')).toBeVisible()
  })
})
