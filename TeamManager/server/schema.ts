export const SCHEMA_SQL = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  gender TEXT DEFAULT '',
  age INTEGER,
  birthday TEXT DEFAULT '',
  workstation TEXT DEFAULT '',
  major TEXT DEFAULT '',
  grade TEXT DEFAULT '',
  college TEXT DEFAULT '',
  education TEXT DEFAULT '',
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  id_card TEXT DEFAULT '',
  workstation_desc TEXT DEFAULT '',
  tech_stack TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'member',
  password_hash TEXT DEFAULT '',
  password_salt TEXT DEFAULT '',
  login_password TEXT DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  start_date TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'planning',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS stages (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  start_date TEXT DEFAULT '',
  end_date TEXT DEFAULT '',
  owner_id TEXT,
  eval_start_date TEXT DEFAULT '',
  eval_end_date TEXT DEFAULT '',
  eval_notes TEXT DEFAULT '',
  eval_adjustments TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (owner_id) REFERENCES members(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS stage_assistants (
  stage_id TEXT NOT NULL,
  member_id TEXT NOT NULL,
  PRIMARY KEY (stage_id, member_id),
  FOREIGN KEY (stage_id) REFERENCES stages(id) ON DELETE CASCADE,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  stage_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  FOREIGN KEY (stage_id) REFERENCES stages(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS deliverables (
  id TEXT PRIMARY KEY,
  stage_id TEXT NOT NULL,
  title TEXT NOT NULL,
  planned_desc TEXT DEFAULT '',
  actual_content TEXT DEFAULT '',
  status INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (stage_id) REFERENCES stages(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS weekly_reports (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  week_start TEXT NOT NULL,
  owner_id TEXT,
  requirements TEXT DEFAULT '',
  features TEXT DEFAULT '',
  created_at TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (owner_id) REFERENCES members(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_stages_project ON stages(project_id);
CREATE INDEX IF NOT EXISTS idx_weekly_project ON weekly_reports(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_stage ON tasks(stage_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_stage ON deliverables(stage_id);
`

export const DB_VERSION = '1'
