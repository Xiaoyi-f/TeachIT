<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import TravelMap from './TravelMap.vue'
import { provinces, search, type Place } from './places'

const query = ref('')
const results = ref<Place[]>(provinces())
const selected = ref<Place | null>(null)
const resetToken = ref(0)

const searching = computed(() => query.value.trim().length > 0)
const empty = computed(() => searching.value && results.value.length === 0)

watch(query, (v) => {
  results.value = search(v)
})

function pick(item: Place) {
  selected.value = item
}

function resetAll() {
  query.value = ''
  results.value = provinces()
  selected.value = null
  resetToken.value += 1
}
</script>

<template>
  <div class="shell">
    <aside class="panel">
      <h1>中国旅行地图</h1>

      <div class="search">
        <input
          v-model="query"
          type="text"
          placeholder="搜省份或景区"
          autocomplete="off"
          spellcheck="false"
        />
        <button v-if="query" type="button" class="clear" @click="query = ''">×</button>
      </div>

      <p class="meta">{{ searching ? `搜索结果 ${results.length}` : `推荐省份 ${results.length}` }}</p>
      <p v-if="empty" class="empty-tip">不存在该省份</p>
      <ul v-else class="list">
        <li v-for="item in results" :key="item.id">
          <button
            type="button"
            class="item"
            :class="{ active: selected?.id === item.id }"
            @click="pick(item)"
          >
            <strong>{{ item.name }}</strong>
            <span>{{ item.subtitle }}</span>
          </button>
        </li>
      </ul>
    </aside>

    <main class="map-stage">
      <TravelMap :place="selected" :reset-token="resetToken" @select="pick" />
      <button type="button" class="reset-btn" @click="resetAll">回到全图</button>
    </main>

    <aside class="detail" :class="{ empty: !selected }">
      <template v-if="selected">
        <button type="button" class="close" @click="selected = null">×</button>
        <h2>{{ selected.name }}</h2>
        <p>{{ selected.subtitle }}</p>
      </template>
      <p v-else>点击左侧结果定位</p>
    </aside>
  </div>
</template>
