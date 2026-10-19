<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { listMembers } from '@/db/members'
import {
  addDeliverable,
  addTask,
  createStage,
  deleteDeliverable,
  deleteStage,
  deleteTask,
  getProjectDetail,
  releaseStageOwner,
  updateDeliverablePlan,
  updateProject,
  updateStage,
  updateTask,
  type ProjectDetailWithStats,
  type ProjectStats,
  type StageInput,
} from '@/db/projects'
import type { Member, StageDetail, StageStatus, WeeklyReport } from '@/db/types'
import { createWeeklyReports, deleteWeeklyReport, formatWeekRange, listWeeklyReports } from '@/db/weeks'
import StatusBadge from '@/components/StatusBadge.vue'
import { toast } from '@/utils/toast'

const route = useRoute()
const router = useRouter()
const project = ref<ProjectDetailWithStats | null>(null)
const members = ref<Member[]>([])
const weeks = ref<WeeklyReport[]>([])
const weekStart = ref('')
const weekOwnerIds = ref<string[]>([])
const showStageModal = ref(false)
const editingStageId = ref<string | null>(null)
const expanded = ref<Record<string, boolean>>({})

const stageForm = reactive({
  title: '',
  description: '',
  start_date: '',
  end_date: '',
  owner_id: '' as string,
  assistant_ids: [] as string[],
  eval_start_date: '',
  eval_end_date: '',
  eval_notes: '',
  eval_adjustments: '',
  status: 'pending' as StageStatus,
  taskLines: '',
  deliverableLines: '',
})

const projectId = computed(() => String(route.params.id))
const stats = computed<ProjectStats | null>(() => project.value?.stats ?? null)
const weekGroups = computed(() => {
  const groups: { week_start: string; reports: WeeklyReport[] }[] = []
  for (const report of weeks.value) {
    const found = groups.find((group) => group.week_start === report.week_start)
    if (found) found.reports.push(report)
    else groups.push({ week_start: report.week_start, reports: [report] })
  }
  return groups
})

function toggleWeekOwner(id: string) {
  const index = weekOwnerIds.value.indexOf(id)
  if (index >= 0) weekOwnerIds.value.splice(index, 1)
  else weekOwnerIds.value.push(id)
}

const allWeekOwnersSelected = computed(
  () => members.value.length > 0 && weekOwnerIds.value.length === members.value.length,
)

function toggleAllWeekOwners() {
  weekOwnerIds.value = allWeekOwnersSelected.value ? [] : members.value.map((member) => member.id)
}

async function reload() {
  project.value = await getProjectDetail(projectId.value)
  if (!project.value) {
    toast('项目不存在')
    router.push('/admin/projects')
    return
  }
  weeks.value = await listWeeklyReports(project.value.id)
}

async function addWeek() {
  if (!project.value) return
  if (!weekStart.value || !weekOwnerIds.value.length) {
    toast('请选择周起始日和负责人')
    return
  }
  try {
    const result = await createWeeklyReports({
      project_id: project.value.id,
      week_start: weekStart.value,
      owner_ids: weekOwnerIds.value,
    })
    weekOwnerIds.value = []
    weeks.value = await listWeeklyReports(project.value.id)
    toast(
      result.skipped
        ? `已添加 ${result.created} 人，${result.skipped} 人已在该周`
        : `已添加 ${result.created} 名负责人`,
    )
  } catch (e) {
    toast(e instanceof Error ? e.message : '添加失败')
  }
}

async function removeWeek(id: string) {
  if (!project.value || !confirm('删除这条周记录？')) return
  await deleteWeeklyReport(id)
  weeks.value = await listWeeklyReports(project.value.id)
}

onMounted(async () => {
  members.value = (await listMembers()).filter((m) => m.role === 'member')
  await reload()
})

watch(projectId, () => {
  void reload()
})

function toggle(id: string) {
  expanded.value[id] = !expanded.value[id]
}

function openCreateStage() {
  editingStageId.value = null
  Object.assign(stageForm, {
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    owner_id: '',
    assistant_ids: [],
    eval_start_date: '',
    eval_end_date: '',
    eval_notes: '',
    eval_adjustments: '',
    status: 'pending',
    taskLines: '',
    deliverableLines: '',
  })
  showStageModal.value = true
}

function openEditStage(s: StageDetail) {
  editingStageId.value = s.id
  Object.assign(stageForm, {
    title: s.title,
    description: s.description,
    start_date: s.start_date,
    end_date: s.end_date,
    owner_id: s.owner_id ?? '',
    assistant_ids: s.assistants.map((a) => a.id),
    eval_start_date: s.eval_start_date,
    eval_end_date: s.eval_end_date,
    eval_notes: s.eval_notes,
    eval_adjustments: s.eval_adjustments,
    status: s.status,
    taskLines: '',
    deliverableLines: '',
  })
  showStageModal.value = true
}

function toggleAssistant(id: string) {
  const i = stageForm.assistant_ids.indexOf(id)
  if (i >= 0) stageForm.assistant_ids.splice(i, 1)
  else stageForm.assistant_ids.push(id)
}

function parseLines(text: string) {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, ...rest] = line.split('|')
      return { title: (title || '').trim(), description: rest.join('|').trim() }
    })
}

async function saveStage() {
  if (!stageForm.title.trim()) {
    toast('请填写阶段名称')
    return
  }
  const base: StageInput = {
    title: stageForm.title,
    description: stageForm.description,
    start_date: stageForm.start_date,
    end_date: stageForm.end_date,
    owner_id: stageForm.owner_id || null,
    assistant_ids: stageForm.assistant_ids.filter((id) => id !== stageForm.owner_id),
    eval_start_date: stageForm.eval_start_date,
    eval_end_date: stageForm.eval_end_date,
    eval_notes: stageForm.eval_notes,
    eval_adjustments: stageForm.eval_adjustments,
    status: stageForm.status,
  }

  if (editingStageId.value) {
    await updateStage(editingStageId.value, base)
    toast('阶段已更新')
  } else {
    const tasks = parseLines(stageForm.taskLines).map((t) => ({
      title: t.title,
      description: t.description,
    }))
    const deliverables = parseLines(stageForm.deliverableLines).map((d) => ({
      title: d.title,
      planned_desc: d.description,
    }))
    const stage = await createStage(projectId.value, { ...base, tasks, deliverables })
    expanded.value[stage.id] = true
    toast('阶段已创建')
  }
  showStageModal.value = false
  await reload()
}

async function removeStage(s: StageDetail) {
  if (!confirm(`删除阶段「${s.title}」？相关任务与交付物将一并删除。`)) return
  await deleteStage(s.id)
  await reload()
  toast('已删除阶段')
}

async function clearOwner(s: StageDetail) {
  await releaseStageOwner(s.id, true)
  await reload()
  toast('已清除负责人')
}

async function quickAddTask(stageId: string) {
  const title = prompt('任务名称')
  if (!title?.trim()) return
  await addTask(stageId, title.trim())
  await reload()
}

async function quickAddDeliv(stageId: string) {
  const title = prompt('交付物名称（管理员预定）')
  if (!title?.trim()) return
  const desc = prompt('预定要求说明（可选）') || ''
  await addDeliverable(stageId, title.trim(), desc)
  await reload()
}

async function saveTaskTitle(id: string, title: string) {
  await updateTask(id, { title })
  await reload()
}

async function saveTaskStatus(id: string, status: 'pending' | 'doing' | 'done') {
  await updateTask(id, { status })
  await reload()
}

async function removeTask(id: string) {
  await deleteTask(id)
  await reload()
}

async function saveDelivPlan(id: string, title: string, planned_desc: string) {
  await updateDeliverablePlan(id, { title, planned_desc })
  await reload()
}

async function removeDeliv(id: string) {
  await deleteDeliverable(id)
  await reload()
}

async function setProjectStatus(status: 'planning' | 'active' | 'completed' | 'archived') {
  if (!project.value) return
  await updateProject(project.value.id, { status })
  await reload()
  toast('项目状态已更新')
}
</script>

<template>
  <div v-if="project">
    <div class="page-head">
      <div>
        <button class="btn small ghost back" @click="router.push('/admin/projects')">← 返回项目列表</button>
        <h1>{{ project.name }}</h1>
        <div class="sub">{{ project.description || '配置实现周期：阶段 → 任务/交付物 → 评估调整期' }}</div>
      </div>
      <div class="row">
        <select class="status-sel" :value="project.status" @change="setProjectStatus(($event.target as HTMLSelectElement).value as any)">
          <option value="planning">筹划中</option>
          <option value="active">进行中</option>
          <option value="completed">已完成</option>
          <option value="archived">已归档</option>
        </select>
        <button class="btn primary" @click="openCreateStage">添加阶段</button>
      </div>
    </div>

    <div class="summary-grid">
      <div class="summ"><div class="sv">{{ stats?.stages ?? 0 }}</div><div class="st">阶段数</div></div>
      <div class="summ"><div class="sv">{{ stats?.activeStages ?? 0 }}</div><div class="st">进行中</div></div>
      <div class="summ"><div class="sv">{{ stats?.evaluatingStages ?? 0 }}</div><div class="st">评估调整中</div></div>
      <div class="summ"><div class="sv">{{ stats?.doneStages ?? 0 }}</div><div class="st">已完成阶段</div></div>
    </div>

    <div v-if="!project.stages.length" class="card empty">
      <div class="icon">🗂</div>
      <b>尚未配置实现周期</b>
      添加阶段，并为每个阶段设定任务、负责人、辅助成员、交付物与评估调整期
    </div>

    <div v-for="(s, idx) in project.stages" :key="s.id" class="stage">
      <div class="stage-hd" @click="toggle(s.id)">
        <div class="no">
          <b>{{ idx + 1 }}</b>
          <span>阶段</span>
        </div>
        <div class="info">
          <div class="title">{{ s.title }}</div>
          <div class="meta">
            负责人：{{ s.owner_name || '未指定' }}
            <template v-if="s.assistants.length">
              · 辅助：{{ s.assistants.map((a) => a.name).join('、') }}
            </template>
            <template v-if="s.start_date || s.end_date">
              · {{ s.start_date || '?' }} → {{ s.end_date || '?' }}
            </template>
            · {{ s.tasks.length }} 任务 · {{ s.deliverables.length }} 交付物
          </div>
        </div>
        <StatusBadge :status="s.status" kind="stage" />
        <span class="chev">{{ expanded[s.id] ? '▴' : '▾' }}</span>
      </div>

      <div v-show="expanded[s.id]" class="stage-bd">
        <p v-if="s.description" class="desc">{{ s.description }}</p>

        <div class="row mb">
          <button class="btn small" @click="openEditStage(s)">编辑阶段</button>
          <button v-if="s.owner_id" class="btn small" @click="clearOwner(s)">清除负责人</button>
          <button class="btn small danger" @click="removeStage(s)">删除阶段</button>
        </div>

        <div class="section-title">
          <span>预定任务</span>
          <button class="btn small" @click="quickAddTask(s.id)">＋ 任务</button>
        </div>
        <div v-if="!s.tasks.length" class="hint mb">暂无任务，管理员可添加预定任务</div>
        <div v-for="t in s.tasks" :key="t.id" class="item-row">
          <input
            class="inline"
            :value="t.title"
            @change="saveTaskTitle(t.id, ($event.target as HTMLInputElement).value)"
          />
          <select
            class="tiny-sel"
            :value="t.status"
            @change="saveTaskStatus(t.id, ($event.target as HTMLSelectElement).value as any)"
          >
            <option value="pending">待办</option>
            <option value="doing">进行中</option>
            <option value="done">完成</option>
          </select>
          <button class="btn small danger" @click="removeTask(t.id)">删</button>
        </div>

        <div class="section-title">
          <span>预定交付物（负责人填写实际）</span>
          <button class="btn small" @click="quickAddDeliv(s.id)">＋ 交付物</button>
        </div>
        <div v-if="!s.deliverables.length" class="hint mb">暂无交付物条目</div>
        <div v-for="d in s.deliverables" :key="d.id" class="deliv">
          <div class="db-h">
            <input
              class="inline bold"
              :value="d.title"
              @change="saveDelivPlan(d.id, ($event.target as HTMLInputElement).value, d.planned_desc)"
            />
            <StatusBadge :status="d.status" kind="deliverable" />
            <button class="btn small danger" @click="removeDeliv(d.id)">删除</button>
          </div>
          <div class="field">
            <label>预定要求</label>
            <textarea
              :value="d.planned_desc"
              rows="2"
              @change="saveDelivPlan(d.id, d.title, ($event.target as HTMLTextAreaElement).value)"
            />
          </div>
          <div class="actual">
            <div class="al">实际实现情况（由负责人填写）</div>
            <div class="av">{{ d.actual_content || '尚未填写' }}</div>
          </div>
        </div>

        <div class="eval-box">
          <div class="section-title" style="margin-top: 0">
            <span>上一阶段评估调整期</span>
            <StatusBadge v-if="s.status === 'evaluating'" status="evaluating" kind="stage" />
          </div>
          <div class="hint mb">
            本阶段完成后进入评估调整期：复盘上一阶段交付、调整后续安排。可在「编辑阶段」中填写评估结论与调整措施。
          </div>
          <div class="grid g2">
            <div><b class="muted">评估期</b>：{{ s.eval_start_date || '未设' }} → {{ s.eval_end_date || '未设' }}</div>
            <div><b class="muted">阶段状态</b>：<StatusBadge :status="s.status" kind="stage" /></div>
          </div>
          <div v-if="s.eval_notes" class="note"><b>评估结论</b>：{{ s.eval_notes }}</div>
          <div v-if="s.eval_adjustments" class="note"><b>调整措施</b>：{{ s.eval_adjustments }}</div>
        </div>
      </div>
    </div>

    <div class="card week-card">
      <div class="section-title" style="margin-top: 0">
        <span>每周完成情况</span>
      </div>
      <p class="hint mb">同一周可指定多名负责人，每人各自填写完成的需求和功能。</p>
      <div class="field">
        <label>本周起始日</label>
        <input v-model="weekStart" type="date" />
      </div>
      <div class="section-title">
        <span>负责人（可多选）</span>
        <button class="btn small" type="button" :disabled="!members.length" @click="toggleAllWeekOwners">
          {{ allWeekOwnersSelected ? '取消全选' : '全选' }}
        </button>
      </div>
      <div class="check-list">
        <label
          v-for="m in members"
          :key="m.id"
          class="check-item"
          :class="{ on: weekOwnerIds.includes(m.id) }"
        >
          <input type="checkbox" :checked="weekOwnerIds.includes(m.id)" @change="toggleWeekOwner(m.id)" />
          {{ m.name }}
        </label>
      </div>
      <div class="row mt">
        <button class="btn primary" @click="addWeek">添加到本周</button>
      </div>

      <div v-if="!weekGroups.length" class="hint mt">尚未安排每周负责人</div>
      <article v-for="group in weekGroups" :key="group.week_start" class="week-item">
        <b>{{ formatWeekRange(group.week_start) }}</b>
        <div v-for="w in group.reports" :key="w.id" class="owner-block">
          <div class="row">
            <span class="chip">{{ w.owner_name || '未指定' }}</span>
            <div class="spacer"></div>
            <button class="btn small danger" @click="removeWeek(w.id)">移除</button>
          </div>
          <div class="week-text"><b>完成的需求</b><p>{{ w.requirements || '尚未填写' }}</p></div>
          <div class="week-text"><b>完成的功能</b><p>{{ w.features || '尚未填写' }}</p></div>
        </div>
      </article>
    </div>

    <div v-if="showStageModal" class="modal-mask">
      <div class="modal">
        <h3>{{ editingStageId ? '编辑阶段' : '添加阶段' }}</h3>
        <div class="modal-sub">设定阶段信息、负责人/辅助成员，以及阶段后的评估调整期</div>

        <div class="grid g2">
          <div class="field" style="grid-column: 1 / -1">
            <label>阶段名称 *</label>
            <input v-model="stageForm.title" placeholder="如：需求调研与方案设计" />
          </div>
          <div class="field" style="grid-column: 1 / -1">
            <label>阶段说明</label>
            <textarea v-model="stageForm.description" rows="2" />
          </div>
          <div class="field"><label>开始日期</label><input v-model="stageForm.start_date" type="date" /></div>
          <div class="field"><label>结束日期</label><input v-model="stageForm.end_date" type="date" /></div>
          <div class="field">
            <label>负责人</label>
            <select v-model="stageForm.owner_id">
              <option value="">未指定</option>
              <option v-for="m in members" :key="m.id" :value="m.id">{{ m.name }}</option>
            </select>
          </div>
          <div class="field">
            <label>阶段状态</label>
            <select v-model="stageForm.status">
              <option value="pending">未开始</option>
              <option value="active">进行中</option>
              <option value="evaluating">评估调整中</option>
              <option value="done">已完成</option>
            </select>
          </div>
        </div>

        <div class="section-title"><span>辅助成员</span></div>
        <div class="check-list">
          <label
            v-for="m in members"
            :key="m.id"
            class="check-item"
            :class="{ on: stageForm.assistant_ids.includes(m.id) }"
          >
            <input
              type="checkbox"
              :checked="stageForm.assistant_ids.includes(m.id)"
              @change="toggleAssistant(m.id)"
            />
            {{ m.name }}
          </label>
        </div>

        <div class="section-title"><span>评估调整期（阶段完成后）</span></div>
        <div class="grid g2">
          <div class="field"><label>评估开始</label><input v-model="stageForm.eval_start_date" type="date" /></div>
          <div class="field"><label>评估结束</label><input v-model="stageForm.eval_end_date" type="date" /></div>
          <div class="field" style="grid-column: 1 / -1">
            <label>评估结论</label>
            <textarea v-model="stageForm.eval_notes" rows="2" placeholder="对上一阶段的复盘评价…" />
          </div>
          <div class="field" style="grid-column: 1 / -1">
            <label>调整措施</label>
            <textarea v-model="stageForm.eval_adjustments" rows="2" placeholder="对后续阶段的调整安排…" />
          </div>
        </div>

        <template v-if="!editingStageId">
          <div class="section-title"><span>批量添加预定任务（可选）</span></div>
          <div class="field">
            <label>每行一个：任务名 | 说明</label>
            <textarea v-model="stageForm.taskLines" rows="3" placeholder="用户访谈 | 访谈至少5人&#10;方案文档" />
          </div>
          <div class="section-title"><span>批量添加预定交付物（可选）</span></div>
          <div class="field">
            <label>每行一个：交付物名 | 预定要求</label>
            <textarea
              v-model="stageForm.deliverableLines"
              rows="3"
              placeholder="调研报告 | 含用户画像与痛点&#10;方案原型"
            />
          </div>
        </template>

        <div class="modal-actions">
          <button class="btn" @click="showStageModal = false">取消</button>
          <button class="btn primary" @click="saveStage">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.back {
  margin-bottom: 8px;
  padding-left: 0;
}
.status-sel {
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 8px 12px;
  background: #fff;
  font-size: 14px;
}
.stage {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--r);
  box-shadow: var(--shadow);
  margin-bottom: 14px;
  overflow: hidden;
}
.stage-hd {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  background: #fbfcfe;
  border-bottom: 1px solid transparent;
  cursor: pointer;
  flex-wrap: wrap;
}
.stage:has(.stage-bd:not([style*='display: none'])) .stage-hd,
.stage-hd:hover {
  border-bottom-color: var(--line);
}
.no {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: var(--brand);
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: none;
}
.no b {
  font-size: 16px;
  line-height: 1.1;
}
.no span {
  font-size: 10px;
  opacity: 0.85;
}
.info {
  flex: 1;
  min-width: 160px;
}
.title {
  font-weight: 700;
  font-size: 15px;
}
.meta {
  font-size: 12.5px;
  color: var(--ink-3);
  margin-top: 3px;
}
.chev {
  color: var(--ink-3);
  font-size: 14px;
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
  margin-bottom: 12px;
}
.item-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}
.inline {
  flex: 1;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 14px;
  background: #fff;
}
.inline.bold {
  font-weight: 600;
}
.tiny-sel {
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 7px 8px;
  font-size: 13px;
  background: #fff;
}
.deliv {
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 12px;
  background: #fafbfd;
  margin-bottom: 10px;
}
.db-h {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.actual {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed var(--line);
}
.al {
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-2);
  margin-bottom: 4px;
}
.av {
  font-size: 13.5px;
  color: var(--ink);
  white-space: pre-wrap;
  background: #fff;
  border-radius: 8px;
  padding: 10px;
  border: 1px solid var(--line);
  min-height: 44px;
}
.eval-box {
  margin-top: 16px;
  padding: 14px;
  border-radius: 12px;
  background: linear-gradient(135deg, #fdf6e8, #fff8ee);
  border: 1px solid #f0e0c0;
}
.note {
  margin-top: 10px;
  font-size: 13.5px;
  line-height: 1.6;
}
.week-card {
  margin-top: 8px;
}
.mt {
  margin-top: 12px;
}
.week-item {
  margin-top: 12px;
  padding: 12px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: #fafbfd;
}
.week-text {
  margin-top: 10px;
  font-size: 13.5px;
}
.week-text p {
  margin-top: 4px;
  white-space: pre-wrap;
  color: var(--ink-2);
}
.owner-block {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed var(--line);
}
</style>
