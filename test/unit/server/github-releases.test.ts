import { describe, it, expect, vi } from 'vitest'
import handler from '../../../server/api/github/releases.get'

// Mock Octokit para não chamar rede
vi.mock('@octokit/rest', () => ({
  Octokit: vi.fn().mockImplementation(() => ({
    rest: {
      repos: {
        listReleases: vi.fn().mockResolvedValue({
          data: [
            {
              tag_name: 'v1.0.0',
              name: 'Release v1.0.0',
              published_at: '2025-01-15T10:00:00Z',
              html_url: 'https://github.com/pianolouvorja/web/releases/tag/v1.0.0',
              body: 'body',
              assets: [],
            },
          ],
        }),
      },
    },
  })),
}))

describe('server/api/github/releases.get.ts (handler)', () => {
  it('returns releases from stub when VITEST', async () => {
    process.env.VITEST = 'true'
    const event = { headers: {}, node: { req: { headers: {} } } } as any
    const result = await handler(event)
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBe(6)
    expect(result[0]._repo).toBe('apk')
  })

  it('sorts by published_at descending', async () => {
    process.env.VITEST = 'true'
    const event = { headers: {}, node: { req: { headers: {} } } } as any
    const result = await handler(event)
    const dates = result.map((r: any) => new Date(r.published_at).getTime())
    const sorted = [...dates].sort((a, b) => b - a)
    expect(dates).toEqual(sorted)
  })

  it('each release has required fields', async () => {
    process.env.VITEST = 'true'
    const event = { headers: {}, node: { req: { headers: {} } } } as any
    const result = await handler(event)
    for (const release of result) {
      expect(release).toHaveProperty('tag_name')
      expect(release).toHaveProperty('name')
      expect(release).toHaveProperty('published_at')
      expect(release).toHaveProperty('html_url')
      expect(release).toHaveProperty('body')
      expect(release).toHaveProperty('_repo')
    }
  })
})
