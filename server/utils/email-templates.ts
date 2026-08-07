interface TemplateParams {
  subject: string
  body: string
  unsubscribeUrl: string
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
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#22d3ee;">$1</a>')
}

function shell(inner: string, headerAccent: string, badge?: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0e1a;font-family:system-ui,-apple-system,sans-serif;">
<tr><td align="center" style="padding:24px;">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;">
    <tr><td style="padding:24px 0;border-bottom:2px solid ${headerAccent};">
      <span style="font-size:24px;font-weight:800;color:${headerAccent};">Piano LouvorJA</span>
      <br><span style="font-size:12px;color:#64748b;">App de louvor para IASD</span>
    </td></tr>
    ${badge ? `<tr><td style="padding:12px 0;"><span style="display:inline-block;padding:4px 12px;border-radius:999px;font-size:11px;font-weight:700;background:rgba(34,211,238,0.12);color:#22d3ee;">${badge}</span></td></tr>` : ''}
    <tr><td style="padding:20px 0;color:#e2e8f0;font-size:15px;line-height:1.6;">
      ${inner}
    </td></tr>
    <tr><td style="padding:20px 0;border-top:1px solid #1e293b;color:#64748b;font-size:12px;">
      <p><a href="https://github.com/pianolouvorja" style="color:#64748b;">GitHub</a> &middot;
      <a href="https://pianolouvorja.com.br" style="color:#64748b;">Site</a></p>
      <p><a href="${'${unsubscribeUrl}'}" style="color:#475569;">Cancelar inscri&ccedil;&atilde;o</a></p>
      <p>&copy; 2026 Piano LouvorJA. Todos os direitos reservados.</p>
    </td></tr>
  </table>
</td></tr>
</table>`
}

export function renderTemplate(template: string, params: TemplateParams): string {
  const body = renderMarkdown(params.body)
  const unsub = params.unsubscribeUrl

  if (template === 'release') {
    return shell(body, '#22d3ee', 'Nova vers&atilde;o').replace('${unsubscribeUrl}', unsub)
  }
  if (template === 'devotional') {
    return `<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0e1a;font-family:system-ui,-apple-system,sans-serif;">
<tr><td align="center" style="padding:24px;">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;">
    <tr><td style="padding:24px 0;border-bottom:2px solid #f59e0b;">
      <span style="font-size:24px;font-weight:800;color:#f59e0b;">Piano LouvorJA</span>
      <br><span style="font-size:12px;color:#64748b;">Devocional</span>
    </td></tr>
    <tr><td style="padding:20px 0;color:#e2e8f0;font-size:15px;line-height:1.6;">
      ${body}
    </td></tr>
    <tr><td style="padding:20px 0;border-top:1px solid #1e293b;color:#64748b;font-size:12px;">
      <p><a href="${unsub}" style="color:#475569;">Cancelar inscri&ccedil;&atilde;o</a></p>
      <p>&copy; 2026 Piano LouvorJA.</p>
    </td></tr>
  </table>
</td></tr>
</table>`
  }
  // announcement (default)
  return shell(body, '#22d3ee').replace('${unsubscribeUrl}', unsub)
}
