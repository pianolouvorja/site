import { test, expect } from '@playwright/test'

test.describe('Newsletter — fluxo E2E', () => {
  test('exibe formulário de newsletter', async ({ page }) => {
    await page.goto('/')
    const emailInput = page.locator('[data-testid="newsletter-email"]')
    await expect(emailInput).toBeVisible()
    await expect(page.locator('[data-testid="newsletter-submit"]')).toBeVisible()
  })

  test('aceita email válido e envia', async ({ page }) => {
    // Interceptar TODAS as chamadas externas
    // Buttondown API (newsletter)
    await page.route('**/api.buttondown.com/**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      }),
    )
    // GitHub API (contributors) — evitar rate limit noise
    await page.route('**/api.github.com/**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      }),
    )
    // Server-side API proxy
    await page.route('**/api/github/contributors**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      }),
    )

    await page.goto('/')
    // Esperar hidratação completa para evitar hydration mismatch
    await page.waitForLoadState('networkidle')

    const emailInput = page.locator('[data-testid="newsletter-email"]')
    await expect(emailInput).toBeVisible()
    const submitBtn = page.locator('[data-testid="newsletter-submit"]')

    await emailInput.fill('teste@exemplo.com')
    await submitBtn.click()

    // Aguardar mensagem de sucesso aparecer
    const success = page.locator('[data-testid="newsletter-success"]')
    await expect(success).toBeVisible({ timeout: 15000 })
  })

  test('não envia com email inválido', async ({ page }) => {
    await page.goto('/')

    const emailInput = page.locator('[data-testid="newsletter-email"]')
    const submitBtn = page.locator('[data-testid="newsletter-submit"]')

    // HTML5 validation deve bloquear envio de email sem formato
    await emailInput.fill('email-invalido')
    await submitBtn.click()

    // Nao deve mostrar mensagem de sucesso
    const success = page.locator('[data-testid="newsletter-success"]')
    await expect(success).not.toBeVisible()
  })

  test('não envia com campo vazio', async ({ page }) => {
    await page.goto('/')

    const submitBtn = page.locator('[data-testid="newsletter-submit"]')
    await submitBtn.click()

    // Form required deve bloquear
    const success = page.locator('[data-testid="newsletter-success"]')
    await expect(success).not.toBeVisible()
  })
})
