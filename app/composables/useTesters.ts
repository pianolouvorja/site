import { computed, ref } from 'vue'
import { type TesterProfile } from '~/data/testers'
import {
  parseTesterProfiles,
  parseTesterReports,
  type SheetTester,
  type TesterReport,
} from '~/utils/testers-sheet'

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
  const positiveReports = ref<TesterReport[] | null>(null) // só status 'ok'

  async function load(): Promise<void> {
    if (!enabled) {
      pending.value = false
      positiveReports.value = null
      return
    }
    try {
      const csv: unknown = await $fetch(sheetUrl, { responseType: 'text' })
      if (typeof csv !== 'string') throw new Error('testers: non-string csv payload')
      const all = parseTesterReports(csv)
      reports.value = all
      positiveReports.value = all.filter((r) => r.status === 'ok')
    } catch {
      reports.value = null
      positiveReports.value = null
    } finally {
      pending.value = false
    }
  }

  onMounted(() => {
    void load()
  })

  const hasReports = computed(() => (reports.value?.length ?? 0) > 0)
  const hasPositiveReports = computed(() => (positiveReports.value?.length ?? 0) > 0)

  return { reports, positiveReports, pending, hasReports, hasPositiveReports, enabled }
}

/**
 * useTestersRoster — fetch dinâmico dos testadores cadastrados (aba 'testadores').
 * Mesma sheet dos relatos, mas com ?sheet=testadores no gviz.
 * Fallback: se env ausente/fetch falho, usa o roster hardcoded de data/testers.ts.
 * Bio hardcoded (i18n) vence quando a sheet não tem bio preenchida.
 */
export function useTestersRoster() {
  const config = useRuntimeConfig()
  const sheetUrl = String(config.public.testersSheetUrl ?? '').trim()
  const enabled = sheetUrl.length > 0

  const sheetTesters = ref<SheetTester[] | null>(null)
  const pending = ref(enabled)

  async function load(): Promise<void> {
    if (!enabled) {
      pending.value = false
      return
    }
    try {
      const sep = sheetUrl.includes('?') ? '&' : '?'
      const csv: unknown = await $fetch(`${sheetUrl}${sep}sheet=testadores`, {
        responseType: 'text',
      })
      if (typeof csv !== 'string') throw new Error('testers: non-string csv payload')
      const parsed = parseTesterProfiles(csv)
      sheetTesters.value = parsed.length > 0 ? parsed : null
    } catch {
      sheetTesters.value = null
    } finally {
      pending.value = false
    }
  }

  onMounted(() => {
    void load()
  })

  /**
   * Roster final: apenas quem se cadastrou na sheet — sem fallback hardcoded.
   * Caique/roster antigo removido; só entra quem vier do Form de cadastro.
   */
  const testers = computed<TesterProfile[]>(() => {
    const fromSheet = sheetTesters.value
    if (fromSheet && fromSheet.length > 0) {
      return fromSheet.map((t) => ({
        id: t.id,
        name: t.name,
        avatar: t.avatar,
        focus: t.focus.length > 0 ? t.focus : ['community'],
        links: t.links,
      }))
    }
    return []
  })

  /** id → bio vinda da sheet (vazio pros hardcoded, que usam i18n). */
  const sheetBios = computed<Record<string, string>>(() => {
    const map: Record<string, string> = {}
    for (const t of sheetTesters.value ?? []) map[t.id] = t.bio
    return map
  })

  /** id → mês de entrada ('desde') vinda da sheet. */
  const sinceById = computed<Record<string, string>>(() => {
    const map: Record<string, string> = {}
    for (const t of sheetTesters.value ?? []) map[t.id] = t.since
    return map
  })

  return { testers, sheetBios, sinceById, pending, enabled }
}
