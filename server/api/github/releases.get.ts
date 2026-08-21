import { Octokit } from '@octokit/rest'

// Token opcional — sem token, usa unauthenticated (60 req/h, suficiente com cache)
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN || undefined,
})

// Tipos para releases
interface GitHubRelease {
  tag_name: string
  name: string
  published_at: string
  html_url: string
  body: string
  _repo: string
  created_at?: string
  assets?: Array<{
    name: string
    browser_download_url: string
    content_type: string
    size: number
  }>
}

export default defineEventHandler(async (event) => {
  // During test prerender only, return stub data (CI needs real releases for SSG)
  if (process.env.VITEST) {
    return [
      {
        tag_name: 'v0.1.53',
        name: 'Mobile v0.1.53',
        published_at: '2025-01-25T10:00:00Z',
        _repo: 'apk',
        html_url: 'https://github.com/pianolouvorja/apk/releases/tag/v0.1.53',
        body: 'Test release',
        assets: [],
      },
      {
        tag_name: 'v0.1.13',
        name: 'Palco Receiver v0.1.13',
        published_at: '2025-01-20T10:00:00Z',
        _repo: 'palco-receiver',
        html_url: 'https://github.com/pianolouvorja/palco-receiver/releases/tag/v0.1.13',
        body: 'Test release',
        assets: [],
      },
      {
        tag_name: 'v1.17.5',
        name: 'Release v1.17.5',
        published_at: '2025-01-15T10:00:00Z',
        _repo: 'web',
        html_url: 'https://github.com/pianolouvorja/web/releases/tag/v1.17.5',
        body: 'Test release',
        assets: [],
      },
      {
        tag_name: 'v1.17.5',
        name: 'Release v1.17.5',
        published_at: '2025-01-15T10:00:00Z',
        _repo: 'app',
        html_url: 'https://github.com/pianolouvorja/app/releases/tag/v1.17.5',
        body: 'Test release',
        assets: [],
      },
      {
        tag_name: 'v1.0.0',
        name: 'API v1.0.0',
        published_at: '2025-01-10T10:00:00Z',
        _repo: 'api',
        html_url: 'https://github.com/pianolouvorja/api/releases/tag/v1.0.0',
        body: 'Test release',
        assets: [],
      },
      {
        tag_name: 'v1.0.0',
        name: 'Site v1.0.0',
        published_at: '2025-01-05T10:00:00Z',
        _repo: 'site',
        html_url: 'https://github.com/pianolouvorja/site/releases/tag/v1.0.0',
        body: 'Test release',
        assets: [],
      },
    ] as GitHubRelease[]
  }

  const repos = ['web', 'app', 'api', 'site', 'palco-receiver', 'apk'] as const
  const allReleases: GitHubRelease[] = []

  // Fetch em paralelo — se um falhar, os outros ainda funcionam
  const results = await Promise.allSettled(
    repos.map(async (repo) => {
      const response = await octokit.rest.repos.listReleases({
        owner: 'pianolouvorja',
        repo,
        per_page: 10,
      })

      return response.data.map((r: any) => ({
        ...r,
        _repo: repo,
      })) as GitHubRelease[]
    }),
  )

  for (let i = 0; i < results.length; i++) {
    const result = results[i]!
    const repo = repos[i]

    if (result.status === 'fulfilled') {
      allReleases.push(...result.value)
    } else {
      // Loga mas nao derruba a resposta inteira
      console.error(`Error fetching releases from ${repo}:`, result.reason)
    }
  }

  // Ordena por data de publicacao (mais recentes primeiro)
  allReleases.sort((a, b) => {
    const dateA = new Date(a.published_at ?? a.created_at ?? new Date()).getTime()
    const dateB = new Date(b.published_at ?? b.created_at ?? new Date()).getTime()
    return dateB - dateA
  })

  setHeader(event, 'cache-control', 'public, max-age=3600, s-maxage=3600')

  return allReleases
})
