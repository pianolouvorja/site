/**
 * Proxy server-side para a API custom do PIANO.
 * O painel admin (browser) chama /api/piano/proxy/* e o servidor Nuxt
 * repassa para api.pianolouvorja.com.br — evita CORS e esconde o host.
 */
import { defineEventHandler, getRequestHeaders, getRequestURL, proxyRequest } from 'h3'

const API_BASE = 'https://api.pianolouvorja.com.br'

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  const path = url.pathname.replace(/^\/api\/piano\/proxy/, '')
  const target = `${API_BASE}${path}${url.search}`

  const headers = getRequestHeaders(event)
  // Repassa Authorization e content-type; descarta cookies do site
  const forward: Record<string, string> = {}
  for (const key of ['authorization', 'content-type']) {
    const v = headers[key]
    if (v) forward[key] = v
  }

  return proxyRequest(event, target, {
    headers: forward,
    fetchOptions: {
      // $fetch do Nitro; follow redirects da API (ex.: /file → 302)
      redirect: 'follow',
    },
  })
})
