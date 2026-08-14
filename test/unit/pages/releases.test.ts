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
})
