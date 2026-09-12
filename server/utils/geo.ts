import { createHash } from 'node:crypto'
import type { H3Event } from 'h3'

/**
 * Utilidades de geolocalização/telemetria (LGPD-compliant).
 *
 * O IP NUNCA é armazenado em texto claro: ele é hasheado com salt
 * (SHA-256) apenas para deduplicação de sessão e descartado em seguida.
 * O que persiste é somente o código ISO do país (dado agregável).
 */

/** Headers de país por CDN, em ordem de prioridade. */
const COUNTRY_HEADERS = [
  'cf-ipcountry', // Cloudflare
  'x-vercel-ip-country', // Vercel
  'x-geo-country', // custom proxies
] as const

/** Códigos especiais que não representam um país real. */
const RESERVED_COUNTRY_CODES = new Set(['XX', 'T1'])

/**
 * Extrai o código ISO 3166-1 alpha-2 do país a partir dos headers da CDN.
 * Retorna 'unknown' quando não é possível determinar.
 */
export function getCountryFromEvent(event: H3Event): string {
  for (const header of COUNTRY_HEADERS) {
    const value = event.node.req.headers[header]
    const code = Array.isArray(value) ? value[0] : value
    if (code && code.length === 2 && !RESERVED_COUNTRY_CODES.has(code.toUpperCase())) {
      return code.toUpperCase()
    }
  }
  return 'unknown'
}

/**
 * Extrai o IP real do cliente (atrás de proxy/CDN).
 * Usa o primeiro valor do x-forwarded-for, com fallback para x-real-ip.
 */
export function getClientIp(event: H3Event): string | null {
  const xff = event.node.req.headers['x-forwarded-for']
  const first = Array.isArray(xff) ? xff[0] : xff
  if (first) {
    const ip = first.split(',')[0]?.trim()
    if (ip) return ip
  }
  const realIp = event.node.req.headers['x-real-ip']
  const value = Array.isArray(realIp) ? realIp[0] : realIp
  return value || event.node.req.socket.remoteAddress || null
}

/**
 * Hash determinístico do IP com salt (SHA-256).
 * O salt é obrigatório — sem ele, o hash é reversível por rainbow table.
 * Usado apenas para deduplicar visitas da mesma origem por janela de tempo;
 * o resultado nunca é persistido em texto legível.
 */
export function hashIp(ip: string, salt: string): string {
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex')
}

/**
 * Bucket diário (YYYY-MM-DD, UTC) para agregação de contadores.
 */
export function geoDayBucket(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10)
}
