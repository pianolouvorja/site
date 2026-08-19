import { EMAIL_BRAND_TOKENS as T } from './email-brand'
import { getEmailStrings, type EmailStrings } from './email-i18n'

const LOGO_URL = 'https://pianolouvorja.com.br/brand/logo-louvor-ja.svg'

interface TemplateParams {
  subject: string
  body: string
  unsubscribeUrl: string
  locale?: string
}

export function renderMarkdown(md: string): string {
  const lines = md.split('\n')
  let html = ''
  let inList = false
  let inCode = false

  for (const line of lines) {
    if (line.startsWith('```')) {
      if (inCode) {
        html += '</code></pre>'
        inCode = false
      } else {
        html += '<pre><code>'
        inCode = true
      }
      continue
    }
    if (inCode) {
      html += line + '\n'
      continue
    }
    if (/^### /.test(line)) {
      if (inList) {
        html += '</ul>'
        inList = false
      }
      html += `<h3>${esc(line.slice(4))}</h3>`
    } else if (/^## /.test(line)) {
      if (inList) {
        html += '</ul>'
        inList = false
      }
      html += `<h2>${esc(line.slice(3))}</h2>`
    } else if (/^# /.test(line)) {
      if (inList) {
        html += '</ul>'
        inList = false
      }
      html += `<h1>${esc(line.slice(2))}</h1>`
    } else if (/^[-*] /.test(line)) {
      if (!inList) {
        html += '<ul>'
        inList = true
      }
      html += `<li>${inline(line.slice(2))}</li>`
    } else if (line.trim() === '') {
      if (inList) {
        html += '</ul>'
        inList = false
      }
    } else {
      if (inList) {
        html += '</ul>'
        inList = false
      }
      html += `<p>${inline(line)}</p>`
    }
  }
  if (inList) html += '</ul>'
  if (inCode) html += '</code></pre>'
  return html
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function inline(s: string): string {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, `<a href="$2" style="color:${T.cyan};">$1</a>`)
}

function badge(strs: EmailStrings, template: string): string | undefined {
  const map: Record<string, keyof EmailStrings['badges']> = {
    release: 'release',
    devotional: 'devotional',
    announcement: 'announcement',
  }
  const key = map[template] ?? 'announcement'
  const text = strs.badges[key]
  return `<span style="display:inline-block;padding:4px 12px;border-radius:999px;font-size:11px;font-weight:700;background:rgba(0,193,230,0.12);color:${T.cyan};">${text}</span>`
}

function shell(
  inner: string,
  headerAccent: string,
  strs: EmailStrings,
  template: string,
  unsubscribeUrl: string,
): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="background:${T.dark};font-family:system-ui,-apple-system,sans-serif;">
<tr><td align="center" style="padding:24px;">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;">
    <tr><td style="padding:24px 0;border-bottom:2px solid ${headerAccent};">
      <img src="${LOGO_URL}" alt="Piano LouvorJA" style="max-height:40px;margin-bottom:8px;display:block;" />
      <span style="font-size:24px;font-weight:800;color:${headerAccent};">Piano LouvorJA</span>
      <br><span style="font-size:12px;color:${T.muted};">${strs.appSubtitle}</span>
    </td></tr>
    <tr><td style="padding:12px 0;">${badge(strs, template)}</td></tr>
    <tr><td style="padding:20px 0;color:${T.text};font-size:15px;line-height:1.6;">
      ${inner}
    </td></tr>
    <tr><td style="padding:20px 0;border-top:1px solid ${T.border};color:${T.muted};font-size:12px;">
      <p><a href="https://github.com/pianolouvorja" style="color:${T.muted};">GitHub</a> &middot;
      <a href="https://pianolouvorja.com.br" style="color:${T.muted};">Site</a></p>
      <p><a href="${unsubscribeUrl}" style="color:${T.slateLight};">${strs.unsubscribe}</a></p>
      <p>&copy; 2026 Piano LouvorJA. ${strs.copyright}</p>
    </td></tr>
  </table>
</td></tr>
</table>`
}

export function renderTemplate(template: string, params: TemplateParams): string {
  const body = renderMarkdown(params.body)
  const locale = params.locale ?? 'pt-BR'
  const strs = getEmailStrings(locale)

  if (template === 'devotional') {
    return shell(body, T.yellow, strs, template, params.unsubscribeUrl)
  }
  // release and announcement
  return shell(body, T.cyan, strs, template, params.unsubscribeUrl)
}
