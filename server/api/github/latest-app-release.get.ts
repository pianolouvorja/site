import { Octokit } from '@octokit/rest'

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})

export default defineEventHandler(async (event) => {
  // During test prerender only, return stub data
  if (process.env.NODE_ENV === 'test') {
    return {
      tag_name: 'v1.0.0',
      assets: [],
    }
  }

  try {
    const response = await octokit.rest.repos.getLatestRelease({
      owner: 'pianolouvorja',
      repo: 'app',
    })

    setHeader(event, 'cache-control', 'public, max-age=3600, s-maxage=3600')

    return {
      tag_name: response.data.tag_name,
      assets: response.data.assets.map((a) => ({
        name: a.name,
        browser_download_url: a.browser_download_url,
        size: a.size,
      })),
    }
  } catch (error) {
    console.error('Error fetching latest app release:', error)
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to fetch latest release',
    })
  }
})
