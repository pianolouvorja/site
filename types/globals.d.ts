/**
 * Global type declarations.
 */

/** Google Analytics gtag function */
declare global {
  interface Window {
    gtag: (
      command: 'consent' | 'event' | 'config' | 'set' | 'js' | 'init',
      actionOrTarget: string,
      params?: Record<string, unknown>,
    ) => void
  }
}

export {}
