import { defineEventHandler, getHeader } from 'h3'

const SITE_URL = 'https://pianolouvorja.com.br'

const ROUTES = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/download', changefreq: 'monthly', priority: '0.9' },
  { path: '/releases', changefreq: 'weekly', priority: '0.8' },
  { path: '/docs', changefreq: 'monthly', priority: '0.7' },
  { path: '/contact', changefreq: 'yearly', priority: '0.6' },
  { path: '/privacy', changefreq: 'yearly', priority: '0.3' },
  { path: '/terms', changefreq: 'yearly', priority: '0.3' },
]

const LOCALES = ['', '/en', '/es']

/**
 * GET /sitemap.xml
 * Gera sitemap dinamico com todas as rotas x locales.
 */
export default defineEventHandler((event) => {
  const urls = ROUTES.flatMap((route) =>
    LOCALES.map((locale) => {
      const url = `${SITE_URL}${locale}${route.path === '/' ? (locale ? '' : '/') : route.path}`
      return `  <url>
    <loc>${url}</loc>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
    }),
  )

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`

  setHeader(event, 'content-type', 'application/xml')
  setHeader(event, 'cache-control', 'public, max-age=3600')

  return xml
})
