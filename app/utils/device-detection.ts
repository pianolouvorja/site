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
export type DeviceArchitecture = 'arm64' | 'x64' | 'unknown'

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
/**
 * Detects the CPU architecture exposed by browser Client Hints or User-Agent.
 * Browser privacy controls may omit this value; callers must preserve manual choice.
 */
export function detectArchitecture(userAgent: string, architecture?: string): DeviceArchitecture {
  const value = `${architecture ?? ''} ${userAgent}`.toLowerCase()
  if (/arm64|aarch64|\barm\b/.test(value)) return 'arm64'
  if (/x86_64|amd64|win64|\bx64\b|\bx86\b/.test(value)) return 'x64'
  return 'unknown'
}

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

/**
 * CPU architecture for desktop download selection (arm64 vs x64).
 *
 * O User-Agent de Macs NAO expoe a arquitetura real (Chrome/Safari reportam
 * 'Intel' ate em Apple Silicon por retrocompatibilidade). Deteccao confiavel:
 *
 * 1. navigator.userAgentData.getHighEntropyValue('architecture') - Chrome/Edge
 *    retorna 'arm' em Apple Silicon. Async, so existe em Chromium moderno.
 * 2. Default 'x64' (Intel) - maior base instalada; o site SEMPRE mostra o link
 *    da outra arquitetura junto, entao erro de deteccao tem correcao a 1 clique.
 */
export type DesktopArch = 'arm64' | 'x64'

interface NavigatorUAData {
  getHighEntropyValue?: (hints: string[]) => Promise<{ architecture?: string }>
}

export function parseArch(architecture: string | undefined): DesktopArch | null {
  if (!architecture) return null
  const a = architecture.toLowerCase()
  if (a === 'arm' || a === 'arm64' || a === 'aarch64') return 'arm64'
  if (a === 'x86' || a === 'x86_64' || a === 'amd64' || a === 'ia32') return 'x64'
  return null
}

/** Sincrono (fallback imediato): sem decisao de arch confiavel sem userAgentData. */
export function detectArchSync(): DesktopArch {
  return 'x64'
}

/** Async: decisao real via userAgentData quando disponivel (client-only). */
export async function detectArch(): Promise<DesktopArch> {
  try {
    const uaData = (navigator as Navigator & { userAgentData?: NavigatorUAData }).userAgentData
    if (uaData?.getHighEntropyValue) {
      const { architecture } = await uaData.getHighEntropyValue(['architecture'])
      const parsed = parseArch(architecture)
      if (parsed) return parsed
    }
  } catch {
    // userAgentData indisponivel (Safari/Firefox) - fallback abaixo
  }
  return detectArchSync()
}
