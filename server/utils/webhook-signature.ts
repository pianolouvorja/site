import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Verifica assinatura HMAC-SHA256 do GitHub Webhook.
 * @param signature valor do header X-Hub-Signature-256 (formato: "sha256=<hex>")
 * @param body corpo raw da requisição como string
 * @param secret WEBHOOK_SECRET configurado no GitHub
 */
export function verifyGithubSignature(signature: string, body: string, secret: string): boolean {
  if (!signature || !signature.startsWith('sha256=')) return false

  const expected = signature.slice(7)
  const computed = createHmac('sha256', secret).update(body).digest('hex')

  if (expected.length !== computed.length) return false
  return timingSafeEqual(Buffer.from(expected), Buffer.from(computed))
}
