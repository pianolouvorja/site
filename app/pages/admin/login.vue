<script setup lang="ts">
  import { ref } from 'vue'

  definePageMeta({
    layout: 'admin',
  })

  useHead({
    title: 'Admin · Piano Louvor JA',
  })

  const { login, user, error } = useFirebaseAuth()
  const email = ref('')
  const password = ref('')
  const loading = ref(false)
  const errorMsg = ref('')
  const showPassword = ref(false)

  // Redirect if already logged in
  watchEffect(() => {
    if (user.value) {
      navigateTo('/admin')
    }
  })

  const handleSubmit = async () => {
    errorMsg.value = ''
    loading.value = true
    try {
      await login(email.value, password.value)
      navigateTo('/admin')
    } catch {
      errorMsg.value = error.value || 'Credenciais inválidas'
    } finally {
      loading.value = false
    }
  }
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>Piano Louvor JA</h1>
        <p>Painel Administrativo</p>
      </div>

      <form class="login-form" @submit.prevent="handleSubmit">
        <div class="field">
          <label for="email">E-mail</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            autocomplete="email"
            placeholder="admin@exemplo.com"
            :disabled="loading"
          />
        </div>

        <div class="field">
          <label for="password">Senha</label>
          <div class="password-wrapper">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              autocomplete="current-password"
              placeholder="********"
              :disabled="loading"
            />
            <button
              type="button"
              class="password-toggle"
              :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
              :title="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
              @click="showPassword = !showPassword"
            >
              <i class="ti" :class="showPassword ? 'ti-eye-off' : 'ti-eye'" aria-hidden="true" />
            </button>
          </div>
        </div>

        <p v-if="errorMsg" class="error">
          {{ errorMsg }}
        </p>

        <button type="submit" class="login-btn" :disabled="loading">
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>

      <NuxtLink to="/" class="back-link"> &larr; Voltar ao site </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
  .login-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
  }

  .login-card {
    width: 100%;
    max-width: 400px;
    background: #111827;
    border: 1px solid #1e293b;
    border-radius: 12px;
    padding: 2.5rem;
  }

  .login-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .login-header h1 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 0.25rem;
    color: #22d3ee;
  }

  .login-header p {
    font-size: 0.875rem;
    color: #94a3b8;
    margin: 0;
  }

  .login-form {
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

  .password-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .password-wrapper input {
    width: 100%;
    padding-right: 2.75rem;
  }

  .password-toggle {
    position: absolute;
    right: 0.5rem;
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
    padding: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.15s;
  }

  .password-toggle:hover {
    color: #22d3ee;
  }

  .password-toggle i {
    font-size: 1.125rem;
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

  .back-link {
    display: block;
    text-align: center;
    margin-top: 1.5rem;
    font-size: 0.8125rem;
    color: #64748b;
    text-decoration: none;
    transition: color 0.15s;
  }

  .back-link:hover {
    color: #94a3b8;
  }
</style>
