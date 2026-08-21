import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'

// Override setup.ts useI18n stub with test-specific translations
const testTranslations: Record<string, string> = {
  'download.tv.badge': 'Palco Digital',
  'download.tv.title': 'TV e Palco Digital',
  'download.tv.description': 'Projecao direta em TVs e telas de palco.',
  'download.tv.downloadGeneric': 'Baixar',
  'download.tv.androidtv.name': 'Android TV',
  'download.tv.androidtv.format': 'APK',
  'download.tv.androidtv.hint': 'Instale via pendrive ou ADB.',
  'download.tv.webos.name': 'LG webOS',
  'download.tv.webos.format': 'IPK',
  'download.tv.webos.hint': 'Instale via USB ou Developer Mode.',
  'download.tv.tizen.name': 'Samsung Tizen TV',
  'download.tv.tizen.format': 'TPK',
  'download.tv.tizen.hint': 'Instale via USB ou Tizen Studio Device Manager.',
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
    tizen: {
      url: 'https://github.com/pianolouvorja/palco-receiver/releases/download/v0.1.13/PalcoLouvorJA-Tizen-0.1.0.tpk',
      name: 'PalcoLouvorJA-Tizen-0.1.0.tpk',
      size: 5200000,
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

  it('renders all 6 brand cards (available + WIP)', () => {
    const wrapper = mount(TvDownloadCards, {
      props: { tvData: emptyCategory },
      global: { stubs: ['i'] },
    })
    const cards = wrapper.findAll('.download-card')
    expect(cards).toHaveLength(6)
  })

  it('shows "em breve" message when no assets available', () => {
    const wrapper = mount(TvDownloadCards, {
      props: { tvData: emptyCategory },
      global: { stubs: ['i'] },
    })
    expect(wrapper.text()).toContain('Em breve disponivel')
  })

  it('marks available cards differently from WIP cards', () => {
    const wrapper = mount(TvDownloadCards, {
      props: { tvData: tvWithAssets },
      global: { stubs: ['i'] },
    })
    const cards = wrapper.findAll('.download-card')
    const wipCards = wrapper.findAll('.download-card--wip')
    // 6 total, 3 available (webos + tizen + androidtv), 3 WIP
    expect(cards).toHaveLength(6)
    expect(wipCards).toHaveLength(3)
  })

  it('renders download button for available androidtv asset', () => {
    const wrapper = mount(TvDownloadCards, {
      props: { tvData: tvWithAssets },
      global: { stubs: ['i'] },
    })
    const btns = wrapper.findAll('.download-card__btn')
    // 3 available = 3 download buttons
    expect(btns).toHaveLength(3)
  })

  it('renders WIP status for unavailable brands', () => {
    const wrapper = mount(TvDownloadCards, {
      props: { tvData: emptyCategory },
      global: { stubs: ['i'] },
    })
    const statuses = wrapper.findAll('.download-card__status')
    // All 6 are WIP when no assets
    expect(statuses).toHaveLength(6)
  })

  it('download buttons have correct href and security attrs', () => {
    const wrapper = mount(TvDownloadCards, {
      props: { tvData: tvWithAssets },
      global: { stubs: ['i'] },
    })
    const btns = wrapper.findAll('.download-card__btn')
    for (const btn of btns) {
      expect(btn.attributes('target')).toBe('_blank')
      expect(btn.attributes('rel')).toBe('noopener noreferrer')
      expect(btn.attributes('href')).toContain('https://')
    }
  })

  it('displays version tag when available', () => {
    const wrapper = mount(TvDownloadCards, {
      props: { tvData: tvWithAssets },
      global: { stubs: ['i'] },
    })
    const versions = wrapper.findAll('.download-card__version')
    // 3 available cards show version
    expect(versions).toHaveLength(3)
    expect(versions[0].text()).toContain('v0.1.13')
  })

  it('does not display version on cards when tag is null', () => {
    const wrapper = mount(TvDownloadCards, {
      props: { tvData: emptyCategory },
      global: { stubs: ['i'] },
    })
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

  describe('branding logos', () => {
    it('all cards render brand logos', () => {
      const wrapper = mount(TvDownloadCards, {
        props: { tvData: tvWithAssets },
        global: { stubs: ['i'] },
      })
      const logos = wrapper.findAll('.download-card__brand-logo')
      expect(logos).toHaveLength(6)
    })

    it('logos have correct src for each brand', () => {
      const wrapper = mount(TvDownloadCards, {
        props: { tvData: tvWithAssets },
        global: { stubs: ['i'] },
      })
      const logos = wrapper.findAll('.download-card__brand-logo')
      const srcs = logos.map((l) => l.attributes('src'))
      expect(srcs).toContain('/brand/lg-logo.svg')
      expect(srcs).toContain('/brand/android-tv-logo.svg')
      expect(srcs).toContain('/brand/samsung-logo.svg')
      expect(srcs).toContain('/brand/roku-logo.svg')
      expect(srcs).toContain('/brand/chromecast-logo.svg')
      expect(srcs).toContain('/brand/apple-tv-logo.svg')
    })

    it('logos use lazy loading', () => {
      const wrapper = mount(TvDownloadCards, {
        props: { tvData: tvWithAssets },
        global: { stubs: ['i'] },
      })
      const logos = wrapper.findAll('.download-card__brand-logo')
      for (const logo of logos) {
        expect(logo.attributes('loading')).toBe('lazy')
      }
    })

    it('logos have descriptive alt text', () => {
      const wrapper = mount(TvDownloadCards, {
        props: { tvData: tvWithAssets },
        global: { stubs: ['i'] },
      })
      const logos = wrapper.findAll('.download-card__brand-logo')
      expect(logos[0].attributes('alt')).toBe('LG Smart TV')
      expect(logos[1].attributes('alt')).toBe('Android TV')
      expect(logos[2].attributes('alt')).toBe('Samsung Smart TV')
      expect(logos[3].attributes('alt')).toBe('Apple TV')
    })
  })

  it('cards have data-testid for E2E targeting', () => {
    const wrapper = mount(TvDownloadCards, {
      props: { tvData: tvWithAssets },
      global: { stubs: ['i'] },
    })
    expect(wrapper.find('[data-testid="tv-download-lg"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="tv-download-samsung"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="tv-download-androidTv"]').exists()).toBe(true)
  })
})
