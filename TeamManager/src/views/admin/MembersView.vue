<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { createMember, deleteMember, listMembers, updateMember, type MemberInput } from '@/db/members'
import type { Member } from '@/db/types'
import { toast } from '@/utils/toast'

const members = ref<Member[]>([])
const q = ref('')
const showModal = ref(false)
const editingId = ref<string | null>(null)

const emptyForm = (): MemberInput => ({
  name: '',
  gender: '男',
  age: null,
  birthday: '',
  workstation: '',
  major: '',
  grade: '',
  college: '',
  education: '本科',
  email: '',
  phone: '',
  id_card: '',
  workstation_desc: '',
  tech_stack: '',
  role: 'member',
})

const form = reactive(emptyForm())
const password = ref('')

async function reload() {
  members.value = await listMembers()
}

onMounted(() => {
  void reload()
})

const filtered = computed(() => {
  const s = q.value.trim().toLowerCase()
  if (!s) return members.value
  return members.value.filter((m) =>
    [m.name, m.major, m.college, m.workstation, m.tech_stack, m.email, m.phone]
      .join(' ')
      .toLowerCase()
      .includes(s),
  )
})

function openCreate() {
  editingId.value = null
  Object.assign(form, emptyForm())
  password.value = ''
  showModal.value = true
}

function openEdit(m: Member) {
  editingId.value = m.id
  Object.assign(form, {
    name: m.name,
    gender: m.gender === '女' ? '女' : '男',
    age: m.age,
    birthday: m.birthday,
    workstation: m.workstation,
    major: m.major,
    grade: m.grade,
    college: m.college,
    education: ['专科', '本科', '硕士', '博士', '其他'].includes(m.education) ? m.education : '本科',
    email: m.email,
    phone: m.phone,
    id_card: m.id_card,
    workstation_desc: m.workstation_desc,
    tech_stack: m.tech_stack,
    role: m.role,
  })
  password.value = m.login_password
  showModal.value = true
}

async function save() {
  if (!form.name.trim()) {
    toast('请填写姓名')
    return
  }
  try {
    const payload: MemberInput = {
      ...form,
      age: form.age === null || form.age === ('' as unknown) ? null : Number(form.age),
      password: password.value,
    }
    if (editingId.value) await updateMember(editingId.value, payload)
    else await createMember(payload)
    showModal.value = false
    await reload()
    toast('已保存成员信息')
  } catch (e) {
    toast(e instanceof Error ? e.message : '保存失败')
  }
}

async function remove(m: Member) {
  if (!confirm(`确定删除成员「${m.name}」？`)) return
  try {
    await deleteMember(m.id)
    await reload()
    toast('已删除')
  } catch (e) {
    toast(e instanceof Error ? e.message : '删除失败')
  }
}
</script>

<template>
  <div>
    <div class="page-head">
      <div>
        <h1>团队成员</h1>
        <div class="sub">管理姓名、工位、专业背景、联系方式与技术栈等完整档案</div>
      </div>
      <button class="btn primary" @click="openCreate">添加成员</button>
    </div>

    <div class="card mb">
      <div class="field">
        <label>搜索</label>
        <input v-model="q" placeholder="姓名 / 专业 / 学院 / 工位 / 技术栈 / 联系方式" />
      </div>
    </div>

    <div v-if="!filtered.length" class="card empty">
      <div class="icon">👤</div>
      <b>暂无成员</b>
      点击「添加成员」录入团队档案
    </div>

    <div v-else class="mgrid">
      <article v-for="m in filtered" :key="m.id" class="mcard">
        <div class="mhd">
          <div class="av">{{ m.name.slice(0, 1) }}</div>
          <div class="grow">
            <div class="nm">
              {{ m.name }}
              <span v-if="m.role === 'admin'" class="badge st-active">管理员</span>
            </div>
            <div class="meta">
              {{ m.gender || '—' }} · {{ m.age ?? '—' }}岁 · {{ m.workstation || '未设工位' }}
            </div>
          </div>
        </div>
        <div class="tags">
          <span v-if="m.college" class="chip">{{ m.college }}</span>
          <span v-if="m.major" class="chip">{{ m.major }}</span>
          <span v-if="m.grade" class="chip">{{ m.grade }}</span>
          <span v-if="m.education" class="chip">{{ m.education }}</span>
        </div>
        <p v-if="m.tech_stack" class="stack">{{ m.tech_stack }}</p>
        <div class="contacts">
          <span v-if="m.email">{{ m.email }}</span>
          <span v-if="m.phone">{{ m.phone }}</span>
        </div>
        <div class="acts">
          <button class="btn small" @click="openEdit(m)">编辑</button>
          <button class="btn small danger" @click="remove(m)">删除</button>
        </div>
      </article>
    </div>

    <div v-if="showModal" class="modal-mask">
      <div class="modal">
        <h3>{{ editingId ? '编辑成员' : '添加成员' }}</h3>

        <div class="grid g2">
          <div class="field"><label>姓名</label><input v-model="form.name" /></div>
          <div class="field">
            <label>性别</label>
            <select v-model="form.gender">
              <option value="男">男</option>
              <option value="女">女</option>
            </select>
          </div>
          <div class="field"><label>年龄</label><input v-model.number="form.age" type="number" min="1" max="120" /></div>
          <div class="field"><label>生日</label><input v-model="form.birthday" type="date" /></div>
          <div class="field"><label>工位</label><input v-model="form.workstation" placeholder="如 B-03" /></div>
          <div class="field"><label>专业</label><input v-model="form.major" /></div>
          <div class="field"><label>年级</label><input v-model="form.grade" placeholder="如 大三 / 研一" /></div>
          <div class="field"><label>学院</label><input v-model="form.college" /></div>
          <div class="field">
            <label>学历</label>
            <select v-model="form.education">
              <option value="专科">专科</option>
              <option value="本科">本科</option>
              <option value="硕士">硕士</option>
              <option value="博士">博士</option>
              <option value="其他">其他</option>
            </select>
          </div>
          <div class="field"><label>邮箱</label><input v-model="form.email" type="email" /></div>
          <div class="field"><label>联系电话</label><input v-model="form.phone" /></div>
          <div class="field"><label>身份证</label><input v-model="form.id_card" /></div>
          <div class="field">
            <label>角色</label>
            <select v-model="form.role">
              <option value="member">普通成员</option>
              <option value="admin">管理员</option>
            </select>
          </div>
          <div class="field">
            <label>登录口令</label>
            <input v-model="password" type="text" autocomplete="off" />
          </div>
        </div>

        <div class="field mt">
          <label>工位描述</label>
          <textarea v-model="form.workstation_desc" placeholder="位置、设备、备注…"></textarea>
        </div>
        <div class="field mt">
          <label>技术栈与特长</label>
          <textarea v-model="form.tech_stack" placeholder="如 Vue / Python / 数据分析…"></textarea>
        </div>

        <div class="modal-actions">
          <button class="btn" @click="showModal = false">取消</button>
          <button class="btn primary" @click="save">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mb {
  margin-bottom: 16px;
}
.mt {
  margin-top: 14px;
}
.mgrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
}
.mcard {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--r);
  box-shadow: var(--shadow);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: transform 0.15s, box-shadow 0.15s;
}
.mcard:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(26, 35, 50, 0.1);
}
.mhd {
  display: flex;
  gap: 12px;
  align-items: center;
}
.av {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: var(--brand-soft);
  color: var(--brand);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex: none;
}
.grow {
  min-width: 0;
  flex: 1;
}
.nm {
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.meta {
  font-size: 12.5px;
  color: var(--ink-3);
  margin-top: 2px;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.stack {
  font-size: 13px;
  color: var(--ink-2);
  background: #f6f8fb;
  border-radius: 8px;
  padding: 8px 10px;
}
.contacts {
  font-size: 12.5px;
  color: var(--ink-3);
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.acts {
  display: flex;
  gap: 8px;
  margin-top: auto;
  padding-top: 4px;
}
</style>
