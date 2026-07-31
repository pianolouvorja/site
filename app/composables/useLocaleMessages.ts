/**
 * Access raw locale messages bypassing vue-i18n's AST compilation.
 *
 * @nuxtjs/i18n pre-compiles all locale JSON into AST nodes at build time.
 * This means $tm() and messages.value return objects like {t:0,b:{t:2,...}}
 * instead of the original strings/arrays.
 *
 * We import the raw locale data from TS modules in assets/i18n/ which
 * bypass @nuxtjs/i18n's AST transform entirely.
 */

import ptBR from '../../assets/i18n/pt-BR'
import en from '../../assets/i18n/en'
import es from '../../assets/i18n/es'

const localeData: Record<string, Record<string, unknown>> = {
  'pt-BR': ptBR,
  en,
  es,
}

type LocaleData = Record<string, unknown>

export function useLocaleMessages() {
  const { locale } = useI18n()

  function raw<T = unknown>(key: string): T | undefined {
    const data: LocaleData | undefined = localeData[locale.value]
    if (!data) return undefined

    const parts = key.split('.')
    let current: unknown = data
    for (const part of parts) {
      if (current && typeof current === 'object' && part in (current as Record<string, unknown>)) {
        current = (current as Record<string, unknown>)[part]
      } else {
        return undefined
      }
    }
    return current as T
  }

  function has(key: string): boolean {
    return raw(key) !== undefined
  }

  return { raw, has }
}
