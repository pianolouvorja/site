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

export function deepGet(obj: unknown, path: string): unknown {
  if (obj === null || obj === undefined) return undefined
  const parts = path.split('.')
  let cur: unknown = obj
  for (const p of parts) {
    if (cur === null || typeof cur !== 'object') return undefined
    cur = (cur as Record<string, unknown>)[p]
  }
  return cur
}

export function useLocaleMessages() {
  const { locale } = useI18n()

  function raw<T = unknown>(key: string): T | undefined {
    return deepGet(localeData[locale.value], key) as T | undefined
  }

  function has(key: string): boolean {
    return raw(key) !== undefined
  }

  return { raw, has }
}
