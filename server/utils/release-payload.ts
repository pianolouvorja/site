export interface ReleasePayload {
  repo: string
  repoUrl: string
  tag: string
  title: string
  body: string
  releaseUrl: string
  publishedAt: string
  action: string
}

interface GithubWebhookBody {
  action?: string
  repository?: { full_name?: string; name?: string; html_url?: string }
  release?: {
    tag_name?: string
    name?: string
    body?: string
    html_url?: string
    published_at?: string
  }
}

export function parseGithubReleasePayload(raw: GithubWebhookBody): ReleasePayload | null {
  if (!raw || raw.action !== 'published') return null
  if (!raw.repository || !raw.release) return null

  const repo = raw.repository.name ?? raw.repository.full_name ?? ''
  if (!repo) return null

  return {
    repo,
    repoUrl: raw.repository.html_url ?? '',
    tag: raw.release.tag_name ?? '',
    title: raw.release.name ?? raw.release.tag_name ?? '',
    body: raw.release.body ?? '',
    releaseUrl: raw.release.html_url ?? '',
    publishedAt: raw.release.published_at ?? '',
    action: raw.action,
  }
}
