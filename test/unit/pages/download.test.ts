import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import DownloadPage from '~/pages/download.vue'

const releaseWithoutDesktopAssets = {
  tag_name: 'v1.17.5',
  assets: [],
}

function mountDownloadPage() {
  return mount(DownloadPage, {
    global: {
      stubs: {
        ClientOnly: { template: '<slot />' },
      },
    },
  })
}

describe('DownloadPage', () => {
  beforeEach(() => {
    vi.stubGlobal('useSeoMeta', vi.fn())
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => releaseWithoutDesktopAssets,
      }),
    )
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('usa URLs diretas dos assets publicados para os downloads disponíveis', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          tag_name: 'v1.17.5',
          assets: [
            {
              name: 'LouvorJA.-.PIANO-1.17.5.AppImage',
              browser_download_url:
                'https://github.com/pianolouvorja/app/releases/download/v1.17.5/LouvorJA.-.PIANO-1.17.5.AppImage',
              size: 168657109,
            },
            {
              name: 'LouvorJA.-.PIANO.Setup.1.17.5.exe',
              browser_download_url:
                'https://github.com/pianolouvorja/app/releases/download/v1.17.5/LouvorJA.-.PIANO.Setup.1.17.5.exe',
              size: 127700720,
            },
          ],
        }),
      }),
    )

    const wrapper = mountDownloadPage()
    await flushPromises()

    const downloadControls = wrapper.findAll('.download-cards .download-card__btn')

    expect(downloadControls[0]?.attributes('href')).toContain('/releases/download/v1.17.5/')
    expect(downloadControls[1]?.attributes('href')).toContain('/releases/download/v1.17.5/')
  })

  it('não redireciona para o repositório quando não há asset para uma plataforma', async () => {
    const wrapper = mountDownloadPage()
    await flushPromises()

    const downloadControls = wrapper.findAll('.download-cards .download-card__btn')

    expect(downloadControls).toHaveLength(3)
    expect(downloadControls.every((control) => control.element.tagName === 'BUTTON')).toBe(true)
    expect(downloadControls.every((control) => control.attributes('disabled') !== undefined)).toBe(
      true,
    )
    expect(wrapper.html()).not.toContain('https://github.com/pianolouvorja/app/releases')
  })
})
