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
 *
 * Roster 100% dinâmico (aba 'testadores' da sheet via useTestersRoster) —
 * sem fallback hardcoded: só aparece quem se cadastrou.
 */
export const communityMembers: CommunityMember[] = []

/** Form de cadastro de testador (Google Forms) — usado no spot da home. */
export const communityJoinUrl =
  'https://docs.google.com/forms/d/e/1FAIpQLSdQuprx1kijND4RBdrsFPh4dKDNtCxoaX7LwW7W2BkN-jHthw/viewform'

/** Form de cadastro de desenvolvedor (Google Forms) — link fixado no grupo WhatsApp. */
export const communityDevFormUrl =
  'https://docs.google.com/forms/d/e/1FAIpQLScQeQr_eVdvZfELugBiIcsKN11jMoekEy0cW_-ueictBrv-DA/viewform'

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
  {
    id: 'dev-form',
    /** Form de cadastro de desenvolvedor. */
    url: communityDevFormUrl,
    icon: 'ti ti-code',
  },
] as const
