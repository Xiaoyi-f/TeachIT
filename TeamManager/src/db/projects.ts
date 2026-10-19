import { api } from '@/api/client'
import type {
  Deliverable,
  DeliverableStatus,
  Project,
  ProjectDetail,
  ProjectStatus,
  StageDetail,
  StageStatus,
  Task,
} from './types'

export type StageInput = {
  title: string
  description?: string
  start_date?: string
  end_date?: string
  owner_id?: string | null
  assistant_ids?: string[]
  eval_start_date?: string
  eval_end_date?: string
  eval_notes?: string
  eval_adjustments?: string
  status?: StageStatus
  tasks?: Array<{ title: string; description?: string }>
  deliverables?: Array<{ title: string; planned_desc?: string }>
}

export type ProjectStats = {
  stages: number
  doneStages: number
  activeStages: number
  evaluatingStages: number
  deliverables: number
  done: number
  delayed: number
  pct: number
}

export type ProjectDetailWithStats = ProjectDetail & { stats: ProjectStats | null }

export async function listProjects(): Promise<Project[]> {
  return api<Project[]>('/api/projects')
}

export async function getDashboard(): Promise<{
  projects: Array<Project & { stats: ProjectStats | null }>
  memberCount: number
}> {
  return api('/api/dashboard')
}

export async function getProject(id: string): Promise<Project | null> {
  try {
    const detail = await getProjectDetail(id)
    if (!detail) return null
    const { stages: _s, stats: _st, ...project } = detail as ProjectDetailWithStats
    return project
  } catch {
    return null
  }
}

export async function getProjectDetail(id: string): Promise<ProjectDetailWithStats | null> {
  try {
    return await api<ProjectDetailWithStats>(`/api/projects/${id}`)
  } catch {
    return null
  }
}

export async function createProject(input: {
  name: string
  description?: string
  start_date?: string
  status?: ProjectStatus
}): Promise<Project> {
  return api<Project>('/api/projects', { method: 'POST', body: JSON.stringify(input) })
}

export async function updateProject(
  id: string,
  input: Partial<Pick<Project, 'name' | 'description' | 'start_date' | 'status'>>,
): Promise<Project> {
  return api<Project>(`/api/projects/${id}`, { method: 'PUT', body: JSON.stringify(input) })
}

export async function deleteProject(id: string): Promise<void> {
  await api<boolean>(`/api/projects/${id}`, { method: 'DELETE' })
}

export async function createStage(projectId: string, input: StageInput): Promise<StageDetail> {
  return api<StageDetail>(`/api/projects/${projectId}/stages`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function updateStage(stageId: string, input: StageInput): Promise<StageDetail> {
  return api<StageDetail>(`/api/stages/${stageId}`, { method: 'PUT', body: JSON.stringify(input) })
}

export async function deleteStage(stageId: string): Promise<void> {
  await api<boolean>(`/api/stages/${stageId}`, { method: 'DELETE' })
}

export async function releaseStageOwner(stageId: string, _isAdmin = false): Promise<StageDetail> {
  return api<StageDetail>(`/api/stages/${stageId}/release-owner`, { method: 'POST', body: '{}' })
}

export async function addTask(stageId: string, title: string, description = ''): Promise<Task> {
  return api<Task>(`/api/stages/${stageId}/tasks`, {
    method: 'POST',
    body: JSON.stringify({ title, description }),
  })
}

export async function updateTask(
  taskId: string,
  input: Partial<Pick<Task, 'title' | 'description' | 'status'>>,
): Promise<Task> {
  return api<Task>(`/api/tasks/${taskId}`, { method: 'PUT', body: JSON.stringify(input) })
}

export async function deleteTask(taskId: string): Promise<void> {
  await api<boolean>(`/api/tasks/${taskId}`, { method: 'DELETE' })
}

export async function addDeliverable(
  stageId: string,
  title: string,
  planned_desc = '',
): Promise<Deliverable> {
  return api<Deliverable>(`/api/stages/${stageId}/deliverables`, {
    method: 'POST',
    body: JSON.stringify({ title, planned_desc }),
  })
}

export async function updateDeliverablePlan(
  id: string,
  input: Partial<Pick<Deliverable, 'title' | 'planned_desc'>>,
): Promise<Deliverable> {
  return api<Deliverable>(`/api/deliverables/${id}/plan`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export async function updateDeliverableActual(
  id: string,
  _memberId: string,
  input: { actual_content?: string; status?: DeliverableStatus },
  _isAdmin = false,
): Promise<Deliverable> {
  return api<Deliverable>(`/api/deliverables/${id}/actual`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export async function deleteDeliverable(id: string): Promise<void> {
  await api<boolean>(`/api/deliverables/${id}`, { method: 'DELETE' })
}

export async function listStagesForMember(_memberId: string): Promise<StageDetail[]> {
  const data = await api<{ stages: StageDetail[] }>('/api/me/workspace')
  return data.stages
}

export async function projectStats(projectId: string): Promise<ProjectStats | null> {
  const detail = await getProjectDetail(projectId)
  return detail?.stats ?? null
}

export async function getWorkspace() {
  return api<{
    stages: StageDetail[]
    weeks: import('./types').WeeklyReport[]
    projects: Record<string, string>
  }>('/api/me/workspace')
}
