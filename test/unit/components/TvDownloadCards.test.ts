import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'

// Override setup.ts useI18n stub with test-specific translations
const testTranslations: Record<string, string> = {
  'download.tv.badge': 'Palco Digital',
  'download.tv.title': 'TV e Palco Digital',
  'download.tv.description': 'Projecao direta em TVs e telas de palco.',
  'download.tv.androidtv.name': 'Android TV',
  'download.tv.androidtv.format': 'APK',
  'download.tv.androidtv.arch': 'Android TV 8.0+',
  'download.tv.androidtv.downloadLabel': 'Baixar para Android TV',
  'download.tv.androidtv.hint': 'Instale via pendrive ou ADB.',
  'download.tv.webos.name': 'LG webOS',
  'download.tv.webos.format': 'IPK',
  'download.tv.webos.arch': 'webOS 4.0+',
  'download.tv.webos.downloadLabel': 'Baixar para LG webOS',
  'download.tv.webos.hint': 'Instale via USB ou Developer Mode.',
  'download.tv.noAssets': 'Em breve disponivel.',
  'download.tv.features.realtime': 'Projecao em tempo real',
  'download.tv.features.multicast': 'Multi-tela via rede local',
  'download.tv.features.autodiscover': 'Descoberta automatica na rede',
}

beforeEach(() => {
  vi.stubGlobal('useI18n', () => ({
    t: (key: string) => testTranslations[key] || key,
    locale: { value: 'pt-BR' },
    locales: { value: [] },
    setLocale: vi.fn(),
  }))
})

import TvDownloadCards from '~/components/TvDownloadCards.vue'
import type { CategoryResult } from '~/utils/downloads'

const emptyCategory: CategoryResult = { repo: 'palco-receiver', tag: null, assets: {} }

const tvWithAssets: CategoryResult = {
  repo: 'palco-receiver',
  tag: 'v0.1.13',
  assets: {
    androidtv: {
      url: 'https://github.com/pianolouvorja/palco-receiver/releases/download/v0.1.13/PalcoLouvorJA-AndroidTV-0.1.0.apk',
      name: 'PalcoLouvorJA-AndroidTV-0.1.0.apk',
      size: 46000000,
    },
    webos: {
      url: 'https://github.com/pianolouvorja/palco-receiver/releases/download/v0.1.13/com.piano.louvorja.palco_0.1.13_all.ipk',
      name: 'com.piano.louvorja.palco_0.1.13_all.ipk',
      size: 3500000,
    },
  },
}

const tvOnlyAndroid: CategoryResult = {
  repo: 'palco-receiver',
  tag: 'v0.1.13',
  assets: {
    androidtv: {
      url: 'https://example.com/tv.apk',
      name: 'PalcoLouvorJA-AndroidTV-0.1.0.apk',
      size: 46000000,
    },
  },
}

describe('TvDownloadCards', () => {
  it('renders section with badge and title', () => {
    const wrapper = mount(TvDownloadCards, {
      props: { tvData: emptyCategory },
      global: { stubs: ['i'] },
    })
    expect(wrapper.find('.download-section').exists()).toBe(true)
    expect(wrapper.find('.download-section__badge').exists()).toBe(true)
    expect(wrapper.find('.download-section__title').exists()).toBe(true)
  })

  it('shows "em breve" message when no assets available', () => {
    const wrapper = mount(TvDownloadCards, {
      props: { tvData: emptyCategory },
      global: { stubs: ['i'] },
    })
    expect(wrapper.text()).toContain('Em breve disponivel')
    expect(wrapper.findAll('.download-card')).toHaveLength(0)
  })

  it('renders 2 cards when both androidtv and webos assets exist', () => {
    const wrapper = mount(TvDownloadCards, {
      props: { tvData: tvWithAssets },
      global: { stubs: ['i'] },
    })
    const cards = wrapper.findAll('.download-card')
    expect(cards).toHaveLength(2)
  })

  it('renders 1 card when only androidtv asset exists', () => {
    const wrapper = mount(TvDownloadCards, {
      props: { tvData: tvOnlyAndroid },
      global: { stubs: ['i'] },
    })
    const cards = wrapper.findAll('.download-card')
    expect(cards).toHaveLength(1)
    expect(cards[0].text()).toContain('Android TV')
  })

  it('renders download button with correct href for androidtv', () => {
    const wrapper = mount(TvDownloadCards, {
      props: { tvData: tvWithAssets },
      global: { stubs: ['i'] },
    })
    const cards = wrapper.findAll('.download-card')
    const btn = cards[0].find('.download-card__btn')
    expect(btn.exists()).toBe(true)
    expect(btn.attributes('href')).toBe(
      'https://github.com/pianolouvorja/palco-receiver/releases/download/v0.1.13/PalcoLouvorJA-AndroidTV-0.1.0.apk',
    )
  })

  it('renders download button with correct href for webos', () => {
    const wrapper = mount(TvDownloadCards, {
      props: { tvData: tvWithAssets },
      global: { stubs: ['i'] },
    })
    const cards = wrapper.findAll('.download-card')
    const btn = cards[1].find('.download-card__btn')
    expect(btn.attributes('href')).toBe(
      'https://github.com/pianolouvorja/palco-receiver/releases/download/v0.1.13/com.piano.louvorja.palco_0.1.13_all.ipk',
    )
  })

  it('displays version tag when available', () => {
    const wrapper = mount(TvDownloadCards, {
      props: { tvData: tvWithAssets },
      global: { stubs: ['i'] },
    })
    expect(wrapper.text()).toContain('v0.1.13')
  })

  it('does not display version when tag is null', () => {
    const wrapper = mount(TvDownloadCards, {
      props: { tvData: emptyCategory },
      global: { stubs: ['i'] },
    })
    // No version tag rendered in "coming soon" state
    const versionEls = wrapper.findAll('.download-card__version')
    expect(versionEls).toHaveLength(0)
  })

  it('renders features list with 3 items', () => {
    const wrapper = mount(TvDownloadCards, {
      props: { tvData: tvWithAssets },
      global: { stubs: ['i'] },
    })
    const features = wrapper.findAll('.download-features li')
    expect(features).toHaveLength(3)
  })

  it('download buttons have target _blank and rel noopener noreferrer', () => {
    const wrapper = mount(TvDownloadCards, {
      props: { tvData: tvWithAssets },
      global: { stubs: ['i'] },
    })
    const btns = wrapper.findAll('.download-card__btn')
    for (const btn of btns) {
      expect(btn.attributes('target')).toBe('_blank')
      expect(btn.attributes('rel')).toBe('noopener noreferrer')
    }
  })
})
