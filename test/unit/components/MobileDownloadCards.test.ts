import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'

// Override setup.ts useI18n stub with test-specific translations
const testTranslations: Record<string, string> = {
  'download.mobile.badge': 'Companion App',
  'download.mobile.title': 'Mobile',
  'download.mobile.description': 'Controle remoto para o PIANO.',
  'download.mobile.android.name': 'Android',
  'download.mobile.android.format': 'APK',
  'download.mobile.android.arch': 'Android 8.0+',
  'download.mobile.android.downloadLabel': 'Baixar para Android',
  'download.mobile.android.hint': 'Instale e conecte ao PIANO na mesma rede.',
  'download.mobile.ios.name': 'iOS',
  'download.mobile.ios.format': 'IPA',
  'download.mobile.ios.arch': 'iOS 16+',
  'download.mobile.ios.downloadLabel': 'Baixar para iOS',
  'download.mobile.ios.hint': 'Em breve na App Store.',
  'download.mobile.noAssets': 'Em breve disponivel para download.',
  'download.mobile.useWebInstead': 'Usar web app no celular',
  'download.mobile.features.remote': 'Controle remoto do PIANO',
  'download.mobile.features.network': 'Funciona na mesma rede local',
  'download.mobile.features.offline': 'Modo offline para slides',
}

beforeEach(() => {
  vi.stubGlobal('useI18n', () => ({
    t: (key: string) => testTranslations[key] || key,
    locale: { value: 'pt-BR' },
    locales: { value: [] },
    setLocale: vi.fn(),
  }))
})

import MobileDownloadCards from '~/components/MobileDownloadCards.vue'
import type { CategoryResult } from '~/utils/downloads'

const emptyCategory: CategoryResult = { repo: 'apk', tag: null, assets: {} }

const mobileWithAsset: CategoryResult = {
  repo: 'apk',
  tag: 'v0.1.53',
  assets: {
    android: {
      url: 'https://github.com/pianolouvorja/apk/releases/download/v0.1.53/louvorja-piano-0.1.19.apk',
      name: 'louvorja-piano-0.1.19.apk',
      size: 70000000,
    },
  },
}

const APP_URL = 'https://app.pianolouvorja.com.br'

const mobileWithIosAsset: CategoryResult = {
  repo: 'apk',
  tag: 'v0.1.53',
  assets: {
    ios: {
      url: 'https://github.com/pianolouvorja/apk/releases/download/v0.1.53/app.ipa',
      name: 'app.ipa',
      size: 80000000,
    },
  },
}

describe('MobileDownloadCards', () => {
  it('renders section with badge and title', () => {
    const wrapper = mount(MobileDownloadCards, {
      props: { mobileData: emptyCategory, appUrl: APP_URL },
      global: { stubs: ['i'] },
    })
    expect(wrapper.find('.download-section').exists()).toBe(true)
    expect(wrapper.find('.download-section__badge').exists()).toBe(true)
    expect(wrapper.find('.download-section__title').exists()).toBe(true)
  })

  it('shows "em breve" state when no assets and web fallback button', () => {
    const wrapper = mount(MobileDownloadCards, {
      props: { mobileData: emptyCategory, appUrl: APP_URL },
      global: { stubs: ['i'] },
    })
    expect(wrapper.text()).toContain('Em breve disponivel')
    expect(wrapper.findAll('.download-card')).toHaveLength(0)
    const webBtn = wrapper.find('.download-card__btn--large')
    expect(webBtn.exists()).toBe(true)
    expect(webBtn.attributes('href')).toBe(APP_URL)
  })

  it('renders android card when android asset exists', () => {
    const wrapper = mount(MobileDownloadCards, {
      props: { mobileData: mobileWithAsset, appUrl: APP_URL },
      global: { stubs: ['i'] },
    })
    const cards = wrapper.findAll('.download-card')
    expect(cards).toHaveLength(1)
    expect(cards[0].text()).toContain('Android')
  })

  it('renders download button with correct href', () => {
    const wrapper = mount(MobileDownloadCards, {
      props: { mobileData: mobileWithAsset, appUrl: APP_URL },
      global: { stubs: ['i'] },
    })
    const btn = wrapper.find('.download-card__btn')
    expect(btn.exists()).toBe(true)
    expect(btn.attributes('href')).toBe(
      'https://github.com/pianolouvorja/apk/releases/download/v0.1.53/louvorja-piano-0.1.19.apk',
    )
  })

  it('displays version tag when available', () => {
    const wrapper = mount(MobileDownloadCards, {
      props: { mobileData: mobileWithAsset, appUrl: APP_URL },
      global: { stubs: ['i'] },
    })
    expect(wrapper.text()).toContain('v0.1.53')
  })

  it('does not display version when tag is null (with assets)', () => {
    const noTag = { ...mobileWithAsset, tag: null }
    const wrapper = mount(MobileDownloadCards, {
      props: { mobileData: noTag, appUrl: APP_URL },
      global: { stubs: ['i'] },
    })
    const versionEls = wrapper.findAll('.download-card__version')
    expect(versionEls).toHaveLength(0)
  })

  it('does not display version when tag is null (no assets)', () => {
    const wrapper = mount(MobileDownloadCards, {
      props: { mobileData: emptyCategory, appUrl: APP_URL },
      global: { stubs: ['i'] },
    })
    const versionEls = wrapper.findAll('.download-card__version')
    expect(versionEls).toHaveLength(0)
  })

  it('does not show web fallback button when assets are available', () => {
    const wrapper = mount(MobileDownloadCards, {
      props: { mobileData: mobileWithAsset, appUrl: APP_URL },
      global: { stubs: ['i'] },
    })
    const largeBtn = wrapper.find('.download-card__btn--large')
    expect(largeBtn.exists()).toBe(false)
  })

  it('renders features list with 3 items', () => {
    const wrapper = mount(MobileDownloadCards, {
      props: { mobileData: mobileWithAsset, appUrl: APP_URL },
      global: { stubs: ['i'] },
    })
    const features = wrapper.findAll('.download-features li')
    expect(features).toHaveLength(3)
  })

  it('download button has target _blank and rel noopener noreferrer', () => {
    const wrapper = mount(MobileDownloadCards, {
      props: { mobileData: mobileWithAsset, appUrl: APP_URL },
      global: { stubs: ['i'] },
    })
    const btn = wrapper.find('.download-card__btn')
    expect(btn.attributes('target')).toBe('_blank')
    expect(btn.attributes('rel')).toBe('noopener noreferrer')
  })

  it('marks the card matching detectedPlatform as recommended', () => {
    const wrapper = mount(MobileDownloadCards, {
      props: { mobileData: mobileWithAsset, appUrl: APP_URL, detectedPlatform: 'android' },
      global: { stubs: ['i'] },
    })
    const recommended = wrapper.find('.download-card--recommended')
    expect(recommended.exists()).toBe(true)
    expect(wrapper.find('.download-card__badge').exists()).toBe(true)
  })

  it('does not mark any card when detectedPlatform is null', () => {
    const wrapper = mount(MobileDownloadCards, {
      props: { mobileData: mobileWithAsset, appUrl: APP_URL, detectedPlatform: null },
      global: { stubs: ['i'] },
    })
    expect(wrapper.find('.download-card--recommended').exists()).toBe(false)
    expect(wrapper.find('.download-card__badge').exists()).toBe(false)
  })

  it('renders ios card with apple icon when ios asset exists', () => {
    const wrapper = mount(MobileDownloadCards, {
      props: { mobileData: mobileWithIosAsset, appUrl: APP_URL, detectedPlatform: 'ios' },
      global: { stubs: ['i'] },
    })
    const icon = wrapper.find('.download-card__icon')
    expect(icon.classes()).toContain('ti-brand-apple')
    expect(wrapper.find('.download-card--recommended').exists()).toBe(true)
  })
})
