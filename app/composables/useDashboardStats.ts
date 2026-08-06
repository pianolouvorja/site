import { ref, onMounted, onUnmounted } from 'vue'
import type { DashboardStats } from '~/types/dashboard'

const POLL_INTERVAL_MS = 5 * 60 * 1000 // 5 minutos

/**
 * Composable que busca dados do endpoint /api/admin/stats.
 * - Polling automatico a cada 5 minutos
 * - Refresh manual via refresh()
 * - Envio de Firebase ID token no header Authorization
 */
export function useDashboardStats() {
  const stats = ref<DashboardStats | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)
  const lastUpdated = ref<Date | null>(null)

  let pollInterval: ReturnType<typeof setInterval> | null = null

  async function fetchStats() {
    error.value = null

    try {
      // Obter Firebase ID token
      let token: string | null = null
      try {
        const { getToken } = useFirebaseAuth()
        token = await getToken()
      } catch {
        // Firebase nao inicializado — tentar sem token (vai falhar com 401)
      }

      const headers: Record<string, string> = {}
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const data = await $fetch<DashboardStats>('/api/admin/stats', { headers })

      stats.value = data
      lastUpdated.value = new Date(data.updatedAt)
    } catch (e) {
      error.value = (e as Error).message || 'Erro ao buscar dados'
    } finally {
      loading.value = false
    }
  }

  async function refresh() {
    loading.value = true
    await fetchStats()
  }

  // Lifecycle: iniciar polling
  function startPolling() {
    fetchStats()
    pollInterval = setInterval(fetchStats, POLL_INTERVAL_MS)
  }

  function stopPolling() {
    if (pollInterval) {
      clearInterval(pollInterval)
      pollInterval = null
    }
  }

  onMounted(startPolling)
  onUnmounted(stopPolling)

  return { stats, loading, error, lastUpdated, fetchStats, refresh, startPolling, stopPolling }
}
