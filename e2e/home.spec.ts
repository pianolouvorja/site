import { test, expect } from '@playwright/test'

test.describe('Homepage — Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('renders hero section with title and CTA', async ({ page }) => {
    await expect(page.locator('#hero')).toBeVisible()
    await expect(page.locator('[data-testid="hero-subtitle"]')).toBeVisible()
    await expect(page.locator('[data-testid="hero-cta"]')).toBeVisible()
    await expect(page.locator('[data-testid="hero-cta"]')).toHaveAttribute('target', '_blank')
  })

  test('hero CTA links to app URL', async ({ page }) => {
    const cta = page.locator('[data-testid="hero-cta"]')
    await expect(cta).toHaveAttribute('href', /pianolouvorja\.com\.br/)
  })

  test('renders stats section with 4 items', async ({ page }) => {
    const stats = page.locator('[data-testid="stat-item"]')
    await expect(stats).toHaveCount(4)
  })

  test('renders platforms section', async ({ page }) => {
    await expect(page.locator('#platforms')).toBeVisible()
  })

  test('renders features section with 8 cards', async ({ page }) => {
    await expect(page.locator('#features')).toBeVisible()
    const cards = page.locator('[data-testid="feature-card"]')
    await expect(cards).toHaveCount(8)
  })

  test('renders how-it-works section with 4 steps', async ({ page }) => {
    await expect(page.locator('#how-it-works')).toBeVisible()
    const steps = page.locator('[data-testid="step"]')
    await expect(steps).toHaveCount(4)
  })

  test('renders about section', async ({ page }) => {
    await expect(page.locator('#about')).toBeVisible()
  })

  test('renders CTA section with button', async ({ page }) => {
    await expect(page.locator('#cta')).toBeVisible()
    await expect(page.locator('[data-testid="cta-button"]')).toBeVisible()
  })

  test('CTA button links to app URL', async ({ page }) => {
    const btn = page.locator('[data-testid="cta-button"]')
    await expect(btn).toHaveAttribute('href', /pianolouvorja\.com\.br/)
    await expect(btn).toHaveAttribute('target', '_blank')
  })

  test('renders header with logo', async ({ page }) => {
    const header = page.locator('.header')
    await expect(header).toBeVisible()
  })

  test('renders footer with copyright', async ({ page }) => {
    const footer = page.locator('.footer')
    await expect(footer).toBeVisible()
    const year = new Date().getFullYear()
    await expect(footer).toContainText(String(year))
  })

  test('skip-to-content link exists', async ({ page }) => {
    const skipLink = page.locator('.skip-link')
    await expect(skipLink).toBeAttached()
  })

  test('has correct document title', async ({ page }) => {
    await expect(page).toHaveTitle(/PIANO LouvorJA/i)
  })

  test('hero secondary CTA scrolls to platforms', async ({ page }) => {
    const secondary = page.locator('[data-testid="hero-secondary"]')
    await expect(secondary).toHaveAttribute('href', '#platforms')
    await secondary.click()
    await expect(page.locator('#platforms')).toBeInViewport()
  })
})
