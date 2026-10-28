<script setup>
import { computed, ref } from 'vue'
import WordCloud3D from './components/WordCloud3D.vue'
import { DEMO_ARTICLES, DEMO_WORDS } from './mockData.js'

const selectedWord = ref('')
const keyword = ref('')

const filteredArticles = computed(() => {
  const q = (selectedWord.value || keyword.value).trim().toLowerCase()
  if (!q) return DEMO_ARTICLES
  return DEMO_ARTICLES.filter((item) => {
    const hay = `${item.title} ${item.summary} ${(item.tags || []).join(' ')}`.toLowerCase()
    return hay.includes(q)
  })
})

const onWordClick = (word) => {
  selectedWord.value = word
  keyword.value = word
}

const clearFilter = () => {
  selectedWord.value = ''
  keyword.value = ''
}
</script>

<template>
  <div class="page">
    <header class="hero">
      <div>
        <p class="eyebrow">Study Demo · from LeanLoopAI SPRightSidebar</p>
        <h1>3D 词云关系图</h1>
        <p class="desc">
          拖拽旋转球体，点击词语会高亮关联连线，并过滤右侧文章列表。
          核心实现来自主项目研学星球侧栏，方便单独学习 Three.js 词云。
        </p>
      </div>
      <div class="tips">
        <div><strong>拖拽</strong>旋转视角</div>
        <div><strong>滚轮</strong>缩放远近</div>
        <div><strong>点击词</strong>触发检索</div>
      </div>
    </header>

    <main class="layout">
      <section class="panel cloud-panel">
        <div class="panel-head">
          <h2>词云画布</h2>
          <span>{{ DEMO_WORDS.length }} 个词 · {{ DEMO_ARTICLES.length }} 篇文章共现</span>
        </div>
        <WordCloud3D
          :nodes="DEMO_WORDS"
          :topics="DEMO_ARTICLES"
          :height="460"
          @word-click="onWordClick"
        />
      </section>

      <aside class="panel side-panel">
        <div class="panel-head">
          <h2>点击检索结果</h2>
          <button v-if="selectedWord || keyword" class="link-btn" @click="clearFilter">清除</button>
        </div>

        <label class="search">
          <span>关键词</span>
          <input v-model="keyword" placeholder="也可手动输入过滤文章" @input="selectedWord = ''" />
        </label>

        <div v-if="selectedWord" class="chip">
          当前选中：<strong>{{ selectedWord }}</strong>
        </div>

        <div class="list">
          <article v-for="item in filteredArticles" :key="item.id" class="card">
            <h3>{{ item.title }}</h3>
            <p>{{ item.summary }}</p>
            <div class="tags">
              <span
                v-for="tag in item.tags"
                :key="tag"
                :class="{ active: tag.toLowerCase() === selectedWord.toLowerCase() }"
              >{{ tag }}</span>
            </div>
          </article>
          <div v-if="!filteredArticles.length" class="empty">没有匹配文章，换个词试试</div>
        </div>

        <details class="learn">
          <summary>实现拆解（学习用）</summary>
          <ol>
            <li><code>createTextSprite</code>：Canvas 画字 → Texture → Sprite</li>
            <li>球面公式摆放节点，词频越大字号越大</li>
            <li><code>buildRelations</code>：文章 tags 共现生成连线</li>
            <li><code>Raycaster</code>：把鼠标坐标映射到 3D，命中后 emit 检索</li>
            <li><code>OrbitControls</code>：拖拽旋转 + 阻尼 + 自动旋转</li>
          </ol>
        </details>
      </aside>
    </main>
  </div>
</template>

<style scoped>
.page {
  max-width: 1180px;
  margin: 0 auto;
  padding: 28px 20px 48px;
}
.hero {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 18px;
  margin-bottom: 22px;
}
.eyebrow {
  margin: 0 0 8px;
  color: #2563eb;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
h1 { margin: 0 0 10px; font-size: 34px; }
.desc { margin: 0; color: #475569; line-height: 1.7; max-width: 56ch; }
.tips {
  display: grid;
  gap: 10px;
  align-content: center;
  padding: 18px;
  border-radius: 18px;
  background: rgba(255,255,255,0.72);
  border: 1px solid #dbe7ff;
  box-shadow: 0 12px 40px rgba(148, 163, 184, 0.18);
}
.tips div {
  padding: 10px 12px;
  border-radius: 12px;
  background: #f8fbff;
  color: #334155;
}
.layout {
  display: grid;
  grid-template-columns: 1.35fr 0.9fr;
  gap: 18px;
}
.panel {
  background: rgba(255,255,255,0.88);
  border: 1px solid #dbe7ff;
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 16px 48px rgba(148, 163, 184, 0.16);
}
.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  gap: 12px;
}
.panel-head h2 { margin: 0; font-size: 16px; }
.panel-head span, .panel-head button { color: #64748b; font-size: 12px; }
.link-btn { color: #2563eb !important; }
.search {
  display: grid;
  gap: 6px;
  margin-bottom: 12px;
  font-size: 12px;
  color: #64748b;
}
.search input {
  height: 40px;
  border-radius: 12px;
  border: 1px solid #dbe7ff;
  padding: 0 12px;
  outline: none;
}
.search input:focus { border-color: #60a5fa; box-shadow: 0 0 0 3px rgba(96,165,250,0.2); }
.chip {
  display: inline-flex;
  margin-bottom: 12px;
  padding: 6px 10px;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 13px;
}
.list { display: grid; gap: 10px; max-height: 420px; overflow: auto; padding-right: 4px; }
.card {
  padding: 12px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  background: #f8fbff;
}
.card h3 { margin: 0 0 6px; font-size: 15px; }
.card p { margin: 0 0 10px; color: #64748b; font-size: 13px; line-height: 1.6; }
.tags { display: flex; flex-wrap: wrap; gap: 6px; }
.tags span {
  padding: 3px 8px;
  border-radius: 999px;
  background: #e2e8f0;
  color: #475569;
  font-size: 12px;
}
.tags span.active { background: #2563eb; color: #fff; }
.empty { text-align: center; color: #94a3b8; padding: 28px 0; }
.learn {
  margin-top: 14px;
  padding: 12px;
  border-radius: 14px;
  background: #0f172a;
  color: #e2e8f0;
}
.learn summary { cursor: pointer; font-weight: 600; }
.learn ol { margin: 10px 0 0; padding-left: 18px; line-height: 1.7; font-size: 13px; }
.learn code { color: #93c5fd; }
@media (max-width: 960px) {
  .hero, .layout { grid-template-columns: 1fr; }
}
</style>
