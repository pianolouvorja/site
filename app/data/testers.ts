/**
 * Galeria de testadores — crédito público da comunidade de testes.
 * Espelha o padrão de app/data/team.ts: perfis com avatar, bio e links.
 * Bio/função vêm do i18n (`testers.members.<id>.role|bio`).
 */
export interface TesterProfile {
  id: string
  name: string
  avatar: string
  /** Links externos opcionais (WhatsApp community, GitHub, redes). */
  links?: { label: string; url: string }[]
  /** Áreas que testa — chaves i18n em `testers.focus.<key>`. */
  focus: string[]
}

export const testerProfiles: TesterProfile[] = [
  {
    id: 'natan',
    name: 'Natan',
    avatar: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f977.svg',
    focus: ['vm', 'install'],
    links: [],
  },
]
