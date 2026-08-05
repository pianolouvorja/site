import { test, expect } from '@playwright/test'

test.describe('Homepage — renderização e navegação', () => {
  test('exibe hero com título e CTAs', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-testid="hero-subtitle"]')).toBeVisible()
    await expect(page.locator('[data-testid="hero-cta"]')).toBeVisible()
    await expect(page.locator('[data-testid="hero-secondary"]')).toBeVisible()
  })

  test('hero CTA leva para appUrl externa', async ({ page }) => {
    await page.goto('/')
    const cta = page.locator('[data-testid="hero-cta"]')
    await expect(cta).toHaveAttribute('target', '_blank')
    await expect(cta).toHaveAttribute('rel', 'noopener noreferrer')
    const href = await cta.getAttribute('href')
    expect(href).toMatch(/^https:\/\/.+/)
  })

  test('hero secondary leva para #platforms', async ({ page }) => {
    await page.goto('/')
    const secondary = page.locator('[data-testid="hero-secondary"]')
    await expect(secondary).toHaveAttribute('href', /#platforms/)
  })

  test('exibe seção de plataformas', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('#platforms')).toBeVisible()
  })

  test('exibe seção CTA com botão', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-testid="cta-button"]')).toBeVisible()
    const href = await page.locator('[data-testid="cta-button"]').getAttribute('href')
    expect(href).toMatch(/^https:\/\/.+/)
  })

  test('header tem navegação com links', async ({ page }) => {
    await page.goto('/')
    const header = page.locator('header')
    await expect(header).toBeVisible()
    const navLinks = header.locator('a[href]')
    const count = await navLinks.count()
    expect(count).toBeGreaterThan(0)
  })

  test('footer está visível e tem conteúdo', async ({ page }) => {
    await page.goto('/')
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()
    const text = await footer.textContent()
    expect(text?.length).toBeGreaterThan(10)
  })
})
