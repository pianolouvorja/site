/**
 * GET /api/admin/community/pending
 * Lista cadastros pendentes (testadores status=pendente, desenvolvedores
 * status=pendente, relatos status=novo) direto da sheet.
 * Exige Firebase ID token (padrão dos endpoints admin).
 */
interface SheetRow {
  row: number // índice 1-based na sheet
  values: string[]
}

async function fetchTab(
  token: string,
  sheetId: string,
  tab: string,
  range: string,
): Promise<SheetRow[]> {
  const res = await $fetch<{ values?: string[][] }>(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${tab}!${range}`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  return (res.values ?? []).map((values, i) => ({ row: i + 1, values }))
}

let cachedToken: { token: string; exp: number } | null = null

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.exp > Date.now() + 60_000) return cachedToken.token
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN
  if (!clientId || !clientSecret || !refreshToken) {
    throw createError({ statusCode: 500, statusMessage: 'Google OAuth não configurado' })
  }
  const res = await $fetch<{ access_token: string; expires_in: number }>(
    'https://oauth2.googleapis.com/token',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }).toString(),
    },
  )
  cachedToken = { token: res.access_token, exp: Date.now() + res.expires_in * 1000 }
  return res.access_token
}

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const sheetId = process.env.TESTERS_SHEET_ID
  if (!sheetId)
    throw createError({ statusCode: 500, statusMessage: 'TESTERS_SHEET_ID não configurado' })

  const token = await getAccessToken()

  const [testadores, desenvolvedores, relatos] = await Promise.all([
    fetchTab(token, sheetId, 'testadores', 'A2:L200').catch(() => []),
    fetchTab(token, sheetId, 'desenvolvedores', 'A2:K200').catch(() => []),
    fetchTab(token, sheetId, 'relatos', 'A2:I200').catch(() => []),
  ])

  // testadores: nome,email,avatar_url,bio,foco,linkedin,github,instagram,outros,ativo,desde,status
  const testersPendentes = testadores
    .filter((r) => (r.values[11] ?? '') === 'pendente')
    .map((r) => ({
      row: r.row,
      tab: 'testadores',
      nome: r.values[0] ?? '',
      email: r.values[1] ?? '',
      bio: r.values[3] ?? '',
      foco: r.values[4] ?? '',
      links: r.values[8] ?? '',
      status: 'pendente',
    }))

  // desenvolvedores: timestamp,nome,email,bio,github,portfolio,areas,disponibilidade,stack,motivacao,status
  const devsPendentes = desenvolvedores
    .filter((r) => (r.values[10] ?? '') === 'pendente')
    .map((r) => ({
      row: r.row,
      tab: 'desenvolvedores',
      nome: r.values[1] ?? '',
      email: r.values[2] ?? '',
      bio: r.values[3] ?? '',
      github: r.values[4] ?? '',
      portfolio: r.values[5] ?? '',
      areas: r.values[6] ?? '',
      disponibilidade: r.values[7] ?? '',
      stack: r.values[8] ?? '',
      status: 'pendente',
    }))

  // relatos: timestamp,testador,email,tipo,versao,modulo,descricao,passos,status
  const relatosNovos = relatos
    .filter((r) => (r.values[8] ?? '') === 'novo')
    .map((r) => ({
      row: r.row,
      tab: 'relatos',
      nome: r.values[1] ?? '',
      email: r.values[2] ?? '',
      tipo: r.values[3] ?? '',
      versao: r.values[4] ?? '',
      modulo: r.values[5] ?? '',
      descricao: r.values[6] ?? '',
      passos: r.values[7] ?? '',
      status: 'novo',
    }))

  return { testersPendentes, devsPendentes, relatosNovos }
})
