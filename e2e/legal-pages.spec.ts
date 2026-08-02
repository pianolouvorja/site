import { test, expect } from '@playwright/test'

test.describe('Legal Pages (Privacy & Terms)', () => {
  test.describe('Privacy Policy', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/privacy')
    })

    test('renders privacy page with title', async ({ page }) => {
      await expect(page.locator('.legal-page')).toBeVisible()
      await expect(page.locator('.legal-page__title')).toBeVisible()
    })

    test('has table of contents', async ({ page }) => {
      const toc = page.locator('.legal-page__toc')
      await expect(toc).toBeVisible()
      const tocLinks = toc.locator('a')
      const count = await tocLinks.count()
      expect(count).toBeGreaterThanOrEqual(8)
    })

    test('renders all privacy sections', async ({ page }) => {
      // Sections from privacy.vue: data, purpose, sharing, international, rights, security, retention, cookies, children, changes, dpo, anpd
      const content = page.locator('.legal-page__content')
      await expect(content).toBeVisible()
      const sections = content.locator('section')
      const count = await sections.count()
      expect(count).toBeGreaterThanOrEqual(10)
    })

    test('TOC links navigate to sections', async ({ page }) => {
      const firstTocLink = page.locator('.legal-page__toc a').first()
      const href = await firstTocLink.getAttribute('href')
      expect(href).toBeTruthy()
      await firstTocLink.click()
      // URL should have hash
      await expect(page).toHaveURL(/#/)
    })

    test('last updated text is present', async ({ page }) => {
      await expect(page.locator('.legal-page__updated')).toBeVisible()
    })

    test('renders in English', async ({ page }) => {
      await page.goto('/en/privacy')
      await expect(page.locator('.legal-page')).toBeVisible()
      await expect(page.locator('.legal-page__title')).toBeVisible()
    })

    test('renders in Spanish', async ({ page }) => {
      await page.goto('/es/privacy')
      await expect(page.locator('.legal-page')).toBeVisible()
      await expect(page.locator('.legal-page__title')).toBeVisible()
    })
  })

  test.describe('Terms of Service', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/terms')
    })

    test('renders terms page with title', async ({ page }) => {
      await expect(page.locator('.legal-page')).toBeVisible()
      await expect(page.locator('.legal-page__title')).toBeVisible()
    })

    test('has table of contents', async ({ page }) => {
      const toc = page.locator('.legal-page__toc')
      await expect(toc).toBeVisible()
      const tocLinks = toc.locator('a')
      const count = await tocLinks.count()
      expect(count).toBeGreaterThanOrEqual(8)
    })

    test('renders all terms sections', async ({ page }) => {
      // Sections from terms.vue: acceptance, service, license, user, responsibility, ip, donations, privacy, modifications, termination, law, misc
      const content = page.locator('.legal-page__content')
      await expect(content).toBeVisible()
      const sections = content.locator('section')
      const count = await sections.count()
      expect(count).toBeGreaterThanOrEqual(10)
    })

    test('TOC links navigate to sections', async ({ page }) => {
      const firstTocLink = page.locator('.legal-page__toc a').first()
      const href = await firstTocLink.getAttribute('href')
      expect(href).toBeTruthy()
      await firstTocLink.click()
      await expect(page).toHaveURL(/#/)
    })

    test('last updated text is present', async ({ page }) => {
      await expect(page.locator('.legal-page__updated')).toBeVisible()
    })

    test('renders in English', async ({ page }) => {
      await page.goto('/en/terms')
      await expect(page.locator('.legal-page')).toBeVisible()
    })

    test('renders in Spanish', async ({ page }) => {
      await page.goto('/es/terms')
      await expect(page.locator('.legal-page')).toBeVisible()
    })
  })
})
