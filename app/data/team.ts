export interface TeamArea {
  id: string
  icon: string
  stack: string[]
}

export interface TeamMember {
  login: string
  name: string
  avatar: string
  profileUrl: string
  /** Links externos opcionais (LinkedIn, site, etc). */
  links?: { label: string; url: string }[]
}

/** URL da organização no GitHub — institucional, sem pessoas. */
export const teamOrgUrl = 'https://github.com/pianolouvorja'

/**
 * Camada de pessoas: perfis públicos do GitHub (avatar, nome e link), sem
 * dados pessoais além do que já é público nos perfis. Papéis vêm do
 * i18n (`team.members.<login>.role`).
 */
export const teamMembers: TeamMember[] = [
  {
    login: 'ezequiasfonseca',
    name: 'Ezequias Fonseca',
    avatar: 'https://github.com/ezequiasfonseca.png?size=96',
    profileUrl: 'https://github.com/ezequiasfonseca',
  },
  {
    login: 'rafaumeu',
    name: 'Rafael Dias Zendron',
    avatar: 'https://github.com/rafaumeu.png?size=96',
    profileUrl: 'https://github.com/rafaumeu',
  },
  {
    login: 'rafaelji',
    name: 'Rafael Barbosa Silva',
    avatar: 'https://github.com/rafaelji.png?size=96',
    profileUrl: 'https://github.com/rafaelji',
  },
  {
    login: 'educharquero',
    name: 'Eduardo Charquero',
    avatar: 'https://github.com/educharquero.png?size=96',
    profileUrl: 'https://github.com/educharquero',
  },
]

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
