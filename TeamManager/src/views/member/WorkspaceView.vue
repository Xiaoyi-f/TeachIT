<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getWorkspace, updateDeliverableActual, updateTask } from '@/db/projects'
import type { DeliverableStatus, StageDetail, WeeklyReport } from '@/db/types'
import { formatWeekRange, updateWeeklyCompletion } from '@/db/weeks'
import { useAuthStore } from '@/stores/auth'
import StatusBadge from '@/components/StatusBadge.vue'
import { toast } from '@/utils/toast'

const auth = useAuthStore()
const stages = ref<StageDetail[]>([])
const weeks = ref<WeeklyReport[]>([])
const projectNames = ref<Record<string, string>>({})

async function reload() {
  if (!auth.user) return
  const data = await getWorkspace()
  stages.value = data.stages
  weeks.value = data.weeks
  projectNames.value = data.projects
}

onMounted(() => {
  void reload()
})

const owned = computed(() => stages.value.filter((s) => s.owner_id === auth.user?.id))
const assisting = computed(() => stages.value.filter((s) => s.owner_id !== auth.user?.id))

function projectName(id: string) {
  return projectNames.value[id] ?? '项目'
}

async function saveActual(delivId: string, content: string, status: DeliverableStatus) {
  if (!auth.user) return
  try {
    await updateDeliverableActual(delivId, auth.user.id, { actual_content: content, status })
    await reload()
    toast('交付情况已保存')
  } catch (e) {
    toast(e instanceof Error ? e.message : '保存失败')
  }
}

function onStatusChange(delivId: string, status: number, content: string) {
  void saveActual(delivId, content, status as DeliverableStatus)
}

async function saveWeek(id: string, requirements: string, features: string) {
  if (!auth.user) return
  try {
    await updateWeeklyCompletion(id, auth.user.id, { requirements, features })
    await reload()
    toast('本周完成情况已保存')
  } catch (e) {
    toast(e instanceof Error ? e.message : '保存失败')
  }
}

async function setTaskStatus(taskId: string, status: 'pending' | 'doing' | 'done', isOwner: boolean) {
  if (!isOwner) {
    toast('仅负责人可更新任务状态')
    return
  }
  await updateTask(taskId, { status })
  await reload()
}
</script>

<template>
  <div>
    <div class="page-head">
      <div>
        <h1>我的工作台</h1>
        <div class="sub">管理员分配负责人后，负责人可填写阶段交付物；辅助成员可查看协作阶段</div>
      </div>
    </div>

    <div class="summary-grid">
      <div class="summ">
        <div class="sv">{{ owned.length }}</div>
        <div class="st">负责阶段</div>
      </div>
      <div class="summ">
        <div class="sv">{{ assisting.length }}</div>
        <div class="st">辅助阶段</div>
      </div>
    </div>

    <div v-if="!stages.length" class="card empty">
      <div class="icon">📄</div>
      <b>暂无分配的阶段</b>
      请等待管理员在项目周期中为你指定负责人或辅助成员
    </div>

    <template v-if="owned.length">
      <div class="section-title"><span>我负责的阶段</span></div>
      <div v-for="s in owned" :key="s.id" class="stage">
        <div class="stage-hd">
          <div class="info">
            <div class="eyebrow">{{ projectName(s.project_id) }}</div>
            <div class="title">{{ s.title }}</div>
            <div class="meta">
              辅助：{{ s.assistants.map((a) => a.name).join('、') || '无' }}
              <template v-if="s.start_date || s.end_date">
                · {{ s.start_date || '?' }} → {{ s.end_date || '?' }}
              </template>
            </div>
          </div>
          <StatusBadge :status="s.status" kind="stage" />
        </div>
        <div class="stage-bd">
          <p v-if="s.description" class="desc">{{ s.description }}</p>

          <div class="section-title" style="margin-top: 0"><span>任务</span></div>
          <div v-if="!s.tasks.length" class="hint mb">暂无任务</div>
          <div v-for="t in s.tasks" :key="t.id" class="task">
            <span>{{ t.title }}</span>
            <select
              :value="t.status"
              @change="setTaskStatus(t.id, ($event.target as HTMLSelectElement).value as any, true)"
            >
              <option value="pending">待办</option>
              <option value="doing">进行中</option>
              <option value="done">完成</option>
            </select>
          </div>

          <div class="section-title"><span>交付物 · 填写实际实现</span></div>
          <div v-for="d in s.deliverables" :key="d.id" class="deliv">
            <div class="db-h">
              <b>{{ d.title }}</b>
              <select
                :value="d.status"
                @change="
                  onStatusChange(
                    d.id,
                    Number(($event.target as HTMLSelectElement).value),
                    d.actual_content,
                  )
                "
              >
                <option :value="0">未开始</option>
                <option :value="1">进行中</option>
                <option :value="2">已完成</option>
                <option :value="3">延期</option>
              </select>
            </div>
            <div v-if="d.planned_desc" class="req">预定要求：{{ d.planned_desc }}</div>
            <div class="field">
              <label>实际实现情况</label>
              <textarea
                :value="d.actual_content"
                rows="3"
                placeholder="填写完成内容、链接、文件说明…"
                @change="
                  saveActual(
                    d.id,
                    ($event.target as HTMLTextAreaElement).value,
                    d.status,
                  )
                "
              />
            </div>
          </div>

          <div v-if="s.eval_notes || s.eval_adjustments || s.eval_start_date" class="eval">
            <b>评估调整期</b>
            <div class="hint">{{ s.eval_start_date || '未设' }} → {{ s.eval_end_date || '未设' }}</div>
            <div v-if="s.eval_notes">评估：{{ s.eval_notes }}</div>
            <div v-if="s.eval_adjustments">调整：{{ s.eval_adjustments }}</div>
          </div>
        </div>
      </div>
    </template>

    <template v-if="assisting.length">
      <div class="section-title"><span>我辅助的阶段（只读）</span></div>
      <div v-for="s in assisting" :key="s.id" class="stage soft">
        <div class="stage-hd">
          <div class="info">
            <div class="eyebrow">{{ projectName(s.project_id) }}</div>
            <div class="title">{{ s.title }}</div>
            <div class="meta">负责人：{{ s.owner_name || '未指定' }}</div>
          </div>
          <StatusBadge :status="s.status" kind="stage" />
        </div>
        <div class="stage-bd">
          <div v-for="d in s.deliverables" :key="d.id" class="deliv readonly">
            <div class="db-h">
              <b>{{ d.title }}</b>
              <StatusBadge :status="d.status" kind="deliverable" />
            </div>
            <div class="hint">仅负责人可填写实际交付。当前内容：{{ d.actual_content || '尚未填写' }}</div>
          </div>
        </div>
      </div>
    </template>

    <div class="section-title"><span>我的每周完成情况</span></div>
    <div v-if="!weeks.length" class="card empty">
      <b>暂无分配给你的周</b>
      管理员在项目里指定你为某周负责人后，可在这里填写完成的需求和功能
    </div>
    <article v-for="w in weeks" :key="w.id" class="stage">
      <div class="stage-hd">
        <div class="info">
          <div class="eyebrow">{{ projectName(w.project_id) }}</div>
          <div class="title">{{ formatWeekRange(w.week_start) }}</div>
        </div>
      </div>
      <div class="stage-bd">
        <div class="field mb">
          <label>本周完成的需求</label>
          <textarea
            :value="w.requirements"
            rows="3"
            placeholder="写明本周做了哪些需求"
            @change="saveWeek(w.id, ($event.target as HTMLTextAreaElement).value, w.features)"
          />
        </div>
        <div class="field">
          <label>本周完成的功能</label>
          <textarea
            :value="w.features"
            rows="3"
            placeholder="写明本周做了哪些功能"
            @change="saveWeek(w.id, w.requirements, ($event.target as HTMLTextAreaElement).value)"
          />
        </div>
      </div>
    </article>
  </div>
</template>

<style scoped>
.stage {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--r);
  box-shadow: var(--shadow);
  margin-bottom: 14px;
  overflow: hidden;
}
.stage.soft {
  opacity: 0.96;
}
.stage-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 18px;
  background: #fbfcfe;
  border-bottom: 1px solid var(--line);
  flex-wrap: wrap;
}
.eyebrow {
  font-size: 12px;
  color: var(--brand-2);
  font-weight: 600;
  margin-bottom: 2px;
}
.title {
  font-weight: 700;
  font-size: 15px;
}
.meta {
  font-size: 12.5px;
  color: var(--ink-3);
  margin-top: 2px;
}
.stage-bd {
  padding: 16px 18px 20px;
}
.desc {
  font-size: 13.5px;
  color: var(--ink-2);
  margin-bottom: 12px;
}
.mb {
  margin-bottom: 10px;
}
.task {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 10px;
  border: 1px solid var(--line);
  border-radius: 8px;
  margin-bottom: 6px;
  font-size: 14px;
}
.task select {
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 5px 8px;
  font-size: 13px;
}
.deliv {
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 12px;
  background: #fafbfd;
  margin-bottom: 10px;
}
.deliv.readonly {
  background: #f7f8fa;
}
.db-h {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}
.db-h select {
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 5px 8px;
  font-size: 13px;
}
.req {
  font-size: 12.5px;
  color: var(--ink-3);
  background: var(--brand-soft);
  padding: 8px 10px;
  border-radius: 8px;
  margin-bottom: 10px;
  white-space: pre-wrap;
}
.eval {
  margin-top: 12px;
  padding: 12px;
  border-radius: 10px;
  background: #fdf6e8;
  border: 1px solid #f0e0c0;
  font-size: 13.5px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
