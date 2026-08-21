import { describe, it, expect, vi, beforeEach } from 'vitest'

const ANDROID_UA =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Mobile Safari/537.36'
const LG_TV_UA = 'Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36 (LG Browser) Safari/537.36'
const DESKTOP_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36'

// Module cache to force fresh imports
let mod: typeof import('~/composables/useDeviceRecommendation')

async function freshImport() {
  vi.resetModules()
  mod = await import('~/composables/useDeviceRecommendation')
  return mod
}

describe('useDeviceRecommendation', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', { userAgent: DESKTOP_UA })
    vi.stubGlobal('onMounted', (fn: () => unknown) => fn())
  })

  it('retorna null quando onMounted não executa (SSR-safe)', async () => {
    vi.stubGlobal('onMounted', vi.fn()) // não executa callback
    await freshImport()
    const { ready, recommendedCategory, isTv } = mod.useDeviceRecommendation()
    expect(ready.value).toBe(false)
    expect(recommendedCategory.value).toBeNull()
    expect(isTv.value).toBe(false)
  })

  it('detecta Android como mobile', async () => {
    vi.stubGlobal('navigator', { userAgent: ANDROID_UA })
    vi.stubGlobal('onMounted', (fn: () => unknown) => fn())
    await freshImport()
    const { device, ready, recommendedCategory, isTv } = mod.useDeviceRecommendation()
    expect(device.value?.category).toBe('mobile')
    expect(device.value?.platform).toBe('android')
    expect(ready.value).toBe(true)
    expect(recommendedCategory.value).toBe('mobile')
    expect(isTv.value).toBe(false)
  })

  it('isTv true para LG WebOS', async () => {
    vi.stubGlobal('navigator', { userAgent: LG_TV_UA })
    vi.stubGlobal('onMounted', (fn: () => unknown) => fn())
    await freshImport()
    const { isTv, recommendedCategory } = mod.useDeviceRecommendation()
    expect(isTv.value).toBe(true)
    expect(recommendedCategory.value).toBe('tv')
  })

  it('detecta desktop com category desktop', async () => {
    vi.stubGlobal('navigator', { userAgent: DESKTOP_UA })
    vi.stubGlobal('onMounted', (fn: () => unknown) => fn())
    await freshImport()
    const { recommendedCategory, isTv } = mod.useDeviceRecommendation()
    expect(recommendedCategory.value).toBe('desktop')
    expect(isTv.value).toBe(false)
  })
})
