import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import RankingPage from '~/pages/ranking.vue'
import pt from '../../../i18n/pt-BR.json'
import en from '../../../i18n/en.json'
import es from '../../../i18n/es.json'

/**
 * SPEC piano-site-public v1.0.0 (RF-02..RF-05): ranking público no site.
 * Dados de GET /api/piano/proxy/v1/custom/ranking?window=week|all
 * (proxy → api.pianolouvorja.com.br, público sem auth, X-Tenant default piano).
 * Regras: NUNCA exibir e-mail; API fora → estado de erro com retry (AC-4);
 * pódio top-3 + lista (AC-2); abas semana/geral; i18n 3 idiomas; SEO meta.
 */

const sample = {
  data: [
    { position: 1, user_id: 10, display_name: 'Ana', total: 120 },
    { position: 2, user_id: 11, display_name: 'Bruno', total: 90 },
    { position: 3, user_id: 12, display_name: 'Carla', total: 75 },
    { position: 4, user_id: 13, display_name: 'Diego', total: 40 },
  ],
}

// $fetch (Nuxt) devolve o payload direto (não é Response com .json()).
const okFetch = () => vi.fn(async (_url?: string) => sample)

function mountPage() {
  const i18n = createI18n({ legacy: false, locale: 'pt', messages: { pt } })
  return mount(RankingPage, {
    global: { plugins: [i18n], mocks: { $t: i18n.global.t } },
  })
}

describe('Ranking público (site)', () => {
  beforeEach(() => {
    // NÃO usar vi.unstubAllGlobals(): desfaria os stubs globais do setup.ts
    // (useI18n, useHead, onMounted etc.). Cada teste substitui $fetch via stub.
  })

  it('busca window=all por default e renderiza pódio + lista', async () => {
    const fetchMock = vi.fn(async (_url: string) => sample)
    vi.stubGlobal('$fetch', fetchMock)
    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.find('[data-testid="ranking-podium"]').exists()).toBe(true)
    const rows = wrapper.findAll('[data-testid="ranking-row"]')
    // 4 entradas: 3 no pódio (não são rows) + 1 na lista
    expect(rows.length + wrapper.findAll('[data-testid="ranking-podium-item"]').length).toBe(4)
    expect(wrapper.text()).toContain('Ana')
    // NUNCA exibir e-mail (AC-3) — o payload não tem e-mail e a página não adiciona
    expect(wrapper.text().toLowerCase()).not.toContain('@')
    expect(String(fetchMock.mock.calls[0]![0])).toContain('window=all')
  })

  it('abas Semana/Geral trocam o window e refazem fetch', async () => {
    const fetchMock = vi.fn(async () => sample)
    vi.stubGlobal('$fetch', fetchMock)
    const wrapper = mountPage()
    await flushPromises()
    const callsBefore = fetchMock.mock.calls.length

    const weekTab = wrapper.find('[data-testid="ranking-tab-week"]')
    expect(weekTab.exists()).toBe(true)
    await weekTab.trigger('click')
    await flushPromises()
    expect(fetchMock.mock.calls.length).toBeGreaterThan(callsBefore)
    const lastUrl = String(fetchMock.mock.calls.at(-1)![0])
    expect(lastUrl).toContain('window=week')
  })

  it('API fora: mostra estado de erro com botão retry (AC-4)', async () => {
    const fetchMock = vi.fn(async () => {
      throw new Error('network down')
    })
    vi.stubGlobal('$fetch', fetchMock)
    const wrapper = mountPage()
    await flushPromises()
    expect(wrapper.find('[data-testid="ranking-error"]').exists()).toBe(true)
    const retry = wrapper.find('[data-testid="ranking-retry"]')
    expect(retry.exists()).toBe(true)
    // retry refaz o fetch
    fetchMock.mockImplementationOnce(async () => sample)
    await retry.trigger('click')
    await flushPromises()
    expect(wrapper.find('[data-testid="ranking-error"]').exists()).toBe(false)
  })

  it('SEO: título da página menciona ranking', async () => {
    vi.stubGlobal('$fetch', okFetch())
    const headSpy = vi.fn()
    vi.stubGlobal('useHead', headSpy)
    mountPage()
    await flushPromises()
    const headCall = headSpy.mock.calls.at(-1)?.[0] as
      | { title?: () => string }
      | undefined
    const title =
      typeof headCall?.title === 'function' ? headCall.title() : String(headCall?.title ?? '')
    expect(title.toLowerCase()).toContain('ranking')
  })

  it('i18n: renderiza nos 3 idiomas sem quebrar', async () => {
    vi.stubGlobal('$fetch', okFetch())
    for (const [locale, messages] of Object.entries({ pt, en, es })) {
      const i18n = createI18n({
        legacy: false,
        locale,
        messages: { [locale]: messages },
      })
      const wrapper = mount(RankingPage, {
        global: { plugins: [i18n], mocks: { $t: i18n.global.t } },
      })
      await flushPromises()
      expect(wrapper.find('[data-testid="ranking-podium"]').exists()).toBe(true)
      wrapper.unmount()
    }
  })
})
