import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { initDatabase } from './db/database'
import { useAuthStore } from './stores/auth'
import './styles/main.css'

async function bootstrap() {
  const mountEl = document.getElementById('app')
  if (!mountEl) return

  mountEl.innerHTML =
    '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:system-ui;color:#4a5568;font-size:14px">正在连接服务器…</div>'

  try {
    await initDatabase()
    const app = createApp(App)
    const pinia = createPinia()
    app.use(pinia)
    app.use(router)
    app.mount('#app')
  } catch (e) {
    console.error(e)
    mountEl.innerHTML =
      '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;text-align:center;font-family:system-ui;color:#d64550;font-size:14px;line-height:1.7">无法连接后端服务。请先启动服务器（pnpm dev 或 pnpm start），确认 SQLite API 可用后再刷新。</div>'
  }
}

void bootstrap()
