/**
 * Tipos compartilhados entre client (app/) e server (server/).
 * Evita import cross-boundary que quebra o typecheck do Nuxt.
 */

export interface PlatformDownloads {
  platform: string
  downloads: number
}

export interface AppDownloadStats {
  repo: string
  category: string
  label: string
  latestTag: string | null
  totalDownloads: number
  platforms: PlatformDownloads[]
}

export interface DownloadStats {
  total: number
  apps: AppDownloadStats[]
}

export interface DashboardStats {
  downloads: DownloadStats | null
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

export interface GeoStats {
  totalVisits: number
  days: number
  countries: Array<{ country: string; visits: number }>
}
