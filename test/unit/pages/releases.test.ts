import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import ReleasesPage from '~/pages/releases.vue'

const appReleaseWithInstaller = {
  tag_name: 'v1.17.5',
  name: 'PIANO v1.17.5',
  published_at: '2026-08-01T00:00:00Z',
  body: 'Correções de estabilidade.',
  _repo: 'app',
  assets: [
    {
      name: 'LouvorJA---PIANO-Setup-1.17.5.exe',
      browser_download_url:
        'https://github.com/pianolouvorja/app/releases/download/untagged-ade129dd9673126dc496/LouvorJA---PIANO-Setup-1.17.5.exe',
    },
  ],
}

function mountReleasesPage() {
  return mount(ReleasesPage)
}

describe('ReleasesPage', () => {
  beforeEach(() => {
    vi.stubGlobal('useSeoMeta', vi.fn())
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('oferece download direto do instalador publicado sem link ao GitHub', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [appReleaseWithInstaller],
      }),
    )

    const wrapper = mountReleasesPage()
    await flushPromises()
    await wrapper.vm.$nextTick()

    const download = wrapper.get('.release-card__link')
    expect(download.attributes('href')).toBe(appReleaseWithInstaller.assets[0].browser_download_url)
    expect(download.attributes('target')).toBeUndefined()
    expect(wrapper.html()).not.toContain('github.com/orgs/pianolouvorja/repositories')
  })

  it('não apresenta link quando a release não possui instalador direto', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ ...appReleaseWithInstaller, assets: [] }],
      }),
    )

    const wrapper = mountReleasesPage()
    await flushPromises()

    expect(wrapper.find('.release-card__link').exists()).toBe(false)
  })

  it('filtra releases por produto', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          appReleaseWithInstaller,
          {
            tag_name: 'webos-v0.1.16',
            name: 'Palco Receiver webOS v0.1.16',
            published_at: '2026-08-05T00:00:00Z',
            body: 'Suporte a TV.',
            _repo: 'palco-receiver',
            assets: [],
          },
        ],
      }),
    )

    const wrapper = mountReleasesPage()
    await flushPromises()
    await wrapper.vm.$nextTick()

    // Filtro presente com todos os produtos
    const filter = wrapper.get('.releases-filter')
    expect(filter.text().toLowerCase()).toContain('todos')

    // Sem filtro: ambas as releases visíveis
    expect(wrapper.findAll('.release-card')).toHaveLength(2)

    // Filtra por TV: só a release do palco-receiver
    const tvOption = wrapper.get('[data-testid="filter-tv"]')
    await tvOption.trigger('click')
    await wrapper.vm.$nextTick()

    const cards = wrapper.findAll('.release-card')
    expect(cards).toHaveLength(1)
    expect(cards[0].text()).toContain('webos-v0.1.16')
  })

  it('exibe estado vazio quando o filtro não tem releases', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [appReleaseWithInstaller],
      }),
    )

    const wrapper = mountReleasesPage()
    await flushPromises()
    await wrapper.vm.$nextTick()

    await wrapper.get('[data-testid="filter-tv"]').trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.release-card').exists()).toBe(false)
    expect(wrapper.text()).toContain('Nenhuma release')
  })
})
