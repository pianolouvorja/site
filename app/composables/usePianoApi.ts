/**
 * Cliente da API custom do PIANO (coletâneas/músicas/estrofes) para o
 * painel admin. O site fala DIRETO com a API via proxy server-side
 * (/api/piano/proxy → api.pianolouvorja.com.br) para evitar CORS.
 *
 * Auth: login próprio da API (e-mail/senha), token Bearer persistido em
 * localStorage. 401 em qualquer chamada = sessão expirada → logout local.
 */
import { ref, computed } from 'vue'

const TOKEN_KEY = 'piano_admin_token'
const USER_KEY = 'piano_admin_user'

export type PianoUser = {
  id_user: number
  email: string
  displayName: string
}

export type PianoSession = { token: string; user: PianoUser }

export type Collection = {
  id: number
  name: string
  description: string | null
  coverUrl?: string | null
  ownerId?: number | null
  authorName?: string | null
  musicsCount: number
  visibility?: 'public' | 'private' | string
  is_owner?: number | boolean
}

export type Music = {
  id: number
  name: string
  duration?: number | null
  hasAudio?: boolean
  audioUrl?: string | null
  officialMusicId?: number | null
}

export type Lyric = {
  id: number
  lyric: string
  time?: string
  order: number
}

function readToken(): string | null {
  if (typeof localStorage === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function usePianoApi() {
  const token = ref<string | null>(readToken())

  const user = computed<PianoUser | null>(() => {
    if (typeof localStorage === 'undefined') return null
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw) as PianoUser
    } catch {
      return null
    }
  })

  const isAuthenticated = computed(() => Boolean(token.value))

  function saveSession(session: PianoSession): void {
    token.value = session.token
    localStorage.setItem(TOKEN_KEY, session.token)
    localStorage.setItem(USER_KEY, JSON.stringify(session.user))
  }

  function logout(): void {
    token.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  async function request<T>(
    path: string,
    options: { method?: string; body?: unknown } = {},
  ): Promise<T> {
    const headers: Record<string, string> = {}
    const current = readToken()
    if (current) headers.Authorization = `Bearer ${current}`
    let body = options.body
    if (body !== undefined && !(body instanceof FormData)) {
      headers['content-type'] = 'application/json'
      body = JSON.stringify(body)
    }
    try {
      // $fetch é global do Nuxt — acessar via globalThis p/ testabilidade
      const doFetch = globalThis.$fetch as unknown as <R>(
        url: string,
        opts?: Record<string, unknown>,
      ) => Promise<R>
      return await doFetch<T>(`/api/piano/proxy${path}`, {
        method: options.method ?? 'GET',
        headers,
        body,
      })
    } catch (error) {
      const status =
        (error as { status?: number; statusCode?: number }).status ??
        (error as { statusCode?: number }).statusCode ??
        0
      if (status === 401) logout()
      throw error
    }
  }

  async function login(email: string, password: string): Promise<PianoSession> {
    const session = await request<PianoSession>('/v1/custom/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    saveSession(session)
    return session
  }

  // ---- Coletâneas ----
  async function listCollections(): Promise<Collection[]> {
    const res = await request<{ data?: Collection[] }>('/v1/custom/collections')
    return res.data ?? []
  }

  async function createCollection(input: {
    name: string
    description?: string
    visibility?: 'public' | 'private'
  }): Promise<{ id: number } | null> {
    try {
      const r = await request<{ id_collection: number } | null>('/v1/custom/collections', {
        method: 'POST',
        body: input,
      })
      return r ? { id: (r as unknown as { id_collection: number }).id_collection } : null
    } catch {
      return null
    }
  }

  async function updateCollection(
    id: number,
    patch: {
      name?: string
      description?: string | null
      visibility?: 'public' | 'private'
    },
  ): Promise<boolean> {
    try {
      await request(`/v1/custom/collections/${id}`, {
        method: 'PUT',
        body: patch,
      })
      return true
    } catch {
      return false
    }
  }

  async function deleteCollection(id: number): Promise<boolean> {
    try {
      await request(`/v1/custom/collections/${id}`, { method: 'DELETE' })
      return true
    } catch {
      return false
    }
  }

  // ---- Músicas ----
  async function listMusics(collectionId: number): Promise<Music[]> {
    const res = await request<{ data?: Music[] }>(`/v1/custom/collections/${collectionId}/musics`)
    return res.data ?? []
  }

  async function getMusic(id: number): Promise<{
    name: string
    audio_url?: string | null
    official_music_id?: number | null
    lyrics?: Array<{
      id_lyric: number
      lyric: string
      time: string
      order?: number
      image_url?: string | null
    }>
  } | null> {
    try {
      return await request('/v1/custom/musics/' + id)
    } catch {
      return null
    }
  }

  async function createMusic(
    collectionId: number,
    input: { name?: string; lyric?: string; official_music_id?: number },
  ): Promise<{ id: number } | null> {
    try {
      const r = await request<{ id_music: number } | null>(
        `/v1/custom/collections/${collectionId}/musics`,
        { method: 'POST', body: input },
      )
      return r ? { id: (r as unknown as { id_music: number }).id_music } : null
    } catch {
      return null
    }
  }

  async function updateMusic(
    id: number,
    patch: {
      name?: string
      lyric?: string
      id_file_audio?: number | null
      id_file_image?: number | null
    },
  ): Promise<boolean> {
    try {
      await request(`/v1/custom/musics/${id}`, { method: 'PUT', body: patch })
      return true
    } catch {
      return false
    }
  }

  async function deleteMusic(id: number): Promise<boolean> {
    try {
      await request(`/v1/custom/musics/${id}`, { method: 'DELETE' })
      return true
    } catch {
      return false
    }
  }

  // ---- Estrofes ----
  async function createLyric(
    musicId: number,
    input: { lyric: string; time?: string; order?: number },
  ): Promise<{ id: number } | null> {
    try {
      const r = await request<{ id_lyric: number } | null>(`/v1/custom/musics/${musicId}/lyrics`, {
        method: 'POST',
        body: input,
      })
      return r ? { id: (r as unknown as { id_lyric: number }).id_lyric } : null
    } catch {
      return null
    }
  }

  async function updateLyric(
    id: number,
    patch: { lyric?: string; time?: string; order?: number },
  ): Promise<boolean> {
    try {
      await request(`/v1/custom/lyrics/${id}`, { method: 'PUT', body: patch })
      return true
    } catch {
      return false
    }
  }

  async function deleteLyric(id: number): Promise<boolean> {
    try {
      await request(`/v1/custom/lyrics/${id}`, { method: 'DELETE' })
      return true
    } catch {
      return false
    }
  }

  // ---- Arquivos (MP3/capas) ----
  async function uploadFile(
    bytes: Uint8Array,
    filename: string,
    kind: 'audio' | 'imagens',
  ): Promise<{ idFile: number; url: string } | null> {
    const form = new FormData()
    form.append('file', new Blob([bytes as BlobPart]), filename)
    form.append('kind', kind)
    try {
      const r = await request<{ id_file: number; url: string }>('/v1/custom/files', {
        method: 'POST',
        body: form,
      })
      return { idFile: r.id_file, url: r.url }
    } catch {
      return null
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    login,
    logout,
    request,
    listCollections,
    createCollection,
    updateCollection,
    deleteCollection,
    listMusics,
    getMusic,
    createMusic,
    updateMusic,
    deleteMusic,
    createLyric,
    updateLyric,
    deleteLyric,
    uploadFile,
  }
}
