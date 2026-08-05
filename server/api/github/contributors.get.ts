import { Octokit } from '@octokit/rest'

// Inicializa o octokit. Se você tiver um PAT, adicione em `process.env.GITHUB_TOKEN`
// Senão, rodará não-autenticado, o que funciona, mas tem rate limits menores.
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})

export default defineEventHandler(async (event) => {
  // Vamos paginar para buscar os contributors de todos os repos
  const repos = ['web', 'app', 'site']
  const allContributors = new Map<string, any>()

  try {
    for (const repo of repos) {
      let page = 1
      let hasMore = true

      while (hasMore) {
        const response = await octokit.rest.repos.listContributors({
          owner: 'pianolouvorja',
          repo: repo,
          per_page: 100, // Máximo por página
          page,
        })

        if (response.data.length === 0) {
          hasMore = false
        } else {
          for (const contributor of response.data) {
            // Ignorar bots
            if (
              contributor.login &&
              (contributor.login.includes('[bot]') || contributor.login.endsWith('-bot'))
            ) {
              continue
            }

            if (contributor.login && allContributors.has(contributor.login)) {
              const existing = allContributors.get(contributor.login)
              existing.contributions += contributor.contributions
            } else if (contributor.login) {
              allContributors.set(contributor.login, contributor)
            }
          }
          page++
        }
      }
    }

    // Convert Map back to array and sort by contributions
    const sortedContributors = Array.from(allContributors.values()).sort(
      (a, b) => b.contributions - a.contributions,
    )

    // Seta cache
    setHeader(event, 'cache-control', 'public, max-age=3600, s-maxage=3600')

    return sortedContributors
  } catch (error) {
    console.error('Error fetching contributors:', error)
    return createError({
      statusCode: 500,
      message: 'Failed to fetch contributors from GitHub',
    })
  }
})
