/**
 * TASK-008 — RF-008: métricas de saúde da comunidade.
 * Puro — recebe docs, calcula agregações.
 */

export interface HealthMetrics {
  newThisWeek: number
  approvalRate30d: number
  openReports: number
  bannedMembers: number
}

function startOfWeek(now: Date): Date {
  const d = new Date(now)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - d.getDay())
  return d
}

/** Calcula métricas de uma lista de members + reports. */
export function computeHealth(
  members: Array<Record<string, unknown>>,
  reports: Array<Record<string, unknown>>,
  now = new Date(),
): HealthMetrics {
  const weekStart = startOfWeek(now)
  const newThisWeek = members.filter((m) => {
    const created = String(m.createdAt ?? '')
    return created && new Date(created) >= weekStart
  }).length

  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const recentReports = reports.filter((r) => {
    const ts = String(r.createdAt ?? '')
    return ts && new Date(ts) >= thirtyDaysAgo
  })
  const reviewed = recentReports.filter(
    (r) => r.status === 'aprovado' || r.status === 'rejeitado' || r.status === 'resolvido',
  )
  const approvalRate30d =
    reviewed.length === 0
      ? 0
      : Math.round(
          (reviewed.filter((r) => r.status === 'aprovado' || r.status === 'resolvido').length /
            reviewed.length) *
            100,
        )

  const openReports = reports.filter((r) => r.status === 'novo').length
  const bannedMembers = members.filter((m) => m.status === 'banned').length

  return { newThisWeek, approvalRate30d, openReports, bannedMembers }
}
