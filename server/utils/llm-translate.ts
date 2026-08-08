export interface TranslationResult {
  en: string
  es: string
}

const SYSTEM_PROMPTS: Record<string, string> = {
  en: 'You are a professional translator for a Christian music app (Piano LouvorJA). Translate the following release notes from Brazilian Portuguese to natural, fluent English. Preserve markdown formatting exactly. Keep technical terms (API, CI, etc.) as-is. Return ONLY the translation, no explanations.',
  es: 'You are a professional translator for a Christian music app (Piano LouvorJA). Translate the following release notes from Brazilian Portuguese to natural, fluent Spanish (Latin America). Preserve markdown formatting exactly. Keep technical terms (API, CI, etc.) as-is. Return ONLY the translation, no explanations.',
}

async function translateOne(
  text: string,
  toLang: string,
  model: string,
  apiKey: string,
): Promise<string> {
  try {
    const res = await $fetch<{ choices?: { message?: { content?: string } }[] }>(
      'https://api.z.ai/api/paas/v4/chat/completions',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}` },
        body: {
          model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPTS[toLang] },
            { role: 'user', content: text },
          ],
        },
      },
    )
    return res.choices?.[0]?.message?.content ?? text
  } catch {
    return text
  }
}

export async function translateChangelog(
  text: string,
  _fromLocale: string,
): Promise<TranslationResult> {
  const config = useRuntimeConfig()
  const apiKey = config.llmApiKey
  const model = config.llmModel ?? 'glm-4-flash'

  if (!apiKey) {
    return { en: text, es: text }
  }

  const [en, es] = await Promise.all([
    translateOne(text, 'en', model, apiKey),
    translateOne(text, 'es', model, apiKey),
  ])

  return { en, es }
}
