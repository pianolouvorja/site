<script setup lang="ts">
  /**
   * Painel admin — gestão de conteúdo (Coletâneas/Músicas/Estrofes).
   * Fala direto com a API custom do PIANO via proxy /api/piano/proxy.
   * Fase 1: CRUD completo das três entidades. Moderação/auditoria = fase 2.
   */
  import { ref, computed, onMounted } from 'vue'
  import { usePianoApi, type Collection, type Music } from '~/composables/usePianoApi'

  definePageMeta({
    layout: 'admin',
    middleware: 'auth',
  })

  useHead({ title: 'Conteúdo · Piano Louvor JA' })

  const api = usePianoApi()

  // ---- Login na API custom (separado do Firebase do site) ----
  const apiEmail = ref('')
  const apiPassword = ref('')
  const apiLoginError = ref('')
  const apiLoggingIn = ref(false)

  async function loginApi() {
    apiLoginError.value = ''
    if (!apiEmail.value || !apiPassword.value) return
    apiLoggingIn.value = true
    try {
      await api.login(apiEmail.value, apiPassword.value)
    } catch {
      apiLoginError.value = 'E-mail ou senha inválidos'
    } finally {
      apiLoggingIn.value = false
    }
  }

  // ---- Estado geral ----
  type Section = 'collections' | 'musics' | 'lyrics'
  const section = ref<Section>('collections')
  const loading = ref(false)
  const message = ref<{ ok: boolean; text: string } | null>(null)

  function notify(ok: boolean, text: string) {
    message.value = { ok, text }
    setTimeout(() => (message.value = null), 3000)
  }

  // ---- Coletâneas ----
  const collections = ref<Collection[]>([])
  const collectionQuery = ref('')

  const filteredCollections = computed(() => {
    const q = collectionQuery.value.trim().toLowerCase()
    if (!q) return collections.value
    return collections.value.filter((c) => c.name.toLowerCase().includes(q))
  })

  async function loadCollections() {
    loading.value = true
    try {
      collections.value = await api.listCollections()
    } catch {
      notify(false, 'Falha ao carregar coletâneas')
    } finally {
      loading.value = false
    }
  }

  const editingCollection = ref<Collection | null>(null)
  const collectionForm = ref({
    name: '',
    description: '',
    visibility: 'public' as 'public' | 'private',
  })

  function startEditCollection(c: Collection) {
    editingCollection.value = c
    collectionForm.value = {
      name: c.name,
      description: c.description ?? '',
      visibility: c.visibility === 'private' ? 'private' : 'public',
    }
  }

  function startNewCollection() {
    editingCollection.value = null
    collectionForm.value = { name: '', description: '', visibility: 'public' }
  }

  async function saveCollection() {
    const form = collectionForm.value
    if (!form.name.trim()) return
    loading.value = true
    try {
      if (editingCollection.value) {
        const ok = await api.updateCollection(editingCollection.value.id, {
          name: form.name.trim(),
          description: form.description || null,
          visibility: form.visibility,
        })
        notify(ok, ok ? 'Coletânea atualizada' : 'Falha ao atualizar')
      } else {
        const created = await api.createCollection({
          name: form.name.trim(),
          description: form.description || undefined,
          visibility: form.visibility,
        })
        const ok = created != null
        notify(ok, ok ? 'Coletânea criada' : 'Falha ao criar')
      }
      editingCollection.value = null
      await loadCollections()
    } finally {
      loading.value = false
    }
  }

  const deletingCollection = ref<Collection | null>(null)
  const confirmDelete = ref(false)

  async function doDeleteCollection() {
    if (!deletingCollection.value) return
    loading.value = true
    try {
      const ok = await api.deleteCollection(deletingCollection.value.id)
      notify(ok, ok ? 'Coletânea excluída' : 'Falha ao excluir')
      deletingCollection.value = null
      await loadCollections()
    } finally {
      loading.value = false
    }
  }

  // ---- Músicas da coletânea selecionada ----
  const selectedCollection = ref<Collection | null>(null)
  const musics = ref<Music[]>([])
  const selectedMusic = ref<Music | null>(null)

  async function openCollection(c: Collection) {
    selectedCollection.value = c
    section.value = 'musics'
    loading.value = true
    try {
      musics.value = await api.listMusics(c.id)
    } catch {
      notify(false, 'Falha ao carregar músicas')
    } finally {
      loading.value = false
    }
  }

  // ---- Estrofes da música selecionada ----
  type LyricRow = {
    id: number
    lyric: string
    time: string
    order: number
  }
  const lyrics = ref<LyricRow[]>([])
  const musicName = ref('')

  async function openMusic(m: Music) {
    selectedMusic.value = m
    section.value = 'lyrics'
    loading.value = true
    try {
      const detail = await api.getMusic(m.id)
      musicName.value = detail?.name ?? m.name
      lyrics.value = (detail?.lyrics ?? [])
        .map((l) => ({
          id: l.id_lyric,
          lyric: l.lyric,
          time: l.time ?? '00:00',
          order: l.order ?? 0,
        }))
        .sort((a, b) => a.order - b.order)
    } catch {
      notify(false, 'Falha ao carregar estrofes')
    } finally {
      loading.value = false
    }
  }

  const newLyric = ref('')
  const newLyricTime = ref('')

  async function addLyric() {
    if (!newLyric.value.trim() || !selectedMusic.value) return
    loading.value = true
    try {
      const created = await api.createLyric(selectedMusic.value.id, {
        lyric: newLyric.value.trim(),
        time: newLyricTime.value || undefined,
        order: lyrics.value.length + 1,
      })
      if (created) {
        lyrics.value.push({
          id: created.id,
          lyric: newLyric.value.trim(),
          time: newLyricTime.value || '00:00',
          order: lyrics.value.length + 1,
        })
        newLyric.value = ''
        newLyricTime.value = ''
        notify(true, 'Estrofe adicionada')
      } else {
        notify(false, 'Falha ao adicionar estrofe')
      }
    } finally {
      loading.value = false
    }
  }

  async function removeLyric(id: number) {
    loading.value = true
    try {
      const ok = await api.deleteLyric(id)
      if (ok) {
        lyrics.value = lyrics.value.filter((l) => l.id !== id)
        notify(true, 'Estrofe removida')
      } else {
        notify(false, 'Falha ao remover estrofe')
      }
    } finally {
      loading.value = false
    }
  }

  async function saveLyric(row: LyricRow) {
    loading.value = true
    try {
      const ok = await api.updateLyric(row.id, {
        lyric: row.lyric,
        time: row.time,
        order: row.order,
      })
      notify(ok, ok ? 'Estrofe salva' : 'Falha ao salvar estrofe')
    } finally {
      loading.value = false
    }
  }

  function askDeleteCollection(c: Collection) {
    deletingCollection.value = c
    confirmDelete.value = true
  }

  async function confirmDeleteCollection() {
    await doDeleteCollection()
    confirmDelete.value = false
  }

  function cancelCollectionForm() {
    editingCollection.value = null
    collectionForm.value.name = ''
  }

  function goCollections() {
    section.value = 'collections'
    if (collections.value.length === 0) void loadCollections()
  }

  onMounted(() => {
    if (api.isAuthenticated.value) void loadCollections()
  })
</script>

<template>
  <div class="admin-content">
    <header class="admin-content__header">
      <h1><i class="ti ti-database" /> Conteúdo</h1>
      <nav class="admin-content__nav">
        <button :class="{ active: section === 'collections' }" @click="goCollections">
          <i class="ti ti-books" /> Coletâneas
        </button>
        <button
          :disabled="!selectedCollection"
          :class="{ active: section === 'musics' }"
          @click="section = 'musics'"
        >
          <i class="ti ti-music" /> Músicas<span v-if="selectedCollection" class="crumb"
            >· {{ selectedCollection.name }}</span
          >
        </button>
        <button
          :disabled="!selectedMusic"
          :class="{ active: section === 'lyrics' }"
          @click="section = 'lyrics'"
        >
          <i class="ti ti-microphone-2" /> Estrofes<span v-if="selectedMusic" class="crumb"
            >· {{ musicName }}</span
          >
        </button>
      </nav>
      <div v-if="message" :class="['admin-content__msg', { ok: message.ok }]">
        <i :class="message.ok ? 'ti ti-check' : 'ti ti-alert-circle'" />
        {{ message.text }}
      </div>
    </header>

    <!-- LOGIN NA API CUSTOM -->
    <section v-if="!api.isAuthenticated" class="admin-content__login">
      <h2><i class="ti ti-plug-connected" /> Conectar à API do PIANO</h2>
      <p class="hint">Use a conta de administrador de conteúdo da API (mesmo login do app).</p>
      <form @submit.prevent="loginApi">
        <input v-model="apiEmail" type="email" placeholder="E-mail" required />
        <input v-model="apiPassword" type="password" placeholder="Senha" required />
        <button type="submit" class="btn btn-primary" :disabled="apiLoggingIn">
          <i class="ti ti-login-2" />
          {{ apiLoggingIn ? 'Entrando…' : 'Entrar' }}
        </button>
        <span v-if="apiLoginError" class="error">
          <i class="ti ti-alert-circle" /> {{ apiLoginError }}
        </span>
      </form>
    </section>

    <!-- COLETÂNEAS -->
    <section v-else-if="section === 'collections'" class="admin-content__body">
      <div class="toolbar">
        <input v-model="collectionQuery" type="search" placeholder="Buscar coletânea…" />
        <button class="btn btn-primary" @click="startNewCollection">
          <i class="ti ti-plus" /> Nova coletânea
        </button>
        <button class="btn" :disabled="loading" @click="loadCollections">
          <i class="ti ti-refresh" /> Recarregar
        </button>
      </div>

      <form
        v-if="editingCollection !== null || collectionForm.name !== ''"
        class="inline-form"
        @submit.prevent="saveCollection"
      >
        <h3>
          <i class="ti ti-pencil" />
          {{ editingCollection ? `Editando: ${editingCollection.name}` : 'Nova coletânea' }}
        </h3>
        <input v-model="collectionForm.name" placeholder="Nome" required />
        <input v-model="collectionForm.description" placeholder="Descrição" />
        <select v-model="collectionForm.visibility">
          <option value="public">Público</option>
          <option value="private">Privado</option>
        </select>
        <button type="submit" class="btn btn-primary" :disabled="loading">
          <i class="ti ti-device-floppy" /> Salvar
        </button>
        <button type="button" class="btn btn-ghost" @click="cancelCollectionForm">Cancelar</button>
      </form>

      <div class="table-card">
        <table class="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Visibilidade</th>
              <th>Músicas</th>
              <th>Dono</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in filteredCollections" :key="c.id">
              <td class="cell-id">
                {{ c.id }}
              </td>
              <td class="cell-name">
                {{ c.name }}
                <span v-if="c.visibility === 'private'" class="badge badge-private">
                  <i class="ti ti-lock" /> privada
                </span>
              </td>
              <td>
                <span
                  :class="['badge', c.visibility === 'private' ? 'badge-private' : 'badge-public']"
                >
                  <i :class="c.visibility === 'private' ? 'ti ti-lock' : 'ti ti-world'" />
                  {{ c.visibility === 'private' ? 'Privada' : 'Pública' }}
                </span>
              </td>
              <td class="cell-muted">
                {{ c.musicsCount }}
              </td>
              <td class="cell-muted">
                {{ c.authorName ?? '—' }}
              </td>
              <td class="actions">
                <button @click="openCollection(c)"><i class="ti ti-folder-open" /> Abrir</button>
                <button @click="startEditCollection(c)"><i class="ti ti-pencil" /> Editar</button>
                <button class="danger" @click="askDeleteCollection(c)">
                  <i class="ti ti-trash" /> Excluir
                </button>
              </td>
            </tr>
            <tr v-if="loading">
              <td colspan="6" class="loading-row">
                <i class="ti ti-loader-2 spinning" />
              </td>
            </tr>
            <tr v-else-if="filteredCollections.length === 0">
              <td colspan="6" class="empty">
                <i class="ti ti-books" />
                Nenhuma coletânea encontrada
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Confirmação de exclusão -->
      <div
        v-if="confirmDelete && deletingCollection"
        class="confirm"
        @click.self="confirmDelete = false"
      >
        <div class="confirm__card">
          <i class="ti ti-alert-triangle" />
          <p>
            Excluir a coletânea <strong>{{ deletingCollection.name }}</strong> e<br />
            TODAS as suas músicas?
          </p>
          <div class="confirm__actions">
            <button class="btn btn-danger" @click="confirmDeleteCollection">
              <i class="ti ti-trash" /> Sim, excluir
            </button>
            <button class="btn" @click="confirmDelete = false">Cancelar</button>
          </div>
        </div>
      </div>
    </section>

    <!-- MÚSICAS -->
    <section v-else-if="section === 'musics' && selectedCollection" class="admin-content__body">
      <p class="breadcrumb">
        <a href="#" @click.prevent="section = 'collections'">
          <i class="ti ti-arrow-left" /> {{ selectedCollection.name }}
        </a>
      </p>
      <div class="table-card">
        <table class="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Áudio</th>
              <th>Hino oficial</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in musics" :key="m.id">
              <td class="cell-id">
                {{ m.id }}
              </td>
              <td class="cell-name">
                {{ m.name }}
              </td>
              <td>
                <i :class="['audio-icon', m.hasAudio ? 'ti ti-music' : 'ti ti-music-off none']" />
              </td>
              <td class="cell-muted">
                {{ m.officialMusicId ?? '—' }}
              </td>
              <td class="actions">
                <button @click="openMusic(m)"><i class="ti ti-microphone-2" /> Estrofes</button>
              </td>
            </tr>
            <tr v-if="loading">
              <td colspan="5" class="loading-row">
                <i class="ti ti-loader-2 spinning" />
              </td>
            </tr>
            <tr v-else-if="musics.length === 0">
              <td colspan="5" class="empty">
                <i class="ti ti-music-off" />
                Nenhuma música nesta coletânea
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- ESTROFES -->
    <section v-else-if="section === 'lyrics' && selectedMusic" class="admin-content__body">
      <p class="breadcrumb">
        <a href="#" @click.prevent="section = 'musics'">
          <i class="ti ti-arrow-left" /> {{ selectedCollection?.name }}
        </a>
      </p>
      <h2 class="lyric-title"><i class="ti ti-microphone-2" /> {{ musicName }}</h2>

      <form class="inline-form" @submit.prevent="addLyric">
        <h3><i class="ti ti-plus" /> Nova estrofe</h3>
        <input v-model="newLyric" placeholder="Letra da estrofe" required />
        <input v-model="newLyricTime" placeholder="Tempo (mm:ss)" />
        <button type="submit" class="btn btn-primary" :disabled="loading">
          <i class="ti ti-plus" /> Adicionar
        </button>
      </form>

      <div class="lyrics-list">
        <div v-for="(l, i) in lyrics" :key="l.id" class="lyric-row">
          <span class="order">{{ i + 1 }}</span>
          <textarea v-model="l.lyric" rows="3" />
          <input v-model="l.time" class="time" placeholder="mm:ss" />
          <div class="actions">
            <button :disabled="loading" @click="saveLyric(l)">
              <i class="ti ti-device-floppy" /> Salvar
            </button>
            <button class="danger" :disabled="loading" @click="removeLyric(l.id)">
              <i class="ti ti-trash" /> Remover
            </button>
          </div>
        </div>
        <div v-if="lyrics.length === 0 && !loading" class="table-card">
          <p class="empty"><i class="ti ti-microphone-2" /> Nenhuma estrofe</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
  .admin-content {
    max-width: 60rem;
    margin: 0 auto;
    padding: 1.5rem;
    color: var(--piano-text-on-dark, #fff);
  }

  /* ---------- header ---------- */
  .admin-content__header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.25rem;
  }

  .admin-content__header h1 {
    margin: 0;
    font-size: 1.4rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .admin-content__header h1 i {
    color: var(--piano-cyan);
  }

  .admin-content__nav {
    display: flex;
    gap: 0.5rem;
    margin-left: auto;
    flex-wrap: wrap;
  }

  .admin-content__nav button {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.45rem 0.9rem;
    border: 1px solid #1e293b;
    border-radius: 8px;
    background: #111827;
    color: var(--piano-text-on-dark-secondary, rgba(255, 255, 255, 0.85));
    cursor: pointer;
    font-size: 0.85rem;
    transition:
      border-color 0.15s,
      background 0.15s;
  }

  .admin-content__nav button:hover:not(:disabled):not(.active) {
    border-color: var(--piano-cyan);
  }

  .admin-content__nav button.active {
    background: var(--piano-cyan);
    color: #0a1733;
    border-color: var(--piano-cyan);
    font-weight: 600;
  }

  .admin-content__nav button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .admin-content__nav .crumb {
    max-width: 12rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .admin-content__msg {
    width: 100%;
    padding: 0.55rem 0.85rem;
    border-radius: 8px;
    background: rgba(239, 68, 68, 0.12);
    border: 1px solid rgba(239, 68, 68, 0.4);
    color: #fca5a5;
    font-size: 0.85rem;
  }

  .admin-content__msg.ok {
    background: rgba(34, 197, 94, 0.12);
    border-color: rgba(34, 197, 94, 0.4);
    color: #86efac;
  }

  /* ---------- login ---------- */
  .admin-content__login {
    background: #111827;
    border: 1px solid #1e293b;
    border-radius: 12px;
    padding: 2rem;
    max-width: 26rem;
    margin: 3rem auto;
  }

  .admin-content__login h2 {
    margin: 0 0 0.25rem;
    font-size: 1.15rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .admin-content__login h2 i {
    color: var(--piano-cyan);
  }

  .admin-content__login .hint {
    font-size: 0.85rem;
    color: var(--piano-text-on-dark-muted, rgba(255, 255, 255, 0.7));
    margin: 0 0 1rem;
  }

  .admin-content__login form {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .admin-content__login .error {
    color: #fca5a5;
    font-size: 0.85rem;
  }

  /* ---------- inputs ---------- */
  input,
  select,
  textarea {
    background: #0a0e1a;
    border: 1px solid #1e293b;
    border-radius: 8px;
    color: var(--piano-text-on-dark, #fff);
    padding: 0.5rem 0.75rem;
    font: inherit;
    font-size: 0.9rem;
    transition: border-color 0.15s;
  }

  input::placeholder,
  textarea::placeholder {
    color: rgba(255, 255, 255, 0.35);
  }

  input:focus,
  select:focus,
  textarea:focus {
    outline: none;
    border-color: var(--piano-cyan);
  }

  /* ---------- botões ---------- */
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    border: 1px solid #1e293b;
    background: #111827;
    color: var(--piano-text-on-dark, #fff);
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 500;
    transition:
      border-color 0.15s,
      background 0.15s,
      opacity 0.15s;
  }

  .btn:hover:not(:disabled) {
    border-color: var(--piano-cyan);
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-primary {
    background: var(--piano-cyan);
    border-color: var(--piano-cyan);
    color: #0a1733;
    font-weight: 600;
  }

  .btn-primary:hover:not(:disabled) {
    background: var(--piano-cyan-light);
    border-color: var(--piano-cyan-light);
  }

  .btn-danger {
    color: #fca5a5;
    border-color: rgba(239, 68, 68, 0.5);
  }

  .btn-danger:hover:not(:disabled) {
    border-color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
  }

  .btn-ghost {
    background: transparent;
  }

  /* ---------- toolbar ---------- */
  .toolbar {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    align-items: center;
  }

  .toolbar input[type='search'] {
    flex: 1;
    min-width: 12rem;
  }

  /* ---------- formulário inline ---------- */
  .inline-form {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
    align-items: center;
    padding: 1rem;
    background: #111827;
    border: 1px solid #1e293b;
    border-radius: 12px;
    margin-bottom: 1.25rem;
  }

  .inline-form h3 {
    width: 100%;
    margin: 0;
    font-size: 0.95rem;
    color: var(--piano-cyan);
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .inline-form input,
  .inline-form select {
    flex: 1;
    min-width: 8rem;
  }

  /* ---------- tabela ---------- */
  .table-card {
    background: #111827;
    border: 1px solid #1e293b;
    border-radius: 12px;
    overflow: hidden;
  }

  .admin-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.88rem;
  }

  .admin-table th {
    text-align: left;
    padding: 0.7rem 0.9rem;
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--piano-text-on-dark-muted, rgba(255, 255, 255, 0.7));
    border-bottom: 1px solid #1e293b;
    background: rgba(255, 255, 255, 0.02);
  }

  .admin-table td {
    text-align: left;
    padding: 0.65rem 0.9rem;
    border-bottom: 1px solid rgba(30, 41, 59, 0.6);
  }

  .admin-table tbody tr:last-child td {
    border-bottom: none;
  }

  .admin-table tbody tr {
    transition: background 0.12s;
  }

  .admin-table tbody tr:hover {
    background: rgba(0, 193, 230, 0.05);
  }

  .admin-table .cell-name {
    font-weight: 500;
  }

  .admin-table .cell-muted {
    color: var(--piano-text-on-dark-muted, rgba(255, 255, 255, 0.7));
  }

  .admin-table .cell-id {
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.8rem;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.72rem;
    font-weight: 600;
    padding: 0.15rem 0.55rem;
    border-radius: 999px;
  }

  .badge-public {
    background: rgba(34, 197, 94, 0.12);
    color: #86efac;
    border: 1px solid rgba(34, 197, 94, 0.35);
  }

  .badge-private {
    background: rgba(251, 191, 36, 0.12);
    color: #fcd34d;
    border: 1px solid rgba(251, 191, 36, 0.35);
  }

  .admin-table .actions {
    display: flex;
    gap: 0.35rem;
  }

  .admin-table .actions button,
  .lyric-row .actions button {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.3rem 0.65rem;
    border: 1px solid #1e293b;
    border-radius: 6px;
    background: transparent;
    color: var(--piano-text-on-dark-secondary, rgba(255, 255, 255, 0.85));
    cursor: pointer;
    font-size: 0.78rem;
    transition:
      border-color 0.15s,
      background 0.15s;
  }

  .admin-table .actions button:hover:not(:disabled),
  .lyric-row .actions button:hover:not(:disabled) {
    border-color: var(--piano-cyan);
    background: rgba(0, 193, 230, 0.08);
  }

  .admin-table .actions button.danger,
  .lyric-row .actions button.danger {
    color: #fca5a5;
    border-color: rgba(239, 68, 68, 0.5);
  }

  .admin-table .actions button.danger:hover:not(:disabled),
  .lyric-row .actions button.danger:hover:not(:disabled) {
    border-color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
  }

  .audio-icon {
    color: var(--piano-cyan);
  }

  .audio-icon.none {
    color: rgba(255, 255, 255, 0.25);
  }

  /* ---------- empty / loading ---------- */
  .empty {
    text-align: center;
    padding: 2.5rem 1rem !important;
    color: var(--piano-text-on-dark-muted, rgba(255, 255, 255, 0.7));
  }

  .empty i {
    display: block;
    font-size: 1.75rem;
    margin-bottom: 0.5rem;
    color: rgba(255, 255, 255, 0.25);
  }

  .loading-row {
    text-align: center;
    padding: 2rem !important;
    color: var(--piano-cyan);
    font-size: 1.25rem;
  }

  /* ---------- breadcrumb ---------- */
  .breadcrumb {
    margin: 0 0 1rem;
    font-size: 0.85rem;
  }

  .breadcrumb a {
    color: var(--piano-cyan);
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    text-decoration: none;
  }

  .breadcrumb a:hover {
    text-decoration: underline;
  }

  /* ---------- estrofes ---------- */
  .lyric-title {
    margin: 0 0 1rem;
    font-size: 1.15rem;
  }

  .lyrics-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .lyric-row {
    display: flex;
    gap: 0.6rem;
    align-items: flex-start;
    padding: 0.85rem;
    background: #111827;
    border: 1px solid #1e293b;
    border-radius: 12px;
  }

  .lyric-row .order {
    min-width: 1.75rem;
    height: 1.75rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 193, 230, 0.12);
    color: var(--piano-cyan);
    border-radius: 6px;
    font-weight: 700;
    font-size: 0.8rem;
  }

  .lyric-row textarea {
    flex: 1;
    resize: vertical;
    min-height: 3.5rem;
  }

  .lyric-row .time {
    width: 5.5rem;
    font-variant-numeric: tabular-nums;
  }

  .lyric-row .actions {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  /* ---------- modal de confirmação ---------- */
  .confirm {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
  }

  .confirm__card {
    background: #111827;
    border: 1px solid #1e293b;
    border-radius: 14px;
    padding: 1.5rem;
    max-width: 26rem;
    width: calc(100% - 2rem);
    text-align: center;
  }

  .confirm__card i {
    font-size: 2rem;
    color: #ef4444;
  }

  .confirm__card p {
    margin: 0.75rem 0 1.25rem;
    line-height: 1.5;
  }

  .confirm__card p strong {
    color: var(--piano-cyan);
  }

  .confirm__actions {
    display: flex;
    gap: 0.6rem;
    justify-content: center;
  }

  /* ---------- responsivo ---------- */
  @media (max-width: 640px) {
    .admin-content__header {
      flex-direction: column;
      align-items: stretch;
    }

    .admin-content__nav {
      margin-left: 0;
    }

    .lyric-row {
      flex-wrap: wrap;
    }

    .lyric-row .actions {
      flex-direction: row;
      width: 100%;
    }
  }

  .spinning {
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
