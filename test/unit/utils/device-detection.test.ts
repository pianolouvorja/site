import { describe, expect, it } from 'vitest'
import { detectArchitecture, detectDevice } from '~/utils/device-detection'

describe('detectDevice', () => {
  describe('TV platforms', () => {
    const cases: Array<[string, string]> = [
      // Android TV / Google TV
      ['Mozilla/5.0 (Linux; Android 9; Android TV) AppleWebKit/537.36 Chrome/120', 'android-tv'],
      ['Mozilla/5.0 (Linux; Android 11; Build/RTT. 4K ATV) AppleWebKit/537.36', 'android-tv'],
      ['Mozilla/5.0 (Linux; Android 8.0.0; SM-G950F Build) Leanback', 'android-tv'],
      // Chromecast
      [
        'Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90 CrKey/1.56.500000',
        'android-tv',
      ],
      // LG webOS
      ['Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36 Safari/537.36', 'webos'],
      ['Mozilla/5.0 (WebOS; Linux/SmartTV) AppleWebKit/537.36', 'webos'],
      ['HbbTV/1.5.1 (+PVR;Humax;HD FOX PL;1.00.11;1.0;)CE-HTML/1.0', 'webos'],
      // Samsung Tizen
      ['Mozilla/5.0 (SMART-TV; LINUX; Tizen 7.0) AppleWebKit/537.36', 'tizen'],
      ['Mozilla/5.0 (SMART-TV; X11; Linux) AppleWebKit/537.36', 'tizen'],
      // Roku
      ['Roku/DVP-9.10 (509.10E04156A)', 'roku'],
      // Apple TV — must NOT match ios
      ['AppleTV6,2/11.1', 'apple-tv'],
      ['Mozilla/5.0 (TV; iOS 16.1) AppleWebKit/605.1.15 tvOS/16.1', 'apple-tv'],
    ]
    it.each(cases)('%s → tv', (ua, platform) => {
      const device = detectDevice(ua)
      expect(device.platform).toBe(platform)
      expect(device.category).toBe('tv')
    })
  })

  describe('mobile platforms', () => {
    const cases: Array<[string, string]> = [
      [
        'Mozilla/5.0 (Linux; Android 13; SM-S901B) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36',
        'android',
      ],
      ['Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/121 Mobile', 'android'],
      [
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
        'ios',
      ],
      ['Mozilla/5.0 (iPad; CPU OS 17_3 like Mac OS X) AppleWebKit/605.1.15', 'ios'],
    ]
    it.each(cases)('%s → mobile', (ua, platform) => {
      const device = detectDevice(ua)
      expect(device.platform).toBe(platform)
      expect(device.category).toBe('mobile')
    })
  })

  describe('desktop platforms', () => {
    const cases: Array<[string, string]> = [
      ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120', 'windows'],
      [
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15',
        'macos',
      ],
      ['Mozilla/5.0 (X11; Linux x86_64; Ubuntu 22.04) AppleWebKit/537.36 Chrome/120', 'linux'],
      ['Mozilla/5.0 (X11; Fedora; Linux x86_64) AppleWebKit/537.36', 'linux'],
    ]
    it.each(cases)('%s → desktop', (ua, platform) => {
      const device = detectDevice(ua)
      expect(device.platform).toBe(platform)
      expect(device.category).toBe('desktop')
    })
  })

  describe('edge cases', () => {
    it('empty UA → unknown', () => {
      expect(detectDevice('')).toEqual({ platform: 'unknown', category: 'unknown' })
      expect(detectDevice('   ')).toEqual({ platform: 'unknown', category: 'unknown' })
    })

    it('unrecognized UA → unknown', () => {
      expect(detectDevice('curl/8.0')).toEqual({ platform: 'unknown', category: 'unknown' })
    })

    it('Android TV UA containing "Android" must be tv, not mobile (priority)', () => {
      // Classic pitfall: Android TV UAs contain "Android" — TV wins
      const device = detectDevice('Mozilla/5.0 (Linux; Android 12; Android TV) Chrome/120')
      expect(device.category).toBe('tv')
    })
  })
})

describe('detectArchitecture', () => {
  it.each([
    ['Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'x64'],
    ['Mozilla/5.0 (X11; Linux x86_64)', 'x64'],
    ['Mozilla/5.0 (X11; Linux aarch64)', 'arm64'],
    ['Mozilla/5.0 (Macintosh; ARM Mac OS X 14_0)', 'arm64'],
    ['curl/8.0', 'unknown'],
  ] as const)('%s → %s', (userAgent, architecture) => {
    expect(detectArchitecture(userAgent)).toBe(architecture)
  })

  it('prioriza Client Hints sobre User-Agent', () => {
    expect(detectArchitecture('Mozilla/5.0 (X11; Linux x86_64)', 'arm')).toBe('arm64')
  })
})
