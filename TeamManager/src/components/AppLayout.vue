<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const adminLinks = [
  { to: '/admin', label: '概览', exact: true },
  { to: '/admin/members', label: '团队成员' },
  { to: '/admin/projects', label: '项目管理' },
]

const memberLinks = [
  { to: '/workspace', label: '我的工作台', exact: true },
  { to: '/workspace/profile', label: '我的档案' },
]

const links = computed(() => (auth.isAdmin ? adminLinks : memberLinks))

function isActive(link: { to: string; exact?: boolean }) {
  if (link.exact) return route.path === link.to
  return route.path === link.to || route.path.startsWith(link.to + '/')
}

async function logout() {
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="shell">
    <aside class="side">
      <div class="brand">
        <div class="logo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="16" rx="3" fill="#fff" />
            <rect x="7" y="9" width="10" height="2" rx="1" fill="#243b6b" />
            <rect x="7" y="13" width="6" height="2" rx="1" fill="#243b6b" />
          </svg>
        </div>
        <div>
          <div class="tt">TeamManager</div>
          <div class="ts">团队 · 项目周期</div>
        </div>
      </div>

      <nav class="nav">
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="nav-item"
          :class="{ on: isActive(link) }"
        >
          {{ link.label }}
        </RouterLink>
      </nav>

      <div class="side-foot">
        <div class="who">
          <div class="av">{{ auth.user?.name?.slice(0, 1) }}</div>
          <div>
            <div class="nm">{{ auth.user?.name }}</div>
            <div class="rl">{{ auth.isAdmin ? '管理员' : '普通成员' }}</div>
          </div>
        </div>
        <button class="btn small w100" @click="logout">退出登录</button>
      </div>
    </aside>

    <div class="main-wrap">
      <header class="top-mobile">
        <div class="brand-m">TeamManager</div>
        <button class="btn small" @click="logout">退出</button>
      </header>
      <nav class="mobile-nav">
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="mnav"
          :class="{ on: isActive(link) }"
        >
          {{ link.label }}
        </RouterLink>
      </nav>
      <main class="main">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.shell {
  display: flex;
  min-height: 100vh;
}

.side {
  width: var(--nav-w);
  flex: none;
  background: rgba(255, 255, 255, 0.86);
  backdrop-filter: blur(12px);
  border-right: 1px solid var(--line);
  padding: 20px 14px;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 8px 18px;
}

.logo {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--brand);
  display: flex;
  align-items: center;
  justify-content: center;
}

.tt {
  font-weight: 700;
  font-size: 15px;
}

.ts {
  font-size: 11.5px;
  color: var(--ink-3);
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.nav-item {
  padding: 10px 12px;
  border-radius: 10px;
  color: var(--ink-2);
  font-size: 14px;
  font-weight: 500;
  transition: background 0.15s, color 0.15s;
}

.nav-item:hover {
  background: var(--brand-soft);
  color: var(--brand);
}

.nav-item.on {
  background: var(--brand);
  color: #fff;
}

.side-foot {
  border-top: 1px solid var(--line);
  padding-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.who {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 4px;
}

.av {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--brand-soft);
  color: var(--brand);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.nm {
  font-size: 13.5px;
  font-weight: 600;
}

.rl {
  font-size: 11.5px;
  color: var(--ink-3);
}

.w100 {
  width: 100%;
}

.main-wrap {
  flex: 1;
  min-width: 0;
}

.main {
  max-width: 1100px;
  margin: 0 auto;
  padding: 28px 28px 80px;
}

.top-mobile {
  display: none;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid var(--line);
  position: sticky;
  top: 0;
  z-index: 20;
}

.brand-m {
  font-weight: 700;
}

.mobile-nav {
  display: none;
}

@media (max-width: 860px) {
  .side {
    display: none;
  }
  .top-mobile {
    display: flex;
  }
  .mobile-nav {
    display: flex;
    gap: 4px;
    padding: 8px 12px;
    overflow-x: auto;
    background: rgba(255, 255, 255, 0.92);
    border-bottom: 1px solid var(--line);
    position: sticky;
    top: 49px;
    z-index: 19;
  }
  .mnav {
    flex: none;
    padding: 8px 12px;
    border-radius: 999px;
    font-size: 13px;
    color: var(--ink-2);
    white-space: nowrap;
  }
  .mnav.on {
    background: var(--brand);
    color: #fff;
    font-weight: 600;
  }
  .main {
    padding: 20px 16px 72px;
  }
}
</style>
