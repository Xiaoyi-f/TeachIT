export type MemberRole = 'admin' | 'member'

export type ProjectStatus = 'planning' | 'active' | 'completed' | 'archived'

export type StageStatus = 'pending' | 'active' | 'evaluating' | 'done'

export type TaskStatus = 'pending' | 'doing' | 'done'

/** 0 未开始 · 1 进行中 · 2 已完成 · 3 延期 */
export type DeliverableStatus = 0 | 1 | 2 | 3

export interface Member {
  id: string
  name: string
  gender: string
  age: number | null
  birthday: string
  workstation: string
  major: string
  grade: string
  college: string
  education: string
  email: string
  phone: string
  id_card: string
  workstation_desc: string
  tech_stack: string
  role: MemberRole
  password_hash: string
  password_salt: string
  /** 解密后的当前登录口令，用于界面回显 */
  login_password: string
  created_at: string
}

export interface Project {
  id: string
  name: string
  description: string
  start_date: string
  status: ProjectStatus
  created_at: string
}

export interface Stage {
  id: string
  project_id: string
  sort_order: number
  title: string
  description: string
  start_date: string
  end_date: string
  owner_id: string | null
  eval_start_date: string
  eval_end_date: string
  eval_notes: string
  eval_adjustments: string
  status: StageStatus
}

export interface Task {
  id: string
  stage_id: string
  title: string
  description: string
  sort_order: number
  status: TaskStatus
}

export interface Deliverable {
  id: string
  stage_id: string
  title: string
  planned_desc: string
  actual_content: string
  status: DeliverableStatus
  sort_order: number
}

export interface StageDetail extends Stage {
  owner_name: string | null
  assistants: Member[]
  tasks: Task[]
  deliverables: Deliverable[]
}

export interface ProjectDetail extends Project {
  stages: StageDetail[]
}

export interface WeeklyReport {
  id: string
  project_id: string
  week_start: string
  owner_id: string | null
  owner_name: string | null
  requirements: string
  features: string
  created_at: string
}

export interface SessionUser {
  id: string
  name: string
  role: MemberRole
}
