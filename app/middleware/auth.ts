/**
 * Auth middleware — protects admin routes.
 * Redirects to /admin/login if not authenticated.
 * Waits for Firebase auth state to resolve before checking.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  // Skip on server — Firebase auth is client-only
  if (import.meta.server) return

  // Skip login page itself
  if (to.path === '/admin/login') return

  const { user, loading } = useFirebaseAuth()

  // Wait for auth state to resolve (max 3s)
  let attempts = 0
  while (loading.value && attempts < 30) {
    await new Promise((r) => setTimeout(r, 100))
    attempts++
  }

  if (!user.value) {
    return navigateTo('/admin/login')
  }
})
