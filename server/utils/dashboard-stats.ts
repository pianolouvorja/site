import { Octokit } from '@octokit/rest'

export interface DashboardStats {
  downloads: number | null
  stars: number | null
  forks: number | null
  subscribers: number | null
  donations: { count: number; totalBRL: number } | null
  visits: number | null
  updatedAt: string
}

const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutos

let cached: { data: DashboardStats; timestamp: number } | null = null

/** Override para testes — injeta Octokit mockado */
let _octokitOverride: Octokit | null = null

export function __setOctokitForTesting(octokit: Octokit | null): void {
  _octokitOverride = octokit
}

function getOctokit(): Octokit {
  if (_octokitOverride) return _octokitOverride
  return new Octokit({ auth: process.env.GITHUB_TOKEN || undefined })
}

export function clearStatsCache(): void {
  cached = null
}

/**
 * GitHub Stats: downloads (soma de assets), stars, forks.
 * Busca do repo pianolouvorja/web.
 */
export async function fetchGitHubStats(): Promise<{
  downloads: number | null
  stars: number | null
  forks: number | null
}> {
  try {
    const octokit = getOctokit()

    const [releasesResponse, repoResponse] = await Promise.all([
      octokit.rest.repos.listReleases({
        owner: 'pianolouvorja',
        repo: 'web',
        per_page: 100,
      }),
      octokit.rest.repos.get({
        owner: 'pianolouvorja',
        repo: 'web',
      }),
    ])

    const downloads = releasesResponse.data
      .flatMap((r) => r.assets || [])
      .reduce((sum, a) => sum + (a.download_count || 0), 0)

    return {
      downloads,
      stars: repoResponse.data.stargazers_count ?? null,
      forks: repoResponse.data.forks_count ?? null,
    }
  } catch {
    return { downloads: null, stars: null, forks: null }
  }
}

/**
 * Newsletter Stats: total de assinantes da Buttondown.
 */
export async function fetchNewsletterStats(): Promise<{
  subscribers: number | null
}> {
  try {
    const config = useRuntimeConfig()
    const apiKey = config.buttondownApiKey || config.public?.buttondownApiKey
    if (!apiKey) return { subscribers: null }

    const response = await $fetch<{ count: number }>(
      'https://api.buttondown.com/api/v1/subscribers',
      {
        headers: { Authorization: `Token ${apiKey}` },
        timeout: 5000,
      },
    )

    return { subscribers: response.count ?? null }
  } catch {
    return { subscribers: null }
  }
}

/**
 * Donation Stats: total de doacoes confirmadas via AbacatePay.
 * Valores vem em centavos — converte para BRL.
 */
export async function fetchDonationStats(): Promise<{
  count: number
  totalBRL: number
} | null> {
  try {
    const config = useRuntimeConfig()
    const apiKey = config.abacatePayApiKey
    if (!apiKey) return null

    const response = await $fetch<{ data: Array<{ status: string; amount: number }> }>(
      'https://api.abacatepay.com/v1/billing/list',
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        timeout: 5000,
      },
    )

    const paid = (response.data || []).filter((d) => d.status === 'paid')
    const totalCents = paid.reduce((sum, d) => sum + (d.amount || 0), 0)

    return {
      count: paid.length,
      totalBRL: totalCents / 100,
    }
  } catch {
    return null
  }
}

/**
 * Visit Stats: visitas dos ultimos 30 dias via GA4 Data API.
 * Retorna null se GOOGLE_ANALYTICS_ID nao estiver configurado.
 */
export async function fetchVisitStats(): Promise<{
  visits: number | null
}> {
  try {
    const config = useRuntimeConfig()
    const propertyId = config.public?.googleAnalyticsId
    if (!propertyId) return { visits: null }

    // GA4 Data API requer service account — implementar quando BD-DASH-04 for resolvido
    // Por ora retorna null se nao configurado
    return { visits: null }
  } catch {
    return { visits: null }
  }
}

/**
 * Aggregador principal: busca todas as metricas em paralelo.
 * Usa cache de 5 minutos para evitar rate limit.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  // Verificar cache
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data
  }

  const [github, newsletter, donations, visits] = await Promise.allSettled([
    fetchGitHubStats(),
    fetchNewsletterStats(),
    fetchDonationStats(),
    fetchVisitStats(),
  ])

  const githubValue =
    github.status === 'fulfilled' ? github.value : { downloads: null, stars: null, forks: null }
  const newsletterValue =
    newsletter.status === 'fulfilled' ? newsletter.value : { subscribers: null }
  const donationsValue = donations.status === 'fulfilled' ? donations.value : null
  const visitsValue = visits.status === 'fulfilled' ? visits.value : { visits: null }

  const data: DashboardStats = {
    downloads: githubValue.downloads,
    stars: githubValue.stars,
    forks: githubValue.forks,
    subscribers: newsletterValue.subscribers,
    donations: donationsValue,
    visits: visitsValue.visits,
    updatedAt: new Date().toISOString(),
  }

  cached = { data, timestamp: Date.now() }

  return data
}
