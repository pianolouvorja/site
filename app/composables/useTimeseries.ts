import { ref, onMounted, onUnmounted } from 'vue'

export type TimeseriesPeriod = '7d' | '30d' | '12m'
export interface TimeseriesPoint {
  key: string
  value: number
}
export interface TimeseriesResponse {
  period: TimeseriesPeriod
  buckets: string[]
  visits: TimeseriesPoint[]
  subscribers: TimeseriesPoint[]
  downloads: TimeseriesPoint[]
}

const POLL_INTERVAL_MS = 5 * 60 * 1000

export function useTimeseries(initialPeriod: TimeseriesPeriod = '30d') {
  const period = ref<TimeseriesPeriod>(initialPeriod)
  const data = ref<TimeseriesResponse | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)
  let poll: ReturnType<typeof setInterval> | null = null

  async function refresh() {
    loading.value = true
    error.value = null
    try {
      let token: string | null = null
      try {
        token = await useFirebaseAuth().getToken()
      } catch {
        /* auth optional */
      }
      const headers: Record<string, string> = {}
      if (token) headers.Authorization = `Bearer ${token}`
      data.value = await $fetch<TimeseriesResponse>('/api/admin/timeseries', {
        query: { period: period.value },
        headers,
      })
    } catch (e) {
      error.value = (e as Error).message || 'Erro ao buscar séries temporais'
    } finally {
      loading.value = false
    }
  }

  function setPeriod(value: TimeseriesPeriod) {
    period.value = value
    void refresh()
  }

  function startPolling() {
    void refresh()
    poll = setInterval(refresh, POLL_INTERVAL_MS)
  }

  function stopPolling() {
    if (poll) {
      clearInterval(poll)
      poll = null
    }
  }

  onMounted(startPolling)
  onUnmounted(stopPolling)

  return { period, data, loading, error, refresh, setPeriod, startPolling, stopPolling }
}

export default useTimeseries
