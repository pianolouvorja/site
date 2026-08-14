<script setup lang="ts">
  import { ref, computed } from 'vue'

  definePageMeta({
    layout: 'admin',
  })

  useHead({
    title: 'Redefinir Senha · Piano Louvor JA',
  })

  const { resetPassword } = useFirebaseAuth()
  const newPassword = ref('')
  const confirmPassword = ref('')
  const loading = ref(false)
  const errorMsg = ref('')
  const success = ref(false)

  const route = useRoute()
  const oobCode = computed(() => (route.query.oobCode as string) || '')

  const passwordsMatch = computed(() => {
    if (!confirmPassword.value) return true
    return newPassword.value === confirmPassword.value
  })

  const isValid = computed(() => {
    return newPassword.value.length >= 6 && passwordsMatch.value && oobCode.value
  })

  const handleSubmit = async () => {
    if (!passwordsMatch.value) {
      errorMsg.value = 'As senhas não coincidem'
      return
    }
    if (newPassword.value.length < 6) {
      errorMsg.value = 'A senha deve ter no mínimo 6 caracteres'
      return
    }

    errorMsg.value = ''
    loading.value = true
    try {
      await resetPassword(oobCode.value, newPassword.value)
      success.value = true
    } catch {
      errorMsg.value = 'Link expirado ou inválido. Solicite uma nova recuperação de senha.'
    } finally {
      loading.value = false
    }
  }
</script>

<template>
  <div class="reset-container">
    <div class="reset-card">
      <div class="reset-header">
        <h1>Piano Louvor JA</h1>
        <p>Redefinir Senha</p>
      </div>

      <div v-if="success" class="reset-success">
        <i
          class="ti ti-circle-check-filled"
          aria-hidden="true"
          style="font-size: 3rem; color: #22d3ee"
        />
        <p>Senha redefinida com sucesso!</p>
        <p class="reset-hint">Você já pode fazer login com sua nova senha.</p>
        <NuxtLink to="/admin/login" class="reset-btn"> Ir para o login </NuxtLink>
      </div>

      <div v-else-if="!oobCode" class="reset-error">
        <i
          class="ti ti-alert-triangle-filled"
          aria-hidden="true"
          style="font-size: 3rem; color: #f59e0b"
        />
        <p>Link inválido.</p>
        <p class="reset-hint">Use o link enviado no email de recuperação.</p>
        <NuxtLink to="/admin/login" class="reset-btn"> Voltar ao login </NuxtLink>
      </div>

      <form v-else class="reset-form" @submit.prevent="handleSubmit">
        <div class="field">
          <label for="newPassword">Nova Senha</label>
          <input
            id="newPassword"
            v-model="newPassword"
            type="password"
            required
            autocomplete="new-password"
            placeholder="Mínimo 6 caracteres"
            :disabled="loading"
          />
        </div>

        <div class="field">
          <label for="confirmPassword">Confirmar Senha</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            required
            autocomplete="new-password"
            placeholder="Repita a nova senha"
            :disabled="loading"
            :class="{ 'input-error': !passwordsMatch }"
          />
          <span v-if="!passwordsMatch" class="field-error">As senhas não coincidem</span>
        </div>

        <p v-if="errorMsg" class="error">
          {{ errorMsg }}
        </p>

        <button type="submit" class="reset-btn" :disabled="loading || !isValid">
          {{ loading ? 'Redefinindo...' : 'Redefinir senha' }}
        </button>
      </form>

      <NuxtLink to="/admin/login" class="back-link"> &larr; Voltar ao login </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
  .reset-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
  }

  .reset-card {
    width: 100%;
    max-width: 400px;
    background: #111827;
    border: 1px solid #1e293b;
    border-radius: 12px;
    padding: 2.5rem;
  }

  .reset-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .reset-header h1 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 0.25rem;
    color: #22d3ee;
  }

  .reset-header p {
    font-size: 0.875rem;
    color: #94a3b8;
    margin: 0;
  }

  .reset-form {
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

  .input-error {
    border-color: rgba(239, 68, 68, 0.5) !important;
  }

  .field-error {
    font-size: 0.75rem;
    color: #fca5a5;
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

  .reset-btn {
    display: block;
    text-align: center;
    padding: 0.75rem 1rem;
    background: #22d3ee;
    color: #0a0e1a;
    border: none;
    border-radius: 8px;
    font-size: 0.9375rem;
    font-weight: 700;
    cursor: pointer;
    text-decoration: none;
    transition: background 0.15s;
  }

  .reset-btn:hover:not(:disabled) {
    background: #06b6d4;
  }

  .reset-btn:disabled {
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

  .reset-success,
  .reset-error {
    text-align: center;
    padding: 1rem 0;
  }

  .reset-success p,
  .reset-error p {
    color: #cbd5e1;
    font-size: 0.9rem;
    margin: 0.75rem 0 0.25rem;
  }

  .reset-hint {
    font-size: 0.8125rem !important;
    color: #64748b !important;
    margin-top: 0.5rem !important;
  }
</style>
