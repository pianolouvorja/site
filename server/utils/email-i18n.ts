/**
 * email-i18n — Strings localizadas para templates de email.
 * Server-side (não tem acesso ao useI18n do Nuxt).
 * Manter em sync com i18n/{pt-BR,en,es}.json keys newsletter.* e notifyModal.*.
 */

export interface EmailStrings {
  appSubtitle: string
  unsubscribe: string
  copyright: string
  badges: {
    release: string
    devotional: string
    announcement: string
  }
}

const STRINGS: Record<string, EmailStrings> = {
  'pt-BR': {
    appSubtitle: 'App de louvor para IASD',
    unsubscribe: 'Cancelar inscri&ccedil;&atilde;o',
    copyright: 'Todos os direitos reservados.',
    badges: {
      release: 'Nova vers&atilde;o',
      devotional: 'Devocional',
      announcement: 'An&uacute;ncio',
    },
  },
  en: {
    appSubtitle: 'Worship app for Seventh-day Adventist Church',
    unsubscribe: 'Unsubscribe',
    copyright: 'All rights reserved.',
    badges: {
      release: 'New release',
      devotional: 'Devotional',
      announcement: 'Announcement',
    },
  },
  es: {
    appSubtitle: 'App de alabanza para IASD',
    unsubscribe: 'Cancelar suscripci&oacute;n',
    copyright: 'Todos los derechos reservados.',
    badges: {
      release: 'Nueva versi&oacute;n',
      devotional: 'Devocional',
      announcement: 'Anuncio',
    },
  },
}

export function getEmailStrings(locale: string): EmailStrings {
  return STRINGS[locale] ?? STRINGS['pt-BR']!
}
