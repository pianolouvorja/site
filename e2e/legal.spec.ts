import { test, expect } from '@playwright/test'

test.describe('Legal pages (Privacy & Terms)', () => {
  test('privacy page renders with title and content', async ({ page }) => {
    await page.goto('/privacy')

    await expect(page.locator('.legal-page__title')).toBeVisible()
    await expect(page.locator('.legal-page__updated')).toBeVisible()

    // LegalBodyItem renders <p> tags inside .legal-page__section-body
    const paragraphs = page.locator('.legal-page__section-body p')
    const count = await paragraphs.count()
    expect(count).toBeGreaterThanOrEqual(3)
  })

  test('terms page renders with title and content', async ({ page }) => {
    await page.goto('/terms')

    await expect(page.locator('.legal-page__title')).toBeVisible()
    await expect(page.locator('.legal-page__updated')).toBeVisible()

    const paragraphs = page.locator('.legal-page__section-body p')
    const count = await paragraphs.count()
    expect(count).toBeGreaterThanOrEqual(3)
  })

  test('privacy page has subsections with numbered headers', async ({ page }) => {
    await page.goto('/privacy')

    // LegalBodyItem renders subsections for "N.N" patterns
    const subsections = page.locator('.legal-page__subsection')
    const count = await subsections.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test('terms page has subsections with numbered headers', async ({ page }) => {
    await page.goto('/terms')

    const subsections = page.locator('.legal-page__subsection')
    const count = await subsections.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test('privacy page links render correctly', async ({ page }) => {
    await page.goto('/privacy')

    // External links should have target=_blank and rel=noopener
    const externalLinks = page.locator('.legal-page__section-body a[target="_blank"]')
    const count = await externalLinks.count()
    if (count > 0) {
      await expect(externalLinks.first()).toHaveAttribute('rel', 'noopener')
    }
  })

  test('privacy page works in English', async ({ page }) => {
    await page.goto('/en/privacy')

    await expect(page.locator('.legal-page__title')).toBeVisible()
    const paragraphs = page.locator('.legal-page__section-body p')
    expect(await paragraphs.count()).toBeGreaterThanOrEqual(3)
  })

  test('terms page works in Spanish', async ({ page }) => {
    await page.goto('/es/terms')

    await expect(page.locator('.legal-page__title')).toBeVisible()
    const paragraphs = page.locator('.legal-page__section-body p')
    expect(await paragraphs.count()).toBeGreaterThanOrEqual(3)
  })

  test('contact page renders with title', async ({ page }) => {
    await page.goto('/contact')

    await expect(page.locator('.contact-hero__title')).toBeVisible()
  })

  test('docs page renders with title', async ({ page }) => {
    await page.goto('/docs')

    await expect(page.locator('.docs-hero__title')).toBeVisible()
  })
})
