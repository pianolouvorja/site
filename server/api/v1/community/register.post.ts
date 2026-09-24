/**
 * POST /api/v1/community/register
 *
 * Aceita application/json:
 * { type: "general"|"tester"|"developer"|"bug", ...campos conforme type }
 * - general  → encaminha pra Web3Forms (via fetch no client, mantido por simplicidade)
 * - tester   → grava na aba `testadores` da sheet (status=pendente)
 * - developer→ grava na aba `desenvolvedores` da sheet (status=pendente)
 * - bug      → grava na aba `relatos` da sheet (status=novo)
 *
 * Obs: pra manter compatibilidade com formulários externos, o client continua
 * enviando pra Web3Forms no tipo 'general' (o server so encaminha a intenção).
 */
import { renderModeracao } from '../../../utils/email-moderacao'
import { sendMail } from '../../../utils/mail'

export default defineEventHandler(async (event) => {
  // --------------------------------------------------------------
  // 1) Config (env direto — nomes do .env)
  // --------------------------------------------------------------
  const SHEET_ID = process.env.TESTERS_SHEET_ID
  const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN
  const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
  const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

  if (!SHEET_ID) throw createError({ statusCode: 500, message: 'TESTERS_SHEET_ID não configurado' })
  if (!REFRESH_TOKEN)
    throw createError({ statusCode: 500, message: 'GOOGLE_REFRESH_TOKEN não configurado' })

  // --------------------------------------------------------------
  // 2) Recebe payload JSON
  // --------------------------------------------------------------
  const body = await readBody(event)
  if (!body || typeof body !== 'object')
    throw createError({ statusCode: 400, message: 'Payload JSON inválido' })

  const { type } = body
  if (!['general', 'tester', 'developer', 'bug'].includes(type)) {
    throw createError({ statusCode: 400, message: `Tipo inválido: ${type}` })
  }

  // --------------------------------------------------------------
  // 3) Helper: obter access token via refresh token (Google OAuth)
  // --------------------------------------------------------------
  async function getAccessToken() {
    const tokenResp = await $fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: CLIENT_ID!,
        client_secret: CLIENT_SECRET!,
        refresh_token: REFRESH_TOKEN!,
        grant_type: 'refresh_token',
      }).toString(),
    })
    return tokenResp.access_token
  }

  // --------------------------------------------------------------
  // 4) Roteamento por type
  // --------------------------------------------------------------
  if (type === 'general') {
    // Mantido pra compatibilidade: o client encaminha direto ao Web3Forms
    // (server apenas confirma recebimento)
    return { ok: true, forwardedTo: 'Web3Forms' }
  }

  const sheetMap = {
    tester: 'testadores',
    developer: 'desenvolvedores',
    bug: 'relatos',
  }
  const sheetName = sheetMap[type]

  // Monta linha conforme aba
  const timestamp = new Date().toISOString()
  let row: any[] = [timestamp] // coluna A: timestamp

  if (type === 'tester') {
    const { name, email, bio, focus, links } = body
    row = [
      name || '',
      email || '',
      '', // avatar_url — preenchido após aprovação
      bio || '',
      focus || '',
      '', // linkedin
      '', // github
      '', // instagram
      links || '',
      'false', // ativo — só vira true na aprovação (moderação)
      '', // desde — preenchido na aprovação
      'pendente',
    ]
  }

  if (type === 'developer') {
    const { name, email, bio, github, portfolio, areas, availability, stack, motivation } = body
    row = [
      timestamp,
      name || '',
      email || '',
      bio || '',
      github || '',
      portfolio || '',
      (areas as string) || '',
      availability || '',
      stack || '',
      motivation || '',
      'pendente', // status
    ]
  }

  if (type === 'bug') {
    const { name, testerEmail, email, reportType, version, module, description, steps } = body
    row = [
      timestamp,
      testerEmail || name || '',
      email || '',
      reportType || 'bug',
      version || '',
      module || '',
      description || '',
      steps || '',
      'novo', // status
    ]
  }

  // --------------------------------------------------------------
  // 5) Garante aba existente (com header) e append linha na sheet
  // --------------------------------------------------------------
  const headers: Record<string, string[]> = {
    // testadores: schema existente, consumido por useTesters.ts (ativo=true → aparece no site)
    testadores: [
      'nome',
      'email',
      'avatar_url',
      'bio',
      'foco',
      'linkedin',
      'github',
      'instagram',
      'outros',
      'ativo',
      'desde',
      'status',
    ],
    desenvolvedores: [
      'timestamp',
      'nome',
      'email',
      'bio',
      'github',
      'portfolio',
      'areas',
      'disponibilidade',
      'stack',
      'motivacao',
      'status',
    ],
    relatos: [
      'timestamp',
      'testador',
      'email',
      'tipo',
      'versao',
      'modulo',
      'descricao',
      'passos',
      'status',
    ],
  }

  try {
    const accessToken = await getAccessToken()
    const authHeaders = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    }

    // cria aba + header se não existir (ignora erro de duplicada)
    let abaExiste = true
    await $fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}:batchUpdate`, {
      method: 'POST',
      headers: authHeaders,
      body: { requests: [{ addSheet: { properties: { title: sheetName } } }] },
    })
      .then(() => {
        abaExiste = false
      })
      .catch(() => {})

    // header só quando a aba foi criada agora — via append (nunca sobrescreve;
    // aba vazia → cai na linha 1). PUT A1 dá 400 em aba recém-criada.
    if (!abaExiste) {
      await $fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${sheetName}!A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
        {
          method: 'POST',
          headers: authHeaders,
          body: { values: [headers[sheetName]] },
        },
      )
    }

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${sheetName}!A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`
    const resp = await $fetch(url, {
      method: 'POST',
      headers: authHeaders,
      body: { values: [row] },
    })

    // resposta típica: { spreadsheetId, tableRange, updates }

    // relato de bug: email de confirmação de recebimento (resposta padrão)
    if (type === 'bug' && (body as { email?: string }).email) {
      const { subject, html } = renderModeracao('bug_recebido', {
        nome: (body as { name?: string }).name,
      })
      await sendMail({ to: (body as { email: string }).email, subject, html }).catch(() => {})
    }

    return { ok: true, sheet: sheetName, updates: resp.updates }
  } catch (err: any) {
    console.error('[community/register] Erro ao gravar na sheet:', err)
    throw createError({
      statusCode: 502,
      message: 'Falha ao gravar na planilha',
      data: err?.message || err,
    })
  }
})
