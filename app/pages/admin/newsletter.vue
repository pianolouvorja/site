<script setup lang="ts">
  definePageMeta({
    layout: 'admin',
    middleware: 'auth',
  })

  useHead({ title: 'Newsletter · Piano Louvor JA' })

  const { logout } = useFirebaseAuth()

  type Tab = 'compose' | 'subscribers' | 'history' | 'status'
  const activeTab = ref<Tab>('compose')

  // --- Compose ---
  const subject = ref('')
  const body = ref('')
  const template = ref<'announcement' | 'release' | 'devotional'>('announcement')
  const testEmail = ref('')
  const sending = ref(false)
  const sendResult = ref<{ success: boolean; message: string } | null>(null)

  const templates = [
    { value: 'announcement' as const, label: 'Anúncio' },
    { value: 'release' as const, label: 'Release' },
    { value: 'devotional' as const, label: 'Devocional' },
  ]

  async function sendTest() {
    if (!testEmail.value || !subject.value || !body.value) return
    sending.value = true
    sendResult.value = null
    try {
      const res = await $fetch('/api/admin/newsletter/send-test', {
        method: 'POST',
        body: {
          to: testEmail.value,
          subject: subject.value,
          body: body.value,
          template: template.value,
        },
      })
      sendResult.value = {
        success: res.success,
        message: res.success ? 'Email de teste enviado!' : `Erro: ${res.error}`,
      }
    } catch {
      sendResult.value = { success: false, message: 'Erro ao enviar teste' }
    } finally {
      sending.value = false
    }
  }

  async function sendAll() {
    if (!subject.value || !body.value) return
    if (!window.confirm('Enviar para TODOS os assinantes?')) return
    sending.value = true
    sendResult.value = null
    try {
      const res = await $fetch('/api/admin/newsletter/send', {
        method: 'POST',
        body: {
          subject: subject.value,
          body: body.value,
          template: template.value,
        },
      })
      sendResult.value = {
        success: res.failed === 0,
        message:
          `Enviados: ${res.sent}/${res.total}` +
          (res.failed > 0 ? ` (${res.failed} falharam)` : ''),
      }
    } catch {
      sendResult.value = { success: false, message: 'Erro ao enviar' }
    } finally {
      sending.value = false
    }
  }

  // --- Subscribers ---
  interface Sub {
    email: string
    createdAt: string
    tags: string[]
    active: boolean
  }
  const subscribers = ref<Sub[]>([])
  const subSearch = ref('')
  const subLoading = ref(false)

  async function loadSubs() {
    subLoading.value = true
    try {
      const res = await $fetch<{ subscribers: Sub[]; total: number }>(
        '/api/admin/newsletter/subscribers',
        { query: subSearch.value ? { search: subSearch.value } : {} },
      )
      subscribers.value = res.subscribers
    } catch {
      subscribers.value = []
    } finally {
      subLoading.value = false
    }
  }

  function exportCSV() {
    const csv = ['email,created_at,active']
    for (const s of subscribers.value) {
      csv.push(`${s.email},${s.createdAt},${s.active ? 'yes' : 'no'}`)
    }
    const blob = new window.Blob([csv.join('\n')], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'subscribers.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  async function removeSub(email: string) {
    if (!window.confirm(`Remover ${email}?`)) return
    try {
      await $fetch(`/api/admin/newsletter/subscribers/${encodeURIComponent(email)}`, {
        method: 'DELETE',
      })
      subscribers.value = subscribers.value.filter((s) => s.email !== email)
    } catch {
      // ignore
    }
  }

  // --- History ---
  interface HistoryItem {
    date: string
    subject: string
    template: string
    total: number
    sent: number
    failed: number
    errors: string[]
  }
  const history = ref<HistoryItem[]>([])

  async function loadHistory() {
    try {
      const res = await $fetch<{ history: HistoryItem[] }>('/api/admin/newsletter/history')
      history.value = res.history
    } catch {
      history.value = []
    }
  }

  // --- Status ---
  const smtpStatus = ref<{
    smtp: { configured: boolean; connected: boolean; error?: string }
    subscribers: number
  } | null>(null)

  async function loadStatus() {
    try {
      smtpStatus.value = await $fetch('/api/admin/newsletter/status')
    } catch {
      smtpStatus.value = null
    }
  }

  // --- Lifecycle ---
  onMounted(() => {
    loadSubs()
    loadHistory()
    loadStatus()
  })

  const formatDate = (d: string) => new Date(d).toLocaleString('pt-BR')

  // --- Live preview ---
  const previewHtml = ref('')
  const previewLoading = ref(false)
  let previewTimer: ReturnType<typeof setTimeout> | null = null

  async function fetchPreview() {
    if (!body.value) {
      previewHtml.value = ''
      return
    }
    previewLoading.value = true
    try {
      const res = await $fetch<{ html: string }>('/api/admin/newsletter/preview', {
        method: 'POST',
        body: {
          template: template.value,
          subject: subject.value || 'Preview',
          body: body.value,
        },
      })
      previewHtml.value = res.html
    } catch {
      previewHtml.value = '<p style="color:#f87171">Erro ao gerar preview</p>'
    } finally {
      previewLoading.value = false
    }
  }

  function schedulePreview() {
    if (previewTimer) clearTimeout(previewTimer)
    previewTimer = setTimeout(fetchPreview, 500)
  }

  watch([subject, body, template], schedulePreview)

  const templates_ = templates
  const subscribers_ = subscribers
  const history_ = history
  const smtpStatus_ = smtpStatus
</script>

<template>
  <div class="newsletter-page">
    <header class="nl-header">
      <div>
        <h1>Newsletter</h1>
        <p class="welcome">Gerenciar envios e assinantes</p>
      </div>
      <div class="header-actions">
        <NuxtLink to="/admin" class="back-btn">
          <i class="ti ti-arrow-left" />
          Dashboard
        </NuxtLink>
        <button class="logout-btn" @click="logout">
          <i class="ti ti-logout" />
          Sair
        </button>
      </div>
    </header>

    <nav class="nl-tabs">
      <button
        v-for="t in [
          { id: 'compose', label: 'Compor', icon: 'ti-edit' },
          { id: 'subscribers', label: 'Assinantes', icon: 'ti-users' },
          { id: 'history', label: 'Histórico', icon: 'ti-history' },
          { id: 'status', label: 'Status', icon: 'ti-plug' },
        ]"
        :key="t.id"
        class="nl-tab"
        :class="{ 'nl-tab--active': activeTab === t.id }"
        @click="activeTab = t.id as Tab"
      >
        <i class="ti" :class="t.icon" />
        {{ t.label }}
      </button>
    </nav>

    <!-- Compose -->
    <section v-if="activeTab === 'compose'" class="nl-section">
      <div class="compose-grid">
        <div class="compose-editor">
          <div class="field">
            <label for="subject">Assunto</label>
            <input id="subject" v-model="subject" type="text" placeholder="Título do email" />
          </div>
          <div class="field">
            <label for="template">Template</label>
            <select id="template" v-model="template">
              <option v-for="t in templates_" :key="t.value" :value="t.value">
                {{ t.label }}
              </option>
            </select>
          </div>
          <div class="field">
            <label for="body">Conteúdo (Markdown)</label>
            <textarea
              id="body"
              v-model="body"
              rows="18"
              placeholder="## Título&#10;&#10;Escreva em **markdown**..."
            />
          </div>
        </div>
        <div class="compose-preview">
          <div class="preview-label">
            Preview
            <span v-if="previewLoading" class="preview-loading">gerando...</span>
          </div>
          <iframe
            v-if="previewHtml"
            class="preview-frame"
            :srcdoc="previewHtml"
            sandbox=""
            referrerpolicy="no-referrer"
          />
          <div v-else class="preview-empty">Digite o conteúdo para ver o preview...</div>
        </div>
      </div>

      <div class="compose-actions">
        <div class="test-section">
          <input
            v-model="testEmail"
            type="email"
            placeholder="email@teste.com"
            class="test-input"
          />
          <button class="btn-secondary" :disabled="sending || !testEmail" @click="sendTest">
            <i class="ti ti-send" />
            Enviar teste
          </button>
        </div>
        <button class="btn-primary" :disabled="sending || !subject || !body" @click="sendAll">
          <i class="ti ti-mail-bolt" />
          Enviar para todos
        </button>
      </div>

      <p
        v-if="sendResult"
        class="nl-result"
        :class="sendResult.success ? 'nl-result--ok' : 'nl-result--err'"
      >
        {{ sendResult.message }}
      </p>
    </section>

    <!-- Subscribers -->
    <section v-if="activeTab === 'subscribers'" class="nl-section">
      <div class="sub-toolbar">
        <input
          v-model="subSearch"
          type="text"
          placeholder="Buscar email..."
          class="search-input"
          @input="loadSubs"
        />
        <button class="btn-secondary" @click="exportCSV">
          <i class="ti ti-download" />
          Exportar CSV
        </button>
        <span class="sub-count">{{ subscribers_.length }} assinantes</span>
      </div>
      <div v-if="subLoading" class="nl-loading">Carregando...</div>
      <table v-else class="sub-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Desde</th>
            <th>Tags</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in subscribers_" :key="s.email">
            <td>{{ s.email }}</td>
            <td>{{ s.createdAt ? formatDate(s.createdAt) : '—' }}</td>
            <td>{{ s.tags.join(', ') || '—' }}</td>
            <td>
              <span class="badge" :class="s.active ? 'badge--ok' : 'badge--off'">
                {{ s.active ? 'Ativo' : 'Inativo' }}
              </span>
            </td>
            <td>
              <button class="icon-btn-danger" :title="'Remover'" @click="removeSub(s.email)">
                <i class="ti ti-trash" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- History -->
    <section v-if="activeTab === 'history'" class="nl-section">
      <div v-if="history_.length === 0" class="nl-empty">Nenhum envio registrado ainda.</div>
      <div v-for="(h, i) in history_" :key="i" class="history-item">
        <div class="history-head">
          <strong>{{ h.subject }}</strong>
          <span class="history-date">{{ formatDate(h.date) }}</span>
        </div>
        <div class="history-stats">
          <span class="badge badge--ok">{{ h.sent }} enviados</span>
          <span v-if="h.failed > 0" class="badge badge--off">{{ h.failed }} falharam</span>
          <span class="history-template">{{ h.template }}</span>
        </div>
        <ul v-if="h.errors.length > 0" class="history-errors">
          <li v-for="(e, j) in h.errors" :key="j">
            {{ e }}
          </li>
        </ul>
      </div>
    </section>

    <!-- Status -->
    <section v-if="activeTab === 'status'" class="nl-section">
      <div v-if="!smtpStatus_" class="nl-loading">Carregando...</div>
      <div v-else class="status-grid">
        <div class="status-card">
          <h3>SMTP</h3>
          <p>
            <strong>Configurado:</strong>
            {{ smtpStatus_.smtp.configured ? 'Sim' : 'Não' }}
          </p>
          <p>
            <strong>Conectado:</strong>
            <span :class="smtpStatus_.smtp.connected ? 'text-ok' : 'text-err'">
              {{ smtpStatus_.smtp.connected ? 'Sim' : 'Não' }}
            </span>
          </p>
          <p v-if="smtpStatus_.smtp.error" class="text-err">
            {{ smtpStatus_.smtp.error }}
          </p>
        </div>
        <div class="status-card">
          <h3>Assinantes</h3>
          <p class="stat-big">
            {{ smtpStatus_.subscribers }}
          </p>
          <p class="stat-sub">total de inscritos</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
  .newsletter-page {
    max-width: 1100px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
  }

  .nl-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .nl-header h1 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
    color: #22d3ee;
  }

  .welcome {
    font-size: 0.875rem;
    color: #94a3b8;
    margin: 0.25rem 0 0;
  }

  .header-actions {
    display: flex;
    gap: 0.75rem;
  }

  .back-btn,
  .logout-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border: 1px solid #334155;
    border-radius: 8px;
    font-size: 0.8125rem;
    cursor: pointer;
    transition: all 0.15s;
    background: transparent;
    color: #94a3b8;
    text-decoration: none;
  }

  .back-btn:hover {
    border-color: #22d3ee;
    color: #22d3ee;
  }

  .logout-btn:hover {
    border-color: #f87171;
    color: #fca5a5;
  }

  .nl-tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    border-bottom: 1px solid #1e293b;
    padding-bottom: 0.5rem;
  }

  .nl-tab {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.5rem 0.875rem;
    background: transparent;
    border: none;
    border-radius: 8px;
    color: #64748b;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.15s;
  }

  .nl-tab:hover {
    color: #94a3b8;
    background: #111827;
  }

  .nl-tab--active {
    color: #22d3ee;
    background: rgba(34, 211, 238, 0.08);
  }

  .nl-section {
    min-height: 400px;
  }

  .compose-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }

  @media (max-width: 768px) {
    .compose-grid {
      grid-template-columns: 1fr;
    }
  }

  .compose-editor {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .field label {
    font-size: 0.75rem;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .field input,
  .field select,
  .field textarea {
    padding: 0.625rem 0.75rem;
    background: #0f172a;
    border: 1px solid #334155;
    border-radius: 8px;
    color: #e2e8f0;
    font-size: 0.875rem;
    font-family: inherit;
    transition: border-color 0.15s;
  }

  .field textarea {
    font-family: 'SF Mono', 'Cascadia Code', monospace;
    resize: vertical;
    line-height: 1.5;
  }

  .field input:focus,
  .field select:focus,
  .field textarea:focus {
    outline: none;
    border-color: #22d3ee;
  }

  .compose-preview {
    background: #0f172a;
    border: 1px solid #1e293b;
    border-radius: 8px;
    padding: 1rem;
    overflow-y: auto;
    max-height: 600px;
  }

  .preview-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: #475569;
    text-transform: uppercase;
    margin-bottom: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .preview-loading {
    font-weight: 400;
    text-transform: none;
    color: #22d3ee;
    font-size: 0.6875rem;
  }

  .preview-frame {
    width: 100%;
    min-height: 480px;
    border: none;
    border-radius: 6px;
    background: #fff;
  }

  .preview-empty {
    color: #475569;
    font-size: 0.8125rem;
    text-align: center;
    padding: 3rem 1rem;
  }

  .compose-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin-top: 1.5rem;
    flex-wrap: wrap;
  }

  .test-section {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .test-input {
    padding: 0.5rem 0.75rem;
    background: #0f172a;
    border: 1px solid #334155;
    border-radius: 8px;
    color: #e2e8f0;
    font-size: 0.8125rem;
    width: 200px;
  }

  .btn-primary,
  .btn-secondary {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1.25rem;
    border: none;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .btn-primary {
    background: #22d3ee;
    color: #0a0e1a;
  }

  .btn-secondary {
    background: #1e293b;
    color: #e2e8f0;
  }

  .btn-primary:disabled,
  .btn-secondary:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .nl-result {
    margin-top: 1rem;
    padding: 0.75rem;
    border-radius: 8px;
    font-size: 0.875rem;
  }

  .nl-result--ok {
    background: rgba(34, 197, 94, 0.1);
    color: #4ade80;
  }

  .nl-result--err {
    background: rgba(239, 68, 68, 0.1);
    color: #fca5a5;
  }

  .sub-toolbar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }

  .search-input {
    flex: 1;
    min-width: 200px;
    padding: 0.5rem 0.75rem;
    background: #0f172a;
    border: 1px solid #334155;
    border-radius: 8px;
    color: #e2e8f0;
    font-size: 0.875rem;
  }

  .sub-count {
    font-size: 0.75rem;
    color: #64748b;
  }

  .sub-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }

  .sub-table th {
    text-align: left;
    padding: 0.625rem;
    color: #64748b;
    font-size: 0.75rem;
    text-transform: uppercase;
    border-bottom: 1px solid #1e293b;
  }

  .sub-table td {
    padding: 0.625rem;
    color: #cbd5e1;
    border-bottom: 1px solid #0f172a;
  }

  .badge {
    display: inline-block;
    padding: 0.125rem 0.5rem;
    border-radius: 999px;
    font-size: 0.6875rem;
    font-weight: 600;
  }

  .badge--ok {
    background: rgba(34, 197, 94, 0.12);
    color: #4ade80;
  }

  .badge--off {
    background: rgba(239, 68, 68, 0.12);
    color: #fca5a5;
  }

  .icon-btn-danger {
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
    padding: 0.25rem;
    transition: color 0.15s;
  }

  .icon-btn-danger:hover {
    color: #fca5a5;
  }

  .nl-empty,
  .nl-loading {
    text-align: center;
    padding: 3rem;
    color: #64748b;
    font-size: 0.875rem;
  }

  .history-item {
    background: #111827;
    border: 1px solid #1e293b;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 0.75rem;
  }

  .history-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .history-head strong {
    color: #e2e8f0;
    font-size: 0.9375rem;
  }

  .history-date {
    font-size: 0.75rem;
    color: #475569;
  }

  .history-stats {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .history-template {
    font-size: 0.75rem;
    color: #64748b;
    margin-left: auto;
  }

  .history-errors {
    margin: 0.5rem 0 0;
    padding-left: 1.25rem;
    font-size: 0.75rem;
    color: #fca5a5;
  }

  .status-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }

  .status-card {
    background: #111827;
    border: 1px solid #1e293b;
    border-radius: 12px;
    padding: 1.5rem;
  }

  .status-card h3 {
    font-size: 0.875rem;
    color: #64748b;
    text-transform: uppercase;
    margin: 0 0 0.75rem;
  }

  .status-card p {
    margin: 0.25rem 0;
    font-size: 0.875rem;
    color: #cbd5e1;
  }

  .stat-big {
    font-size: 2rem !important;
    font-weight: 800;
    color: #22d3ee !important;
  }

  .stat-sub {
    color: #64748b !important;
    font-size: 0.75rem !important;
  }

  .text-ok {
    color: #4ade80;
  }

  .text-err {
    color: #fca5a5;
  }
</style>
