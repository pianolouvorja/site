/**
 * TASK-008 — RF-010: export CSV da lista de membros (LGPD portabilidade).
 * Puro — recebe docs, retorna string CSV com BOM e escape RFC 4180.
 */

/** Escapa campo CSV: aspas duplas internas dobradas, campo envolvido se tiver , " \n. */
export function escapeCsvField(value: unknown): string {
  const s = String(value ?? '')
  if (/[",\n\r]/.test(s)) return `"${s.replaceAll('"', '""')}"`
  return s
}

/** Gera CSV com header e BOM UTF-8 pra abrir direto no Excel/Sheets. */
export function membersToCsv(members: Array<Record<string, unknown>>): string {
  const header = 'uid,name,email,role,status,createdAt'
  const lines = members.map((m) =>
    [m.uid, m.name, m.email, m.role, m.status, m.createdAt].map(escapeCsvField).join(','),
  )
  return `\uFEFF${header}\n${lines.join('\n')}\n`
}
