import { describe, it, expect } from 'vitest'
import { renderTemplate, renderMarkdown } from '~~/server/utils/email-templates'

describe('renderMarkdown', () => {
  it('converts headings', () => {
    expect(renderMarkdown('# Title')).toContain('<h1>Title</h1>')
    expect(renderMarkdown('## Sub')).toContain('<h2>Sub</h2>')
    expect(renderMarkdown('### Sub3')).toContain('<h3>Sub3</h3>')
  })

  it('converts lists', () => {
    const md = '- item1\n- item2'
    const html = renderMarkdown(md)
    expect(html).toContain('<ul>')
    expect(html).toContain('<li>item1</li>')
    expect(html).toContain('<li>item2</li>')
    expect(html).toContain('</ul>')
  })

  it('converts bold and italic', () => {
    expect(renderMarkdown('**bold**')).toContain('<strong>bold</strong>')
    expect(renderMarkdown('*italic*')).toContain('<em>italic</em>')
  })

  it('escapes HTML', () => {
    expect(renderMarkdown('<script>')).toContain('&lt;script&gt;')
  })

  it('renders links with piano-cyan color', () => {
    const html = renderMarkdown('[text](https://example.com)')
    expect(html).toContain('color:#00c1e6')
    expect(html).not.toContain('#22d3ee')
  })

  it('converts paragraphs', () => {
    expect(renderMarkdown('Hello world')).toContain('<p>Hello world</p>')
  })

  it('closes list when heading follows', () => {
    const md = '- item1\n## Heading'
    const html = renderMarkdown(md)
    expect(html).toContain('</ul>')
    expect(html).toContain('<h2>Heading</h2>')
    // list must be closed BEFORE heading
    expect(html.indexOf('</ul>')).toBeLessThan(html.indexOf('<h2>'))
  })

  it('closes list when h1 follows', () => {
    const md = '- item\n# Title'
    const html = renderMarkdown(md)
    expect(html).toContain('</ul>')
    expect(html).toContain('<h1>Title</h1>')
  })

  it('closes list when empty line follows', () => {
    const md = '- item\n\n'
    const html = renderMarkdown(md)
    expect(html).toContain('</ul>')
  })

  it('closes list when paragraph follows', () => {
    const md = '- item\nSome text'
    const html = renderMarkdown(md)
    expect(html).toContain('</ul>')
    expect(html).toContain('<p>Some text</p>')
    expect(html.indexOf('</ul>')).toBeLessThan(html.indexOf('<p>'))
  })

  it('renders code blocks', () => {
    const md = '```\ncode here\n```'
    const html = renderMarkdown(md)
    expect(html).toContain('<pre><code>')
    expect(html).toContain('code here')
    expect(html).toContain('</code></pre>')
  })

  it('renders h3 after list', () => {
    const md = '- item\n### Sub'
    const html = renderMarkdown(md)
    expect(html).toContain('<h3>Sub</h3>')
  })

  it('auto-closes unclosed code block at end of input', () => {
    const md = '```\ncode without closing'
    const html = renderMarkdown(md)
    expect(html).toContain('<pre><code>')
    expect(html).toContain('code without closing')
    expect(html).toContain('</code></pre>')
  })

  it('renders content inside code block spanning multiple lines', () => {
    const md = '```\nline1\nline2\n```'
    const html = renderMarkdown(md)
    expect(html).toContain('line1')
    expect(html).toContain('line2')
    expect(html).toContain('</code></pre>')
  })
})

describe('renderTemplate — branding', () => {
  const params = {
    subject: 'Test',
    body: '# Hello',
    unsubscribeUrl: 'https://example.com/unsub',
  }

  it('release template uses piano-dark background (#0a1733)', () => {
    const html = renderTemplate('release', params)
    expect(html).toContain('#0a1733')
    expect(html).not.toContain('#0a0e1a')
  })

  it('release template uses piano-cyan accent (#00c1e6)', () => {
    const html = renderTemplate('release', params)
    expect(html).toContain('#00c1e6')
    expect(html).not.toContain('#22d3ee')
  })

  it('devotional template uses piano-yellow accent (#fcce02)', () => {
    const html = renderTemplate('devotional', params)
    expect(html).toContain('#fcce02')
    expect(html).not.toContain('#f59e0b')
  })

  it('announcement template uses piano-dark background', () => {
    const html = renderTemplate('announcement', params)
    expect(html).toContain('#0a1733')
  })

  it('includes logo img with alt text in header', () => {
    const html = renderTemplate('release', params)
    expect(html).toContain('<img')
    expect(html).toContain('logo-louvor-ja.svg')
    expect(html).toMatch(/alt="[^"]*Piano LouvorJA[^"]*"/i)
  })
})

describe('renderTemplate — i18n', () => {
  const params = (locale: string) => ({
    subject: 'Test',
    body: '# Hello',
    unsubscribeUrl: 'https://example.com/unsub',
    locale,
  })

  it('pt-BR (default) has Portuguese strings', () => {
    const html = renderTemplate('release', params('pt-BR'))
    expect(html).toContain('Cancelar inscri')
    expect(html).toContain('Todos os direitos reservados')
    expect(html).toContain('App de louvor para IASD')
  })

  it('en has English strings', () => {
    const html = renderTemplate('release', params('en'))
    expect(html).toContain('Unsubscribe')
    expect(html).toContain('All rights reserved')
    expect(html).toContain('Worship app')
  })

  it('es has Spanish strings', () => {
    const html = renderTemplate('release', params('es'))
    expect(html).toContain('Cancelar suscripci')
    expect(html).toContain('Todos los derechos reservados')
    expect(html).toContain('alabanza')
  })

  it('unknown locale falls back to pt-BR', () => {
    const html = renderTemplate('release', params('fr'))
    expect(html).toContain('Cancelar inscri')
  })

  it('release badge is localized', () => {
    expect(renderTemplate('release', params('en'))).toContain('New release')
    expect(renderTemplate('release', params('pt-BR'))).toContain('Nova vers')
  })

  it('unknown template falls back to announcement badge', () => {
    const html = renderTemplate('unknown' as 'announcement', params('pt-BR'))
    const announcementHtml = renderTemplate('announcement', params('pt-BR'))
    // badge deve ser a mesma do announcement
    expect(html).toContain('background:rgba(0,193,230,0.12)')
    // deve ter o texto do badge announcement
    const badgeText = announcementHtml.match(/font-weight:700[^>]*>([^<]+)</)
    if (badgeText) {
      expect(html).toContain(badgeText[1])
    }
  })
})
