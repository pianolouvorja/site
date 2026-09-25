<script setup lang="ts">
  /**
   * TASK-006/007 — Painel Membros da Comunidade (RF-001/002/003/004/007).
   * Lista paginada + busca + modal de detalhe com ações de role/ban + auditoria.
   * Visual alinhado ao tema dark do admin (mesmos tokens do conteudo.vue).
   */
  import { ref, onMounted } from 'vue'
  import { useCommunityAdmin, type CommunityMember } from '~/composables/useCommunityAdmin'

  definePageMeta({
    layout: 'admin',
    middleware: 'auth',
  })

  console.log('[membros-page] setup SSR:', import.meta.server)
  const { members, nextCursor, loading, hasMembers, loadMembers, mutate } = useCommunityAdmin()

  const busca = ref('')
  const filtroStatus = ref('')
  const selecionado = ref<CommunityMember | null>(null)
  const motivoBan = ref('')
  const novaRole = ref('moderator')
  const msg = ref<{ ok: boolean; text: string } | null>(null)

  function notify(ok: boolean, text: string) {
    msg.value = { ok, text }
    setTimeout(() => (msg.value = null), 3000)
  }

  async function carregar() {
    await loadMembers({
      q: busca.value || undefined,
      status: filtroStatus.value || undefined,
    })
  }

  async function abrirDetalhe(m: CommunityMember) {
    selecionado.value = m
    motivoBan.value = ''
    novaRole.value = m.role === 'owner' ? 'admin' : 'moderator'
  }

  async function aplicarRole() {
    if (!selecionado.value) return
    const r = await mutate(selecionado.value.uid, 'role_change', {
      newRole: novaRole.value,
    })
    notify(r.ok, r.ok ? 'Role atualizada' : (r.error ?? 'Falha'))
    if (r.ok) await carregar()
  }

  async function aplicarBan() {
    if (!selecionado.value) return
    const r = await mutate(selecionado.value.uid, 'ban', { reason: motivoBan.value })
    notify(r.ok, r.ok ? 'Membro banido' : (r.error ?? 'Falha'))
    if (r.ok) {
      selecionado.value = null
      await carregar()
    }
  }

  async function reativar() {
    if (!selecionado.value) return
    const r = await mutate(selecionado.value.uid, 'reactivate')
    notify(r.ok, r.ok ? 'Membro reativado' : (r.error ?? 'Falha'))
    if (r.ok) {
      selecionado.value = null
      await carregar()
    }
  }

  onMounted(() => {
    void carregar()
  })
</script>

<template>
  <div class="admin-membros">
    <header class="admin-membros__header">
      <h1><i class="ti ti-users-group" /> Membros da Comunidade</h1>
    </header>

    <div v-if="msg" :class="['admin-membros__msg', { ok: msg.ok }]">
      <i :class="msg.ok ? 'ti ti-check' : 'ti ti-alert-circle'" />
      {{ msg.text }}
    </div>

    <div class="toolbar">
      <input
        v-model="busca"
        type="search"
        placeholder="Buscar por nome ou email…"
        @keyup.enter="carregar"
      />
      <select v-model="filtroStatus" @change="carregar">
        <option value="">Todos os status</option>
        <option value="active">Ativos</option>
        <option value="pending">Pendentes</option>
        <option value="suspended">Suspensos</option>
        <option value="banned">Banidos</option>
      </select>
      <button class="btn" :disabled="loading" @click="carregar">
        <i class="ti ti-search" /> Buscar
      </button>
    </div>

    <div class="table-card">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in members" :key="m.uid">
            <td class="cell-name">
              {{ m.name }}
            </td>
            <td class="cell-muted">
              {{ m.email }}
            </td>
            <td>
              <span class="badge" :class="`badge-${m.role}`">{{ m.role }}</span>
            </td>
            <td>
              <span :class="['badge', m.status === 'active' ? 'badge-public' : 'badge-private']">
                {{ m.status }}
              </span>
            </td>
            <td class="actions">
              <button @click="abrirDetalhe(m)"><i class="ti ti-user-cog" /> Gerir</button>
            </td>
          </tr>
          <tr v-if="loading">
            <td colspan="5" class="loading-row">
              <i class="ti ti-loader-2 spinning" />
            </td>
          </tr>
          <tr v-else-if="!hasMembers">
            <td colspan="5" class="empty">
              <i class="ti ti-users-group" /> Nenhum membro encontrado
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <button v-if="nextCursor" class="btn" @click="carregar">
      <i class="ti ti-arrow-down" /> Próxima página
    </button>

    <!-- Modal de detalhe / ações -->
    <div v-if="selecionado" class="confirm" @click.self="selecionado = null">
      <div class="confirm__card">
        <h3 class="confirm__title"><i class="ti ti-user-cog" /> {{ selecionado.name }}</h3>
        <p class="confirm__email">
          {{ selecionado.email }}
        </p>

        <div class="confirm__section">
          <label>Role</label>
          <div class="confirm__row">
            <select v-model="novaRole" :disabled="selecionado.role === 'owner'">
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
              <option value="member">Member</option>
            </select>
            <button
              class="btn btn-primary"
              :disabled="selecionado.role === 'owner'"
              @click="aplicarRole"
            >
              <i class="ti ti-shield-check" /> Aplicar
            </button>
          </div>
        </div>

        <div class="confirm__section">
          <label>Banir (motivo obrigatório)</label>
          <input v-model="motivoBan" placeholder="Ex: spam repetido" />
          <div class="confirm__actions">
            <button
              class="btn btn-danger"
              :disabled="motivoBan.trim().length < 3"
              @click="aplicarBan"
            >
              <i class="ti ti-ban" /> Banir
            </button>
            <button class="btn" :disabled="selecionado.status === 'active'" @click="reativar">
              <i class="ti ti-circle-check" /> Reativar
            </button>
          </div>
        </div>

        <button class="btn btn-ghost" @click="selecionado = null">Fechar</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .admin-membros {
    max-width: 60rem;
    margin: 0 auto;
    padding: 1.5rem;
    color: var(--piano-text-on-dark, #fff);
  }

  .admin-membros__header h1 {
    margin: 0 0 1rem;
    font-size: 1.4rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .admin-membros__header i {
    color: var(--piano-cyan);
  }

  .admin-membros__msg {
    padding: 0.55rem 0.85rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    background: rgba(239, 68, 68, 0.12);
    border: 1px solid rgba(239, 68, 68, 0.4);
    color: #fca5a5;
    font-size: 0.85rem;
  }

  .admin-membros__msg.ok {
    background: rgba(34, 197, 94, 0.12);
    border-color: rgba(34, 197, 94, 0.4);
    color: #86efac;
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

  input,
  select {
    background: #0a0e1a;
    border: 1px solid #1e293b;
    border-radius: 8px;
    color: var(--piano-text-on-dark, #fff);
    padding: 0.5rem 0.75rem;
    font: inherit;
    font-size: 0.9rem;
  }

  input::placeholder {
    color: rgba(255, 255, 255, 0.35);
  }

  input:focus,
  select:focus {
    outline: none;
    border-color: var(--piano-cyan);
  }

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
    margin-top: 0.5rem;
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

  .table-card {
    background: #111827;
    border: 1px solid #1e293b;
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 1rem;
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
  }

  .admin-table td {
    text-align: left;
    padding: 0.65rem 0.9rem;
    border-bottom: 1px solid rgba(30, 41, 59, 0.6);
  }

  .admin-table tbody tr:last-child td {
    border-bottom: none;
  }

  .admin-table tbody tr:hover {
    background: rgba(0, 193, 230, 0.05);
  }

  .cell-name {
    font-weight: 500;
  }

  .cell-muted {
    color: rgba(255, 255, 255, 0.7);
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
    background: rgba(239, 68, 68, 0.12);
    color: #fca5a5;
    border: 1px solid rgba(239, 68, 68, 0.35);
  }

  .badge-owner,
  .badge-admin {
    background: rgba(0, 193, 230, 0.12);
    color: var(--piano-cyan);
    border: 1px solid rgba(0, 193, 230, 0.35);
  }

  .badge-moderator {
    background: rgba(251, 191, 36, 0.12);
    color: #fcd34d;
    border: 1px solid rgba(251, 191, 36, 0.35);
  }

  .badge-member {
    background: rgba(148, 163, 184, 0.12);
    color: #cbd5e1;
    border: 1px solid rgba(148, 163, 184, 0.35);
  }

  .admin-table .actions button {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.3rem 0.65rem;
    border: 1px solid #1e293b;
    border-radius: 6px;
    background: transparent;
    color: rgba(255, 255, 255, 0.85);
    cursor: pointer;
    font-size: 0.78rem;
  }

  .admin-table .actions button:hover {
    border-color: var(--piano-cyan);
    background: rgba(0, 193, 230, 0.08);
  }

  .empty {
    text-align: center;
    padding: 2.5rem 1rem !important;
    color: rgba(255, 255, 255, 0.7);
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
    max-width: 28rem;
    width: calc(100% - 2rem);
  }

  .confirm__title {
    margin: 0;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .confirm__title i {
    color: var(--piano-cyan);
  }

  .confirm__email {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.85rem;
    margin: 0.25rem 0 1rem;
  }

  .confirm__section {
    margin-bottom: 1rem;
  }

  .confirm__section label {
    display: block;
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 0.4rem;
  }

  .confirm__section input,
  .confirm__section select {
    width: 100%;
    margin-bottom: 0.5rem;
  }

  .confirm__row {
    display: flex;
    gap: 0.5rem;
  }

  .confirm__row select {
    flex: 1;
  }

  .confirm__actions {
    display: flex;
    gap: 0.6rem;
  }

  .confirm__actions .btn {
    margin-top: 0;
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

  @media (max-width: 640px) {
    .toolbar {
      flex-direction: column;
    }

    .confirm__row {
      flex-direction: column;
    }
  }
</style>
