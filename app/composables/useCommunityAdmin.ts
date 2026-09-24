/**
 * TASK-006 — RF-001/002/003/004/007: cliente dos endpoints admin de comunidade.
 * Token Firebase do usuário logado (mesma sessão do painel admin).
 */
import { ref, computed } from 'vue'

export interface CommunityMember {
  uid: string
  name: string
  email: string
  role: string
  status: string
  banReason?: string
  createdAt?: string
}

export interface AuditRow {
  id?: string
  actorUid: string
  action: string
  targetUid: string
  before: Record<string, unknown>
  after: Record<string, unknown>
  ip: string
  ts: string
}

export function useCommunityAdmin() {
  console.log('[useCommunityAdmin] SSR:', import.meta.server)
  const members = ref<CommunityMember[]>([])
  const nextCursor = ref<string | null>(null)
  const loading = ref(false)
  const error = ref('')

  async function authHeaders(): Promise<Record<string, string>> {
    const { $firebaseAuth } = useNuxtApp() as unknown as {
      $firebaseAuth: { currentUser: { getIdToken(): Promise<string> } | null }
    }
    const token = await $firebaseAuth.currentUser?.getIdToken()
    if (!token) throw new Error('não autenticado')
    return { Authorization: `Bearer ${token}` }
  }

  async function loadMembers(params?: {
    q?: string
    status?: string
    cursor?: string | null
  }): Promise<void> {
    loading.value = true
    error.value = ''
    try {
      const qs = new URLSearchParams()
      if (params?.q) qs.set('q', params.q)
      if (params?.status) qs.set('status', params.status)
      if (params?.cursor) qs.set('cursor', params.cursor)
      const res = await $fetch<{
        members: CommunityMember[]
        nextCursor: string | null
      }>(`/api/admin/community/members?${qs}`, { headers: await authHeaders() })
      members.value = res.members
      nextCursor.value = res.nextCursor
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erro ao carregar membros'
    } finally {
      loading.value = false
    }
  }

  const audit = ref<AuditRow[]>([])

  async function loadAudit(): Promise<void> {
    audit.value = await $fetch<AuditRow[]>('/api/admin/community/audit', {
      headers: await authHeaders(),
    }).then((r) => (r as unknown as { entries: AuditRow[] }).entries ?? [])
  }

  async function mutate(
    targetUid: string,
    action: 'role_change' | 'ban' | 'suspend' | 'reactivate',
    extra?: { newRole?: string; reason?: string; until?: string | null },
  ): Promise<{ ok: boolean; error?: string }> {
    try {
      await $fetch('/api/admin/community/members', {
        method: 'PATCH',
        headers: await authHeaders(),
        body: { targetUid, action, ...extra },
      })
      return { ok: true }
    } catch (e) {
      return {
        ok: false,
        error: e instanceof Error ? e.message : 'Erro na ação',
      }
    }
  }

  const hasMembers = computed(() => members.value.length > 0)

  return {
    members,
    nextCursor,
    loading,
    error,
    hasMembers,
    audit,
    loadMembers,
    loadAudit,
    mutate,
  }
}
