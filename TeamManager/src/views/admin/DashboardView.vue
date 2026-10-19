<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getDashboard, type ProjectStats } from '@/db/projects'
import type { Project } from '@/db/types'
import StatusBadge from '@/components/StatusBadge.vue'

const router = useRouter()
const projects = ref<Array<Project & { stats: ProjectStats | null }>>([])
const memberCount = ref(0)

onMounted(async () => {
  const data = await getDashboard()
  projects.value = data.projects
  memberCount.value = data.memberCount
})

const totals = computed(() => {
  let stages = 0
  let done = 0
  for (const p of projects.value) {
    if (!p.stats) continue
    stages += p.stats.stages
    done += p.stats.doneStages
  }
  return {
    projects: projects.value.length,
    members: memberCount.value,
    stages,
    doneStages: done,
  }
})

function go(id: string) {
  router.push(`/admin/projects/${id}`)
}
</script>

<template>
  <div>
    <div class="page-head">
      <div>
        <h1>工作台概览</h1>
        <div class="sub">一眼掌握团队规模与各项目实现周期进展</div>
      </div>
      <button class="btn primary" @click="router.push('/admin/projects')">管理项目</button>
    </div>

    <div class="summary-grid">
      <div class="summ">
        <div class="sv">{{ totals.projects }}</div>
        <div class="st">项目数</div>
      </div>
      <div class="summ">
        <div class="sv">{{ totals.members }}</div>
        <div class="st">团队成员</div>
      </div>
      <div class="summ">
        <div class="sv">{{ totals.stages }}</div>
        <div class="st">阶段总数</div>
      </div>
      <div class="summ">
        <div class="sv">{{ totals.doneStages }}</div>
        <div class="st">已完成阶段</div>
      </div>
    </div>

    <div class="card">
      <div class="section-title" style="margin-top: 0">
        <span>项目列表</span>
      </div>
      <div v-if="!projects.length" class="empty">
        <div class="icon">📁</div>
        <b>还没有项目</b>
        点击右上角创建第一个项目，并配置实现周期阶段
      </div>
      <div v-else class="plist">
        <button v-for="p in projects" :key="p.id" class="prow" @click="go(p.id)">
          <div class="left">
            <div class="name">{{ p.name }}</div>
            <div class="meta">
              {{ p.stats?.stages ?? 0 }} 个阶段 · 已完成 {{ p.stats?.doneStages ?? 0 }}
            </div>
          </div>
          <StatusBadge :status="p.status" kind="project" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.plist {
  display: grid;
  gap: 10px;
}
.prow {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  width: 100%;
  text-align: left;
  border: 1px solid #e4ebf5;
  background: #fbfcfe;
  border-radius: 12px;
  padding: 14px 16px;
  cursor: pointer;
}
.prow:hover {
  border-color: #b9c8e0;
}
.name {
  font-weight: 600;
  color: #1d2a44;
}
.meta {
  margin-top: 4px;
  font-size: 0.85rem;
  color: #6b7a94;
}
</style>
