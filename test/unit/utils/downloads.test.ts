import { describe, it, expect } from 'vitest'
import {
  matchAssets,
  makeEmptyCategory,
  formatBytes,
  REPO_CONFIGS,
  type RawReleaseAsset,
} from '~/utils/downloads'

describe('matchAssets', () => {
  it('matches .AppImage as linux', () => {
    const assets: RawReleaseAsset[] = [
      {
        name: 'LouvorJA---PIANO-1.17.5.AppImage',
        browser_download_url: 'https://example.com/a.AppImage',
        size: 168000000,
      },
    ]
    const result = matchAssets(assets, REPO_CONFIGS[0].assetMatchers)
    expect(result).toHaveProperty('linux')
    expect(result.linux.url).toBe('https://example.com/a.AppImage')
    expect(result.linux.size).toBe(168000000)
  })

  it('matches .exe as windows but not .exe.yml or .exe.blockmap', () => {
    const assets: RawReleaseAsset[] = [
      {
        name: 'PIANO-Setup-1.17.5.exe',
        browser_download_url: 'https://example.com/setup.exe',
        size: 127000000,
      },
      {
        name: 'PIANO-1.17.5.exe.blockmap',
        browser_download_url: 'https://example.com/blockmap',
        size: 500,
      },
      { name: 'latest.yml', browser_download_url: 'https://example.com/latest.yml', size: 300 },
    ]
    const result = matchAssets(assets, REPO_CONFIGS[0].assetMatchers)
    expect(result).toHaveProperty('windows')
    expect(result.windows!.name).toBe('PIANO-Setup-1.17.5.exe')
    expect(result).not.toHaveProperty('linux')
  })

  it('matches .dmg as macos', () => {
    const assets: RawReleaseAsset[] = [
      {
        name: 'PIANO-1.17.5.dmg',
        browser_download_url: 'https://example.com/a.dmg',
        size: 161000000,
      },
    ]
    const result = matchAssets(assets, REPO_CONFIGS[0].assetMatchers)
    expect(result).toHaveProperty('macos')
  })

  it('matches AndroidTV .apk as androidtv for TV category', () => {
    const assets: RawReleaseAsset[] = [
      {
        name: 'PalcoLouvorJA-AndroidTV-0.1.0.apk',
        browser_download_url: 'https://example.com/tv.apk',
        size: 46000000,
      },
    ]
    const result = matchAssets(assets, REPO_CONFIGS[1].assetMatchers)
    expect(result).toHaveProperty('androidtv')
    expect(result.androidtv!.url).toBe('https://example.com/tv.apk')
  })

  it('matches .ipk as webos for TV category', () => {
    const assets: RawReleaseAsset[] = [
      {
        name: 'com.piano.louvorja.palco_0.1.13_all.ipk',
        browser_download_url: 'https://example.com/palco.ipk',
        size: 3500000,
      },
    ]
    const result = matchAssets(assets, REPO_CONFIGS[1].assetMatchers)
    expect(result).toHaveProperty('webos')
  })

  it('matches louvorja-piano-*.apk as android for mobile category', () => {
    const assets: RawReleaseAsset[] = [
      {
        name: 'louvorja-piano-0.1.53.apk',
        browser_download_url: 'https://example.com/mobile.apk',
        size: 70000000,
      },
    ]
    const result = matchAssets(assets, REPO_CONFIGS[2].assetMatchers)
    expect(result).toHaveProperty('android')
  })

  it('does NOT match AndroidTV apk as mobile android (different regex)', () => {
    const assets: RawReleaseAsset[] = [
      {
        name: 'PalcoLouvorJA-AndroidTV-0.1.0.apk',
        browser_download_url: 'https://example.com/tv.apk',
        size: 46000000,
      },
    ]
    const result = matchAssets(assets, REPO_CONFIGS[2].assetMatchers)
    expect(result).not.toHaveProperty('android')
  })

  it('returns empty object when no assets match', () => {
    const assets: RawReleaseAsset[] = [
      { name: 'source.tar.gz', browser_download_url: 'https://example.com/src.tar.gz', size: 1000 },
    ]
    const result = matchAssets(assets, REPO_CONFIGS[0].assetMatchers)
    expect(result).toEqual({})
  })

  it('matches all 3 desktop platforms at once', () => {
    const assets: RawReleaseAsset[] = [
      { name: 'Piano-1.0.0.AppImage', browser_download_url: 'https://x.com/a.AppImage', size: 100 },
      { name: 'Piano-Setup-1.0.0.exe', browser_download_url: 'https://x.com/s.exe', size: 200 },
      { name: 'Piano-1.0.0.dmg', browser_download_url: 'https://x.com/m.dmg', size: 300 },
    ]
    const result = matchAssets(assets, REPO_CONFIGS[0].assetMatchers)
    expect(Object.keys(result)).toEqual(['linux', 'windows', 'macos'])
  })

  it('last matching asset wins for same platform', () => {
    const assets: RawReleaseAsset[] = [
      {
        name: 'louvorja-piano-0.1.50.apk',
        browser_download_url: 'https://x.com/old.apk',
        size: 50000000,
      },
      {
        name: 'louvorja-piano-0.1.53.apk',
        browser_download_url: 'https://x.com/new.apk',
        size: 70000000,
      },
    ]
    const result = matchAssets(assets, REPO_CONFIGS[2].assetMatchers)
    expect(result.android!.url).toBe('https://x.com/new.apk')
  })
})

describe('makeEmptyCategory', () => {
  it('returns category with null tag and empty assets', () => {
    const cat = makeEmptyCategory('app')
    expect(cat.repo).toBe('app')
    expect(cat.tag).toBeNull()
    expect(cat.assets).toEqual({})
  })
})

describe('formatBytes', () => {
  it('formats 0 bytes', () => {
    expect(formatBytes(0)).toBe('0 B')
  })

  it('formats bytes (< 1 KB)', () => {
    expect(formatBytes(500)).toBe('500 B')
  })

  it('formats kilobytes', () => {
    expect(formatBytes(1536)).toBe('1.5 KB')
  })

  it('formats megabytes', () => {
    expect(formatBytes(168657084)).toBe('160.8 MB')
  })

  it('formats gigabytes', () => {
    expect(formatBytes(2147483648)).toBe('2.0 GB')
  })

  it('formats exactly 1 KB without decimals', () => {
    expect(formatBytes(1024)).toBe('1.0 KB')
  })
})

describe('REPO_CONFIGS', () => {
  it('has 3 configs: app, palco-receiver, apk', () => {
    expect(REPO_CONFIGS).toHaveLength(3)
    expect(REPO_CONFIGS.map((c) => c.name)).toEqual(['app', 'palco-receiver', 'apk'])
  })

  it('each config has non-empty assetMatchers', () => {
    for (const config of REPO_CONFIGS) {
      expect(config.assetMatchers.length).toBeGreaterThan(0)
      for (const m of config.assetMatchers) {
        expect(m.platform).toBeTruthy()
        expect(typeof m.test).toBe('function')
      }
    }
  })

  it('desktop has linux, windows, macos matchers', () => {
    const desktop = REPO_CONFIGS[0]
    expect(desktop.category).toBe('desktop')
    expect(desktop.assetMatchers.map((m) => m.platform)).toEqual(['linux', 'windows', 'macos'])
  })

  it('tv has androidtv, webos, tizen matchers', () => {
    const tv = REPO_CONFIGS[1]
    expect(tv.category).toBe('tv')
    expect(tv.assetMatchers.map((m: { platform: string }) => m.platform)).toEqual([
      'androidtv',
      'webos',
      'tizen',
    ])
  })

  it('mobile has android, ios matchers', () => {
    const mobile = REPO_CONFIGS[2]
    expect(mobile.category).toBe('mobile')
    expect(mobile.assetMatchers.map((m) => m.platform)).toEqual(['android', 'ios'])
  })
})
