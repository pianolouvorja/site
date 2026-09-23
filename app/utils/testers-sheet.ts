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
  if (!text.trim()) return []

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
  const header = rows[0]
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
    if (aliases.includes(key.trim().toLowerCase())) return row[key]
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
