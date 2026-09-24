/**
 * Testers sheet — parses Google Sheets gviz CSV export into typed tester reports.
 * Fonte: Google Form → Sheet compartilhada "qualquer pessoa com o link".
 * Export URL: https://docs.google.com/spreadsheets/d/<ID>/gviz/tq?tqx=out:csv
 */

export interface TesterReport {
  date: string
  tester: string
  version: string
  module: string
  status: 'ok' | 'bug' | 'feature' | 'other'
  report: string
}

type RawRow = Record<string, string>

/**
 * RFC-4180-ish CSV parser (quotes, escaped quotes, CRLF, embedded newlines).
 */
export function parseGvizCsv(csv: string): RawRow[] {
  const text = csv.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  if (!text) return []

  const rows: string[][] = []
  let field = ''
  let row: string[] = []
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      row.push(field)
      field = ''
    } else if (ch === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += ch
    }
  }
  // final field/row without trailing newline
  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  if (rows.length === 0) return []
  const header = rows[0]!
  return rows.slice(1).map((cells) => {
    const obj: RawRow = {}
    header.forEach((h, idx) => {
      obj[h] = cells[idx] ?? ''
    })
    return obj
  })
}

const HEADER_ALIASES: Record<keyof Omit<TesterReport, 'status'>, string[]> = {
  date: ['timestamp', 'data', 'date'],
  tester: ['nome', 'tester', 'testador', 'name'],
  version: ['versão', 'versao', 'version', 'versão testada'],
  module: ['módulo', 'modulo', 'module', 'área', 'area'],
  report: ['relato', 'report', 'descrição', 'descricao', 'description', 'feedback'],
}

const STATUS_ALIASES: Record<TesterReport['status'], string[]> = {
  ok: ['ok', 'funcionou', 'passou', 'sucesso', 'working'],
  bug: ['bug', 'erro', 'falha', 'não funciona', 'nao funciona', 'broken'],
  feature: ['feature', 'sugestão', 'sugestao', 'melhoria', 'request'],
  other: [],
}

function pick(row: RawRow, aliases: string[]): string {
  for (const key of Object.keys(row)) {
    if (aliases.includes(key.trim().toLowerCase())) return row[key] || ''
  }
  return ''
}

function normalizeStatus(raw: string): TesterReport['status'] {
  const v = raw.trim().toLowerCase()
  for (const status of ['ok', 'bug', 'feature'] as const) {
    if (STATUS_ALIASES[status].includes(v)) return status
  }
  return 'other'
}

export function normalizeTesterRow(row: RawRow): TesterReport {
  return {
    date: pick(row, HEADER_ALIASES.date),
    tester: pick(row, HEADER_ALIASES.tester),
    version: pick(row, HEADER_ALIASES.version),
    module: pick(row, HEADER_ALIASES.module),
    status: normalizeStatus(pick(row, ['status'])),
    report: pick(row, HEADER_ALIASES.report),
  }
}

export function parseTesterReports(csv: string): TesterReport[] {
  return parseGvizCsv(csv).map(normalizeTesterRow)
}

// ── Roster de testadores (aba 'testadores') ──────────────────────

/** Perfil vindo da sheet — dinâmico, a partir do Form de cadastro. */
export interface SheetTester {
  id: string
  name: string
  avatar: string
  bio: string
  focus: string[]
  links: { label: string; url: string }[]
  since: string
  /** true quando a coluna 'ativo' marca inativo — filtrado fora do roster. */
  inactive: boolean
}

/** Emoji default quando o testador não informa avatar ( deterministic por nome). */
const AVATAR_EMOJIS = [
  '1f977', // 🥻 -> usa raccoon-like; fallback visual ok
  '1f9d1-200d-1f4bb', // pessoa no computador
  '1f9d1-200d-1f3eb', // pessoa professora
  '1f469-200d-1f4bb', // mulher no computador
  '1f468-200d-1f4bb', // homem no computador
  '1f9d1-200d-1f52c', // pessoa cientista
]

function hashCode(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

function defaultAvatar(name: string): string {
  const emoji = AVATAR_EMOJIS[hashCode(name) % AVATAR_EMOJIS.length]
  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${emoji}.svg`
}

function slugId(name: string, idx: number): string {
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return slug || `tester-${idx + 1}`
}

/** Plataformas aceitas no form de cadastro → chave de foco i18n. */
const FOCUS_ALIASES: Record<string, string[]> = {
  web: ['web'],
  desktop: ['desktop', 'electron'],
  mobile: ['mobile', 'apk', 'android'],
  tv: ['tv', 'palco', 'cast'],
}

function normalizeFocus(raw: string): string[] {
  const out = new Set<string>()
  for (const part of raw.split(';')) {
    const v = part.trim().toLowerCase()
    for (const [key, aliases] of Object.entries(FOCUS_ALIASES)) {
      if (aliases.some((a) => v.includes(a))) out.add(key)
    }
  }
  return [...out]
}

function addLink(links: { label: string; url: string }[], label: string, raw: string): void {
  const url = raw.trim()
  if (!url) return
  links.push({ label, url: url.startsWith('http') ? url : `https://${url}` })
}

export function normalizeTesterProfileRow(row: RawRow, idx: number): SheetTester {
  const name = pick(row, ['nome', 'name', 'testador']).trim()
  const bio = pick(row, ['bio', 'sobre']).trim()
  const since = pick(row, ['desde', 'since']).trim()
  const active = pick(row, ['ativo', 'active']).trim().toLowerCase()
  const inactive = ['inativo', 'inactive', 'false', 'no'].includes(active)

  const links: { label: string; url: string }[] = []
  addLink(links, 'LinkedIn', pick(row, ['linkedin']))
  addLink(links, 'GitHub', pick(row, ['github']))
  addLink(links, 'Instagram', pick(row, ['instagram']))
  addLink(links, 'Outros', pick(row, ['outros', 'outro', 'other']))

  return {
    id: slugId(name, idx),
    name,
    avatar: pick(row, ['avatar_url', 'avatar']).trim() || defaultAvatar(name),
    bio,
    focus: normalizeFocus(pick(row, ['foco', 'focus', 'plataforma'])),
    links,
    since,
    inactive,
  }
}

/** Linhas com nome ≥2 chars e ativo — vazias/teste/inativas descartadas. */
export function parseTesterProfiles(csv: string): SheetTester[] {
  return parseGvizCsv(csv)
    .map((row, idx) => normalizeTesterProfileRow(row, idx))
    .filter((t) => t.name.length >= 2 && !t.inactive)
}
