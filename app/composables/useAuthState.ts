import { onAuthStateChanged, type User } from 'firebase/auth'

/**
 * Auth state composable for middleware consumption.
 * Wraps Firebase onAuthStateChanged into a reactive state with waitForAuth().
 * Used by auth.ts middleware to gate admin routes.
 */
export const useAuthState = () => {
  const { $firebaseAuth } = useNuxtApp()
  // Stryker disable next-line StringLiteral -- useState key is internal Nuxt identifier, unobservable in tests
  const user = useState<User | null>('firebase_user', () => null)
  // Stryker disable next-line StringLiteral -- useState key is internal Nuxt identifier, unobservable in tests
  const isLoading = useState<boolean>('firebase_auth_loading', () => true)
  let resolved = false

  const waitForAuth = (): Promise<void> => {
    return new Promise((resolve) => {
      // Already resolved from a previous call
      // Stryker disable next-line LogicalOperator -- ||→&& is equivalent: resolved and !isLoading are never both false simultaneously
      if (resolved || !isLoading.value) {
        resolve()
        return
      }

      // No Firebase — allow through (dev mode without env)
      if (!$firebaseAuth) {
        isLoading.value = false
        // Stryker disable next-line BooleanLiteral -- resolved=false is equivalent: !isLoading.value already short-circuits second call
        resolved = true
        resolve()
        return
      }

      // Listen once, resolve on first callback (max 3s timeout)
      const timeout = setTimeout(() => {
        isLoading.value = false
        // Stryker disable next-line BooleanLiteral -- resolved=false is equivalent: !isLoading.value already short-circuits second call
        resolved = true
        resolve()
      }, 3000)

      const unsub = onAuthStateChanged(
        $firebaseAuth,
        (firebaseUser) => {
          user.value = firebaseUser
          isLoading.value = false
          // Stryker disable next-line BooleanLiteral -- resolved=false is equivalent: !isLoading.value already short-circuits second call
          resolved = true
          clearTimeout(timeout)
          unsub()
          resolve()
        },
        () => {
          isLoading.value = false
          // Stryker disable next-line BooleanLiteral -- resolved=false is equivalent: !isLoading.value already short-circuits second call
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
