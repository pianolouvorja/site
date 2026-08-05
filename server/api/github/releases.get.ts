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

  // Atualmente o site busca de pianolouvorja/web
  // Mas vamos buscar dos 3 e consolidar.
  const repos = ['web', 'app', 'site']
  const allReleases: any[] = []

  try {
    for (const repo of repos) {
      let page = 1
      let hasMore = true

      while (hasMore) {
        const response = await octokit.rest.repos.listReleases({
          owner: 'pianolouvorja',
          repo: repo,
          per_page: 100, // Máximo
          page,
        })

        if (response.data.length === 0) {
          hasMore = false
        } else {
          // Marca o repo em cada release caso precisemos na UI
          const repoReleases = response.data.map((r) => ({
            ...r,
            _repo: repo,
          }))
          allReleases.push(...repoReleases)
          page++
        }
      }
    }

    // Ordena por data de publicação (mais recentes primeiro)
    allReleases.sort((a, b) => {
      const dateA = new Date(a.published_at || a.created_at).getTime()
      const dateB = new Date(b.published_at || b.created_at).getTime()
      return dateB - dateA
    })

    setHeader(event, 'cache-control', 'public, max-age=3600, s-maxage=3600')

    // Retorna todos os releases combinados
    return allReleases
  } catch (error) {
    console.error('Error fetching releases:', error)
    return createError({
      statusCode: 500,
      message: 'Failed to fetch releases from GitHub',
    })
  }
})
