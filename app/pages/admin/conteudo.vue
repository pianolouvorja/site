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

  onMounted(() => {
    if (api.isAuthenticated.value) void loadCollections()
  })
</script>

<template>
  <div class="admin-content">
    <header class="admin-content__header">
      <h1>Conteúdo</h1>
      <nav class="admin-content__nav">
        <button
          :class="{ active: section === 'collections' }"
          @click="
            section = 'collections'
            if (collections.length === 0) loadCollections()
          "
        >
          Coletâneas
        </button>
        <button
          :disabled="!selectedCollection"
          :class="{ active: section === 'musics' }"
          @click="section = 'musics'"
        >
          Músicas{{ selectedCollection ? ` · ${selectedCollection.name}` : '' }}
        </button>
        <button
          :disabled="!selectedMusic"
          :class="{ active: section === 'lyrics' }"
          @click="section = 'lyrics'"
        >
          Estrofes{{ selectedMusic ? ` · ${musicName}` : '' }}
        </button>
      </nav>
      <div v-if="message" :class="['admin-content__msg', { ok: message.ok }]">
        {{ message.text }}
      </div>
    </header>

    <!-- LOGIN NA API CUSTOM -->
    <section v-if="!api.isAuthenticated" class="admin-content__login">
      <h2>Conectar à API do PIANO</h2>
      <p class="hint">Use a conta de administrador de conteúdo da API (mesmo login do app).</p>
      <form @submit.prevent="loginApi">
        <input v-model="apiEmail" type="email" placeholder="E-mail" required />
        <input v-model="apiPassword" type="password" placeholder="Senha" required />
        <button type="submit" :disabled="apiLoggingIn">
          {{ apiLoggingIn ? 'Entrando…' : 'Entrar' }}
        </button>
        <span v-if="apiLoginError" class="error">{{ apiLoginError }}</span>
      </form>
    </section>

    <!-- COLETÂNEAS -->
    <section v-else-if="section === 'collections'" class="admin-content__body">
      <div class="toolbar">
        <input v-model="collectionQuery" type="search" placeholder="Buscar coletânea…" />
        <button @click="startNewCollection">+ Nova coletânea</button>
        <button @click="loadCollections">Recarregar</button>
      </div>

      <form
        v-if="editingCollection !== null || collectionForm.name !== ''"
        class="inline-form"
        @submit.prevent="saveCollection"
      >
        <h3>{{ editingCollection ? `Editando: ${editingCollection.name}` : 'Nova coletânea' }}</h3>
        <input v-model="collectionForm.name" placeholder="Nome" required />
        <input v-model="collectionForm.description" placeholder="Descrição" />
        <select v-model="collectionForm.visibility">
          <option value="public">Público</option>
          <option value="private">Privado</option>
        </select>
        <button type="submit" :disabled="loading">Salvar</button>
        <button
          type="button"
          @click="
            editingCollection = null
            collectionForm.name = ''
          "
        >
          Cancelar
        </button>
      </form>

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
            <td>{{ c.id }}</td>
            <td>
              {{ c.name }}
              <span v-if="c.visibility === 'private'" class="badge">🔒 privada</span>
            </td>
            <td>{{ c.visibility === 'private' ? 'Privada' : 'Pública' }}</td>
            <td>{{ c.musicsCount }}</td>
            <td>{{ c.authorName ?? '—' }}</td>
            <td class="actions">
              <button @click="openCollection(c)">Abrir</button>
              <button @click="startEditCollection(c)">Editar</button>
              <button
                class="danger"
                @click="
                  deletingCollection = c
                  confirmDelete = true
                "
              >
                Excluir
              </button>
            </td>
          </tr>
          <tr v-if="filteredCollections.length === 0 && !loading">
            <td colspan="6" class="empty">Nenhuma coletânea</td>
          </tr>
        </tbody>
      </table>

      <!-- Confirmação de exclusão -->
      <div v-if="confirmDelete && deletingCollection" class="confirm">
        <p>
          Excluir a coletânea <strong>{{ deletingCollection.name }}</strong> e TODAS as suas
          músicas?
        </p>
        <button
          class="danger"
          @click="
            doDeleteCollection
            confirmDelete = false
          "
        >
          Sim, excluir
        </button>
        <button @click="confirmDelete = false">Cancelar</button>
      </div>
    </section>

    <!-- MÚSICAS -->
    <section v-else-if="section === 'musics' && selectedCollection" class="admin-content__body">
      <p class="breadcrumb">
        <a href="#" @click.prevent="section = 'collections'">← {{ selectedCollection.name }}</a>
      </p>
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
            <td>{{ m.id }}</td>
            <td>{{ m.name }}</td>
            <td>{{ m.hasAudio ? '🎵' : '—' }}</td>
            <td>{{ m.officialMusicId ?? '—' }}</td>
            <td class="actions">
              <button @click="openMusic(m)">Estrofes</button>
            </td>
          </tr>
          <tr v-if="musics.length === 0 && !loading">
            <td colspan="5" class="empty">Nenhuma música nesta coletânea</td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- ESTROFES -->
    <section v-else-if="section === 'lyrics' && selectedMusic" class="admin-content__body">
      <p class="breadcrumb">
        <a href="#" @click.prevent="section = 'musics'">← {{ selectedCollection?.name }}</a>
      </p>
      <h2>{{ musicName }}</h2>

      <form class="inline-form" @submit.prevent="addLyric">
        <input v-model="newLyric" placeholder="Nova estrofe (letra)" required />
        <input v-model="newLyricTime" placeholder="Tempo (mm:ss)" />
        <button type="submit" :disabled="loading">Adicionar</button>
      </form>

      <div class="lyrics-list">
        <div v-for="(l, i) in lyrics" :key="l.id" class="lyric-row">
          <span class="order">{{ i + 1 }}</span>
          <textarea v-model="l.lyric" rows="3" />
          <input v-model="l.time" class="time" placeholder="mm:ss" />
          <div class="actions">
            <button :disabled="loading" @click="saveLyric(l)">Salvar</button>
            <button class="danger" :disabled="loading" @click="removeLyric(l.id)">Remover</button>
          </div>
        </div>
        <p v-if="lyrics.length === 0 && !loading" class="empty">Nenhuma estrofe</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
  .admin-content {
    max-width: 60rem;
    margin: 0 auto;
    padding: 1.5rem;
  }

  .admin-content__header h1 {
    margin: 0 0 0.75rem;
    font-size: 1.5rem;
  }

  .admin-content__nav {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .admin-content__nav button {
    padding: 0.4rem 0.9rem;
    border: 1px solid var(--border, #ddd);
    border-radius: 6px;
    background: transparent;
    cursor: pointer;
  }

  .admin-content__nav button.active {
    background: var(--primary, #2196f3);
    color: #fff;
    border-color: var(--primary, #2196f3);
  }

  .admin-content__nav button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .admin-content__msg {
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    background: #fdecea;
    color: #b71c1c;
    margin-top: 0.5rem;
  }

  .admin-content__msg.ok {
    background: #e8f5e9;
    color: #1b5e20;
  }

  .admin-content__login {
    border: 1px solid var(--border, #ddd);
    border-radius: 8px;
    padding: 1.5rem;
    max-width: 24rem;
  }

  .admin-content__login h2 {
    margin-top: 0;
    font-size: 1.1rem;
  }
  .admin-content__login form {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .hint {
    font-size: 0.85rem;
    opacity: 0.7;
  }
  .error {
    color: #b71c1c;
    font-size: 0.85rem;
  }

  .toolbar {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }
  .toolbar input[type='search'] {
    flex: 1;
    min-width: 12rem;
  }

  .inline-form {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
    padding: 0.75rem;
    border: 1px dashed var(--border, #ccc);
    border-radius: 8px;
    margin-bottom: 1rem;
  }

  .inline-form h3 {
    width: 100%;
    margin: 0 0 0.25rem;
    font-size: 1rem;
  }
  .inline-form input,
  .inline-form select {
    flex: 1;
    min-width: 8rem;
  }

  .admin-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
  }
  .admin-table th,
  .admin-table td {
    text-align: left;
    padding: 0.5rem 0.6rem;
    border-bottom: 1px solid var(--border, #eee);
  }
  .admin-table .actions {
    display: flex;
    gap: 0.35rem;
  }
  .admin-table .actions button {
    padding: 0.25rem 0.6rem;
    border: 1px solid var(--border, #ddd);
    border-radius: 4px;
    background: transparent;
    cursor: pointer;
    font-size: 0.8rem;
  }
  .admin-table .actions button.danger {
    color: #b71c1c;
    border-color: #b71c1c;
  }
  .empty {
    text-align: center;
    opacity: 0.6;
    padding: 1.5rem 0;
  }
  .badge {
    font-size: 0.75rem;
    opacity: 0.75;
  }

  .breadcrumb {
    font-size: 0.85rem;
  }
  .breadcrumb a {
    color: var(--primary, #2196f3);
  }

  .lyrics-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .lyric-row {
    display: flex;
    gap: 0.5rem;
    align-items: flex-start;
    padding: 0.75rem;
    border: 1px solid var(--border, #eee);
    border-radius: 8px;
  }
  .lyric-row .order {
    font-weight: 600;
    min-width: 1.5rem;
  }
  .lyric-row textarea {
    flex: 1;
    font: inherit;
  }
  .lyric-row .time {
    width: 5rem;
  }
  .lyric-row .actions {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }
  .lyric-row .actions button {
    padding: 0.25rem 0.6rem;
    border: 1px solid var(--border, #ddd);
    border-radius: 4px;
    background: transparent;
    cursor: pointer;
    font-size: 0.8rem;
  }
  .lyric-row .actions button.danger {
    color: #b71c1c;
    border-color: #b71c1c;
  }

  .confirm {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
  }
  .confirm p {
    background: #fff;
    padding: 1.25rem 1.5rem;
    border-radius: 8px;
    max-width: 26rem;
  }
</style>
