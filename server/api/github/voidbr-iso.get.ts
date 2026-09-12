/**
 * GET /api/github/voidbr-iso
 *
 * Proxy para o diretório /iso/current/ do voidbr.org — encontra a ISO
 * `voidbr-live-louvorja-piano-*.iso` mais recente e expõe nome, URL,
 * tamanho (Content-Length) e data de build (Last-Modified).
 *
 * Cache de 1h (a ISO é reconstruída com frequência, mas não a cada minuto).
 */
interface VoidBrIsoResponse {
  available: boolean
  fileName: string | null
  url: string | null
  sizeBytes: number | null
  builtAt: string | null
}

const ISO_DIR = 'https://voidbr.org/iso/current/'
// URL canônica estável: o voidbr.org publica um symlink "current" que sempre aponta
// pra ISO mais recente — o download nunca quebra quando eles publicam build novo.
const ISO_CURRENT_URL = 'https://www.voidbr.org/iso/voidbr-live-louvorja-piano-current.iso'
const ISO_PATTERN = /voidbr-live-louvorja-piano-x86_64-[0-9._-]+\.iso/gi
const CACHE_TTL_MS = 60 * 60 * 1000

let cache: { data: VoidBrIsoResponse; fetchedAt: number } | null = null

async function headSize(url: string): Promise<{ size: number | null; builtAt: string | null }> {
  try {
    const res = await fetch(url, { method: 'HEAD' })
    const size = Number(res.headers.get('content-length'))
    const modified = res.headers.get('last-modified')
    return {
      size: Number.isFinite(size) && size > 0 ? size : null,
      builtAt: modified ? new Date(modified).toISOString().slice(0, 10) : null,
    }
  } catch {
    return { size: null, builtAt: null }
  }
}

export default defineEventHandler(async (): Promise<VoidBrIsoResponse> => {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.data
  }

  const unavailable: VoidBrIsoResponse = {
    available: false,
    fileName: null,
    url: null,
    sizeBytes: null,
    builtAt: null,
  }

  try {
    const res = await fetch(ISO_DIR)
    if (!res.ok) throw new Error(`voidbr.org ${res.status}`)
    const html = await res.text()

    // pega a MAIS RECENTE: nomes contêm timestamp YYYYMMDD-HHMM — ordena desc
    const matches = [...html.matchAll(ISO_PATTERN)].map((m) => m[0])
    const unique = [...new Set(matches)].sort().reverse()
    if (unique.length === 0) return unavailable

    const fileName = unique[0]
    if (!fileName) return unavailable
    const url = ISO_CURRENT_URL
    const { size, builtAt } = await headSize(url)

    const data: VoidBrIsoResponse = {
      available: true,
      fileName,
      url,
      sizeBytes: size,
      builtAt,
    }
    cache = { data, fetchedAt: Date.now() }
    return data
  } catch {
    // voidbr.org offline: resposta unavailable SEM cache negativo longo
    cache = { data: unavailable, fetchedAt: Date.now() - CACHE_TTL_MS + 5 * 60 * 1000 }
    return unavailable
  }
})
