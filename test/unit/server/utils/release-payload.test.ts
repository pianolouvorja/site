import { describe, it, expect } from 'vitest'
import { parseGithubReleasePayload } from '~~/server/utils/release-payload'

describe('parseGithubReleasePayload', () => {
  it('extracts release info from valid payload', () => {
    const payload = {
      action: 'published',
      repository: {
        full_name: 'pianolouvorja/app',
        name: 'app',
        html_url: 'https://github.com/pianolouvorja/app',
      },
      release: {
        tag_name: 'v2.0.0',
        name: 'v2.0.0',
        body: '## Novidades\n- Feature A\n- Bug fix B',
        html_url: 'https://github.com/pianolouvorja/app/releases/tag/v2.0.0',
        published_at: '2026-08-08T12:00:00Z',
      },
    }

    const result = parseGithubReleasePayload(payload)

    expect(result).toEqual({
      repo: 'app',
      repoUrl: 'https://github.com/pianolouvorja/app',
      tag: 'v2.0.0',
      title: 'v2.0.0',
      body: '## Novidades\n- Feature A\n- Bug fix B',
      releaseUrl: 'https://github.com/pianolouvorja/app/releases/tag/v2.0.0',
      publishedAt: '2026-08-08T12:00:00Z',
      action: 'published',
    })
  })

  it('returns null for non-published action', () => {
    const payload = {
      action: 'unpublished',
      repository: { full_name: 'pianolouvorja/app', name: 'app', html_url: '' },
      release: { tag_name: 'v1.0', name: 'v1.0', body: '', html_url: '', published_at: '' },
    }

    expect(parseGithubReleasePayload(payload)).toBeNull()
  })

  it('returns null when action is draft', () => {
    const payload = {
      action: 'created',
      repository: { full_name: 'pianolouvorja/app', name: 'app', html_url: '' },
      release: { tag_name: 'v1.0', name: 'v1.0', body: '', html_url: '', published_at: '' },
    }

    expect(parseGithubReleasePayload(payload)).toBeNull()
  })

  it('returns null for missing release', () => {
    const payload = {
      action: 'published',
      repository: { full_name: 'pianolouvorja/app', name: 'app', html_url: '' },
    }

    expect(parseGithubReleasePayload(payload)).toBeNull()
  })

  it('returns null for missing repository', () => {
    const payload = {
      action: 'published',
      release: { tag_name: 'v1.0', name: 'v1.0', body: '', html_url: '', published_at: '' },
    }

    expect(parseGithubReleasePayload(payload)).toBeNull()
  })

  it('falls back to full_name when name is missing', () => {
    const payload = {
      action: 'published',
      repository: { full_name: 'pianolouvorja/app' },
      release: { tag_name: 'v1.0' },
    }

    const result = parseGithubReleasePayload(payload)!
    expect(result.repo).toBe('pianolouvorja/app')
  })

  it('returns null when both name and full_name are missing', () => {
    const payload = {
      action: 'published',
      repository: {},
      release: { tag_name: 'v1.0' },
    }

    expect(parseGithubReleasePayload(payload)).toBeNull()
  })

  it('uses empty string for all missing optional fields', () => {
    const payload = {
      action: 'published',
      repository: { name: 'app' },
      release: {},
    }

    const result = parseGithubReleasePayload(payload)!

    expect(result.repoUrl).toBe('')
    expect(result.tag).toBe('')
    expect(result.title).toBe('')
    expect(result.body).toBe('')
    expect(result.releaseUrl).toBe('')
    expect(result.publishedAt).toBe('')
  })

  it('title falls back to tag_name when name is missing', () => {
    const payload = {
      action: 'published',
      repository: { name: 'app' },
      release: { tag_name: 'v2.0.0' },
    }

    const result = parseGithubReleasePayload(payload)!
    expect(result.title).toBe('v2.0.0')
  })
})
