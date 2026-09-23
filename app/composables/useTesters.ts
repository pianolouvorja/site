import { computed, ref } from 'vue'
import { parseTesterReports, type TesterReport } from '~/utils/testers-sheet'

/**
 * useTesters — fetch dos relatos da planilha do Form de testadores.
 * Fonte: gviz CSV público (Sheet "qualquer pessoa com o link - leitor").
 * URL vem de NUXT_PUBLIC_TESTERS_SHEET_URL (runtimeConfig.public).
 * Env ausente ou fetch falho → null (página mostra empty-state, sem erro).
 */
export function useTestersReports() {
  const config = useRuntimeConfig()
  const sheetUrl = String(config.public.testersSheetUrl ?? '').trim()
  const enabled = sheetUrl.length > 0

  const reports = ref<TesterReport[] | null>(null)
  const pending = ref(enabled)

  async function load(): Promise<void> {
    if (!enabled) {
      pending.value = false
      return
    }
    try {
      const csv: unknown = await $fetch(sheetUrl, { responseType: 'text' })
      if (typeof csv !== 'string') throw new Error('testers: non-string csv payload')
      reports.value = parseTesterReports(csv)
    } catch {
      reports.value = null
    } finally {
      pending.value = false
    }
  }

  onMounted(() => {
    void load()
  })

  const hasReports = computed(() => (reports.value?.length ?? 0) > 0)

  return { reports, pending, hasReports, enabled }
}
