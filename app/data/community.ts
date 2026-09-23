export type CommunityRole = 'tester' | 'enthusiast' | 'suggester'

export const communityRoles: CommunityRole[] = ['tester', 'enthusiast', 'suggester']

export interface CommunityMember {
  name: string
  role: CommunityRole
  /** Mês/ano de entrada na comunidade (YYYY-MM). */
  since: string
  /** Link público opcional (perfil, rede social). */
  url?: string
}

/**
 * Membros da comunidade: testadores, entusiastas e sugestores.
 * Apenas dados públicos consentidos — nada de e-mail/telefone (LGPD).
 */
export const communityMembers: CommunityMember[] = [
  { name: 'Caique', role: 'tester', since: '2026-08' },
]

/** Canal público para entrar na comunidade. */
export const communityJoinUrl = 'https://github.com/pianolouvorja'

/**
 * Canais oficiais da comunidade PIANO LouvorJA.
 * Links de convite públicos — sem dados pessoais (LGPD).
 */
export const communityChannels = [
  {
    id: 'whatsapp-support',
    /** Grupo de suporte a usuários (WhatsApp). */
    url: 'https://chat.whatsapp.com/LBcTv5rQDZw3OU56QmUahc',
    icon: 'ti ti-brand-whatsapp',
  },
  {
    id: 'telegram-devs',
    /** Grupo de desenvolvedores (Telegram). */
    url: 'https://t.me/c/4390408870/6',
    icon: 'ti ti-brand-telegram',
  },
] as const
