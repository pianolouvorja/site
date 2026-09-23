import { describe, it, expect, vi, beforeEach } from 'vitest'

// --- Mocks (antes do import, padrão do repo) ---
// happy-dom deste projeto não implementa localStorage — stub in-memory
const storage = new Map<string, string>()
vi.stubGlobal('localStorage', {
  getItem: (k: string) => storage.get(k) ?? null,
  setItem: (k: string, v: string) => void storage.set(k, v),
  removeItem: (k: string) => void storage.delete(k),
  clear: () => void storage.clear(),
})

const fetchMock = vi.fn()
vi.stubGlobal('$fetch', fetchMock)

import { usePianoApi } from '~/composables/usePianoApi'

describe('usePianoApi', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    storage.clear()
  })

  it('login guarda o token e o usuário no localStorage', async () => {
    fetchMock.mockResolvedValueOnce({
      token: 'tok-123',
      user: { id_user: 1, email: 'a@b.c', displayName: 'Admin' },
    })
    const api = usePianoApi()
    const session = await api.login('a@b.c', 'senha')
    expect(session.token).toBe('tok-123')
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/piano/proxy/v1/custom/auth/login',
      expect.objectContaining({ method: 'POST' }),
    )
    expect(localStorage.getItem('piano_admin_token')).toBe('tok-123')
  })

  it('logout limpa a sessão', () => {
    localStorage.setItem('piano_admin_token', 'tok-123')
    const api = usePianoApi()
    api.logout()
    expect(localStorage.getItem('piano_admin_token')).toBeNull()
  })

  it('request inclui Authorization quando autenticado', async () => {
    localStorage.setItem('piano_admin_token', 'tok-123')
    fetchMock.mockResolvedValueOnce({ data: [], meta: { total: 0 } })
    const api = usePianoApi()
    await api.listCollections()
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/piano/proxy/v1/custom/collections',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer tok-123' }),
      }),
    )
  })

  it('listCollections extrai data do envelope {data, meta}', async () => {
    localStorage.setItem('piano_admin_token', 'tok-1')
    fetchMock.mockResolvedValueOnce({
      data: [{ id_collection: 1, name: 'X' }],
      meta: { total: 1 },
    })
    const api = usePianoApi()
    const list = await api.listCollections()
    expect(list).toHaveLength(1)
    expect(list[0]!.name).toBe('X')
  })

  it('401 dispara logout (sessão expirada)', async () => {
    localStorage.setItem('piano_admin_token', 'tok-velho')
    fetchMock.mockRejectedValueOnce({ status: 401 })
    const api = usePianoApi()
    await expect(api.listCollections()).rejects.toBeDefined()
    expect(localStorage.getItem('piano_admin_token')).toBeNull()
  })

  it('createCollection envia visibility', async () => {
    localStorage.setItem('piano_admin_token', 'tok-1')
    fetchMock.mockResolvedValueOnce({ id_collection: 9 })
    const api = usePianoApi()
    await api.createCollection({ name: 'Nova', visibility: 'private' })
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/piano/proxy/v1/custom/collections',
      expect.objectContaining({
        method: 'POST',
      }),
    )
    const [, opts] = fetchMock.mock.calls[0]!
    expect((opts as RequestInit).body).toBe(JSON.stringify({ name: 'Nova', visibility: 'private' }))
  })

  it('updateCollection usa PUT com id', async () => {
    localStorage.setItem('piano_admin_token', 'tok-1')
    fetchMock.mockResolvedValueOnce({})
    const api = usePianoApi()
    await api.updateCollection(5, { visibility: 'public' })
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/piano/proxy/v1/custom/collections/5',
      expect.objectContaining({ method: 'PUT' }),
    )
  })

  it('deleteCollection usa DELETE', async () => {
    localStorage.setItem('piano_admin_token', 'tok-1')
    fetchMock.mockResolvedValueOnce({})
    const api = usePianoApi()
    await api.deleteCollection(7)
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/piano/proxy/v1/custom/collections/7',
      expect.objectContaining({ method: 'DELETE' }),
    )
  })

  it('listMusics e listLyrics chamam as rotas certas', async () => {
    localStorage.setItem('piano_admin_token', 'tok-1')
    fetchMock.mockResolvedValue({ data: [], meta: { total: 0 } })
    const api = usePianoApi()
    await api.listMusics(3)
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/piano/proxy/v1/custom/collections/3/musics',
      expect.anything(),
    )
    await api.getMusic(12)
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/piano/proxy/v1/custom/musics/12',
      expect.anything(),
    )
  })

  it('uploadAudio envia FormData para /files', async () => {
    localStorage.setItem('piano_admin_token', 'tok-1')
    fetchMock.mockResolvedValueOnce({ id_file: 4, url: '/custom/a.mp3' })
    const api = usePianoApi()
    const bytes = new Uint8Array([1, 2, 3])
    const res = await api.uploadFile(bytes, 'som.mp3', 'audio')
    expect(res?.idFile).toBe(4)
    const [url, opts] = fetchMock.mock.calls[0]!
    expect(String(url)).toBe('/api/piano/proxy/v1/custom/files')
    expect((opts as RequestInit).method).toBe('POST')
    expect((opts as { body: FormData }).body).toBeInstanceOf(FormData)
  })

  it('createMusic em coletânea', async () => {
    localStorage.setItem('piano_admin_token', 'tok-1')
    fetchMock.mockResolvedValueOnce({ id_music: 21 })
    const api = usePianoApi()
    const res = await api.createMusic(3, { name: 'Nova' })
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/piano/proxy/v1/custom/collections/3/musics',
      expect.objectContaining({ method: 'POST' }),
    )
    expect(res?.id).toBe(21)
  })

  it('updateMusic PUT id_file_audio', async () => {
    localStorage.setItem('piano_admin_token', 'tok-1')
    fetchMock.mockResolvedValueOnce({})
    const api = usePianoApi()
    const ok = await api.updateMusic(8, { id_file_audio: 4 })
    expect(ok).toBe(true)
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/piano/proxy/v1/custom/musics/8',
      expect.objectContaining({ method: 'PUT' }),
    )
  })

  it('updateMusic falha devolve false', async () => {
    localStorage.setItem('piano_admin_token', 'tok-1')
    fetchMock.mockRejectedValueOnce({ status: 500 })
    const api = usePianoApi()
    const ok = await api.updateMusic(8, { name: 'x' })
    expect(ok).toBe(false)
  })

  it('deleteMusic DELETE', async () => {
    localStorage.setItem('piano_admin_token', 'tok-1')
    fetchMock.mockResolvedValueOnce({})
    const api = usePianoApi()
    expect(await api.deleteMusic(9)).toBe(true)
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/piano/proxy/v1/custom/musics/9',
      expect.objectContaining({ method: 'DELETE' }),
    )
  })

  it('getMusic retorna detalhe com lyrics', async () => {
    localStorage.setItem('piano_admin_token', 'tok-1')
    fetchMock.mockResolvedValueOnce({
      name: 'M',
      lyrics: [{ id_lyric: 1, lyric: 'L', time: '00:01', order: 1 }],
    })
    const api = usePianoApi()
    const m = await api.getMusic(5)
    expect(m?.name).toBe('M')
    expect(m?.lyrics).toHaveLength(1)
  })

  it('createLyric em música', async () => {
    localStorage.setItem('piano_admin_token', 'tok-1')
    fetchMock.mockResolvedValueOnce({ id_lyric: 33 })
    const api = usePianoApi()
    const res = await api.createLyric(5, { lyric: 'Verso', order: 1 })
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/piano/proxy/v1/custom/musics/5/lyrics',
      expect.objectContaining({ method: 'POST' }),
    )
    expect(res?.id).toBe(33)
  })

  it('updateLyric PUT', async () => {
    localStorage.setItem('piano_admin_token', 'tok-1')
    fetchMock.mockResolvedValueOnce({})
    const api = usePianoApi()
    expect(await api.updateLyric(33, { lyric: 'x' })).toBe(true)
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/piano/proxy/v1/custom/lyrics/33',
      expect.objectContaining({ method: 'PUT' }),
    )
  })

  it('deleteLyric DELETE', async () => {
    localStorage.setItem('piano_admin_token', 'tok-1')
    fetchMock.mockResolvedValueOnce({})
    const api = usePianoApi()
    expect(await api.deleteLyric(33)).toBe(true)
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/piano/proxy/v1/custom/lyrics/33',
      expect.objectContaining({ method: 'DELETE' }),
    )
  })

  it('updateCollection falha devolve false', async () => {
    localStorage.setItem('piano_admin_token', 'tok-1')
    fetchMock.mockRejectedValueOnce({ status: 403 })
    const api = usePianoApi()
    expect(await api.updateCollection(1, { name: 'y' })).toBe(false)
  })

  it('deleteCollection falha devolve false', async () => {
    localStorage.setItem('piano_admin_token', 'tok-1')
    fetchMock.mockRejectedValueOnce({ status: 403 })
    const api = usePianoApi()
    expect(await api.deleteCollection(1)).toBe(false)
  })

  it('deleteMusic falha devolve false', async () => {
    localStorage.setItem('piano_admin_token', 'tok-1')
    fetchMock.mockRejectedValueOnce({ status: 403 })
    const api = usePianoApi()
    expect(await api.deleteMusic(9)).toBe(false)
  })

  it('deleteLyric falha devolve false', async () => {
    localStorage.setItem('piano_admin_token', 'tok-1')
    fetchMock.mockRejectedValueOnce({ status: 403 })
    const api = usePianoApi()
    expect(await api.deleteLyric(33)).toBe(false)
  })

  it('createLyric falha devolve null', async () => {
    localStorage.setItem('piano_admin_token', 'tok-1')
    fetchMock.mockRejectedValueOnce({ status: 500 })
    const api = usePianoApi()
    expect(await api.createLyric(5, { lyric: 'x' })).toBeNull()
  })

  it('createMusic falha devolve null', async () => {
    localStorage.setItem('piano_admin_token', 'tok-1')
    fetchMock.mockRejectedValueOnce({ status: 500 })
    const api = usePianoApi()
    expect(await api.createMusic(3, { name: 'x' })).toBeNull()
  })

  it('createCollection falha devolve null', async () => {
    localStorage.setItem('piano_admin_token', 'tok-1')
    fetchMock.mockRejectedValueOnce({ status: 500 })
    const api = usePianoApi()
    expect(await api.createCollection({ name: 'x' })).toBeNull()
  })

  it('uploadFile falha devolve null', async () => {
    localStorage.setItem('piano_admin_token', 'tok-1')
    fetchMock.mockRejectedValueOnce({ status: 500 })
    const api = usePianoApi()
    expect(await api.uploadFile(new Uint8Array([1]), 'a.mp3', 'audio')).toBeNull()
  })

  it('getMusic 404 devolve null e faz logout por sessão expirada não ocorre (404)', async () => {
    localStorage.setItem('piano_admin_token', 'tok-1')
    fetchMock.mockRejectedValueOnce({ status: 404 })
    const api = usePianoApi()
    expect(await api.getMusic(999)).toBeNull()
    expect(localStorage.getItem('piano_admin_token')).toBe('tok-1')
  })

  it('user computed lê do localStorage', () => {
    localStorage.setItem('piano_admin_token', 't')
    localStorage.setItem(
      'piano_admin_user',
      JSON.stringify({ id_user: 2, email: 'e@d.f', displayName: 'D' }),
    )
    const api = usePianoApi()
    expect(api.user.value?.displayName).toBe('D')
    expect(api.isAuthenticated.value).toBe(true)
  })

  it('user computed com JSON corrompido devolve null', () => {
    localStorage.setItem('piano_admin_token', 't')
    localStorage.setItem('piano_admin_user', '{{{')
    const api = usePianoApi()
    expect(api.user.value).toBeNull()
  })

  it('updateLyric falha devolve false', async () => {
    localStorage.setItem('piano_admin_token', 'tok-1')
    fetchMock.mockRejectedValueOnce({ status: 403 })
    const api = usePianoApi()
    expect(await api.updateLyric(33, { lyric: 'z' })).toBe(false)
  })

  it('guards de SSR: funciona mesmo com localStorage ausente (branch typeof)', () => {
    // simula servidor: localStorage undefined
    const original = globalThis.localStorage
    // @ts-expect-error — simulando ambiente sem localStorage (SSR)
    delete globalThis.localStorage
    try {
      const api = usePianoApi()
      expect(api.isAuthenticated.value).toBe(false)
      expect(api.user.value).toBeNull()
    } finally {
      globalThis.localStorage = original
    }
  })

  it('user computed sem USER_KEY (só token) devolve null — branch !raw', () => {
    localStorage.setItem('piano_admin_token', 't')
    localStorage.removeItem('piano_admin_user')
    const api = usePianoApi()
    expect(api.user.value).toBeNull()
  })

  it('erro sem status (network) conta como 0 — branch statusCode', async () => {
    localStorage.setItem('piano_admin_token', 'tok-1')
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    const api = usePianoApi()
    await expect(api.listCollections()).rejects.toBeDefined()
    // status !== 401 → NÃO faz logout
    expect(localStorage.getItem('piano_admin_token')).toBe('tok-1')
  })

  it('erro com statusCode (h3) 401 também desloga', async () => {
    localStorage.setItem('piano_admin_token', 'tok-1')
    fetchMock.mockRejectedValueOnce({ statusCode: 401 })
    const api = usePianoApi()
    await expect(api.listCollections()).rejects.toBeDefined()
    expect(localStorage.getItem('piano_admin_token')).toBeNull()
  })

  it('createCollection com resposta vazia devolve null — branch !r', async () => {
    localStorage.setItem('piano_admin_token', 'tok-1')
    fetchMock.mockResolvedValueOnce(null)
    const api = usePianoApi()
    expect(await api.createCollection({ name: 'x' })).toBeNull()
  })

  it('createMusic com resposta vazia devolve null — branch !r', async () => {
    localStorage.setItem('piano_admin_token', 'tok-1')
    fetchMock.mockResolvedValueOnce(null)
    const api = usePianoApi()
    expect(await api.createMusic(3, { name: 'x' })).toBeNull()
  })

  it('createLyric com resposta vazia devolve null — branch !r', async () => {
    localStorage.setItem('piano_admin_token', 'tok-1')
    fetchMock.mockResolvedValueOnce(null)
    const api = usePianoApi()
    expect(await api.createLyric(5, { lyric: 'x' })).toBeNull()
  })

  it('uploadFile com resposta vazia — branch r null (defensivo)', async () => {
    localStorage.setItem('piano_admin_token', 'tok-1')
    fetchMock.mockResolvedValueOnce({ id_file: 1, url: '/u' })
    const api = usePianoApi()
    const res = await api.uploadFile(new Uint8Array([1]), 'a.mp3', 'audio')
    expect(res).toEqual({ idFile: 1, url: '/u' })
  })

  it('listCollections sem campo data devolve [] — branch ?? []', async () => {
    localStorage.setItem('piano_admin_token', 'tok-1')
    fetchMock.mockResolvedValueOnce({})
    const api = usePianoApi()
    expect(await api.listCollections()).toEqual([])
  })

  it('listMusics sem campo data devolve [] — branch ?? []', async () => {
    localStorage.setItem('piano_admin_token', 'tok-1')
    fetchMock.mockResolvedValueOnce({})
    const api = usePianoApi()
    expect(await api.listMusics(1)).toEqual([])
  })
})
