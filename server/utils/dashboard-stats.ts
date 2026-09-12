import { Octokit } from '@octokit/rest'
import { getGeoStats } from './geo-visit'

// Types mirroring app/types/dashboard.ts to avoid cross-boundary import.
// Keep in sync with app/types/dashboard.ts.

export interface PlatformDownloads {
  platform: string
  downloads: number
}

export interface AppDownloadStats {
  repo: string
  category: string
  label: string
  latestTag: string | null
  totalDownloads: number
  platforms: PlatformDownloads[]
}

export interface DownloadStats {
  total: number
  apps: AppDownloadStats[]
}

export interface DashboardStats {
  downloads: DownloadStats | null
  stars: number | null
  forks: number | null
  subscribers: number | null
  donations: { count: number; totalBRL: number } | null
  visits: number | null
  updatedAt: string
}

// Matchers server-side — kept in sync with app/utils/downloads.ts REPO_CONFIGS.
interface AssetMatcher {
  platform: string
  test: (name: string) => boolean
}

interface RepoConfig {
  name: string
  category: string
  label: string
  assetMatchers: AssetMatcher[]
  aggregatePlatforms?: boolean
}

const REPO_CONFIGS: RepoConfig[] = [
  {
    name: 'app',
    category: 'desktop',
    label: 'Desktop',
    assetMatchers: [
      { platform: 'Linux', test: (n) => /\.appimage$/i.test(n) },
      {
        platform: 'Windows',
        test: (n) => /\.exe$/i.test(n) && !/\.yml$/i.test(n) && !/\.blockmap$/i.test(n),
      },
      { platform: 'macOS', test: (n) => /\.dmg$/i.test(n) },
    ],
  },
  {
    name: 'palco-receiver',
    category: 'tv',
    label: 'TV / Palco',
    assetMatchers: [
      { platform: 'Android TV', test: (n) => /AndroidTV.*\.apk$/i.test(n) },
      { platform: 'WebOS', test: (n) => /\.ipk$/i.test(n) },
      { platform: 'Tizen', test: (n) => /\.wgt$|\.tpk$/i.test(n) },
    ],
    aggregatePlatforms: true,
  },
  {
    name: 'apk',
    category: 'mobile',
    label: 'Mobile',
    assetMatchers: [
      { platform: 'Android', test: (n) => /^louvorja-piano-.*\.apk$/i.test(n) },
      { platform: 'iOS', test: (n) => /ios-unsigned\.ipa$/i.test(n) },
    ],
  },
]

const CACHE_TTL_MS = 5 * 60 * 1000

let cached: { data: DashboardStats; timestamp: number } | null = null

let octokitOverride: Octokit | null = null

export function __setOctokitForTesting(octokit: Octokit | null): void {
  octokitOverride = octokit
}

function getOctokit(): Octokit {
  if (octokitOverride) return octokitOverride
  return new Octokit({ auth: process.env.GITHUB_TOKEN || undefined })
}

export function clearStatsCache(): void {
  cached = null
}

interface ReleaseAsset {
  name: string
  download_count: number
}

interface Release {
  tag_name: string
  assets: ReleaseAsset[]
}

/**
 * GitHub Stats: downloads por app/plataforma, stars, forks.
 * Busca dos repos: app, palco-receiver, apk.
 */
export async function fetchGitHubStats(): Promise<{
  downloads: DownloadStats | null
  stars: number | null
  forks: number | null
}> {
  try {
    const octokit = getOctokit()

    const [appReleases, tvReleases, mobileReleases, repoInfo] = await Promise.all([
      octokit.rest.repos.listReleases({ owner: 'pianolouvorja', repo: 'app', per_page: 100 }),
      octokit.rest.repos.listReleases({
        owner: 'pianolouvorja',
        repo: 'palco-receiver',
        per_page: 100,
      }),
      octokit.rest.repos.listReleases({ owner: 'pianolouvorja', repo: 'apk', per_page: 100 }),
      octokit.rest.repos.get({ owner: 'pianolouvorja', repo: 'app' }),
    ])

    const allReleases = [appReleases.data, tvReleases.data, mobileReleases.data] as Release[][]

    const apps: AppDownloadStats[] = REPO_CONFIGS.map((config, i) => {
      const releases = allReleases[i] ?? []
      const platformMap = new Map<string, number>()
      let totalApp = 0
      let latestTag: string | null = null

      for (const release of releases) {
        if (!latestTag) latestTag = release.tag_name

        for (const asset of release.assets || []) {
          for (const matcher of config.assetMatchers) {
            if (matcher.test(asset.name)) {
              if (config.aggregatePlatforms) {
                const current = platformMap.get(matcher.platform) ?? 0
                if (asset.download_count > current) {
                  platformMap.set(matcher.platform, asset.download_count)
                }
              } else {
                platformMap.set(
                  matcher.platform,
                  (platformMap.get(matcher.platform) ?? 0) + asset.download_count,
                )
              }
              totalApp += asset.download_count
              break
            }
          }
        }
      }

      const platforms: PlatformDownloads[] = [...platformMap.entries()].map(
        ([platform, downloads]) => ({
          platform,
          downloads,
        }),
      )

      return {
        repo: config.name,
        category: config.category,
        label: config.label,
        latestTag,
        totalDownloads: totalApp,
        platforms,
      }
    })

    const total = apps.reduce((sum, a) => sum + a.totalDownloads, 0)

    return {
      downloads: { total, apps },
      stars: repoInfo.data.stargazers_count ?? null,
      forks: repoInfo.data.forks_count ?? null,
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
 * Visit Stats: visitas dos ultimos 30 dias, agregadas do geoStats
 * (telemetria propria, middleware geo-telemetry.ts -> Firestore).
 * Nao depende de GA4: usa os mesmos contadores do /api/admin/geo.
 */
export async function fetchVisitStats(): Promise<{
  visits: number | null
}> {
  try {
    const stats = await getGeoStats(30)
    return { visits: stats.totalVisits }
  } catch {
    return { visits: null }
  }
}

/**
 * Aggregador principal: busca todas as metricas em paralelo.
 * Usa cache de 5 minutos para evitar rate limit.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data
  }

  const [github, newsletter, visits] = await Promise.allSettled([
    fetchGitHubStats(),
    fetchNewsletterStats(),
    fetchVisitStats(),
  ])

  const githubValue =
    github.status === 'fulfilled' ? github.value : { downloads: null, stars: null, forks: null }
  const newsletterValue =
    newsletter.status === 'fulfilled' ? newsletter.value : { subscribers: null }
  const visitsValue = visits.status === 'fulfilled' ? visits.value : { visits: null }

  const data: DashboardStats = {
    downloads: githubValue.downloads,
    stars: githubValue.stars,
    forks: githubValue.forks,
    subscribers: newsletterValue.subscribers,
    donations: null,
    visits: visitsValue.visits,
    updatedAt: new Date().toISOString(),
  }

  cached = { data, timestamp: Date.now() }

  return data
}
