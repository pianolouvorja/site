<script setup lang="ts">
  import { ref } from 'vue'
  import { updatePassword, signInWithEmailAndPassword } from 'firebase/auth'

  definePageMeta({
    layout: 'admin',
    middleware: 'auth',
  })

  useHead({
    title: 'Dashboard · Piano Louvor JA',
  })

  const { user, logout, getToken } = useFirebaseAuth()

  // --- Forçar troca de senha provisória ---
  const TEMP_PASSWORD = 'Piano@2026'
  const mustChangePassword = ref(false)
  const newPassword = ref('')
  const confirmPassword = ref('')
  const changePasswordError = ref('')
  const changingPassword = ref(false)

  async function checkTempPassword() {
    if (!user.value?.email) return
    try {
      // Tenta re-login com a senha provisória
      const { getAuth } = await import('firebase/auth')
      const auth = getAuth()
      await signInWithEmailAndPassword(auth, user.value.email, TEMP_PASSWORD)
      // Se chegou aqui, a senha ainda é a provisória
      mustChangePassword.value = true
    } catch {
      // Senha já foi trocada (login falhou) -- tudo certo
    }
  }

  async function handleChangePassword() {
    changePasswordError.value = ''

    if (newPassword.value.length < 8) {
      changePasswordError.value = 'A senha deve ter no mínimo 8 caracteres'
      return
    }
    if (newPassword.value === TEMP_PASSWORD) {
      changePasswordError.value = 'A nova senha não pode ser igual à provisória'
      return
    }
    if (newPassword.value !== confirmPassword.value) {
      changePasswordError.value = 'As senhas não coincidem'
      return
    }

    if (!user.value) {
      changePasswordError.value = 'Usuário não autenticado'
      return
    }
    changingPassword.value = true
    try {
      await updatePassword(user.value, newPassword.value)
      // Força refresh do token para refletir a nova senha
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

  // Verifica ao montar
  onMounted(() => {
    checkTempPassword()
  })

  // Stats placeholders — wire to real data later
  const stats = ref([
    { label: 'Downloads', value: '—', icon: 'ti ti-download' },
    { label: 'Visitas', value: '—', icon: 'ti ti-eye' },
    { label: 'Newsletter', value: '—', icon: 'ti ti-mail' },
    { label: 'Doações', value: '—', icon: 'ti ti-heart' },
  ])
</script>

<template>
  <!-- Modal: forçar troca de senha -->
  <div v-if="mustChangePassword" class="change-password-overlay">
    <div class="change-password-card">
      <h2>Troque sua senha</h2>
      <p class="change-password-desc">
        Você está usando a senha provisória. Por segurança, defina uma nova senha antes de
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
            placeholder="Mínimo 8 caracteres"
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
      </div>
      <button class="logout-btn" @click="logout">
        <i class="ti ti-logout" />
        Sair
      </button>
    </header>

    <section class="stats-grid">
      <div v-for="stat in stats" :key="stat.label" class="stat-card">
        <i :class="stat.icon" class="stat-icon" />
        <div>
          <div class="stat-value">
            {{ stat.value }}
          </div>
          <div class="stat-label">
            {{ stat.label }}
          </div>
        </div>
      </div>
    </section>

    <section class="content-area">
      <div class="panel">
        <h2>Atividade Recente</h2>
        <p class="placeholder">Dados em breve.</p>
      </div>
      <div class="panel">
        <h2>Links Rápidos</h2>
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

  .dashboard {
    max-width: 1100px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
  }

  .dash-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 2rem;
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

  .stat-label {
    font-size: 0.75rem;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .content-area {
    display: grid;
    grid-template-columns: 1fr 1fr;
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
