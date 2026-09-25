import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.stubGlobal('$fetch', vi.fn())
vi.stubGlobal('useNuxtApp', () => ({
  $firebaseAuth: { currentUser: { getIdToken: async () => 'tok' } },
}))

describe('useCommunityAdmin', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubGlobal('useNuxtApp', () => ({
      $firebaseAuth: { currentUser: { getIdToken: async () => 'tok' } },
    }))
  })

  it('loadMembers popula members e nextCursor', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      members: [{ uid: 'u1', name: 'A', email: 'a@b.c', role: 'member', status: 'active' }],
      nextCursor: '25',
    })
    vi.stubGlobal('$fetch', fetchMock)
    const { useCommunityAdmin } = await import('@/composables/useCommunityAdmin')
    const api = useCommunityAdmin()
    await api.loadMembers({ q: 'a', status: 'active', cursor: '10' })
    expect(api.members.value).toHaveLength(1)
    expect(api.nextCursor.value).toBe('25')
    expect(api.hasMembers.value).toBe(true)
    expect(api.loading.value).toBe(false)
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/community/members?'),
      expect.objectContaining({ headers: { Authorization: 'Bearer tok' } }),
    )
    const url = String(fetchMock.mock.calls[0][0])
    expect(url).toContain('q=a')
    expect(url).toContain('status=active')
    expect(url).toContain('cursor=10')
  })

  it('loadMembers grava error quando o fetch falha com Error', async () => {
    vi.stubGlobal('$fetch', vi.fn().mockRejectedValue(new Error('falha rede')))
    const { useCommunityAdmin } = await import('@/composables/useCommunityAdmin')
    const api = useCommunityAdmin()
    await api.loadMembers()
    expect(api.error.value).toBe('falha rede')
    expect(api.loading.value).toBe(false)
    expect(api.hasMembers.value).toBe(false)
  })

  it('loadMembers usa mensagem generica para rejeicao nao-Error', async () => {
    vi.stubGlobal('$fetch', vi.fn().mockRejectedValue('boom'))
    const { useCommunityAdmin } = await import('@/composables/useCommunityAdmin')
    const api = useCommunityAdmin()
    await api.loadMembers({ q: '' })
    expect(api.error.value).toBe('Erro ao carregar membros')
  })

  it('loadMembers lanca quando nao ha token', async () => {
    vi.stubGlobal('useNuxtApp', () => ({
      $firebaseAuth: { currentUser: null },
    }))
    vi.stubGlobal('$fetch', vi.fn())
    const { useCommunityAdmin } = await import('@/composables/useCommunityAdmin')
    const api = useCommunityAdmin()
    await api.loadMembers()
    expect(api.error.value).toBe('não autenticado')
  })

  it('loadAudit popula audit a partir de entries', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      entries: [
        { actorUid: 'a', action: 'ban', targetUid: 'u', before: {}, after: {}, ip: '', ts: '' },
      ],
    })
    vi.stubGlobal('$fetch', fetchMock)
    const { useCommunityAdmin } = await import('@/composables/useCommunityAdmin')
    const api = useCommunityAdmin()
    await api.loadAudit()
    expect(api.audit.value).toHaveLength(1)
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/admin/community/audit',
      expect.objectContaining({ headers: { Authorization: 'Bearer tok' } }),
    )
  })

  it('loadAudit usa lista vazia quando entries esta ausente', async () => {
    vi.stubGlobal('$fetch', vi.fn().mockResolvedValue({}))
    const { useCommunityAdmin } = await import('@/composables/useCommunityAdmin')
    const api = useCommunityAdmin()
    await api.loadAudit()
    expect(api.audit.value).toEqual([])
  })

  it('mutate retorna ok:true em 2xx', async () => {
    vi.stubGlobal('$fetch', vi.fn().mockResolvedValue({ ok: true }))
    const { useCommunityAdmin } = await import('@/composables/useCommunityAdmin')
    const api = useCommunityAdmin()
    const r = await api.mutate('u1', 'ban', { reason: 'spam' })
    expect(r.ok).toBe(true)
  })

  it('mutate propaga erro do servidor', async () => {
    vi.stubGlobal('$fetch', vi.fn().mockRejectedValue(new Error('Role insuficiente')))
    const { useCommunityAdmin } = await import('@/composables/useCommunityAdmin')
    const api = useCommunityAdmin()
    const r = await api.mutate('u1', 'role_change', { newRole: 'moderator' })
    expect(r.ok).toBe(false)
    expect(r.error).toContain('Role insuficiente')
  })

  it('mutate usa mensagem generica para rejeicao nao-Error', async () => {
    vi.stubGlobal('$fetch', vi.fn().mockRejectedValue(42))
    const { useCommunityAdmin } = await import('@/composables/useCommunityAdmin')
    const api = useCommunityAdmin()
    const r = await api.mutate('u1', 'reactivate')
    expect(r).toEqual({ ok: false, error: 'Erro na ação' })
  })
})
