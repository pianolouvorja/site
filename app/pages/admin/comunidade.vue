<script setup lang="ts">
  definePageMeta({
    layout: 'admin',
    middleware: 'auth',
  })

  useHead({ title: 'Comunidade · Piano Louvor JA' })

  const { getToken } = useFirebaseAuth()

  interface PendenteBase {
    row: number
    tab: string
    nome: string
    email: string
    status: string
  }
  interface TesterPendente extends PendenteBase {
    bio: string
    foco: string
    links: string
  }
  interface DevPendente extends PendenteBase {
    bio: string
    github: string
    portfolio: string
    areas: string
    disponibilidade: string
    stack: string
  }
  interface RelatoNovo extends PendenteBase {
    tipo: string
    versao: string
    modulo: string
    descricao: string
    passos: string
  }

  type Tab = 'testers' | 'devs' | 'relatos'
  const activeTab = ref<Tab>('testers')

  const testers = ref<TesterPendente[]>([])
  const devs = ref<DevPendente[]>([])
  const relatos = ref<RelatoNovo[]>([])
  const loading = ref(false)
  const feedback = ref<{ ok: boolean; msg: string } | null>(null)
  const processando = ref<string | null>(null) // `${tab}:${row}`

  async function carregar() {
    loading.value = true
    feedback.value = null
    try {
      const token = await getToken()
      const res = await $fetch<{
        testersPendentes: TesterPendente[]
        devsPendentes: DevPendente[]
        relatosNovos: RelatoNovo[]
      }>('/api/admin/community/pending', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      testers.value = res.testersPendentes
      devs.value = res.devsPendentes
      relatos.value = res.relatosNovos
    } catch {
      feedback.value = { ok: false, msg: 'Erro ao carregar pendentes' }
    } finally {
      loading.value = false
    }
  }

  onMounted(carregar)

  async function revisar(tab: string, row: number, acao: 'aprovar' | 'rejeitar' | 'resolver') {
    processando.value = `${tab}:${row}`
    feedback.value = null
    try {
      const token = await getToken()
      const res = await $fetch<{
        ok: boolean
        emailEnviado: boolean
        emailErro?: string
      }>('/api/admin/community/review', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: { tab, row, acao },
      })
      const acaoLabel =
        acao === 'resolver' ? 'resolvido' : acao === 'aprovar' ? 'aprovado' : 'rejeitado'
      feedback.value = {
        ok: true,
        msg: res.emailEnviado
          ? `${acaoLabel} ✓ — email enviado`
          : res.emailErro
            ? `${acaoLabel} ✓ — mas email falhou: ${res.emailErro}`
            : `${acaoLabel} ✓ — sem email`,
      }
      await carregar()
    } catch {
      feedback.value = { ok: false, msg: 'Erro ao processar' }
    } finally {
      processando.value = null
    }
  }

  const tabs = [
    { value: 'testers' as const, label: 'Testadores', count: () => testers.value.length },
    { value: 'devs' as const, label: 'Desenvolvedores', count: () => devs.value.length },
    { value: 'relatos' as const, label: 'Relatos', count: () => relatos.value.length },
  ]
</script>

<template>
  <div class="admin-comunidade">
    <header class="admin-comunidade__header">
      <h1>Moderação da Comunidade</h1>
      <p class="admin-comunidade__sub">
        Cadastros pendentes de aprovação. Aprovar envia email de boas-vindas; rejeitar envia
        agradecimento.
      </p>
    </header>

    <div v-if="feedback" class="admin-comunidade__feedback" :class="{ '--erro': !feedback.ok }">
      {{ feedback.msg }}
    </div>

    <nav class="admin-comunidade__tabs">
      <button
        v-for="t in tabs"
        :key="t.value"
        class="admin-comunidade__tab"
        :class="{ '--ativa': activeTab === t.value }"
        @click="activeTab = t.value"
      >
        {{ t.label }}
        <span class="admin-comunidade__badge">{{ t.count() }}</span>
      </button>
      <button class="admin-comunidade__recarregar" :disabled="loading" @click="carregar">
        {{ loading ? 'Carregando…' : '↻ Recarregar' }}
      </button>
    </nav>

    <!-- Testadores -->
    <section v-if="activeTab === 'testers'" class="admin-comunidade__lista">
      <p v-if="!testers.length" class="admin-comunidade__vazio">Nenhum testador pendente 🎉</p>
      <article v-for="t in testers" :key="`t${t.row}`" class="admin-comunidade__card">
        <h3>{{ t.nome }}</h3>
        <p class="admin-comunidade__email">
          {{ t.email }}
        </p>
        <dl>
          <div>
            <dt>Foco</dt>
            <dd>{{ t.foco || '—' }}</dd>
          </div>
          <div>
            <dt>Bio</dt>
            <dd>{{ t.bio || '—' }}</dd>
          </div>
          <div>
            <dt>Links</dt>
            <dd>{{ t.links || '—' }}</dd>
          </div>
        </dl>
        <div class="admin-comunidade__acoes">
          <button
            class="admin-comunidade__aprovar"
            :disabled="processando === `testadores:${t.row}`"
            @click="revisar('testadores', t.row, 'aprovar')"
          >
            ✓ Aprovar
          </button>
          <button
            class="admin-comunidade__rejeitar"
            :disabled="processando === `testadores:${t.row}`"
            @click="revisar('testadores', t.row, 'rejeitar')"
          >
            ✕ Rejeitar
          </button>
        </div>
      </article>
    </section>

    <!-- Desenvolvedores -->
    <section v-if="activeTab === 'devs'" class="admin-comunidade__lista">
      <p v-if="!devs.length" class="admin-comunidade__vazio">Nenhum dev pendente 🎉</p>
      <article v-for="d in devs" :key="`d${d.row}`" class="admin-comunidade__card">
        <h3>{{ d.nome }}</h3>
        <p class="admin-comunidade__email">
          {{ d.email }}
        </p>
        <dl>
          <div>
            <dt>GitHub</dt>
            <dd>{{ d.github || '—' }}</dd>
          </div>
          <div>
            <dt>Portfólio</dt>
            <dd>{{ d.portfolio || '—' }}</dd>
          </div>
          <div>
            <dt>Stack</dt>
            <dd>{{ d.stack || '—' }}</dd>
          </div>
          <div>
            <dt>Áreas</dt>
            <dd>{{ d.areas || '—' }}</dd>
          </div>
          <div>
            <dt>Disponibilidade</dt>
            <dd>{{ d.disponibilidade || '—' }}</dd>
          </div>
          <div>
            <dt>Bio</dt>
            <dd>{{ d.bio || '—' }}</dd>
          </div>
        </dl>
        <div class="admin-comunidade__acoes">
          <button
            class="admin-comunidade__aprovar"
            :disabled="processando === `desenvolvedores:${d.row}`"
            @click="revisar('desenvolvedores', d.row, 'aprovar')"
          >
            ✓ Aprovar
          </button>
          <button
            class="admin-comunidade__rejeitar"
            :disabled="processando === `desenvolvedores:${d.row}`"
            @click="revisar('desenvolvedores', d.row, 'rejeitar')"
          >
            ✕ Rejeitar
          </button>
        </div>
      </article>
    </section>

    <!-- Relatos -->
    <section v-if="activeTab === 'relatos'" class="admin-comunidade__lista">
      <p v-if="!relatos.length" class="admin-comunidade__vazio">Nenhum relato novo 🎉</p>
      <article v-for="r in relatos" :key="`r${r.row}`" class="admin-comunidade__card">
        <h3>{{ r.tipo }} — {{ r.modulo || 'geral' }}</h3>
        <p class="admin-comunidade__email">{{ r.nome }} · {{ r.email }} · v{{ r.versao || '?' }}</p>
        <dl>
          <div>
            <dt>Descrição</dt>
            <dd>{{ r.descricao || '—' }}</dd>
          </div>
          <div>
            <dt>Passos</dt>
            <dd>{{ r.passos || '—' }}</dd>
          </div>
        </dl>
        <div class="admin-comunidade__acoes">
          <button
            class="admin-comunidade__aprovar"
            :disabled="processando === `relatos:${r.row}`"
            @click="revisar('relatos', r.row, 'resolver')"
          >
            ✓ Resolver
          </button>
          <button
            class="admin-comunidade__rejeitar"
            :disabled="processando === `relatos:${r.row}`"
            @click="revisar('relatos', r.row, 'rejeitar')"
          >
            ✕ Descartar
          </button>
        </div>
      </article>
    </section>
  </div>
</template>

<style scoped lang="scss">
  .admin-comunidade {
    max-width: 900px;
    margin: 0 auto;
    padding: 24px 16px;

    &__header {
      margin-bottom: 20px;

      h1 {
        font-size: 1.6rem;
        margin: 0 0 4px;
      }
    }

    &__sub {
      color: var(--color-text-muted, #64748b);
      font-size: 0.9rem;
      margin: 0;
    }

    &__feedback {
      padding: 10px 14px;
      border-radius: 8px;
      background: rgba(34, 197, 94, 0.12);
      color: #16a34a;
      margin-bottom: 16px;
      font-size: 0.9rem;

      &.--erro {
        background: rgba(239, 68, 68, 0.12);
        color: #dc2626;
      }
    }

    &__tabs {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    &__tab {
      padding: 8px 14px;
      border-radius: 999px;
      border: 1px solid var(--color-border, #1e293b);
      background: transparent;
      color: inherit;
      cursor: pointer;
      font-size: 0.9rem;

      &.--ativa {
        background: #00c1e6;
        border-color: #00c1e6;
        color: #0a1733;
        font-weight: 600;
      }
    }

    &__badge {
      display: inline-block;
      min-width: 20px;
      padding: 1px 6px;
      border-radius: 999px;
      background: rgba(0, 193, 230, 0.15);
      font-size: 0.75rem;
      text-align: center;
      margin-left: 4px;
    }

    &__recarregar {
      margin-left: auto;
      padding: 8px 14px;
      border-radius: 8px;
      border: 1px solid var(--color-border, #1e293b);
      background: transparent;
      color: inherit;
      cursor: pointer;
      font-size: 0.85rem;

      &:disabled {
        opacity: 0.5;
        cursor: default;
      }
    }

    &__lista {
      display: grid;
      gap: 12px;
    }

    &__vazio {
      color: var(--color-text-muted, #64748b);
      text-align: center;
      padding: 40px 0;
    }

    &__card {
      border: 1px solid var(--color-border, #1e293b);
      border-radius: 12px;
      padding: 16px;

      h3 {
        margin: 0 0 2px;
        font-size: 1.05rem;
      }
    }

    &__email {
      color: #00c1e6;
      font-size: 0.85rem;
      margin: 0 0 10px;
    }

    dl {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 8px;
      margin: 0 0 14px;
      font-size: 0.85rem;
    }

    dt {
      color: var(--color-text-muted, #64748b);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    dd {
      margin: 2px 0 0;
      word-break: break-word;
    }

    &__acoes {
      display: flex;
      gap: 8px;
    }

    &__aprovar,
    &__rejeitar {
      padding: 8px 16px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.85rem;
    }

    &__aprovar {
      background: #16a34a;
      color: white;

      &:disabled {
        opacity: 0.5;
      }
    }

    &__rejeitar {
      background: transparent;
      color: #dc2626;
      border: 1px solid #dc2626;

      &:disabled {
        opacity: 0.5;
      }
    }
  }
</style>
