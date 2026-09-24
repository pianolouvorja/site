/**
 * TASK-009 — RF-009: rate limit + verificação de email no cadastro público.
 *
 * Rate limit em memória (por instância): 5 cadastros/hora/IP.
 * Email não verificado → gravado com emailVerified:false (fila separada),
 * mas ainda entra (o admin vê o flag na moderação).
 */

const WINDOW_MS = 60 * 60 * 1000
const MAX_PER_WINDOW = 5

const hits = new Map<string, number[]>()

/** Extrai IP do request (x-forwarded-for em produção atrás de proxy). */
export function clientIp(headers: Record<string, string | undefined>): string {
  const fwd = headers['x-forwarded-for']
  if (fwd) return fwd.split(',')[0]!.trim()
  return headers['x-real-ip'] ?? 'unknown'
}

/** Limpa janelas expiradas (chamar antes de checar). */
export function prune(now = Date.now()): void {
  for (const [ip, times] of hits) {
    const valid = times.filter((t) => now - t < WINDOW_MS)
    if (valid.length === 0) hits.delete(ip)
    else hits.set(ip, valid)
  }
}

/** Verifica se o IP excedeu a cota. true = permitido. */
export function allowRequest(ip: string, now = Date.now()): boolean {
  prune(now)
  const times = hits.get(ip) ?? []
  if (times.length >= MAX_PER_WINDOW) return false
  times.push(now)
  hits.set(ip, times)
  return true
}

/** Reset (para testes). */
export function resetRateLimit(): void {
  hits.clear()
}
