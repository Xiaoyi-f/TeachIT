<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import AppToast from '@/components/AppToast.vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const auth = useAuthStore()

const useShell = computed(() => auth.isLoggedIn && route.path !== '/login')
</script>

<template>
  <AppLayout v-if="useShell">
    <RouterView />
  </AppLayout>
  <RouterView v-else />
  <AppToast />
</template>
