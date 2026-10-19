import type { Express, NextFunction, Request, Response } from 'express'
import {
  addDeliverable,
  addTask,
  authenticateAdmin,
  authenticateMember,
  createMember,
  createProject,
  createStage,
  createWeeklyReports,
  deleteDeliverable,
  deleteMember,
  deleteProject,
  deleteStage,
  deleteTask,
  deleteWeeklyReport,
  getMember,
  getProject,
  getProjectDetail,
  listLoginMembers,
  listMembers,
  listProjects,
  listStagesForMember,
  listWeeklyReports,
  listWeeklyReportsForOwner,
  projectStats,
  publicMember,
  releaseStageOwner,
  updateDeliverableActual,
  updateDeliverablePlan,
  updateMember,
  updateProject,
  updateStage,
  updateTask,
  updateWeeklyCompletion,
  type MemberRole,
} from './services'

type SessionUser = { id: string; name: string; role: MemberRole }

declare module 'express-session' {
  interface SessionData {
    user?: SessionUser
  }
}

function ok<T>(res: Response, data: T, status = 200) {
  res.status(status).json({ ok: true, data })
}

function fail(res: Response, message: string, status = 400) {
  res.status(status).json({ ok: false, error: message })
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.user) return fail(res, '未登录', 401)
  next()
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.user) return fail(res, '未登录', 401)
  if (req.session.user.role !== 'admin') return fail(res, '需要管理员权限', 403)
  next()
}

function wrap(fn: (req: Request, res: Response) => void) {
  return (req: Request, res: Response) => {
    try {
      fn(req, res)
    } catch (e) {
      fail(res, e instanceof Error ? e.message : '服务器错误', 400)
    }
  }
}

export function registerRoutes(app: Express) {
  app.get('/api/health', (_req, res) => {
    ok(res, { status: 'up' })
  })

  app.get(
    '/api/auth/login-members',
    wrap((_req, res) => {
      ok(res, listLoginMembers())
    }),
  )

  app.get('/api/auth/me', (req, res) => {
    ok(res, req.session.user ?? null)
  })

  app.post(
    '/api/auth/login',
    wrap((req, res) => {
      const role = String(req.body?.role ?? '')
      const password = String(req.body?.password ?? '')
      const memberId = String(req.body?.memberId ?? '')
      if (role === 'admin') {
        const admin = authenticateAdmin(password)
        if (!admin) return fail(res, '口令错误', 401)
        req.session.user = { id: admin.id, name: admin.name, role: 'admin' }
        return ok(res, req.session.user)
      }
      if (role === 'member') {
        const member = authenticateMember(memberId, password)
        if (!member) return fail(res, '口令错误', 401)
        req.session.user = { id: member.id, name: member.name, role: 'member' }
        return ok(res, req.session.user)
      }
      fail(res, '无效角色')
    }),
  )

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy(() => {
      ok(res, true)
    })
  })

  app.get(
    '/api/members',
    requireAuth,
    wrap((req, res) => {
      const isAdmin = req.session.user!.role === 'admin'
      const rows = listMembers().map((m) => {
        const pub = publicMember(m)
        if (!isAdmin) {
          return { ...pub, login_password: '', password_hash: '', password_salt: '' }
        }
        return pub
      })
      ok(res, rows)
    }),
  )

  app.get(
    '/api/members/:id',
    requireAuth,
    wrap((req, res) => {
      const m = getMember(String(req.params.id))
      if (!m) return fail(res, '成员不存在', 404)
      const user = req.session.user!
      if (user.role !== 'admin' && user.id !== m.id) return fail(res, '无权查看', 403)
      const pub = publicMember(m)
      if (user.role !== 'admin') {
        ok(res, { ...pub, login_password: '' })
        return
      }
      ok(res, pub)
    }),
  )

  app.post(
    '/api/members',
    requireAdmin,
    wrap((req, res) => {
      ok(res, publicMember(createMember(req.body ?? {})), 201)
    }),
  )

  app.put(
    '/api/members/:id',
    requireAuth,
    wrap((req, res) => {
      const id = String(req.params.id)
      const user = req.session.user!
      if (user.role !== 'admin' && user.id !== id) return fail(res, '无权修改', 403)
      const body = { ...(req.body ?? {}) }
      if (user.role !== 'admin') {
        const existing = getMember(id)
        if (!existing) return fail(res, '成员不存在', 404)
        body.role = 'member'
        body.workstation = existing.workstation
        body.workstation_desc = existing.workstation_desc
        delete body.password
      }
      ok(res, publicMember(updateMember(id, body)))
    }),
  )

  app.delete(
    '/api/members/:id',
    requireAdmin,
    wrap((req, res) => {
      deleteMember(String(req.params.id))
      ok(res, true)
    }),
  )

  app.get(
    '/api/projects',
    requireAuth,
    wrap((_req, res) => {
      ok(res, listProjects())
    }),
  )

  app.get(
    '/api/dashboard',
    requireAuth,
    wrap((_req, res) => {
      const projects = listProjects().map((p) => ({
        ...p,
        stats: projectStats(p.id),
      }))
      ok(res, { projects, memberCount: listMembers().length })
    }),
  )

  app.get(
    '/api/projects/:id',
    requireAuth,
    wrap((req, res) => {
      const detail = getProjectDetail(String(req.params.id))
      if (!detail) return fail(res, '项目不存在', 404)
      ok(res, { ...detail, stats: projectStats(detail.id) })
    }),
  )

  app.post(
    '/api/projects',
    requireAdmin,
    wrap((req, res) => {
      ok(res, createProject(req.body ?? {}), 201)
    }),
  )

  app.put(
    '/api/projects/:id',
    requireAdmin,
    wrap((req, res) => {
      ok(res, updateProject(String(req.params.id), req.body ?? {}))
    }),
  )

  app.delete(
    '/api/projects/:id',
    requireAdmin,
    wrap((req, res) => {
      deleteProject(String(req.params.id))
      ok(res, true)
    }),
  )

  app.post(
    '/api/projects/:id/stages',
    requireAdmin,
    wrap((req, res) => {
      ok(res, createStage(String(req.params.id), req.body ?? {}), 201)
    }),
  )

  app.put(
    '/api/stages/:id',
    requireAdmin,
    wrap((req, res) => {
      ok(res, updateStage(String(req.params.id), req.body ?? {}))
    }),
  )

  app.delete(
    '/api/stages/:id',
    requireAdmin,
    wrap((req, res) => {
      deleteStage(String(req.params.id))
      ok(res, true)
    }),
  )

  app.post(
    '/api/stages/:id/release-owner',
    requireAdmin,
    wrap((req, res) => {
      ok(res, releaseStageOwner(String(req.params.id), true))
    }),
  )

  app.post(
    '/api/stages/:id/tasks',
    requireAdmin,
    wrap((req, res) => {
      ok(res, addTask(String(req.params.id), String(req.body?.title ?? ''), String(req.body?.description ?? '')), 201)
    }),
  )

  app.put(
    '/api/tasks/:id',
    requireAuth,
    wrap((req, res) => {
      ok(res, updateTask(String(req.params.id), req.body ?? {}))
    }),
  )

  app.delete(
    '/api/tasks/:id',
    requireAdmin,
    wrap((req, res) => {
      deleteTask(String(req.params.id))
      ok(res, true)
    }),
  )

  app.post(
    '/api/stages/:id/deliverables',
    requireAdmin,
    wrap((req, res) => {
      ok(
        res,
        addDeliverable(
          String(req.params.id),
          String(req.body?.title ?? ''),
          String(req.body?.planned_desc ?? ''),
        ),
        201,
      )
    }),
  )

  app.put(
    '/api/deliverables/:id/plan',
    requireAdmin,
    wrap((req, res) => {
      ok(res, updateDeliverablePlan(String(req.params.id), req.body ?? {}))
    }),
  )

  app.put(
    '/api/deliverables/:id/actual',
    requireAuth,
    wrap((req, res) => {
      const user = req.session.user!
      ok(
        res,
        updateDeliverableActual(String(req.params.id), user.id, req.body ?? {}, user.role === 'admin'),
      )
    }),
  )

  app.delete(
    '/api/deliverables/:id',
    requireAdmin,
    wrap((req, res) => {
      deleteDeliverable(String(req.params.id))
      ok(res, true)
    }),
  )

  app.get(
    '/api/projects/:id/weeks',
    requireAuth,
    wrap((req, res) => {
      ok(res, listWeeklyReports(String(req.params.id)))
    }),
  )

  app.post(
    '/api/projects/:id/weeks',
    requireAdmin,
    wrap((req, res) => {
      ok(
        res,
        createWeeklyReports({
          project_id: String(req.params.id),
          week_start: String(req.body?.week_start ?? ''),
          owner_ids: Array.isArray(req.body?.owner_ids) ? req.body.owner_ids.map(String) : [],
        }),
        201,
      )
    }),
  )

  app.put(
    '/api/weeks/:id',
    requireAuth,
    wrap((req, res) => {
      const user = req.session.user!
      ok(
        res,
        updateWeeklyCompletion(
          String(req.params.id),
          user.id,
          {
            requirements: String(req.body?.requirements ?? ''),
            features: String(req.body?.features ?? ''),
          },
          user.role === 'admin',
        ),
      )
    }),
  )

  app.delete(
    '/api/weeks/:id',
    requireAdmin,
    wrap((req, res) => {
      deleteWeeklyReport(String(req.params.id))
      ok(res, true)
    }),
  )

  app.get(
    '/api/me/workspace',
    requireAuth,
    wrap((req, res) => {
      const user = req.session.user!
      const stages = listStagesForMember(user.id)
      const weeks = listWeeklyReportsForOwner(user.id)
      const projectIds = [...new Set(stages.map((s) => s.project_id))]
      const projects = Object.fromEntries(
        projectIds.map((id) => {
          const p = getProject(id)
          return [id, p?.name ?? '项目']
        }),
      )
      ok(res, { stages, weeks, projects })
    }),
  )
}
