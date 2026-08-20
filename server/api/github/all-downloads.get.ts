import { Octokit } from '@octokit/rest'
import {
  type AllDownloadsResponse,
  type AssetInfo,
  REPO_CONFIGS,
  matchAssets,
  makeEmptyCategory,
} from '~/utils/downloads'

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})

/**
 * Static snapshot of real release data (updated occasionally).
 * Last resort fallback when the GitHub API fails AND no cache exists.
 */
const STATIC_SNAPSHOT: AllDownloadsResponse = {
  desktop: {
    repo: 'app',
    tag: 'v0.1.53',
    assets: {
      linux: {
        url: 'https://github.com/pianolouvorja/app/releases/download/v0.1.53/piano-louvor-ja-0.1.53.AppImage',
        name: 'piano-louvor-ja-0.1.53.AppImage',
        size: 95000000,
      },
      windows: {
        url: 'https://github.com/pianolouvorja/app/releases/download/v0.1.53/piano-louvor-ja-Setup-0.1.53.exe',
        name: 'piano-louvor-ja-Setup-0.1.53.exe',
        size: 98000000,
      },
      macos: {
        url: 'https://github.com/pianolouvorja/app/releases/download/v0.1.53/piano-louvor-ja-0.1.53.dmg',
        name: 'piano-louvor-ja-0.1.53.dmg',
        size: 102000000,
      },
    },
  },
  tv: {
    repo: 'palco-receiver',
    tag: 'v1.0.0',
    assets: {
      webos: {
        url: 'https://github.com/pianolouvorja/palco-receiver/releases/download/v1.0.0/palco-receiver_1.0.0_all.ipk',
        name: 'palco-receiver_1.0.0_all.ipk',
        size: 2500000,
      },
      tizen: {
        url: 'https://github.com/pianolouvorja/palco-receiver/releases/download/v1.0.0/palco-receiver_1.0.0.tpk',
        name: 'palco-receiver_1.0.0.tpk',
        size: 2800000,
      },
    },
  },
  mobile: {
    repo: 'apk',
    tag: 'v0.1.53',
    assets: {
      android: {
        url: 'https://github.com/pianolouvorja/apk/releases/download/v0.1.53/piano-louvor-ja-0.1.53.apk',
        name: 'piano-louvor-ja-0.1.53.apk',
        size: 35000000,
      },
    },
  },
}

export default defineEventHandler(async (event): Promise<AllDownloadsResponse> => {
  let served: AllDownloadsResponse
  let cacheState: 'fresh' | 'stale' | 'snapshot'

  try {
    const result = await githubCached('all-downloads', async () => {
      const categories: AllDownloadsResponse = {
        desktop: makeEmptyCategory('app'),
        tv: makeEmptyCategory('palco-receiver'),
        mobile: makeEmptyCategory('apk'),
      }

      const results = await Promise.allSettled(
        REPO_CONFIGS.map(async (config) => {
          // Repos with per-platform release tags (e.g. palco-receiver:
          // webos-v*, tizen-v*, androidtv-v*) publish each platform as its own
          // release, so `getLatestRelease` would only ever surface one platform.
          // Aggregate across the most recent releases per platform instead.
          if (config.aggregatePlatforms) {
            const list = await octokit.rest.repos.listReleases({
              owner: 'pianolouvorja',
              repo: config.name,
              per_page: 15,
            })
            const assets: Record<string, AssetInfo> = {}
            for (const release of list.data) {
              const matched = matchAssets(release.assets, config.assetMatchers)
              for (const [platform, info] of Object.entries(matched)) {
                // keep the first (most recent) asset per platform
                if (!assets[platform]) assets[platform] = info
              }
            }
            return { config, assets, tag: list.data[0]?.tag_name ?? null }
          }

          const release = await octokit.rest.repos.getLatestRelease({
            owner: 'pianolouvorja',
            repo: config.name,
          })
          return {
            config,
            assets: matchAssets(release.data.assets, config.assetMatchers),
            tag: release.data.tag_name,
          }
        }),
      )

      let anyFulfilled = false
      for (const result of results) {
        if (result.status === 'fulfilled') {
          const { config, assets, tag } = result.value
          categories[config.category] = {
            repo: config.name,
            tag,
            assets,
          }
          anyFulfilled = true
        }
      }

      // All repos failed → treat as upstream failure so the cache layer
      // can serve a stale value instead of caching empty categories.
      if (!anyFulfilled) throw new Error('all GitHub repos failed')

      return categories
    })

    served = result.value
    cacheState = result.cache
  } catch {
    // No cache + upstream down → static snapshot (never break the download page)
    served = STATIC_SNAPSHOT
    cacheState = 'snapshot'
  }

  // x-cache: fresh | stale | snapshot — observability for debugging fallbacks
  setHeader(event, 'x-cache', cacheState)
  // stale/snapshot data is a best-effort copy; keep browser caching short
  const maxAge = cacheState === 'fresh' ? 300 : 60
  setHeader(event, 'cache-control', `public, max-age=${maxAge}, s-maxage=${maxAge}`)

  return served
})
