import { Octokit } from '@octokit/rest'

export interface ActivityItem {
  type: 'release' | 'pr' | 'issue' | 'unknown'
  title: string
  author: string
  createdAt: string
  url: string
}

/** Override para testes */
let _octokitOverride: Octokit | null = null

export function __setOctokitForTesting(octokit: Octokit | null): void {
  _octokitOverride = octokit
}

function getOctokit(): Octokit {
  if (_octokitOverride) return _octokitOverride
  return new Octokit({ auth: process.env.GITHUB_TOKEN || undefined })
}

/**
 * Busca eventos recentes do repo pianolouvorja/web.
 * Filtra: releases publicados, PRs, issues.
 */
export async function fetchRecentActivity(): Promise<ActivityItem[]> {
  try {
    const octokit = getOctokit()

    const response = await octokit.rest.activity.listRepoEvents({
      owner: 'pianolouvorja',
      repo: 'web',
      per_page: 30,
    })

    const events = response.data
      .filter((e) => ['ReleaseEvent', 'PullRequestEvent', 'IssuesEvent'].includes(e.type as string))
      .slice(0, 5)
      .map((e): ActivityItem => {
        const payload = e.payload as Record<string, unknown>
        const author = e.actor?.login || 'unknown'
        const createdAt = e.created_at || new Date().toISOString()

        if (e.type === 'ReleaseEvent') {
          const release = payload.release as Record<string, unknown>
          return {
            type: 'release',
            title: (release?.name as string) || (release?.tag_name as string) || 'Release',
            author,
            createdAt,
            url: (release?.html_url as string) || '#',
          }
        }
        if (e.type === 'PullRequestEvent') {
          const pr = payload.pull_request as Record<string, unknown>
          return {
            type: 'pr',
            title: (pr?.title as string) || `PR #${payload.number}`,
            author,
            createdAt,
            url: (pr?.html_url as string) || '#',
          }
        }
        if (e.type === 'IssuesEvent') {
          const issue = payload.issue as Record<string, unknown>
          return {
            type: 'issue',
            title: (issue?.title as string) || `Issue #${payload.number}`,
            author,
            createdAt,
            url: (issue?.html_url as string) || '#',
          }
        }
        return {
          type: 'unknown' as const,
          title: (e.type as string) ?? 'Event',
          author,
          createdAt,
          url: '#',
        }
      })

    return events
  } catch {
    return []
  }
}
