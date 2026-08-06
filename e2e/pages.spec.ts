import { test, expect } from '@playwright/test'

test.describe('Páginas estáticas — navegação', () => {
  test('página /docs carrega', async ({ page }) => {
    await page.goto('/docs')
    await expect(page.locator('body')).toBeVisible()
    const text = await page.locator('body').textContent()
    expect(text?.trim().length).toBeGreaterThan(0)
  })

  test('página /contact carrega', async ({ page }) => {
    await page.goto('/contact')
    await expect(page.locator('body')).toBeVisible()
  })

  test('página /privacy carrega', async ({ page }) => {
    await page.goto('/privacy')
    await expect(page.locator('body')).toBeVisible()
    // Deve ter algum conteúdo de privacidade
    const text = (await page.locator('body').textContent())?.toLowerCase() || ''
    expect(text.length).toBeGreaterThan(50)
  })

  test('página /terms carrega', async ({ page }) => {
    await page.goto('/terms')
    await expect(page.locator('body')).toBeVisible()
    const text = (await page.locator('body').textContent())?.toLowerCase() || ''
    expect(text.length).toBeGreaterThan(50)
  })

  test('página /download carrega', async ({ page }) => {
    await page.goto('/download')
    await expect(page.locator('body')).toBeVisible()
  })

  test('página /releases carrega', async ({ page }) => {
    await page.goto('/releases')
    await expect(page.locator('body')).toBeVisible()
  })

  test('página /admin/login carrega', async ({ page }) => {
    await page.goto('/admin/login')
    await expect(page.locator('body')).toBeVisible()
  })

  test('página inexistente retorna 404', async ({ page }) => {
    const response = await page.goto('/pagina-que-nao-existe')
    expect(response?.status()).toBe(404)
  })
})

test.describe('Acessibilidade — básico', () => {
  test('imagens têm alt text', async ({ page }) => {
    await page.goto('/')
    const images = page.locator('img')
    const count = await images.count()
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt')
      expect(alt).not.toBeNull()
    }
  })

  test('links externos têm rel=noopener', async ({ page }) => {
    await page.goto('/')
    const externalLinks = page.locator('a[target="_blank"]')
    const count = await externalLinks.count()
    for (let i = 0; i < count; i++) {
      const rel = await externalLinks.nth(i).getAttribute('rel')
      expect(rel).toContain('noopener')
    }
  })

  test('html tem atributo lang', async ({ page }) => {
    await page.goto('/')
    const lang = await page.locator('html').getAttribute('lang')
    expect(lang).toBeTruthy()
  })
})
