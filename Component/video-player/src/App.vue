<script setup>
import { computed, ref } from 'vue'
import BilibiliPlayer from './components/BilibiliPlayer.vue'
import { EPISODES, VIDEO_META } from './mockData.js'

const currentEpId = ref(EPISODES[0].id)
const onlineCount = ref(1286)

const currentEp = computed(() => EPISODES.find((e) => e.id === currentEpId.value) || EPISODES[0])

const selectEpisode = (id) => {
  currentEpId.value = id
}

const onEpisodeEnded = () => {
  const idx = EPISODES.findIndex((e) => e.id === currentEpId.value)
  if (idx >= 0 && idx < EPISODES.length - 1) {
    currentEpId.value = EPISODES[idx + 1].id
  }
}
</script>

<template>
  <div class="page">
    <header class="top">
      <div>
        <p class="eyebrow">Study Demo · from EnhancedVideoPlayer + Player</p>
        <h1>{{ VIDEO_META.title }}</h1>
        <p class="meta">
          {{ VIDEO_META.author }} · {{ VIDEO_META.views }} 播放 · {{ VIDEO_META.danmakuCount }} 弹幕 · {{ VIDEO_META.publishDate }}
        </p>
      </div>
    </header>

    <main class="layout">
      <section class="main-col">
        <BilibiliPlayer
          :url="currentEp.url"
          :title="currentEp.title"
          :author-name="VIDEO_META.author"
          :online-count="onlineCount"
          @episode-ended="onEpisodeEnded"
        />

        <article class="intro">
          <h2>{{ currentEp.title }}</h2>
          <p>{{ VIDEO_META.intro }}</p>
          <details>
            <summary>保留的原始能力 / Demo 增强点</summary>
            <ul>
              <li>原始：Artplayer、弹幕显示/发送、截图、窗口全屏、自动回放、加载层、笔记</li>
              <li>增强：切集保持全屏、倍速按钮、弹幕图标开关、分 P / 快捷键</li>
            </ul>
          </details>
        </article>
      </section>

      <aside class="side">
        <div class="side-head">
          <h3>分 P 列表</h3>
          <span>{{ EPISODES.length }}P</span>
        </div>
        <button
          v-for="(ep, index) in EPISODES"
          :key="ep.id"
          class="ep"
          :class="{ active: ep.id === currentEp.id }"
          @click="selectEpisode(ep.id)"
        >
          <span class="idx">P{{ index + 1 }}</span>
          <span class="ttl">{{ ep.title }}</span>
          <span class="dur">{{ ep.duration }}</span>
        </button>

        <div class="help">
          <h4>快捷键</h4>
          <p>空格 播放/暂停</p>
          <p>← / → 快退 / 快进 5 秒</p>
          <p>F 全屏 · M 静音</p>
        </div>
      </aside>
    </main>
  </div>
</template>

<style scoped>
.page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 18px 48px;
}
.top {
  margin-bottom: 18px;
}
.eyebrow {
  margin: 0 0 8px;
  color: #fb7299;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
h1 { margin: 0 0 8px; font-size: 28px; }
.meta { margin: 0; color: #9aa4b2; font-size: 13px; }
.layout {
  display: grid;
  grid-template-columns: 1.7fr 0.8fr;
  gap: 16px;
}
.intro {
  margin-top: 14px;
  padding: 16px;
  border-radius: 14px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
}
.intro h2 { margin: 0 0 8px; font-size: 18px; }
.intro p { margin: 0; color: #b7c0ce; line-height: 1.7; }
.intro details { margin-top: 12px; color: #9aa4b2; }
.intro ul { margin: 8px 0 0; padding-left: 18px; line-height: 1.7; }
.side {
  padding: 12px;
  border-radius: 14px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  align-self: start;
}
.side-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}
.side-head h3 { margin: 0; font-size: 15px; }
.side-head span { color: #9aa4b2; font-size: 12px; }
.ep {
  width: 100%;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 8px;
  align-items: center;
  padding: 10px;
  border-radius: 10px;
  text-align: left;
  margin-bottom: 6px;
  background: transparent;
}
.ep:hover { background: rgba(255,255,255,0.04); }
.ep.active {
  background: rgba(251,114,153,0.14);
  outline: 1px solid rgba(251,114,153,0.35);
}
.idx { color: #fb7299; font-size: 12px; font-weight: 700; }
.ttl { font-size: 13px; }
.dur { color: #9aa4b2; font-size: 12px; }
.help {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid rgba(255,255,255,0.06);
  color: #9aa4b2;
  font-size: 13px;
}
.help h4 { margin: 0 0 8px; color: #e5eaf2; }
.help p { margin: 4px 0; }
@media (max-width: 960px) {
  .layout { grid-template-columns: 1fr; }
}
</style>
