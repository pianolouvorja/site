import { signInWithEmailAndPassword, signOut, onAuthStateChanged, type User } from 'firebase/auth'

// Extracted for testability — can be overridden in tests via __setIsClientForTesting
let _isClient = true

export function __setIsClientForTesting(val: boolean) {
  _isClient = val
}

export function useFirebaseAuth() {
  const user = useState<User | null>('firebase_user', () => null)
  const loading = useState<boolean>('firebase_loading', () => true)
  const error = useState<string | null>('firebase_error', () => null)

  // Client-only initialization
  let auth: ReturnType<typeof useFirebaseClient> | null = null

  if (_isClient) {
    try {
      auth = useFirebaseClient()
      onMounted(() => {
        onAuthStateChanged(auth!, (u) => {
          user.value = u
          loading.value = false
        })
      })
    } catch {
      // Firebase not configured — leave loading=false so middleware allows through
      loading.value = false
    }
  }

  async function login(email: string, password: string) {
    error.value = null
    if (!auth) throw new Error('Firebase not initialized')
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      user.value = cred.user
    } catch (e) {
      error.value = (e as Error).message
      throw e
    }
  }

  async function logout() {
    if (!auth) return
    await signOut(auth)
    user.value = null
  }

  async function getToken(): Promise<string | null> {
    if (!user.value) return null
    return await user.value.getIdToken()
  }

  return { user, loading, error, login, logout, getToken }
}
