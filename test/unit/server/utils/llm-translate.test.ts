import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('translateChangelog', () => {
  let mockFetch: ReturnType<typeof vi.fn>
  let translateChangelog: (text: string, fromLocale: string) => Promise<{ en: string; es: string }>

  beforeEach(async () => {
    vi.resetModules()
    mockFetch = vi.fn()
    vi.stubGlobal('$fetch', mockFetch)
    vi.stubGlobal('useRuntimeConfig', () => ({
      llmApiKey: 'test-key',
      llmModel: 'test-model',
    }))

    const mod = await import('~~/server/utils/llm-translate')
    translateChangelog = mod.translateChangelog
  })

  it('returns translations for both en and es', async () => {
    mockFetch
      .mockResolvedValueOnce({ choices: [{ message: { content: 'English release notes' } }] })
      .mockResolvedValueOnce({ choices: [{ message: { content: 'Notas de versión en español' } }] })

    const result = await translateChangelog('# Nova versão\n\n- Bug fix', 'pt-BR')

    expect(result.en).toBe('English release notes')
    expect(result.es).toBe('Notas de versión en español')
  })

  it('preserves markdown structure in translation', async () => {
    mockFetch
      .mockResolvedValueOnce({ choices: [{ message: { content: '# New version\n\n- Bug fix' } }] })
      .mockResolvedValueOnce({
        choices: [{ message: { content: '# Nueva versión\n\n- Bug fix' } }],
      })

    const result = await translateChangelog('# Nova versão\n\n- Bug fix', 'pt-BR')

    expect(result.en).toContain('# New version')
    expect(result.en).toContain('- Bug fix')
  })

  it('falls back to original text on API error (catch branch)', async () => {
    mockFetch
      .mockRejectedValueOnce(new Error('API down'))
      .mockRejectedValueOnce(new Error('API down'))

    const original = '# Nova versão\\n- Feature'
    const result = await translateChangelog(original, 'pt-BR')

    expect(result.en).toBe(original)
    expect(result.es).toBe(original)
  })

  it('falls back to original text on non-Error rejection (catch branch)', async () => {
    mockFetch.mockRejectedValueOnce('string error').mockRejectedValueOnce(null)

    const original = '# Outra versão'
    const result = await translateChangelog(original, 'pt-BR')

    expect(result.en).toBe(original)
    expect(result.es).toBe(original)
  })

  it('falls back to original when response has no choices', async () => {
    mockFetch.mockResolvedValueOnce({}).mockResolvedValueOnce({})

    const result = await translateChangelog('Texto', 'pt-BR')

    expect(result.en).toBe('Texto')
    expect(result.es).toBe('Texto')
  })

  it('returns TranslationResult type', async () => {
    mockFetch
      .mockResolvedValueOnce({ choices: [{ message: { content: 'EN' } }] })
      .mockResolvedValueOnce({ choices: [{ message: { content: 'ES' } }] })

    const result = await translateChangelog('texto', 'pt-BR')

    expect(result).toHaveProperty('en')
    expect(result).toHaveProperty('es')
  })

  it('falls back to original text when apiKey is not configured (empty string)', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({
      llmApiKey: '',
      llmModel: 'test-model',
    }))

    vi.resetModules()
    const mod = await import('~~/server/utils/llm-translate')

    const original = '# Nova versão\n- Feature'
    const result = await mod.translateChangelog(original, 'pt-BR')

    expect(result.en).toBe(original)
    expect(result.es).toBe(original)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('falls back to original when apiKey is undefined', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({
      llmModel: 'test-model',
    }))

    vi.resetModules()
    const mod = await import('~~/server/utils/llm-translate')

    const original = '# Outra versão'
    const result = await mod.translateChangelog(original, 'pt-BR')

    expect(result.en).toBe(original)
    expect(result.es).toBe(original)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('returns original for one lang when that specific translation fails', async () => {
    mockFetch
      .mockResolvedValueOnce({ choices: [{ message: { content: 'English translation' } }] })
      .mockRejectedValueOnce(new Error('API down'))

    const original = '# Nova versão\\n- Feature'
    const result = await translateChangelog(original, 'pt-BR')

    expect(result.en).toBe('English translation')
    expect(result.es).toBe(original)
  })

  it('uses default model glm-4-flash when llmModel is not configured', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({
      llmApiKey: 'test-key',
    }))

    vi.resetModules()
    const mod = await import('~~/server/utils/llm-translate')

    mockFetch
      .mockResolvedValueOnce({ choices: [{ message: { content: 'EN' } }] })
      .mockResolvedValueOnce({ choices: [{ message: { content: 'ES' } }] })

    await mod.translateChangelog('texto', 'pt-BR')

    const callBody = mockFetch.mock.calls[0]![1] as { body: { model: string } }
    expect(callBody.body.model).toBe('glm-4-flash')
  })
})
