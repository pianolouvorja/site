import { Octokit } from '@octokit/rest'

// Token opcional — sem token, usa unauthenticated (60 req/h, suficiente com cache)
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN || undefined,
})

export default defineEventHandler(async (event) => {
  // During CI/test prerender, return stub data to avoid GitHub API rate limits
  if (process.env.CI === 'true' || process.env.NODE_ENV === 'test') {
    return [
      {
        tag_name: 'v1.0.0',
        name: 'Test Release',
        published_at: '2025-01-01T00:00:00Z',
        _repo: 'web',
        html_url: '',
        body: '',
      },
    ]
  }

  const repos = ['web', 'app', 'api', 'site'] as const
  const allReleases: any[] = []

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
      }))
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
    const dateA = new Date(a.published_at || a.created_at).getTime()
    const dateB = new Date(b.published_at || b.created_at).getTime()
    return dateB - dateA
  })

  setHeader(event, 'cache-control', 'public, max-age=3600, s-maxage=3600')

  return allReleases
})
