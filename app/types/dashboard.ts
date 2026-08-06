/**
 * Tipos compartilhados entre client (app/) e server (server/).
 * Evita import cross-boundary que quebra o typecheck do Nuxt.
 */

export interface DashboardStats {
  downloads: number | null
  stars: number | null
  forks: number | null
  subscribers: number | null
  donations: { count: number; totalBRL: number } | null
  visits: number | null
  updatedAt: string
}

export interface ActivityItem {
  type: 'release' | 'pr' | 'issue' | 'unknown'
  title: string
  author: string
  createdAt: string
  url: string
}
