import { api } from '@/api/client'
import type { WeeklyReport } from './types'

export function formatWeekRange(weekStart: string): string {
  const parts = weekStart.split('-').map(Number)
  if (parts.length < 3 || parts.some((n) => Number.isNaN(n))) return weekStart
  const start = new Date(parts[0]!, parts[1]! - 1, parts[2])
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  const fmt = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  return `${fmt(start)} 至 ${fmt(end)}`
}

export async function listWeeklyReports(projectId: string): Promise<WeeklyReport[]> {
  return api<WeeklyReport[]>(`/api/projects/${projectId}/weeks`)
}

export async function listWeeklyReportsForOwner(ownerId: string): Promise<WeeklyReport[]> {
  // 工作台接口已包含；保留兼容入口
  void ownerId
  const data = await api<{ weeks: WeeklyReport[] }>('/api/me/workspace')
  return data.weeks
}

export async function createWeeklyReports(input: {
  project_id: string
  week_start: string
  owner_ids: string[]
}): Promise<{ created: number; skipped: number }> {
  return api<{ created: number; skipped: number }>(`/api/projects/${input.project_id}/weeks`, {
    method: 'POST',
    body: JSON.stringify({ week_start: input.week_start, owner_ids: input.owner_ids }),
  })
}

export async function updateWeeklyCompletion(
  id: string,
  _memberId: string,
  input: { requirements: string; features: string },
): Promise<WeeklyReport> {
  return api<WeeklyReport>(`/api/weeks/${id}`, { method: 'PUT', body: JSON.stringify(input) })
}

export async function deleteWeeklyReport(id: string): Promise<void> {
  await api<boolean>(`/api/weeks/${id}`, { method: 'DELETE' })
}
