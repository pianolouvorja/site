export interface AssetInfo {
  url: string
  name: string
  size: number
}

export interface CategoryResult {
  repo: string
  tag: string | null
  assets: Record<string, AssetInfo>
}

export interface AllDownloadsResponse {
  desktop: CategoryResult
  tv: CategoryResult
  mobile: CategoryResult
}

interface AssetMatcher {
  platform: string
  test: (name: string) => boolean
}

export interface RepoConfig {
  name: string
  category: keyof AllDownloadsResponse
  assetMatchers: AssetMatcher[]
}

export const REPO_CONFIGS: RepoConfig[] = [
  {
    name: 'app',
    category: 'desktop',
    assetMatchers: [
      { platform: 'linux', test: (n) => /\.appimage$/i.test(n) },
      {
        platform: 'windows',
        test: (n) => /\.exe$/i.test(n) && !/\.yml$/i.test(n) && !/\.blockmap$/i.test(n),
      },
      { platform: 'macos', test: (n) => /\.dmg$/i.test(n) },
    ],
  },
  {
    name: 'palco-receiver',
    category: 'tv',
    assetMatchers: [
      { platform: 'androidtv', test: (n) => /AndroidTV.*\.apk$/i.test(n) },
      { platform: 'webos', test: (n) => /\.ipk$/i.test(n) },
    ],
  },
  {
    name: 'apk',
    category: 'mobile',
    assetMatchers: [
      { platform: 'android', test: (n) => /^louvorja-piano-.*\.apk$/i.test(n) },
      { platform: 'ios', test: (n) => /ios-unsigned\.ipa$/i.test(n) },
    ],
  },
]

export interface RawReleaseAsset {
  name: string
  browser_download_url: string
  size: number
}

export function matchAssets(
  assets: RawReleaseAsset[],
  matchers: AssetMatcher[],
): Record<string, AssetInfo> {
  const result: Record<string, AssetInfo> = {}
  for (const asset of assets) {
    for (const matcher of matchers) {
      if (matcher.test(asset.name)) {
        result[matcher.platform] = {
          url: asset.browser_download_url,
          name: asset.name,
          size: asset.size,
        }
      }
    }
  }
  return result
}

export function makeEmptyCategory(repo: string): CategoryResult {
  return { repo, tag: null, assets: {} }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const value = bytes / 1024 ** i
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}
