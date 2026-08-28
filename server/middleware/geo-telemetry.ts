import { recordGeoVisit } from '../utils/geo-visit'

/**
 * Middleware global de telemetria de audiência (LGPD-compliant).
 *
 * Registra visita agregada por país em páginas públicas renderizadas no
 * servidor. Fire-and-forget: nunca bloqueia nem falha a request principal.
 * Não roda em /admin, /api (endpoints próprios) nem assets estáticos.
 */
export default defineEventHandler((event) => {
  const path = event.path || ''

  const isExcluded =
    path.startsWith('/admin') ||
    path.startsWith('/api') ||
    path.startsWith('/_') ||
    path.startsWith('/@') ||
    path.startsWith('/__') ||
    path.includes('.') // assets: .js, .css, .svg, etc.

  if (!isExcluded) {
    // Fire-and-forget — sem await para não adicionar latência
    void recordGeoVisit(event)
  }
})
