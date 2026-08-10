# Newsletter Manager Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Newsletter manager completo no dashboard admin — compor, preview, enviar via SMTP Hostinger, gerenciar assinantes Buttondown, com templates personalizados Piano LouvorJA.

**Architecture:** Server-side SMTP via nodemailer (Hostinger), client-side dashboard com editor markdown, preview HTML, lista de assinantes via Buttondown API, historico de envios em memoria (cache). Templates HTML responsivos com branding Piano.

**Tech Stack:** Nuxt 4 server routes, nodemailer, html-to-text, Buttondown API, Vue 3 + scoped CSS, TypeScript strict

---

## Contexto atual

- **Captura de inscritos**: ja funciona via Buttondown API (useNewsletter composable + form na home)
- **Dashboard admin**: ja existe em `/admin` com Firebase Auth, 4 stat cards, atividade recente
- **SMTP Hostinger**: dados de conexao precisam ser configurados em env vars
- **Skill himalaya**: CLI email client — util pra referencia de IMAP/SMTP mas nao integravel no app web
- **Skill nodemailer reference**: `software-development/typescript-api-patterns/references/nodemailer-email-service.ts` — template pronto pra adaptar
- **Buttondown API**: captura de inscritos ja funciona, mas nao temos listagem/envio

## O que vamos construir

### Funcionalidades do Newsletter Manager

1. **Compor newsletter** — editor markdown com live preview HTML
2. **Templates** — 3 templates HTML personalizados Piano LouvorJA (anuncio, release, devocional)
3. **Enviar** — via SMTP Hostinger para todos os inscritos ou segmento
4. **Assinantes** — lista, busca, export CSV, remover
5. **Historico** — ultimos envios com status (enviado, falhou)
6. **Teste** — enviar pra email de teste antes do envio massivo

---

## Task 1: Instalar dependencias

**Objective:** Adicionar nodemailer e html-to-text ao projeto

**Files:**

- Modify: `package.json`

**Step 1:** Instalar deps

```bash
cd /home/ubuntu/piano-site && pnpm add nodemailer html-to-text && pnpm add -D @types/nodemailer
```

**Step 2:** Commit

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add nodemailer + html-to-text for newsletter SMTP"
```

---

## Task 2: Config SMTP no nuxt.config.ts e .env.example

**Objective:** Configurar runtimeConfig com credenciais SMTP Hostinger

**Files:**

- Modify: `nuxt.config.ts` (adicionar runtimeConfig.server)
- Modify: `.env.example`

**Step 1:** Adicionar runtimeConfig server-side em nuxt.config.ts

```typescript
runtimeConfig: {
  // Server-only (nao exposto ao client)
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: parseInt(process.env.SMTP_PORT || '465'),
  smtpSecure: process.env.SMTP_SECURE !== 'false', // default true (465)
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  smtpFromName: process.env.SMTP_FROM_NAME || 'Piano LouvorJA',
  smtpFromEmail: process.env.SMTP_FROM_EMAIL || 'noreply@pianolouvorja.com.br',
  buttondownApiKey: process.env.BUTTONDOWN_API_KEY || '',
},
```

**Step 2:** Adicionar vars em .env.example

```env
# SMTP (Hostinger) — Newsletter manager
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=noreply@pianolouvorja.com.br
SMTP_PASS=your-smtp-password
SMTP_FROM_NAME=Piano LouvorJA
SMTP_FROM_EMAIL=noreply@pianolouvorja.com.br
BUTTONDOWN_API_KEY=your-buttondown-key
```

**Step 3:** Commit

---

## Task 3: Server utility — SMTP service

**Objective:** Criar service reutilizavel de envio de email via nodemailer

**Files:**

- Create: `server/utils/mail.ts`

**Step 1:** Criar server/utils/mail.ts baseado no nodemailer reference

```typescript
import nodemailer, { type Transporter } from 'nodemailer'
import { convert } from 'html-to-text'

let transporter: Transporter | null = null

function getTransporter(): Transporter | null {
  const config = useRuntimeConfig()
  if (!config.smtpUser || !config.smtpPass) return null
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpSecure,
      auth: { user: config.smtpUser, pass: config.smtpPass },
    })
  }
  return transporter
}

export interface SendMailOptions {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
}

export async function sendMail(
  options: SendMailOptions,
): Promise<{ success: boolean; error?: string }> {
  const config = useRuntimeConfig()
  const tp = getTransporter()
  if (!tp) {
    return { success: false, error: 'SMTP not configured' }
  }
  try {
    const textContent = convert(options.html, { wordwrap: 80 })
    await tp.sendMail({
      from: `"${config.smtpFromName}" <${config.smtpFromEmail}>`,
      to: Array.isArray(options.to) ? options.to.join(',') : options.to,
      subject: options.subject,
      html: options.html,
      text: textContent,
      replyTo: options.replyTo,
    })
    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[mail] Error:', msg)
    return { success: false, error: msg }
  }
}

export async function verifyMailConnection(): Promise<{
  configured: boolean
  connected: boolean
  error?: string
}> {
  const config = useRuntimeConfig()
  if (!config.smtpUser || !config.smtpPass) {
    return { configured: false, connected: false }
  }
  const tp = getTransporter()
  if (!tp) return { configured: false, connected: false }
  try {
    await tp.verify()
    return { configured: true, connected: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { configured: true, connected: false, error: msg }
  }
}
```

**Step 2:** Commit

---

## Task 4: Server utility — Buttondown subscribers

**Objective:** Buscar lista de assinantes via Buttondown API

**Files:**

- Create: `server/utils/subscribers.ts`

**Step 1:** Criar server/utils/subscribers.ts

```typescript
export interface Subscriber {
  email: string
  createdAt: string
  tags: string[]
  active: boolean
}

export async function fetchSubscribers(): Promise<Subscriber[]> {
  const config = useRuntimeConfig()
  if (!config.buttondownApiKey) return []

  const subscribers: Subscriber[] = []
  let url: string | null = 'https://api.buttondown.com/api/v1/subscribers'

  while (url) {
    const res = await fetch(url, {
      headers: { Authorization: `Token ${config.buttondownApiKey}` },
    })
    if (!res.ok) break
    const data = await res.json()
    // Buttondown returns { results: [...], next: "url" | null }
    for (const sub of data.results || []) {
      subscribers.push({
        email: sub.email,
        createdAt: sub.creation_date || sub.created_at || '',
        tags: sub.tags || [],
        active: !sub.secondary_type || sub.secondary_type === 'regular',
      })
    }
    url = data.next
  }

  return subscribers
}

export async function getSubscriberCount(): Promise<number> {
  const config = useRuntimeConfig()
  if (!config.buttondownApiKey) return 0
  try {
    const res = await fetch('https://api.buttondown.com/api/v1/subscribers', {
      headers: { Authorization: `Token ${config.buttondownApiKey}` },
    })
    if (!res.ok) return 0
    const data = await res.json()
    return data.count || data.results?.length || 0
  } catch {
    return 0
  }
}

export async function removeSubscriber(email: string): Promise<boolean> {
  const config = useRuntimeConfig()
  if (!config.buttondownApiKey) return false
  try {
    const res = await fetch(`https://api.buttondown.com/api/v1/subscribers/${email}`, {
      method: 'DELETE',
      headers: { Authorization: `Token ${config.buttondownApiKey}` },
    })
    return res.ok || res.status === 204
  } catch {
    return false
  }
}
```

**Step 2:** Commit

---

## Task 5: Email templates HTML

**Objective:** Criar 3 templates HTML responsivos com branding Piano LouvorJA

**Files:**

- Create: `server/utils/email-templates.ts`

**Step 1:** Criar templates com design system Piano (cores #22d3ee cyan, dark theme, logo)

3 templates:

- `announcement` — anuncio geral (nova versao, evento, etc)
- `release` — nova release publicada com changelog
- `devotional` — devocional/conteudo

Cada template recebe `{ subject, body, unsubscribeUrl }` e retorna HTML string.

Design: header com gradient Piano, body com tipografia system-ui, footer com links sociais e unsubscribe. Cores do design system Piano (#0a0e1a bg, #22d3ee accent, #e2e8f0 text).

**Step 2:** Commit

---

## Task 6: Server API — GET /api/admin/newsletter/status

**Objective:** Status do SMTP + contagem de assinantes

**Files:**

- Create: `server/api/admin/newsletter/status.get.ts`

Retorna `{ smtp: { configured, connected, error }, subscribers: number }`

**Step 1:** Criar endpoint usando verifyMailConnection() + getSubscriberCount()

**Step 2:** Commit

---

## Task 7: Server API — GET /api/admin/newsletter/subscribers

**Objective:** Lista de assinantes com busca opcional

**Files:**

- Create: `server/api/admin/newsletter/subscribers.get.ts`

Query params: `?search=email&q=page=1`

Retorna `{ subscribers: Subscriber[], total: number }`

---

## Task 8: Server API — POST /api/admin/newsletter/send-test

**Objective:** Enviar email de teste pra um endereco especifico

**Files:**

- Create: `server/api/admin/newsletter/send-test.post.ts`

Body: `{ to: string, subject: string, html: string, template: string }`

Usa sendMail() com template renderizado.

---

## Task 9: Server API — POST /api/admin/newsletter/send

**Objective:** Enviar newsletter para todos os assinantes

**Files:**

- Create: `server/api/admin/newsletter/send.post.ts`

Body: `{ subject: string, body: string (markdown), template: string }`

Fluxo:

1. Renderizar markdown -> HTML com template
2. Buscar todos assinantes
3. Enviar em batches de 50 (evita rate limit SMTP)
4. Retornar `{ total: N, sent: N, failed: N, errors: string[] }`

**Pitfall:** Usar BCC ou enviar individualmente? Individual e melhor pra tracking + unsubscribe link unico. Mas BCC e mais rapido. Vamos com BCC em batches de 50 pra começar.

---

## Task 10: Server API — DELETE /api/admin/newsletter/subscribers/:email

**Objective:** Remover assinante

**Files:**

- Create: `server/api/admin/newsletter/subscribers/[email].delete.ts`

---

## Task 11: Server API — GET /api/admin/newsletter/history

**Objective:** Historico de envios (cache em memoria)

**Files:**

- Create: `server/api/admin/newsletter/history.get.ts`

Cache simples em `let history: SendRecord[]` — data, subject, template, total, sent, failed.

---

## Task 12: Pagina admin/newsletter.vue

**Objective:** Pagina do Newsletter Manager no dashboard

**Files:**

- Create: `app/pages/admin/newsletter.vue`

Layout com tabs:

1. **Compor** — editor markdown (textarea + preview ao lado), select de template, input de subject, botao "Enviar teste" + "Enviar para todos"
2. **Assinantes** — tabela com busca, export CSV, remover
3. **Historico** — lista de ultimos envios com status
4. **Status** — info do SMTP (conectado?), total de assinantes

UI matching admin dark theme (cores #0a0e1a, #22d3ee, etc).

---

## Task 13: Nav link no admin dashboard

**Objective:** Adicionar link "Newsletter" no header do dashboard

**Files:**

- Modify: `app/pages/admin/index.vue`

Adicionar link `<NuxtLink to="/admin/newsletter">Newsletter</NuxtLink>` no header actions.

---

## Task 14: i18n keys

**Objective:** Adicionar chaves de traducao para newsletter manager

**Files:**

- Modify: `i18n/pt-BR.json`, `i18n/en.json`, `i18n/es.json`

---

## Task 15: Testes

**Objective:** Cobertura 100% para novos endpoints e utils

**Files:**

- Create: `test/unit/server/utils/mail.test.ts` — mock nodemailer
- Create: `test/unit/server/utils/subscribers.test.ts` — mock fetch
- Create: `test/unit/server/utils/email-templates.test.ts` — renderiza todos templates
- Create: `test/unit/pages/admin-newsletter.test.ts` — monta componente

---

## Verification

Para cada task:

```bash
pnpm typecheck   # deve passar
pnpm lint        # 0 errors
pnpm test        # 100% coverage nos novos arquivos
```

Apos tudo implementado:

```bash
pnpm generate    # SSG build deve funcionar
```

---

## Riscos e tradeoffs

1. **SMTP rate limit Hostinger** — limit de ~100-500 emails/hora dependendo do plano. Batches de 50 com delay de 2s entre batches.
2. **Historico em memoria** — resetou o server perde o historico. Futuro: persistir em SQLite ou Firebase Firestore.
3. **Sem tracking de abertura/cliques** — SMTP nao oferece isso. Para tracking, precisaria de pixel tracking ou migrar para Buttondown campaigns.
4. **Unsubscribe** — link no rodape do email. Implementar rota `/api/newsletter/unsubscribe?email=X` que chama removeSubscriber().
5. **GDPR/LGPD** — termos de uso ja mencionam processamento de dados. Cada email deve incluir link de descadastro.

## Aproveitamento da skill himalaya

A skill himalaya e um CLI email client (IMAP/SMTP terminal). O aproveitamento:

- **Config SMTP**: o padrão de config.toml do himalaya serve de referencia pra estrutura de env vars (host, port, encryption, login, auth)
- **Bulk operations**: o pattern de batch delete/flag do bulk-email-cleanup.md e aplicavel no envio em massa
- **Nao integravel diretamente**: himalaya e CLI, o portal precisa de nodemailer (programatico)
