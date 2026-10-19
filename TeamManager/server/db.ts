import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Database from 'better-sqlite3'
import { DB_VERSION, SCHEMA_SQL } from './schema'
import { createPassword, nowIso, uid } from './utils'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.resolve(__dirname, '../data')
const dbPath = process.env.TM_DB_PATH || path.join(dataDir, 'teammanager.sqlite')

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (!db) throw new Error('数据库尚未初始化')
  return db
}

export function getDbPath(): string {
  return dbPath
}

function seedIfEmpty(database: Database.Database) {
  const count = Number(
    (database.prepare('SELECT COUNT(*) AS c FROM members').get() as { c: number }).c,
  )
  if (count > 0) return

  const adminPass = createPassword('admin')
  const adminId = uid('m')
  const memberA = uid('m')
  const memberB = uid('m')
  const created = nowIso()

  const insertMember = database.prepare(`
    INSERT INTO members (
      id, name, gender, age, birthday, workstation, major, grade, college, education,
      email, phone, id_card, workstation_desc, tech_stack, role, password_hash, password_salt, login_password, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  insertMember.run(
    adminId,
    '系统管理员',
    '男',
    28,
    '1998-01-01',
    'A-01',
    '软件工程',
    '研二',
    '计算机学院',
    '硕士',
    'admin@team.local',
    '13800000000',
    '',
    '管理工位，负责统筹与评审',
    '项目管理 / Vue / SQLite',
    'admin',
    adminPass.hash,
    adminPass.salt,
    'admin',
    created,
  )

  insertMember.run(
    memberA,
    '张晓明',
    '男',
    22,
    '2004-05-12',
    'B-03',
    '计算机科学与技术',
    '大三',
    '计算机学院',
    '本科',
    'xiaoming@team.local',
    '13900000001',
    '',
    '靠窗工位，前端开发',
    'Vue / TypeScript / UI',
    'member',
    '',
    '',
    '',
    created,
  )

  insertMember.run(
    memberB,
    '李思雨',
    '女',
    21,
    '2005-09-20',
    'B-05',
    '数据科学',
    '大三',
    '人工智能学院',
    '本科',
    'siyu@team.local',
    '13900000002',
    '',
    '靠门工位，数据分析',
    'Python / 数据分析 / 文档',
    'member',
    '',
    '',
    '',
    created,
  )

  const projectId = uid('p')
  database
    .prepare(
      `INSERT INTO projects (id, name, description, start_date, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(
      projectId,
      '示例项目：团队协作平台',
      '演示用项目。管理员可配置阶段、任务、交付物与评估期；负责人填写实际交付情况。',
      new Date().toISOString().slice(0, 10),
      'active',
      created,
    )

  const stage1 = uid('s')
  const stage2 = uid('s')
  const insertStage = database.prepare(`
    INSERT INTO stages (
      id, project_id, sort_order, title, description, start_date, end_date,
      owner_id, eval_start_date, eval_end_date, eval_notes, eval_adjustments, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '', '', ?)
  `)
  insertStage.run(
    stage1,
    projectId,
    1,
    '需求调研与方案设计',
    '完成用户调研、竞品分析与总体方案',
    '',
    '',
    memberA,
    '',
    '',
    'active',
  )
  insertStage.run(
    stage2,
    projectId,
    2,
    '核心功能开发',
    '完成成员管理与项目周期主流程',
    '',
    '',
    null,
    '',
    '',
    'pending',
  )

  database
    .prepare(`INSERT INTO stage_assistants (stage_id, member_id) VALUES (?, ?)`)
    .run(stage1, memberB)

  const insertTask = database.prepare(
    `INSERT INTO tasks (id, stage_id, title, description, sort_order, status) VALUES (?, ?, ?, ?, ?, ?)`,
  )
  insertTask.run(uid('t'), stage1, '用户访谈', '访谈至少 5 位目标用户', 1, 'doing')
  insertTask.run(uid('t'), stage1, '方案文档', '输出总体技术方案初稿', 2, 'pending')
  insertTask.run(uid('t'), stage2, '成员模块开发', '实现成员档案 CRUD', 1, 'pending')

  const insertDeliv = database.prepare(
    `INSERT INTO deliverables (id, stage_id, title, planned_desc, actual_content, status, sort_order)
     VALUES (?, ?, ?, ?, '', 0, ?)`,
  )
  insertDeliv.run(uid('d'), stage1, '调研报告', '包含用户画像、痛点与机会点', 1)
  insertDeliv.run(uid('d'), stage1, '方案原型', '低保真原型或流程图', 2)
  insertDeliv.run(uid('d'), stage2, '可运行演示', '本地可运行的核心功能演示', 1)

  database.prepare(`INSERT INTO settings (key, value) VALUES (?, ?)`).run('db_version', DB_VERSION)
  database.prepare(`INSERT INTO settings (key, value) VALUES (?, ?)`).run('app_name', 'TeamManager')
}

export function initDatabase(): Database.Database {
  if (db) return db
  fs.mkdirSync(path.dirname(dbPath), { recursive: true })
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  db.exec(SCHEMA_SQL)
  seedIfEmpty(db)
  return db
}

/** 删除库文件并重新初始化（开发/运维用）。 */
export function resetDatabaseFile(): void {
  if (db) {
    db.close()
    db = null
  }
  for (const suffix of ['', '-wal', '-shm']) {
    const file = `${dbPath}${suffix}`
    if (fs.existsSync(file)) fs.unlinkSync(file)
  }
  initDatabase()
}
