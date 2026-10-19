import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/login' },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { public: true },
    },
    {
      path: '/admin',
      name: 'admin-home',
      component: () => import('@/views/admin/DashboardView.vue'),
      meta: { role: 'admin' },
    },
    {
      path: '/admin/members',
      name: 'admin-members',
      component: () => import('@/views/admin/MembersView.vue'),
      meta: { role: 'admin' },
    },
    {
      path: '/admin/projects',
      name: 'admin-projects',
      component: () => import('@/views/admin/ProjectsView.vue'),
      meta: { role: 'admin' },
    },
    {
      path: '/admin/projects/:id',
      name: 'admin-project-detail',
      component: () => import('@/views/admin/ProjectDetailView.vue'),
      meta: { role: 'admin' },
    },
    {
      path: '/workspace',
      name: 'workspace',
      component: () => import('@/views/member/WorkspaceView.vue'),
      meta: { role: 'member' },
    },
    {
      path: '/workspace/profile',
      name: 'workspace-profile',
      component: () => import('@/views/member/ProfileView.vue'),
      meta: { role: 'member' },
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (!auth.ready) await auth.hydrate()
  if (to.meta.public) {
    if (auth.isLoggedIn) {
      return auth.isAdmin ? '/admin' : '/workspace'
    }
    return true
  }
  if (!auth.isLoggedIn) return '/login'
  if (to.meta.role === 'admin' && !auth.isAdmin) return '/workspace'
  if (to.meta.role === 'member' && !auth.isMember) return '/admin'
  return true
})

export default router
