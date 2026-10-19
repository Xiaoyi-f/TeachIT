<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  createProject,
  deleteProject,
  getDashboard,
  updateProject,
  type ProjectStats,
} from '@/db/projects'
import type { Project, ProjectStatus } from '@/db/types'
import StatusBadge from '@/components/StatusBadge.vue'
import { toast } from '@/utils/toast'

const router = useRouter()
const projects = ref<Array<Project & { stats: ProjectStats | null }>>([])
const showModal = ref(false)
const editingId = ref<string | null>(null)

const form = reactive({
  name: '',
  description: '',
  start_date: '',
  status: 'planning' as ProjectStatus,
})

async function reload() {
  const data = await getDashboard()
  projects.value = data.projects
}

onMounted(() => {
  void reload()
})

function openCreate() {
  editingId.value = null
  form.name = ''
  form.description = ''
  form.start_date = new Date().toISOString().slice(0, 10)
  form.status = 'planning'
  showModal.value = true
}

function openEdit(p: Project) {
  editingId.value = p.id
  form.name = p.name
  form.description = p.description
  form.start_date = p.start_date
  form.status = p.status
  showModal.value = true
}

async function save() {
  if (!form.name.trim()) {
    toast('请填写项目名称')
    return
  }
  if (editingId.value) {
    await updateProject(editingId.value, { ...form })
    toast('项目已更新')
  } else {
    const p = await createProject({ ...form })
    toast('项目已创建，请配置实现周期')
    showModal.value = false
    router.push(`/admin/projects/${p.id}`)
    return
  }
  showModal.value = false
  await reload()
}

async function remove(p: Project) {
  if (!confirm(`确定删除项目「${p.name}」及其全部阶段数据？`)) return
  await deleteProject(p.id)
  await reload()
  toast('已删除项目')
}
</script>

<template>
  <div>
    <div class="page-head">
      <div>
        <h1>项目管理</h1>
        <div class="sub">创建项目并进入详情配置阶段、任务、负责人与交付物</div>
      </div>
      <button class="btn primary" @click="openCreate">新建项目</button>
    </div>

    <div v-if="!projects.length" class="card empty">
      <div class="icon">📁</div>
      <b>暂无项目</b>
      先创建一个项目，再规划实现周期表
    </div>

    <div v-else class="grid g2">
      <article v-for="p in projects" :key="p.id" class="card pcard">
        <div class="row">
          <h3>{{ p.name }}</h3>
          <div class="spacer"></div>
          <StatusBadge :status="p.status" kind="project" />
        </div>
        <p class="desc">{{ p.description || '暂无描述' }}</p>
        <div class="stats">
          <span>{{ p.stats?.stages ?? 0 }} 个阶段</span>
          <span v-if="p.start_date">起始 {{ p.start_date }}</span>
        </div>
        <div class="row mt">
          <button class="btn primary small" @click="router.push(`/admin/projects/${p.id}`)">
            管理周期
          </button>
          <button class="btn small" @click="openEdit(p)">编辑</button>
          <button class="btn small danger" @click="remove(p)">删除</button>
        </div>
      </article>
    </div>

    <div v-if="showModal" class="modal-mask">
      <div class="modal" style="max-width: 520px">
        <h3>{{ editingId ? '编辑项目' : '新建项目' }}</h3>
        <div class="modal-sub">创建后可继续配置阶段与评估调整期</div>
        <div class="grid g2">
          <div class="field" style="grid-column: 1 / -1">
            <label>项目名称 *</label>
            <input v-model="form.name" placeholder="例如：智能客服系统" />
          </div>
          <div class="field">
            <label>起始日期</label>
            <input v-model="form.start_date" type="date" />
          </div>
          <div class="field">
            <label>状态</label>
            <select v-model="form.status">
              <option value="planning">筹划中</option>
              <option value="active">进行中</option>
              <option value="completed">已完成</option>
              <option value="archived">已归档</option>
            </select>
          </div>
          <div class="field" style="grid-column: 1 / -1">
            <label>项目描述</label>
            <textarea v-model="form.description" placeholder="目标、范围、里程碑说明…"></textarea>
          </div>
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
.pcard h3 {
  font-size: 16px;
}
.desc {
  font-size: 13.5px;
  color: var(--ink-3);
  margin: 10px 0 12px;
  min-height: 40px;
}
.stats {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 12.5px;
  color: var(--ink-2);
}
.stats span {
  background: #f4f7fb;
  padding: 4px 10px;
  border-radius: 999px;
}
.mt {
  margin-top: 14px;
}
</style>
