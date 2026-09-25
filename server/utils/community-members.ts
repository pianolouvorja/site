/**
 * TASK-004 — RF-001/RF-002: repositório Firestore de membros da comunidade.
 *
 * Camada de dados pura (Firestore injetado) — testável sem emulador.
 */

export interface MemberQuery {
  q?: string
  role?: string
  status?: string
  cursor?: string
  limit?: number
}

export interface MemberPage {
  members: Array<Record<string, unknown>>
  nextCursor: string | null
  total: number
}

export interface MemberDeps {
  collection: (name: string) => CollectionRef
}

export interface CollectionRef {
  doc(id: string): DocRef
  where(field: string, op: string, value: unknown): Query
}

export interface DocRef {
  get(): Promise<{ exists: boolean; data(): Record<string, unknown> | undefined }>
}

export interface Query {
  where(field: string, op: string, value: unknown): Query
  limit(n: number): Query
  startAfter(cursor: string): Query
  get(): Promise<QuerySnapshot>
}

export interface QuerySnapshot {
  docs: Array<{
    id: string
    data(): Record<string, unknown>
  }>
}

/** Normaliza o termo de busca (lowercase, trim) — consistente com gravação. */
export function normalizeQuery(q: string | undefined): string {
  return (q ?? '').trim().toLowerCase()
}

/** Limita o tamanho de página (default 25, máx 100). */
export function pageSize(limit?: number): number {
  if (!limit || limit < 1) return 25
  return Math.min(limit, 100)
}

/**
 * Filtra members em memória por busca (prefixo em name/email, case-insensitive)
 * e filtros exatos de role/status. Puro — Firestore entrega os docs.
 */
export function applyFilters(
  members: Array<Record<string, unknown>>,
  query: MemberQuery,
): Array<Record<string, unknown>> {
  const q = normalizeQuery(query.q)
  let out = members
  if (q) {
    out = out.filter((m) => {
      const name = String(m.name ?? '').toLowerCase()
      const email = String(m.email ?? '').toLowerCase()
      return name.startsWith(q) || email.startsWith(q)
    })
  }
  if (query.role) {
    out = out.filter((m) => m.role === query.role)
  }
  if (query.status) {
    out = out.filter((m) => m.status === query.status)
  }
  return out
}

/** Pagina uma lista filtrada com cursor baseado em índice (offset codificado). */
export function paginate(members: Array<Record<string, unknown>>, query: MemberQuery): MemberPage {
  const size = pageSize(query.limit)
  const offset = query.cursor ? Number.parseInt(query.cursor, 10) || 0 : 0
  const page = members.slice(offset, offset + size)
  const next = offset + size
  return {
    members: page,
    nextCursor: next < members.length ? String(next) : null,
    total: members.length,
  }
}

/** Pipeline completo: filtros + paginação. */
export function queryMembers(
  members: Array<Record<string, unknown>>,
  query: MemberQuery,
): MemberPage {
  const filtered = applyFilters(members, query)
  return paginate(filtered, query)
}
