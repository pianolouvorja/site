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
  // Sonoplasta que pediu para participar da equipe de testes (nome a confirmar)
  { name: 'Colaborador Sonoplastia', role: 'tester', since: '2026-08' },
]

/** Canal público para entrar na comunidade. */
export const communityJoinUrl = 'https://github.com/pianolouvorja'
