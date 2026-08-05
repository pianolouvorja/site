import { onAuthStateChanged, type User } from 'firebase/auth'

/**
 * Auth state composable for middleware consumption.
 * Wraps Firebase onAuthStateChanged into a reactive state with waitForAuth().
 * Used by auth.ts middleware to gate admin routes.
 */
export const useAuthState = () => {
  const { $firebaseAuth } = useNuxtApp()
  const user = useState<User | null>('firebase_user', () => null)
  const isLoading = useState<boolean>('firebase_auth_loading', () => true)
  let resolved = false

  const waitForAuth = (): Promise<void> => {
    return new Promise((resolve) => {
      // Already resolved from a previous call
      if (resolved || !isLoading.value) {
        resolve()
        return
      }

      // No Firebase — allow through (dev mode without env)
      if (!$firebaseAuth) {
        isLoading.value = false
        resolved = true
        resolve()
        return
      }

      // Listen once, resolve on first callback (max 3s timeout)
      const timeout = setTimeout(() => {
        isLoading.value = false
        resolved = true
        resolve()
      }, 3000)

      const unsub = onAuthStateChanged(
        $firebaseAuth,
        (firebaseUser) => {
          user.value = firebaseUser
          isLoading.value = false
          resolved = true
          clearTimeout(timeout)
          unsub()
          resolve()
        },
        () => {
          isLoading.value = false
          resolved = true
          clearTimeout(timeout)
          unsub()
          resolve()
        },
      )
    })
  }

  return { user, isLoading, waitForAuth }
}
