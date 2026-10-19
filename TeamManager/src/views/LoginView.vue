<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { listLoginMembers, type LoginMember } from '@/db/members'
import { useAuthStore } from '@/stores/auth'
import { toast } from '@/utils/toast'

const auth = useAuthStore()
const router = useRouter()

const role = ref<'admin' | 'member'>('admin')
const password = ref('')
const passwordInput = ref<HTMLInputElement | null>(null)
const memberId = ref('')
const members = ref<LoginMember[]>([])
const loading = ref(false)

const regularMembers = computed(() => members.value)

const selectedMember = computed(() => regularMembers.value.find((x) => x.id === memberId.value) ?? null)

const memberNeedsPassword = computed(() => !!selectedMember.value?.has_password)

function clearPassword() {
  password.value = ''
  if (passwordInput.value) passwordInput.value.value = ''
}

function unlockPassword(event: FocusEvent) {
  ;(event.target as HTMLInputElement).removeAttribute('readonly')
}

onMounted(async () => {
  members.value = await listLoginMembers()
  memberId.value = regularMembers.value[0]?.id ?? ''
  clearPassword()
  window.setTimeout(clearPassword, 0)
  window.setTimeout(clearPassword, 300)
  window.setTimeout(clearPassword, 800)
})

watch([role, memberId], () => {
  password.value = ''
})

async function submit() {
  loading.value = true
  try {
    if (role.value === 'admin') {
      if (!password.value) {
        toast('请输入口令')
        return
      }
      if (!(await auth.loginAsAdmin(password.value))) {
        toast('口令错误')
        return
      }
      router.push('/admin')
      return
    }

    if (!regularMembers.value.length || !memberId.value) {
      toast('暂无普通成员')
      return
    }

    const member = selectedMember.value
    if (!member) {
      toast('成员不存在')
      return
    }

    if (member.has_password) {
      if (!password.value) {
        toast('请输入口令')
        return
      }
      if (!(await auth.loginAsMember(memberId.value, password.value))) {
        toast('口令错误')
        return
      }
    } else if (!(await auth.loginAsMember(memberId.value))) {
      toast('登录失败')
      return
    }

    router.push('/workspace')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-wrap">
    <div class="form-card">
      <div class="logo">
        <div class="mark">TM</div>
        <div>
          <h1>TeamManager</h1>
          <p>团队成员与项目实现周期</p>
        </div>
      </div>

      <div class="role-tabs">
        <button type="button" :class="{ on: role === 'admin' }" @click="role = 'admin'">管理员</button>
        <button type="button" :class="{ on: role === 'member' }" @click="role = 'member'">普通成员</button>
      </div>

      <div v-if="role === 'member'" class="field">
        <label>选择成员</label>
        <select v-model="memberId">
          <option v-for="m in regularMembers" :key="m.id" :value="m.id">
            {{ m.name }}{{ m.workstation ? ` · ${m.workstation}` : '' }}
          </option>
        </select>
      </div>

      <div v-if="role === 'admin' || memberNeedsPassword" class="field">
        <label>{{ role === 'admin' ? '管理员口令' : '登录口令' }}</label>
        <input
          ref="passwordInput"
          v-model="password"
          name="access-code"
          type="password"
          autocomplete="new-password"
          readonly
          placeholder="请输入口令"
          @focus="unlockPassword"
          @keyup.enter="submit"
        />
      </div>

      <button class="btn primary w100" :disabled="loading" @click="submit">
        {{ loading ? '进入中…' : '进入' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.login-wrap {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background:
    radial-gradient(1200px 500px at 10% -10%, #d7e6ff 0%, transparent 55%),
    radial-gradient(900px 420px at 100% 0%, #e8f4ef 0%, transparent 50%),
    #f3f6fb;
}
.form-card {
  width: min(420px, 100%);
  background: #fff;
  border: 1px solid #e4ebf5;
  border-radius: 18px;
  padding: 28px 26px;
  box-shadow: 0 18px 40px rgba(36, 59, 107, 0.08);
}
.logo {
  display: flex;
  gap: 14px;
  align-items: center;
  margin-bottom: 22px;
}
.mark {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: #243b6b;
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 700;
  letter-spacing: 0.04em;
}
h1 {
  margin: 0;
  font-size: 1.35rem;
  color: #1d2a44;
}
p {
  margin: 4px 0 0;
  color: #6b7a94;
  font-size: 0.9rem;
}
.role-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 16px;
}
.role-tabs button {
  border: 1px solid #d7e0ee;
  background: #f7f9fc;
  border-radius: 10px;
  padding: 10px;
  cursor: pointer;
  color: #445672;
}
.role-tabs button.on {
  background: #243b6b;
  border-color: #243b6b;
  color: #fff;
}
.field {
  margin-bottom: 14px;
}
.field label {
  display: block;
  margin-bottom: 6px;
  font-size: 0.85rem;
  color: #5a6b86;
}
.field input,
.field select {
  width: 100%;
  border: 1px solid #d7e0ee;
  border-radius: 10px;
  padding: 10px 12px;
  font: inherit;
  background: #fff;
}
.w100 {
  width: 100%;
  margin-top: 8px;
}
</style>
