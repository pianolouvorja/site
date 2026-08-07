import { Octokit } from '@octokit/rest'

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
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

  // Busca releases de todos os repos da org pianolouvorja
  const repos = ['web', 'app', 'api', 'site']
  const allReleases: any[] = []

  // Cada repo é buscado de forma independente — se um falhar, os outros ainda funcionam
  await Promise.all(
    repos.map(async (repo) => {
      try {
        let page = 1
        let hasMore = true

        while (hasMore) {
          const response = await octokit.rest.repos.listReleases({
            owner: 'pianolouvorja',
            repo,
            per_page: 100,
            page,
          })

          if (response.data.length === 0) {
            hasMore = false
          } else {
            const repoReleases = response.data.map((r) => ({
              ...r,
              _repo: repo,
            }))
            allReleases.push(...repoReleases)
            page++
          }
        }
      } catch (repoError) {
        // Loga mas não derruba a resposta inteira — retorna o que conseguir dos outros
        console.error(`Error fetching releases from ${repo}:`, repoError)
      }
    }),
  )

  // Ordena por data de publicação (mais recentes primeiro)
  allReleases.sort((a, b) => {
    const dateA = new Date(a.published_at || a.created_at).getTime()
    const dateB = new Date(b.published_at || b.created_at).getTime()
    return dateB - dateA
  })

  setHeader(event, 'cache-control', 'public, max-age=3600, s-maxage=3600')

  return allReleases
})
