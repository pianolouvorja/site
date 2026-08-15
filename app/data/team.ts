export interface TeamArea {
  id: string
  icon: string
  stack: string[]
}

/** URL da organização no GitHub — institucional, sem pessoas. */
export const teamOrgUrl = 'https://github.com/pianolouvorja'

/**
 * Frentes de trabalho da equipe (visão institucional, sem pessoas identificadas).
 * Títulos e descrições vêm do i18n (`team.areas.<id>.title|description`).
 */
export const teamAreas: TeamArea[] = [
  {
    id: 'leadership',
    icon: 'ti ti-compass',
    stack: ['Visão de produto', 'Roadmap', 'Comunidade'],
  },
  {
    id: 'desktop',
    icon: 'ti ti-device-desktop',
    stack: ['Electron', 'TypeScript', 'WebSocket'],
  },
  {
    id: 'web',
    icon: 'ti ti-world',
    stack: ['Vue 3', 'PWA', 'Service Workers'],
  },
  {
    id: 'api',
    icon: 'ti ti-server-2',
    stack: ['Hono', 'Cloudflare Workers', 'TypeScript'],
  },
  {
    id: 'site',
    icon: 'ti ti-browser',
    stack: ['Nuxt 3', 'i18n', 'Analytics'],
  },
  {
    id: 'quality',
    icon: 'ti ti-shield-check',
    stack: ['GitHub Actions', 'Vitest', 'Code Review'],
  },
]
