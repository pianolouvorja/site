/**
 * Device/platform detection from User-Agent string.
 *
 * Pure functions — safe to run on server or client, fully unit-testable.
 * Used by `useDeviceRecommendation` composable.
 */

export type DevicePlatform =
  | 'android-tv'
  | 'webos'
  | 'tizen'
  | 'roku'
  | 'apple-tv'
  | 'android'
  | 'ios'
  | 'windows'
  | 'macos'
  | 'linux'
  | 'unknown'

export type DeviceCategory = 'tv' | 'mobile' | 'desktop' | 'unknown'

export interface DeviceInfo {
  platform: DevicePlatform
  category: DeviceCategory
}

const TV_PATTERNS: Array<{ platform: DevicePlatform; re: RegExp }> = [
  // LG webOS / NetCast
  { platform: 'webos', re: /web0s|webos|netcast|hbbtv/i },
  // Samsung Tizen / SMART-TV
  { platform: 'tizen', re: /tizen|smart-tv|smarttv/i },
  // Roku
  { platform: 'roku', re: /roku|dvp-\d/i },
  // Apple TV (tvOS) — check before iOS to avoid iPhone/iPad match
  { platform: 'apple-tv', re: /appletv|tvos/i },
  // Android TV / Google TV / Chromecast
  // - "Android TV)" inside parens, "4K ATV" outside, standalone "Leanback"
  { platform: 'android-tv', re: /android[^)]*\b(tv|leanback)\b|\batv\b|leanback|crkey/i },
]

const MOBILE_PATTERNS: Array<{ platform: DevicePlatform; re: RegExp }> = [
  { platform: 'android', re: /android.*mobile|mobile.*android|android/i },
  { platform: 'ios', re: /iphone|ipad|ipod/i },
]

const DESKTOP_PATTERNS: Array<{ platform: DevicePlatform; re: RegExp }> = [
  { platform: 'macos', re: /mac os x|macintosh|darwin/i },
  { platform: 'windows', re: /windows|win32|win64/i },
  { platform: 'linux', re: /linux|x11|ubuntu|fedora/i },
]

const CATEGORY_BY_PLATFORM: Record<DevicePlatform, DeviceCategory> = {
  'android-tv': 'tv',
  webos: 'tv',
  tizen: 'tv',
  roku: 'tv',
  'apple-tv': 'tv',
  android: 'mobile',
  ios: 'mobile',
  windows: 'desktop',
  macos: 'desktop',
  linux: 'desktop',
  unknown: 'unknown',
}

/**
 * Detects the device platform from a User-Agent string.
 *
 * TV platforms are checked first (their UAs often also contain
 * "Android" or "Linux", which would otherwise misclassify them as
 * mobile/desktop). Falls back to mobile, then desktop, then unknown.
 */
export function detectDevice(userAgent: string): DeviceInfo {
  const ua = userAgent.trim()
  if (!ua) return { platform: 'unknown', category: 'unknown' }

  for (const { platform, re } of TV_PATTERNS) {
    if (re.test(ua)) return { platform, category: CATEGORY_BY_PLATFORM[platform] }
  }
  for (const { platform, re } of MOBILE_PATTERNS) {
    if (re.test(ua)) return { platform, category: CATEGORY_BY_PLATFORM[platform] }
  }
  for (const { platform, re } of DESKTOP_PATTERNS) {
    if (re.test(ua)) return { platform, category: CATEGORY_BY_PLATFORM[platform] }
  }
  return { platform: 'unknown', category: 'unknown' }
}
