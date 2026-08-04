/**
 * RSS Feed — /rss.xml
 * Busca os últimos 20 releases do GitHub (pianolouvorja/web) e retorna XML.
 * Cache de 1h no Cloudflare/Vercel edge.
 */
const GITHUB_API = 'https://api.github.com/repos/pianolouvorja/web/releases?per_page=20'

interface GithubRelease {
  tag_name: string
  name: string | null
  body: string | null
  html_url: string
  published_at: string
  prerelease: boolean
  draft: boolean
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export default defineEventHandler(async (event) => {
  // Cache 1h
  setHeader(event, 'content-type', 'application/rss+xml; charset=utf-8')
  setHeader(event, 'cache-control', 'public, max-age=3600, s-maxage=3600')

  let releases: GithubRelease[] = []

  try {
    const res = await fetch(GITHUB_API, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'piano-site-rss',
      },
    })

    if (res.ok) {
      releases = (await res.json()) as GithubRelease[]
    }
  } catch {
    // Se GitHub falhar, retorna feed vazio (não quebra o site)
  }

  const items = releases
    .filter((r) => !r.draft)
    .map((r) => {
      const title = r.name || r.tag_name
      const description = r.body || `Release ${r.tag_name}`
      return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${escapeXml(r.html_url)}</link>
      <guid isPermaLink="true">${escapeXml(r.html_url)}</guid>
      <pubDate>${new Date(r.published_at).toUTCString()}</pubDate>
      <description><![CDATA[${description}]]></description>
      ${r.prerelease ? '<category>prerelease</category>' : '<category>stable</category>'}
    </item>`
    })
    .join('\n')

  const now = new Date().toUTCString()
  const lastBuild = releases.length > 0 ? new Date(releases[0].published_at).toUTCString() : now

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Piano Louvor JA — Releases</title>
    <link>https://pianolouvorja.com.br/releases</link>
    <atom:link href="https://pianolouvorja.com.br/rss.xml" rel="self" type="application/rss+xml" />
    <description>Acompanhe as novidades e atualizações do Piano Louvor JA</description>
    <language>pt-BR</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
${items}
  </channel>
</rss>`

  return xml
})
