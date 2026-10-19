import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/api/client'
import type { SessionUser } from '@/db/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<SessionUser | null>(null)
  const ready = ref(false)

  const isAdmin = computed(() => user.value?.role === 'admin')
  const isMember = computed(() => user.value?.role === 'member')
  const isLoggedIn = computed(() => !!user.value)

  async function hydrate() {
    try {
      user.value = await api<SessionUser | null>('/api/auth/me')
    } catch {
      user.value = null
    } finally {
      ready.value = true
    }
  }

  async function loginAsAdmin(password: string): Promise<boolean> {
    try {
      user.value = await api<SessionUser>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ role: 'admin', password }),
      })
      return true
    } catch {
      return false
    }
  }

  async function loginAsMember(memberId: string, password?: string): Promise<boolean> {
    try {
      user.value = await api<SessionUser>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ role: 'member', memberId, password: password ?? '' }),
      })
      return true
    } catch {
      return false
    }
  }

  async function logout() {
    try {
      await api<boolean>('/api/auth/logout', { method: 'POST', body: '{}' })
    } catch {
      // ignore
    }
    user.value = null
  }

  function refreshName(name: string) {
    if (!user.value) return
    user.value = { ...user.value, name }
  }

  return {
    user,
    ready,
    isAdmin,
    isMember,
    isLoggedIn,
    hydrate,
    loginAsAdmin,
    loginAsMember,
    logout,
    refreshName,
  }
})
