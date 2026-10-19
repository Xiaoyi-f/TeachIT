<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { getMember, updateMember } from '@/db/members'
import { useAuthStore } from '@/stores/auth'
import { toast } from '@/utils/toast'

const GENDERS = ['男', '女'] as const
const EDUCATIONS = ['专科', '本科', '硕士', '博士', '其他'] as const

const auth = useAuthStore()
const loaded = ref(false)
const workstation = ref('')
const workstationDesc = ref('')

const form = reactive({
  name: '',
  gender: '男',
  age: null as number | null,
  birthday: '',
  major: '',
  grade: '',
  college: '',
  education: '本科',
  email: '',
  phone: '',
  id_card: '',
  tech_stack: '',
})

onMounted(async () => {
  if (!auth.user) return
  const m = await getMember(auth.user.id)
  if (!m) return
  Object.assign(form, {
    name: m.name,
    gender: GENDERS.includes(m.gender as (typeof GENDERS)[number]) ? m.gender : '男',
    age: m.age,
    birthday: m.birthday,
    major: m.major,
    grade: m.grade,
    college: m.college,
    education: EDUCATIONS.includes(m.education as (typeof EDUCATIONS)[number]) ? m.education : '本科',
    email: m.email,
    phone: m.phone,
    id_card: m.id_card,
    tech_stack: m.tech_stack,
  })
  workstation.value = m.workstation
  workstationDesc.value = m.workstation_desc
  loaded.value = true
})

async function saveProfile() {
  if (!auth.user) return
  if (!form.name.trim()) {
    toast('姓名不能为空')
    return
  }
  await updateMember(auth.user.id, {
    ...form,
    workstation: workstation.value,
    workstation_desc: workstationDesc.value,
    role: 'member',
  })
  auth.refreshName(form.name.trim())
  toast('档案已保存')
}
</script>

<template>
  <div>
    <div class="page-head">
      <div>
        <h1>我的档案</h1>
        <div class="sub">工位与登录口令由管理员维护</div>
      </div>
      <button class="btn primary" :disabled="!loaded" @click="saveProfile">保存档案</button>
    </div>

    <div class="card">
      <div class="grid g2">
        <div class="field"><label>姓名</label><input v-model="form.name" /></div>
        <div class="field">
          <label>性别</label>
          <select v-model="form.gender">
            <option value="男">男</option>
            <option value="女">女</option>
          </select>
        </div>
        <div class="field"><label>年龄</label><input v-model.number="form.age" type="number" /></div>
        <div class="field"><label>生日</label><input v-model="form.birthday" type="date" /></div>
        <div class="field">
          <label>工位</label>
          <input :value="workstation || '未设置'" readonly />
        </div>
        <div class="field"><label>专业</label><input v-model="form.major" /></div>
        <div class="field"><label>年级</label><input v-model="form.grade" /></div>
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
        <div class="field"><label>邮箱</label><input v-model="form.email" /></div>
        <div class="field"><label>联系电话</label><input v-model="form.phone" /></div>
        <div class="field"><label>身份证</label><input v-model="form.id_card" /></div>
      </div>
      <div class="field mt">
        <label>工位描述</label>
        <textarea :value="workstationDesc || '未设置'" readonly />
      </div>
      <div class="field mt">
        <label>技术栈与特长</label>
        <textarea v-model="form.tech_stack" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.mt {
  margin-top: 14px;
}
input[readonly],
textarea[readonly] {
  background: #f4f6fa;
  color: var(--ink-2);
  cursor: default;
}
</style>
