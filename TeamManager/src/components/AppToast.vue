<script setup lang="ts">
import { useToast } from '@/utils/toast'

const { message, visible } = useToast()
</script>

<template>
  <div class="toast" :class="{ show: visible }">{{ message }}</div>
</template>
