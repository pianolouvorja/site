import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

const KNOWN_REPOS = ['web', 'app', 'api', 'site', 'palco-receiver', 'apk']

describe('server/api/github/releases.get.ts', async () => {
  await setup({
    rootDir: process.cwd(),
  })

  it('returns releases from GitHub API', async () => {
    const response = (await $fetch('/api/github/releases')) as any[]
    expect(Array.isArray(response)).toBe(true)
    expect(response.length).toBeGreaterThan(0)
  })

  it('each release has required fields', async () => {
    const response = (await $fetch('/api/github/releases')) as any[]
    for (const release of response) {
      expect(release).toHaveProperty('tag_name')
      expect(release).toHaveProperty('name')
      expect(release).toHaveProperty('published_at')
      expect(release).toHaveProperty('html_url')
      expect(release).toHaveProperty('body')
      expect(KNOWN_REPOS).toContain(release._repo)
    }
  })

  it('sorts releases by published_at descending', async () => {
    const response = (await $fetch('/api/github/releases')) as any[]
    const dates = response.map((r) => new Date(r.published_at).getTime())
    const sorted = [...dates].sort((a, b) => b - a)
    expect(dates).toEqual(sorted)
  })
})
