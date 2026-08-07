<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { updatePassword, signInWithEmailAndPassword } from 'firebase/auth'
  import type { ActivityItem } from '~/types/dashboard'

  definePageMeta({
    layout: 'admin',
    middleware: 'auth',
  })

  useHead({
    title: 'Dashboard · Piano Louvor JA',
  })

  const { user, logout, getToken } = useFirebaseAuth()
  const { stats, loading, refresh } = useDashboardStats()

  // --- Atividade recente ---
  const recentActivity = ref<ActivityItem[]>([])
  const activityLoading = ref(true)

  async function fetchActivity() {
    activityLoading.value = true
    try {
      const token = await getToken()
      const data = await $fetch<{ items: ActivityItem[] }>('/api/admin/activity', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      recentActivity.value = data.items
    } catch {
      recentActivity.value = []
    } finally {
      activityLoading.value = false
    }
  }

  // --- Forcar troca de senha provisoria ---
  const TEMP_PASSWORD = 'Piano@2026'
  const mustChangePassword = ref(false)
  const newPassword = ref('')
  const confirmPassword = ref('')
  const changePasswordError = ref('')
  const changingPassword = ref(false)

  async function checkTempPassword() {
    if (!user.value?.email) return
    try {
      const { getAuth } = await import('firebase/auth')
      const auth = getAuth()
      await signInWithEmailAndPassword(auth, user.value.email, TEMP_PASSWORD)
      mustChangePassword.value = true
    } catch {
      // Senha ja foi trocada
    }
  }

  async function handleChangePassword() {
    changePasswordError.value = ''

    if (newPassword.value.length < 8) {
      changePasswordError.value = 'A senha deve ter no minimo 8 caracteres'
      return
    }
    if (newPassword.value === TEMP_PASSWORD) {
      changePasswordError.value = 'A nova senha nao pode ser igual a provisoria'
      return
    }
    if (newPassword.value !== confirmPassword.value) {
      changePasswordError.value = 'As senhas nao coincidem'
      return
    }

    if (!user.value) {
      changePasswordError.value = 'Usuario nao autenticado'
      return
    }
    changingPassword.value = true
    try {
      await updatePassword(user.value, newPassword.value)
      await getToken()
      mustChangePassword.value = false
      newPassword.value = ''
      confirmPassword.value = ''
    } catch (e) {
      changePasswordError.value = (e as Error).message || 'Erro ao trocar senha'
    } finally {
      changingPassword.value = false
    }
  }

  // --- Helpers de formatacao ---
  function formatValue(value: number | null): string {
    if (value === null) return '—'
    return value.toLocaleString('pt-BR')
  }

  function formatDonations(donations: { count: number; totalBRL: number } | null): string {
    if (!donations) return '—'
    return donations.totalBRL.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString)
    const diffMs = Date.now() - date.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    const diffHour = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHour / 24)

    if (diffMin < 1) return 'agora'
    if (diffMin < 60) return `ha ${diffMin} min`
    if (diffHour < 24) return `ha ${diffHour}h`
    return `ha ${diffDay}d`
  }

  const activityIcon = (type: string): string => {
    if (type === 'release') return 'ti ti-tag'
    if (type === 'pr') return 'ti ti-git-pull-request'
    if (type === 'issue') return 'ti ti-alert-circle'
    return 'ti ti-activity'
  }

  const lastUpdatedText = computed(() => {
    if (!stats.value) return ''
    const diff = Date.now() - new Date(stats.value.updatedAt).getTime()
    const min = Math.floor(diff / 60000)
    if (min < 1) return 'Agora'
    return `Atualizado ha ${min} min`
  })

  // Stats cards reativos
  const statCards = computed(() => {
    const s = stats.value
    return [
      {
        label: 'Downloads',
        value: s ? formatValue(s.downloads) : '—',
        icon: 'ti ti-download',
        loading: loading.value,
      },
      {
        label: 'Newsletter',
        value: s ? formatValue(s.subscribers) : '—',
        icon: 'ti ti-mail',
        loading: loading.value,
      },
      {
        label: 'Doacoes',
        value: s ? formatDonations(s.donations) : '—',
        icon: 'ti ti-heart',
        loading: loading.value,
      },
      {
        label: 'Visitas (30d)',
        value: s ? formatValue(s.visits) : '—',
        icon: 'ti ti-eye',
        loading: loading.value,
      },
    ]
  })

  // --- Lifecycle ---
  onMounted(() => {
    checkTempPassword()
    fetchActivity()
  })

  async function handleRefresh() {
    await Promise.all([refresh(), fetchActivity()])
  }
</script>

<template>
  <!-- Modal: forcar troca de senha -->
  <div v-if="mustChangePassword" class="change-password-overlay">
    <div class="change-password-card">
      <h2>Troque sua senha</h2>
      <p class="change-password-desc">
        Voce esta usando a senha provisoria. Por seguranca, defina uma nova senha antes de
        continuar.
      </p>
      <form class="change-password-form" @submit.prevent="handleChangePassword">
        <div class="field">
          <label for="newPassword">Nova senha</label>
          <input
            id="newPassword"
            v-model="newPassword"
            type="password"
            required
            minlength="8"
            placeholder="Minimo 8 caracteres"
            :disabled="changingPassword"
          />
        </div>
        <div class="field">
          <label for="confirmPassword">Confirmar senha</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            required
            placeholder="Repita a nova senha"
            :disabled="changingPassword"
          />
        </div>
        <p v-if="changePasswordError" class="error">
          {{ changePasswordError }}
        </p>
        <button type="submit" class="login-btn" :disabled="changingPassword">
          {{ changingPassword ? 'Salvando...' : 'Trocar senha' }}
        </button>
      </form>
    </div>
  </div>

  <div v-else class="dashboard">
    <header class="dash-header">
      <div>
        <h1>Dashboard</h1>
        <p class="welcome">Bem-vindo, {{ user?.email || 'admin' }}</p>
        <p v-if="lastUpdatedText" class="updated-info">
          {{ lastUpdatedText }}
        </p>
      </div>
      <div class="header-actions">
        <NuxtLink to="/admin/newsletter" class="refresh-btn">
          <i class="ti ti-mail" />
          <span>Newsletter</span>
        </NuxtLink>
        <button class="refresh-btn" :disabled="loading" @click="handleRefresh">
          <i class="ti ti-refresh" :class="{ spinning: loading }" />
          <span>{{ loading ? 'Carregando...' : 'Atualizar' }}</span>
        </button>
        <button class="logout-btn" @click="logout">
          <i class="ti ti-logout" />
          Sair
        </button>
      </div>
    </header>

    <section class="stats-grid">
      <div v-for="card in statCards" :key="card.label" class="stat-card">
        <i :class="card.icon" class="stat-icon" />
        <div>
          <div class="stat-value">
            <span v-if="card.loading" class="skeleton">———</span>
            <span v-else>{{ card.value }}</span>
          </div>
          <div class="stat-label">
            {{ card.label }}
          </div>
        </div>
      </div>
    </section>

    <section class="content-area">
      <div class="panel">
        <h2>Atividade Recente</h2>
        <div v-if="activityLoading" class="placeholder">Carregando...</div>
        <div v-else-if="recentActivity.length === 0" class="placeholder">Dados indisponiveis.</div>
        <ul v-else class="activity-list">
          <li v-for="(item, i) in recentActivity" :key="i" class="activity-item">
            <a :href="item.url" target="_blank" rel="noopener" class="activity-link">
              <i :class="activityIcon(item.type)" class="activity-icon" />
              <div class="activity-content">
                <span class="activity-title">{{ item.title }}</span>
                <span class="activity-meta">
                  por {{ item.author }} · {{ formatRelativeTime(item.createdAt) }}
                </span>
              </div>
            </a>
          </li>
        </ul>
      </div>
      <div class="panel">
        <h2>Links Rapidos</h2>
        <nav class="quick-links">
          <NuxtLink to="/" target="_blank"> Ver site </NuxtLink>
          <NuxtLink to="/releases"> Releases </NuxtLink>
          <NuxtLink to="/download"> Download </NuxtLink>
        </nav>
      </div>
    </section>
  </div>
</template>

<style scoped>
  .change-password-overlay {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
    background: #0a0e1a;
  }

  .change-password-card {
    width: 100%;
    max-width: 420px;
    background: #111827;
    border: 1px solid #1e293b;
    border-radius: 12px;
    padding: 2.5rem;
  }

  .change-password-card h2 {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0 0 0.5rem;
    color: #22d3ee;
  }

  .change-password-desc {
    font-size: 0.8125rem;
    color: #94a3b8;
    margin: 0 0 1.5rem;
    line-height: 1.5;
  }

  .change-password-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .field label {
    font-size: 0.8125rem;
    font-weight: 600;
    color: #cbd5e1;
  }

  .field input {
    padding: 0.75rem 1rem;
    background: #0f172a;
    border: 1px solid #334155;
    border-radius: 8px;
    color: #e2e8f0;
    font-size: 0.9375rem;
    transition: border-color 0.15s;
  }

  .field input:focus {
    outline: none;
    border-color: #22d3ee;
  }

  .field input:disabled {
    opacity: 0.5;
  }

  .error {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #fca5a5;
    padding: 0.625rem 0.875rem;
    border-radius: 8px;
    font-size: 0.8125rem;
    margin: 0;
  }

  .login-btn {
    padding: 0.75rem 1rem;
    background: #22d3ee;
    color: #0a0e1a;
    border: none;
    border-radius: 8px;
    font-size: 0.9375rem;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.15s;
  }

  .login-btn:hover:not(:disabled) {
    background: #06b6d4;
  }

  .login-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .dashboard {
    max-width: 1100px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
  }

  .dash-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 2rem;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .dash-header h1 {
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

  .updated-info {
    font-size: 0.75rem;
    color: #475569;
    margin: 0.125rem 0 0;
  }

  .header-actions {
    display: flex;
    gap: 0.75rem;
  }

  .refresh-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: transparent;
    border: 1px solid #334155;
    border-radius: 8px;
    color: #22d3ee;
    font-size: 0.8125rem;
    cursor: pointer;
    transition: all 0.15s;
  }

  .refresh-btn:hover:not(:disabled) {
    border-color: #22d3ee;
    background: rgba(34, 211, 238, 0.08);
  }

  .refresh-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .spinning {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .logout-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: transparent;
    border: 1px solid #334155;
    border-radius: 8px;
    color: #94a3b8;
    font-size: 0.8125rem;
    cursor: pointer;
    transition: all 0.15s;
  }

  .logout-btn:hover {
    border-color: #f87171;
    color: #fca5a5;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: #111827;
    border: 1px solid #1e293b;
    border-radius: 12px;
    padding: 1.25rem 1.5rem;
  }

  .stat-icon {
    font-size: 1.75rem;
    color: #22d3ee;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #e2e8f0;
  }

  .skeleton {
    color: #334155;
    letter-spacing: 2px;
  }

  .stat-label {
    font-size: 0.75rem;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .content-area {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1.5rem;
  }

  @media (max-width: 768px) {
    .content-area {
      grid-template-columns: 1fr;
    }
  }

  .panel {
    background: #111827;
    border: 1px solid #1e293b;
    border-radius: 12px;
    padding: 1.5rem;
  }

  .panel h2 {
    font-size: 1rem;
    font-weight: 600;
    color: #e2e8f0;
    margin: 0 0 1rem;
  }

  .placeholder {
    color: #475569;
    font-size: 0.875rem;
  }

  .activity-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .activity-item {
    padding: 0.5rem 0;
    border-bottom: 1px solid #1e293b;
  }

  .activity-item:last-child {
    border-bottom: none;
  }

  .activity-link {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    text-decoration: none;
    color: inherit;
    transition: color 0.15s;
  }

  .activity-link:hover {
    color: #22d3ee;
  }

  .activity-icon {
    font-size: 1.125rem;
    color: #22d3ee;
    flex-shrink: 0;
    margin-top: 0.125rem;
  }

  .activity-content {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .activity-title {
    font-size: 0.875rem;
    color: #e2e8f0;
    line-height: 1.4;
  }

  .activity-meta {
    font-size: 0.75rem;
    color: #64748b;
  }

  .quick-links {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .quick-links a {
    color: #22d3ee;
    text-decoration: none;
    font-size: 0.875rem;
    transition: color 0.15s;
  }

  .quick-links a:hover {
    color: #06b6d4;
  }
</style>
