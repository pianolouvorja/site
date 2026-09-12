import { describe, it, expect, vi, afterEach } from 'vitest'
import { parseArch, detectArchSync } from '~/utils/device-detection'

describe('parseArch', () => {
  it('arm variants → arm64', () => {
    expect(parseArch('arm')).toBe('arm64')
    expect(parseArch('arm64')).toBe('arm64')
    expect(parseArch('aarch64')).toBe('arm64')
    expect(parseArch('ARM')).toBe('arm64')
  })

  it('x86 variants → x64', () => {
    expect(parseArch('x86')).toBe('x64')
    expect(parseArch('x86_64')).toBe('x64')
    expect(parseArch('amd64')).toBe('x64')
    expect(parseArch('ia32')).toBe('x64')
  })

  it('desconhecido/undefined → null (fallback decide)', () => {
    expect(parseArch(undefined)).toBeNull()
    expect(parseArch('')).toBeNull()
    expect(parseArch('wasm32')).toBeNull()
  })
})

describe('detectArchSync', () => {
  it('fallback síncrono é x64 (base maior + link da outra arch sempre visível)', () => {
    expect(detectArchSync()).toBe('x64')
  })
})

describe('detectArch (async, userAgentData)', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('Chrome em Apple Silicon: architecture=arm → arm64', async () => {
    vi.stubGlobal('navigator', {
      userAgentData: {
        getHighEntropyValue: async (hints: string[]) =>
          hints.includes('architecture') ? { architecture: 'arm' } : {},
      },
    })
    const { detectArch } = await import('~/utils/device-detection')
    expect(await detectArch()).toBe('arm64')
  })

  it('Chrome em Intel: architecture=x86 → x64', async () => {
    vi.stubGlobal('navigator', {
      userAgentData: {
        getHighEntropyValue: async () => ({ architecture: 'x86' }),
      },
    })
    const { detectArch } = await import('~/utils/device-detection')
    expect(await detectArch()).toBe('x64')
  })

  it('Safari/Firefox (sem userAgentData) → x64 fallback', async () => {
    vi.stubGlobal('navigator', {})
    const { detectArch } = await import('~/utils/device-detection')
    expect(await detectArch()).toBe('x64')
  })

  it('getHighEntropyValue rejeita → x64 fallback', async () => {
    vi.stubGlobal('navigator', {
      userAgentData: {
        getHighEntropyValue: async () => {
          throw new Error('denied')
        },
      },
    })
    const { detectArch } = await import('~/utils/device-detection')
    expect(await detectArch()).toBe('x64')
  })

  it('architecture desconhecida do userAgentData → x64 fallback', async () => {
    vi.stubGlobal('navigator', {
      userAgentData: {
        getHighEntropyValue: async () => ({ architecture: 'wasm32' }),
      },
    })
    const { detectArch } = await import('~/utils/device-detection')
    expect(await detectArch()).toBe('x64')
  })
})
