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

/**
 * Links de comunidade/suporte.
 * WhatsApp: grupo de suporte a usuários (público)
 * Telegram: grupo de desenvolvedores (precisa do link público t.me/<nome> ou t.me/+hash)
 */
export const communityLinks = {
  whatsapp: 'https://chat.whatsapp.com/LBcTv5rQDZw3OU56QmUahc',
  telegram: 'https://t.me/pianolouvorja_devs', // TODO: substituir pelo link público real do grupo de devs
}

/** @deprecated use communityLinks.whatsapp */
export const communityJoinUrl = communityLinks.whatsapp
