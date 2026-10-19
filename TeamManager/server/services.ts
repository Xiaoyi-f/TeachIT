import { getDb } from './db'
import { createPassword, nowIso, uid, verifyPassword } from './utils'

export type MemberRole = 'admin' | 'member'
export type ProjectStatus = 'planning' | 'active' | 'completed' | 'archived'
export type StageStatus = 'pending' | 'active' | 'evaluating' | 'done'
export type TaskStatus = 'pending' | 'doing' | 'done'
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

export type MemberInput = {
  name: string
  gender?: string
  age?: number | null
  birthday?: string
  workstation?: string
  major?: string
  grade?: string
  college?: string
  education?: string
  email?: string
  phone?: string
  id_card?: string
  workstation_desc?: string
  tech_stack?: string
  role?: MemberRole
  password?: string
}

const MEMBER_COLS = `
  id, name, gender, age, birthday, workstation, major, grade, college, education,
  email, phone, id_card, workstation_desc, tech_stack, role, password_hash, password_salt, login_password, created_at
`

function mapMember(row: Record<string, unknown>): Member {
  return {
    id: String(row.id),
    name: String(row.name ?? ''),
    gender: String(row.gender ?? ''),
    age: row.age == null ? null : Number(row.age),
    birthday: String(row.birthday ?? ''),
    workstation: String(row.workstation ?? ''),
    major: String(row.major ?? ''),
    grade: String(row.grade ?? ''),
    college: String(row.college ?? ''),
    education: String(row.education ?? ''),
    email: String(row.email ?? ''),
    phone: String(row.phone ?? ''),
    id_card: String(row.id_card ?? ''),
    workstation_desc: String(row.workstation_desc ?? ''),
    tech_stack: String(row.tech_stack ?? ''),
    role: (row.role as MemberRole) || 'member',
    password_hash: String(row.password_hash ?? ''),
    password_salt: String(row.password_salt ?? ''),
    login_password: String(row.login_password ?? ''),
    created_at: String(row.created_at),
  }
}

function mapProject(row: Record<string, unknown>): Project {
  return {
    id: String(row.id),
    name: String(row.name ?? ''),
    description: String(row.description ?? ''),
    start_date: String(row.start_date ?? ''),
    status: (row.status as ProjectStatus) || 'planning',
    created_at: String(row.created_at),
  }
}

function mapStage(row: Record<string, unknown>): Stage {
  return {
    id: String(row.id),
    project_id: String(row.project_id),
    sort_order: Number(row.sort_order),
    title: String(row.title ?? ''),
    description: String(row.description ?? ''),
    start_date: String(row.start_date ?? ''),
    end_date: String(row.end_date ?? ''),
    owner_id: row.owner_id == null ? null : String(row.owner_id),
    eval_start_date: String(row.eval_start_date ?? ''),
    eval_end_date: String(row.eval_end_date ?? ''),
    eval_notes: String(row.eval_notes ?? ''),
    eval_adjustments: String(row.eval_adjustments ?? ''),
    status: (row.status as StageStatus) || 'pending',
  }
}

function mapTask(row: Record<string, unknown>): Task {
  return {
    id: String(row.id),
    stage_id: String(row.stage_id),
    title: String(row.title ?? ''),
    description: String(row.description ?? ''),
    sort_order: Number(row.sort_order),
    status: (row.status as TaskStatus) || 'pending',
  }
}

function mapDeliverable(row: Record<string, unknown>): Deliverable {
  return {
    id: String(row.id),
    stage_id: String(row.stage_id),
    title: String(row.title ?? ''),
    planned_desc: String(row.planned_desc ?? ''),
    actual_content: String(row.actual_content ?? ''),
    status: Number(row.status) as DeliverableStatus,
    sort_order: Number(row.sort_order),
  }
}

function mapReport(row: Record<string, unknown>): WeeklyReport {
  const ownerId = row.owner_id == null || row.owner_id === '' ? null : String(row.owner_id)
  return {
    id: String(row.id),
    project_id: String(row.project_id),
    week_start: String(row.week_start ?? ''),
    owner_id: ownerId,
    owner_name: ownerId ? (getMember(ownerId)?.name ?? null) : null,
    requirements: String(row.requirements ?? ''),
    features: String(row.features ?? ''),
    created_at: String(row.created_at),
  }
}

export function listMembers(): Member[] {
  return getDb()
    .prepare(`SELECT ${MEMBER_COLS} FROM members`)
    .all()
    .map((r) => mapMember(r as Record<string, unknown>))
    .sort((a, b) => {
      if (a.role !== b.role) return a.role === 'admin' ? -1 : 1
      return a.name.localeCompare(b.name, 'zh')
    })
}

export function getMember(id: string): Member | null {
  const row = getDb().prepare(`SELECT ${MEMBER_COLS} FROM members WHERE id = ?`).get(id) as
    | Record<string, unknown>
    | undefined
  return row ? mapMember(row) : null
}

export function createMember(input: MemberInput): Member {
  const id = uid('m')
  const created = nowIso()
  let hash = ''
  let salt = ''
  const plainPassword = input.password ?? ''
  if (plainPassword) {
    const p = createPassword(plainPassword)
    hash = p.hash
    salt = p.salt
  }
  getDb()
    .prepare(
      `INSERT INTO members (
      id, name, gender, age, birthday, workstation, major, grade, college, education,
      email, phone, id_card, workstation_desc, tech_stack, role, password_hash, password_salt, login_password, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      id,
      input.name.trim(),
      input.gender ?? '',
      input.age ?? null,
      input.birthday ?? '',
      input.workstation ?? '',
      input.major ?? '',
      input.grade ?? '',
      input.college ?? '',
      input.education ?? '',
      input.email ?? '',
      input.phone ?? '',
      input.id_card ?? '',
      input.workstation_desc ?? '',
      input.tech_stack ?? '',
      input.role ?? 'member',
      hash,
      salt,
      plainPassword,
      created,
    )
  return getMember(id)!
}

export function updateMember(id: string, input: MemberInput): Member {
  const existing = getMember(id)
  if (!existing) throw new Error('成员不存在')

  let hash = existing.password_hash
  let salt = existing.password_salt
  let loginPassword = existing.login_password
  if (input.password !== undefined) {
    loginPassword = input.password
    if (input.password) {
      const p = createPassword(input.password)
      hash = p.hash
      salt = p.salt
    } else {
      hash = ''
      salt = ''
    }
  }

  getDb()
    .prepare(
      `UPDATE members SET
      name = ?, gender = ?, age = ?, birthday = ?, workstation = ?, major = ?, grade = ?,
      college = ?, education = ?, email = ?, phone = ?, id_card = ?, workstation_desc = ?,
      tech_stack = ?, role = ?, password_hash = ?, password_salt = ?, login_password = ?
     WHERE id = ?`,
    )
    .run(
      input.name.trim(),
      input.gender ?? '',
      input.age ?? null,
      input.birthday ?? '',
      input.workstation ?? '',
      input.major ?? '',
      input.grade ?? '',
      input.college ?? '',
      input.education ?? '',
      input.email ?? '',
      input.phone ?? '',
      input.id_card ?? '',
      input.workstation_desc ?? '',
      input.tech_stack ?? '',
      input.role ?? existing.role,
      hash,
      salt,
      loginPassword,
      id,
    )
  return getMember(id)!
}

export function deleteMember(id: string): void {
  const m = getMember(id)
  if (!m) return
  if (m.role === 'admin') {
    const admins = getDb().prepare(`SELECT COUNT(*) AS c FROM members WHERE role = 'admin'`).get() as {
      c: number
    }
    if (Number(admins.c) <= 1) throw new Error('至少保留一名管理员')
  }
  const database = getDb()
  database.prepare(`UPDATE stages SET owner_id = NULL WHERE owner_id = ?`).run(id)
  database.prepare(`DELETE FROM stage_assistants WHERE member_id = ?`).run(id)
  database.prepare(`DELETE FROM weekly_reports WHERE owner_id = ?`).run(id)
  database.prepare(`DELETE FROM members WHERE id = ?`).run(id)
}

function passwordMatches(member: Member, password: string): boolean {
  if (member.login_password) return member.login_password === password
  if (member.password_hash) return verifyPassword(password, member.password_hash, member.password_salt)
  return password === ''
}

export function authenticateAdmin(password: string): Member | null {
  for (const admin of listMembers().filter((m) => m.role === 'admin')) {
    if (passwordMatches(admin, password)) return admin
  }
  return null
}

export function authenticateMember(memberId: string, password?: string): Member | null {
  const member = getMember(memberId)
  if (!member || member.role === 'admin') return null
  if (!passwordMatches(member, password ?? '')) return null
  return member
}

export function listLoginMembers() {
  return listMembers()
    .filter((m) => m.role === 'member')
    .map((m) => ({
      id: m.id,
      name: m.name,
      workstation: m.workstation,
      has_password: !!(m.login_password || m.password_hash),
    }))
}

export function listProjects(): Project[] {
  return getDb()
    .prepare(`SELECT * FROM projects ORDER BY created_at DESC`)
    .all()
    .map((r) => mapProject(r as Record<string, unknown>))
}

export function getProject(id: string): Project | null {
  const row = getDb().prepare(`SELECT * FROM projects WHERE id = ?`).get(id) as
    | Record<string, unknown>
    | undefined
  return row ? mapProject(row) : null
}

export function getStageDetail(stageId: string): StageDetail | null {
  const row = getDb().prepare(`SELECT * FROM stages WHERE id = ?`).get(stageId) as
    | Record<string, unknown>
    | undefined
  if (!row) return null
  const stage = mapStage(row)
  const owner = stage.owner_id ? getMember(stage.owner_id) : null
  const assistants = (
    getDb()
      .prepare(
        `SELECT m.id FROM members m
         INNER JOIN stage_assistants sa ON sa.member_id = m.id
         WHERE sa.stage_id = ?`,
      )
      .all(stageId) as Array<{ id: string }>
  )
    .map((r) => getMember(r.id)!)
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name, 'zh'))

  const tasks = getDb()
    .prepare(`SELECT * FROM tasks WHERE stage_id = ? ORDER BY sort_order`)
    .all(stageId)
    .map((r) => mapTask(r as Record<string, unknown>))

  const deliverables = getDb()
    .prepare(`SELECT * FROM deliverables WHERE stage_id = ? ORDER BY sort_order`)
    .all(stageId)
    .map((r) => mapDeliverable(r as Record<string, unknown>))

  return { ...stage, owner_name: owner?.name ?? null, assistants, tasks, deliverables }
}

export function getProjectDetail(id: string): ProjectDetail | null {
  const project = getProject(id)
  if (!project) return null
  const stageRows = getDb()
    .prepare(`SELECT id FROM stages WHERE project_id = ? ORDER BY sort_order, title`)
    .all(id) as Array<{ id: string }>
  const stages = stageRows.map((r) => getStageDetail(r.id)!).filter(Boolean)
  return { ...project, stages }
}

export function createProject(input: {
  name: string
  description?: string
  start_date?: string
  status?: ProjectStatus
}): Project {
  const id = uid('p')
  const created = nowIso()
  getDb()
    .prepare(
      `INSERT INTO projects (id, name, description, start_date, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(
      id,
      input.name.trim(),
      input.description ?? '',
      input.start_date ?? '',
      input.status ?? 'planning',
      created,
    )
  return getProject(id)!
}

export function updateProject(
  id: string,
  input: Partial<Pick<Project, 'name' | 'description' | 'start_date' | 'status'>>,
): Project {
  const p = getProject(id)
  if (!p) throw new Error('项目不存在')
  getDb()
    .prepare(`UPDATE projects SET name = ?, description = ?, start_date = ?, status = ? WHERE id = ?`)
    .run(
      input.name?.trim() ?? p.name,
      input.description ?? p.description,
      input.start_date ?? p.start_date,
      input.status ?? p.status,
      id,
    )
  return getProject(id)!
}

export function deleteProject(id: string): void {
  const database = getDb()
  const stages = database.prepare(`SELECT id FROM stages WHERE project_id = ?`).all(id) as Array<{
    id: string
  }>
  for (const s of stages) {
    database.prepare(`DELETE FROM stage_assistants WHERE stage_id = ?`).run(s.id)
    database.prepare(`DELETE FROM tasks WHERE stage_id = ?`).run(s.id)
    database.prepare(`DELETE FROM deliverables WHERE stage_id = ?`).run(s.id)
  }
  database.prepare(`DELETE FROM stages WHERE project_id = ?`).run(id)
  database.prepare(`DELETE FROM weekly_reports WHERE project_id = ?`).run(id)
  database.prepare(`DELETE FROM projects WHERE id = ?`).run(id)
}

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

export function createStage(projectId: string, input: StageInput): StageDetail {
  if (!getProject(projectId)) throw new Error('项目不存在')
  const max = getDb()
    .prepare(`SELECT COALESCE(MAX(sort_order), 0) AS m FROM stages WHERE project_id = ?`)
    .get(projectId) as { m: number }
  const sort = Number(max.m) + 1
  const id = uid('s')
  const database = getDb()
  const tx = database.transaction(() => {
    database
      .prepare(
        `INSERT INTO stages (
        id, project_id, sort_order, title, description, start_date, end_date,
        owner_id, eval_start_date, eval_end_date, eval_notes, eval_adjustments, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        id,
        projectId,
        sort,
        input.title.trim(),
        input.description ?? '',
        input.start_date ?? '',
        input.end_date ?? '',
        input.owner_id ?? null,
        input.eval_start_date ?? '',
        input.eval_end_date ?? '',
        input.eval_notes ?? '',
        input.eval_adjustments ?? '',
        input.status ?? 'pending',
      )
    for (const aid of input.assistant_ids ?? []) {
      database.prepare(`INSERT INTO stage_assistants (stage_id, member_id) VALUES (?, ?)`).run(id, aid)
    }
    ;(input.tasks ?? []).forEach((t, i) => {
      database
        .prepare(
          `INSERT INTO tasks (id, stage_id, title, description, sort_order, status)
            VALUES (?, ?, ?, ?, ?, 'pending')`,
        )
        .run(uid('t'), id, t.title.trim(), t.description ?? '', i + 1)
    })
    ;(input.deliverables ?? []).forEach((d, i) => {
      database
        .prepare(
          `INSERT INTO deliverables (id, stage_id, title, planned_desc, actual_content, status, sort_order)
            VALUES (?, ?, ?, ?, '', 0, ?)`,
        )
        .run(uid('d'), id, d.title.trim(), d.planned_desc ?? '', i + 1)
    })
  })
  tx()
  return getStageDetail(id)!
}

export function updateStage(stageId: string, input: StageInput): StageDetail {
  const stage = getStageDetail(stageId)
  if (!stage) throw new Error('阶段不存在')
  const database = getDb()
  database
    .prepare(
      `UPDATE stages SET
      title = ?, description = ?, start_date = ?, end_date = ?, owner_id = ?,
      eval_start_date = ?, eval_end_date = ?, eval_notes = ?, eval_adjustments = ?, status = ?
     WHERE id = ?`,
    )
    .run(
      input.title.trim(),
      input.description ?? '',
      input.start_date ?? '',
      input.end_date ?? '',
      input.owner_id ?? null,
      input.eval_start_date ?? '',
      input.eval_end_date ?? '',
      input.eval_notes ?? '',
      input.eval_adjustments ?? '',
      input.status ?? stage.status,
      stageId,
    )
  if (input.assistant_ids) {
    database.prepare(`DELETE FROM stage_assistants WHERE stage_id = ?`).run(stageId)
    for (const aid of input.assistant_ids) {
      database.prepare(`INSERT INTO stage_assistants (stage_id, member_id) VALUES (?, ?)`).run(stageId, aid)
    }
  }
  return getStageDetail(stageId)!
}

export function deleteStage(stageId: string): void {
  const database = getDb()
  database.prepare(`DELETE FROM stage_assistants WHERE stage_id = ?`).run(stageId)
  database.prepare(`DELETE FROM tasks WHERE stage_id = ?`).run(stageId)
  database.prepare(`DELETE FROM deliverables WHERE stage_id = ?`).run(stageId)
  database.prepare(`DELETE FROM stages WHERE id = ?`).run(stageId)
}

export function releaseStageOwner(stageId: string, isAdmin = false): StageDetail {
  const stage = getStageDetail(stageId)
  if (!stage) throw new Error('阶段不存在')
  if (!isAdmin) throw new Error('仅管理员可清除负责人')
  getDb().prepare(`UPDATE stages SET owner_id = NULL WHERE id = ?`).run(stageId)
  return getStageDetail(stageId)!
}

export function addTask(stageId: string, title: string, description = ''): Task {
  const max = getDb()
    .prepare(`SELECT COALESCE(MAX(sort_order), 0) AS m FROM tasks WHERE stage_id = ?`)
    .get(stageId) as { m: number }
  const id = uid('t')
  getDb()
    .prepare(
      `INSERT INTO tasks (id, stage_id, title, description, sort_order, status)
     VALUES (?, ?, ?, ?, ?, 'pending')`,
    )
    .run(id, stageId, title.trim(), description, Number(max.m) + 1)
  return mapTask(getDb().prepare(`SELECT * FROM tasks WHERE id = ?`).get(id) as Record<string, unknown>)
}

export function updateTask(
  taskId: string,
  input: Partial<Pick<Task, 'title' | 'description' | 'status'>>,
): Task {
  const row = getDb().prepare(`SELECT * FROM tasks WHERE id = ?`).get(taskId) as
    | Record<string, unknown>
    | undefined
  if (!row) throw new Error('任务不存在')
  const t = mapTask(row)
  getDb()
    .prepare(`UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ?`)
    .run(input.title?.trim() ?? t.title, input.description ?? t.description, input.status ?? t.status, taskId)
  return mapTask(getDb().prepare(`SELECT * FROM tasks WHERE id = ?`).get(taskId) as Record<string, unknown>)
}

export function deleteTask(taskId: string): void {
  getDb().prepare(`DELETE FROM tasks WHERE id = ?`).run(taskId)
}

export function addDeliverable(stageId: string, title: string, planned_desc = ''): Deliverable {
  const max = getDb()
    .prepare(`SELECT COALESCE(MAX(sort_order), 0) AS m FROM deliverables WHERE stage_id = ?`)
    .get(stageId) as { m: number }
  const id = uid('d')
  getDb()
    .prepare(
      `INSERT INTO deliverables (id, stage_id, title, planned_desc, actual_content, status, sort_order)
     VALUES (?, ?, ?, ?, '', 0, ?)`,
    )
    .run(id, stageId, title.trim(), planned_desc, Number(max.m) + 1)
  return mapDeliverable(
    getDb().prepare(`SELECT * FROM deliverables WHERE id = ?`).get(id) as Record<string, unknown>,
  )
}

export function updateDeliverablePlan(
  id: string,
  input: Partial<Pick<Deliverable, 'title' | 'planned_desc'>>,
): Deliverable {
  const row = getDb().prepare(`SELECT * FROM deliverables WHERE id = ?`).get(id) as
    | Record<string, unknown>
    | undefined
  if (!row) throw new Error('交付物不存在')
  const d = mapDeliverable(row)
  getDb()
    .prepare(`UPDATE deliverables SET title = ?, planned_desc = ? WHERE id = ?`)
    .run(input.title?.trim() ?? d.title, input.planned_desc ?? d.planned_desc, id)
  return mapDeliverable(
    getDb().prepare(`SELECT * FROM deliverables WHERE id = ?`).get(id) as Record<string, unknown>,
  )
}

export function updateDeliverableActual(
  id: string,
  memberId: string,
  input: { actual_content?: string; status?: DeliverableStatus },
  isAdmin = false,
): Deliverable {
  const row = getDb().prepare(`SELECT * FROM deliverables WHERE id = ?`).get(id) as
    | Record<string, unknown>
    | undefined
  if (!row) throw new Error('交付物不存在')
  const d = mapDeliverable(row)
  const stage = getStageDetail(d.stage_id)
  if (!stage) throw new Error('阶段不存在')
  if (!isAdmin && stage.owner_id !== memberId) throw new Error('仅负责人可填写实际交付情况')
  getDb()
    .prepare(`UPDATE deliverables SET actual_content = ?, status = ? WHERE id = ?`)
    .run(input.actual_content ?? d.actual_content, input.status ?? d.status, id)
  return mapDeliverable(
    getDb().prepare(`SELECT * FROM deliverables WHERE id = ?`).get(id) as Record<string, unknown>,
  )
}

export function deleteDeliverable(id: string): void {
  getDb().prepare(`DELETE FROM deliverables WHERE id = ?`).run(id)
}

export function listStagesForMember(memberId: string): StageDetail[] {
  const rows = getDb()
    .prepare(
      `SELECT DISTINCT s.id FROM stages s
     LEFT JOIN stage_assistants sa ON sa.stage_id = s.id
     WHERE s.owner_id = ? OR sa.member_id = ?
     ORDER BY s.project_id, s.sort_order`,
    )
    .all(memberId, memberId) as Array<{ id: string }>
  return rows.map((r) => getStageDetail(r.id)!).filter(Boolean)
}

export function projectStats(projectId: string) {
  const detail = getProjectDetail(projectId)
  if (!detail) return null
  let deliverables = 0
  let done = 0
  let delayed = 0
  for (const s of detail.stages) {
    for (const d of s.deliverables) {
      deliverables++
      if (d.status === 2) done++
      if (d.status === 3) delayed++
    }
  }
  return {
    stages: detail.stages.length,
    doneStages: detail.stages.filter((s) => s.status === 'done').length,
    activeStages: detail.stages.filter((s) => s.status === 'active').length,
    evaluatingStages: detail.stages.filter((s) => s.status === 'evaluating').length,
    deliverables,
    done,
    delayed,
    pct: deliverables ? Math.round((done / deliverables) * 100) : 0,
  }
}

export function listWeeklyReports(projectId: string): WeeklyReport[] {
  return getDb()
    .prepare(`SELECT * FROM weekly_reports WHERE project_id = ? ORDER BY week_start`)
    .all(projectId)
    .map((r) => mapReport(r as Record<string, unknown>))
}

export function listWeeklyReportsForOwner(ownerId: string): WeeklyReport[] {
  return getDb()
    .prepare(`SELECT * FROM weekly_reports WHERE owner_id = ? ORDER BY week_start`)
    .all(ownerId)
    .map((r) => mapReport(r as Record<string, unknown>))
}

export function createWeeklyReports(input: {
  project_id: string
  week_start: string
  owner_ids: string[]
}): { created: number; skipped: number } {
  const ids = [...new Set(input.owner_ids.filter(Boolean))]
  if (!ids.length) throw new Error('请选择负责人')
  if (!getProject(input.project_id)) throw new Error('项目不存在')
  let created = 0
  let skipped = 0
  const database = getDb()
  const insert = database.prepare(
    `INSERT INTO weekly_reports (id, project_id, week_start, owner_id, requirements, features, created_at)
     VALUES (?, ?, ?, ?, '', '', ?)`,
  )
  const exists = database.prepare(
    `SELECT id FROM weekly_reports WHERE project_id = ? AND week_start = ? AND owner_id = ?`,
  )
  for (const ownerId of ids) {
    if (!getMember(ownerId)) throw new Error('负责人不存在')
    if (exists.get(input.project_id, input.week_start, ownerId)) {
      skipped++
      continue
    }
    insert.run(uid('w'), input.project_id, input.week_start, ownerId, nowIso())
    created++
  }
  if (!created) throw new Error('所选负责人都已在这一周')
  return { created, skipped }
}

export function updateWeeklyCompletion(
  id: string,
  memberId: string,
  input: { requirements: string; features: string },
  isAdmin = false,
): WeeklyReport {
  const row = getDb().prepare(`SELECT * FROM weekly_reports WHERE id = ?`).get(id) as
    | Record<string, unknown>
    | undefined
  if (!row) throw new Error('周记录不存在')
  const report = mapReport(row)
  if (!isAdmin && report.owner_id !== memberId) throw new Error('仅本周负责人可填写完成情况')
  getDb()
    .prepare(`UPDATE weekly_reports SET requirements = ?, features = ? WHERE id = ?`)
    .run(input.requirements, input.features, id)
  return mapReport(
    getDb().prepare(`SELECT * FROM weekly_reports WHERE id = ?`).get(id) as Record<string, unknown>,
  )
}

export function deleteWeeklyReport(id: string): void {
  getDb().prepare(`DELETE FROM weekly_reports WHERE id = ?`).run(id)
}

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

export function publicMember(m: Member) {
  const { password_hash: _h, password_salt: _s, ...rest } = m
  return rest
}
