import { describe, expect, it, vi } from 'vitest'

// TASK-006 — contrato do composable useCommunityAdmin (mockando $fetch global)

vi.stubGlobal('$fetch', vi.fn())

describe('useCommunityAdmin', () => {
  it('loadMembers popula members e nextCursor', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      members: [{ uid: 'u1', name: 'A', email: 'a@b.c', role: 'member', status: 'active' }],
      nextCursor: '25',
    })
    vi.stubGlobal('$fetch', fetchMock)
    const { useCommunityAdmin } = await import('@/composables/useCommunityAdmin')
    const api = useCommunityAdmin()
    // mock auth
    vi.stubGlobal('useNuxtApp', () => ({
      $firebaseAuth: { currentUser: { getIdToken: async () => 'tok' } },
    }))
    await api.loadMembers({ q: 'a' })
    expect(api.members.value).toHaveLength(1)
    expect(api.nextCursor.value).toBe('25')
    expect(api.hasMembers.value).toBe(true)
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/community/members?q=a'),
      expect.objectContaining({ headers: { Authorization: 'Bearer tok' } }),
    )
  })

  it('mutate retorna ok:true em 2xx', async () => {
    vi.stubGlobal('$fetch', vi.fn().mockResolvedValue({ ok: true }))
    vi.stubGlobal('useNuxtApp', () => ({
      $firebaseAuth: { currentUser: { getIdToken: async () => 'tok' } },
    }))
    const { useCommunityAdmin } = await import('@/composables/useCommunityAdmin')
    const api = useCommunityAdmin()
    const r = await api.mutate('u1', 'ban', { reason: 'spam' })
    expect(r.ok).toBe(true)
  })

  it('mutate propaga erro do servidor', async () => {
    vi.stubGlobal('$fetch', vi.fn().mockRejectedValue(new Error('Role insuficiente')))
    vi.stubGlobal('useNuxtApp', () => ({
      $firebaseAuth: { currentUser: { getIdToken: async () => 'tok' } },
    }))
    const { useCommunityAdmin } = await import('@/composables/useCommunityAdmin')
    const api = useCommunityAdmin()
    const r = await api.mutate('u1', 'role_change', { newRole: 'moderator' })
    expect(r.ok).toBe(false)
    expect(r.error).toContain('Role insuficiente')
  })
})
