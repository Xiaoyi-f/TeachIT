import path from 'node:path'
import { fileURLToPath } from 'node:url'
import cors from 'cors'
import express from 'express'
import session from 'express-session'
import { getDbPath, initDatabase } from './db'
import { registerRoutes } from './routes'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.PORT || 3000)
const isProd = process.env.NODE_ENV === 'production' || process.argv.includes('--serve')

initDatabase()

const app = express()
app.set('trust proxy', 1)
app.use(
  cors({
    origin: isProd ? true : ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  }),
)
app.use(express.json({ limit: '2mb' }))
app.use(
  session({
    name: 'tm.sid',
    secret: process.env.TM_SESSION_SECRET || 'teammanager-dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.TM_COOKIE_SECURE === '1',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }),
)

registerRoutes(app)

const distDir = path.resolve(__dirname, '../dist')
if (isProd) {
  app.use(express.static(distDir))
  app.get(/.*/, (_req, res) => {
    res.sendFile(path.join(distDir, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`[TeamManager] API http://localhost:${PORT}`)
  console.log(`[TeamManager] SQLite ${getDbPath()}`)
})
