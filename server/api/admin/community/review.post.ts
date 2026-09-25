/**
 * POST /api/admin/community/review
 * Aprova ou rejeita um cadastro pendente e envia email de resposta padrão.
 *
 * Body: { tab: 'testadores'|'desenvolvedores'|'relatos', row: number,
 *         acao: 'aprovar'|'rejeitar'|'resolver' }
 *
 * - testadores: aprovar → ativo=TRUE, status=aprovado | rejeitar → status=rejeitado
 * - desenvolvedores: aprovar → status=aprovado | rejeitar → status=rejeitado
 * - relatos: resolver → status=resolvido (email de confirmação é enviado no recebimento,
 *   não aqui — mas rejeitar um relato falso também marca como rejeitado)
 * Exige Firebase ID token (padrão admin).
 */
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

// Coluna da célula de status por aba (1-based)
const STATUS_COL: Record<string, number> = {
  testadores: 12, // L — status
  desenvolvedores: 11, // K — status
  relatos: 9, // I — status
}

const COL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const sheetId = process.env.TESTERS_SHEET_ID
  if (!sheetId)
    throw createError({ statusCode: 500, statusMessage: 'TESTERS_SHEET_ID não configurado' })

  const body = await readBody<{ tab?: string; row?: number; acao?: string }>(event)
  const { tab, row, acao } = body ?? {}

  if (!tab || !(tab in STATUS_COL)) {
    throw createError({ statusCode: 400, statusMessage: 'tab inválida' })
  }
  if (!row || row < 2) {
    throw createError({ statusCode: 400, statusMessage: 'row inválida (>=2, linha 1 é header)' })
  }
  const acoesValidas = tab === 'relatos' ? ['resolver', 'rejeitar'] : ['aprovar', 'rejeitar']
  if (!acao || !acoesValidas.includes(acao)) {
    throw createError({ statusCode: 400, statusMessage: `ação inválida para ${tab}` })
  }

  const token = await getAccessToken()

  // 1) Lê a linha pra pegar nome/email (pro email)
  const colLetter = COL_LETTERS[STATUS_COL[tab]! - 1]
  const linha = await $fetch<{ values?: string[][] }>(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${tab}!A${row}:${COL_LETTERS[STATUS_COL[tab]! - 1]}${row}`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  const values = linha.values?.[0] ?? []
  if (!values.length) {
    throw createError({ statusCode: 404, statusMessage: 'Linha não encontrada' })
  }

  // nome/email conforme schema da aba
  const nome = tab === 'testadores' ? (values[0] ?? '') : (values[1] ?? '')
  const email = tab === 'testadores' ? (values[1] ?? '') : (values[2] ?? '')

  // 2) Atualiza célula de status
  const novoStatus =
    tab === 'relatos'
      ? acao === 'resolver'
        ? 'resolvido'
        : 'rejeitado'
      : acao === 'aprovar'
        ? 'aprovado'
        : 'rejeitado'

  await $fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${tab}!${colLetter}${row}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: { values: [[novoStatus]] },
    },
  )

  // 3) Bonus: aprovar testador também ativa (coluna J ativo=TRUE)
  if (tab === 'testadores' && acao === 'aprovar') {
    await $fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/testadores!J${row}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: { values: [['TRUE']] },
      },
    ).catch(() => {}) // não falha a aprovação se o ativo falhar
  }

  // 4) Email de resposta padrão
  let emailEnviado = false
  let emailErro: string | undefined

  const whatsappUrl = process.env.NUXT_PUBLIC_WHATSAPP_URL || 'https://chat.whatsapp.com/'

  let template: Parameters<typeof renderModeracao>[0] | null = null
  if (tab === 'testadores') template = acao === 'aprovar' ? 'tester_aprovado' : 'tester_rejeitado'
  if (tab === 'desenvolvedores') template = acao === 'aprovar' ? 'dev_aprovado' : 'dev_rejeitado'
  // relatos: sem email no review (o email de confirmação é pro endpoint de registro)

  if (template && email) {
    const { subject, html } = renderModeracao(template, { nome, whatsappUrl })
    const result = await sendMail({ to: email, subject, html })
    emailEnviado = result.success
    emailErro = result.error
  }

  return { ok: true, tab, row, status: novoStatus, emailEnviado, emailErro }
})
