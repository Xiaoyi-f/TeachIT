<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  status: string | number
  kind?: 'stage' | 'deliverable' | 'project' | 'task'
}>()

const meta = computed(() => {
  if (props.kind === 'deliverable' || typeof props.status === 'number') {
    const map: Record<number, [string, string]> = {
      0: ['未开始', 'st-0'],
      1: ['进行中', 'st-1'],
      2: ['已完成', 'st-2'],
      3: ['延期', 'st-3'],
    }
    return map[Number(props.status)] ?? ['未知', 'st-0']
  }
  if (props.kind === 'project') {
    const map: Record<string, [string, string]> = {
      planning: ['筹划中', 'st-pending'],
      active: ['进行中', 'st-active'],
      completed: ['已完成', 'st-done'],
      archived: ['已归档', 'st-pending'],
    }
    return map[String(props.status)] ?? [String(props.status), 'st-pending']
  }
  if (props.kind === 'task') {
    const map: Record<string, [string, string]> = {
      pending: ['待办', 'st-pending'],
      doing: ['进行中', 'st-active'],
      done: ['完成', 'st-done'],
    }
    return map[String(props.status)] ?? [String(props.status), 'st-pending']
  }
  const map: Record<string, [string, string]> = {
    pending: ['未开始', 'st-pending'],
    active: ['进行中', 'st-active'],
    evaluating: ['评估调整', 'st-evaluating'],
    done: ['已完成', 'st-done'],
  }
  return map[String(props.status)] ?? [String(props.status), 'st-pending']
})
</script>

<template>
  <span class="badge" :class="meta[1]">{{ meta[0] }}</span>
</template>
