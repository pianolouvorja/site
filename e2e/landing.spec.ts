import { test, expect } from '@playwright/test'

test.describe('Landing page', () => {
  test('displays hero section with correct content', async ({ page }) => {
    await page.goto('/')

    // Badge
    await expect(page.locator('.hero__badge')).toBeVisible()

    // Title
    await expect(page.locator('.hero__title')).toBeVisible()
    await expect(page.locator('.hero__title')).toContainText('Gerenciador de Culto')

    // Subtitle
    await expect(page.locator('[data-testid="hero-subtitle"]')).toBeVisible()

    // CTA buttons
    await expect(page.locator('[data-testid="hero-cta"]')).toBeVisible()
    await expect(page.locator('[data-testid="hero-cta"]')).toHaveAttribute(
      'href',
      'https://app.pianolouvorja.com.br',
    )
    await expect(page.locator('[data-testid="hero-secondary"]')).toBeVisible()
  })

  test('renders all stats items', async ({ page }) => {
    await page.goto('/')

    const stats = page.locator('[data-testid="stat-item"]')
    await expect(stats).toHaveCount(4)

    // Check numbers are correct
    const nums = page.locator('[data-testid="stat-num"]')
    await expect(nums.nth(0)).toHaveText('8+')
    await expect(nums.nth(1)).toHaveText('100%')
    await expect(nums.nth(2)).toHaveText('0')
    await expect(nums.nth(3)).toHaveText('PWA')
  })

  test('renders 8 feature cards', async ({ page }) => {
    await page.goto('/')

    const features = page.locator('[data-testid="feature-card"]')
    await expect(features).toHaveCount(8)

    // Each card should have an icon, title, and description
    for (let i = 0; i < 8; i++) {
      await expect(features.nth(i).locator('.features__card-title')).toBeVisible()
      await expect(features.nth(i).locator('.features__card-desc')).toBeVisible()
    }
  })

  test('renders 3 platform cards', async ({ page }) => {
    await page.goto('/')

    const platforms = page.locator('[data-testid="platform-card"]')
    await expect(platforms).toHaveCount(3)

    // Desktop, Web, Mobile
    await expect(platforms.nth(0)).toContainText('Recomendado')
    await expect(platforms.nth(1).locator('.platforms__card-name')).toBeVisible()
    await expect(platforms.nth(2).locator('.platforms__card-name')).toBeVisible()
  })

  test('renders how it works with 4 steps', async ({ page }) => {
    await page.goto('/')

    const steps = page.locator('[data-testid="step"]')
    await expect(steps).toHaveCount(4)

    const stepTitles = page.locator('[data-testid="step-title"]')
    await expect(stepTitles).toHaveCount(4)
  })

  test('renders about section', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('#about')).toBeVisible()
    await expect(page.locator('.about__title')).toBeVisible()
    await expect(page.locator('.about__text').first()).toBeVisible()

    // About stats
    const aboutStats = page.locator('.about__stat')
    await expect(aboutStats).toHaveCount(3)
  })

  test('renders CTA section with correct link', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('#cta')).toBeVisible()
    const ctaButton = page.locator('[data-testid="cta-button"]')
    await expect(ctaButton).toBeVisible()
    await expect(ctaButton).toHaveAttribute('href', 'https://app.pianolouvorja.com.br')
  })

  test('renders header with navigation', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('.header')).toBeVisible()

    // Nav links
    const navLinks = page.locator('.header__nav-link')
    const navCount = await navLinks.count()
    expect(navCount).toBeGreaterThanOrEqual(4)

    // Language toggle
    await expect(page.locator('[data-testid="header-lang-toggle"]')).toBeVisible()

    // Logo
    await expect(page.locator('.header__logo')).toBeVisible()
  })

  test('renders footer with links', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('.footer')).toBeVisible()
    await expect(page.locator('.footer__copyright')).toContainText('PIANO LouvorJA')

    // Footer nav links
    const footerLinks = page.locator('.footer__nav a')
    const linkCount = await footerLinks.count()
    expect(linkCount).toBeGreaterThanOrEqual(4)

    // GitHub social link
    const githubLink = page.locator('.footer__social-link[aria-label="GitHub"]')
    await expect(githubLink).toHaveAttribute('href', 'https://github.com/pianolouvorja')
  })

  test('clicking secondary CTA scrolls to platforms', async ({ page }) => {
    await page.goto('/')

    await page.locator('[data-testid="hero-secondary"]').click()
    await expect(page).toHaveURL(/#platforms$/)
  })
})
