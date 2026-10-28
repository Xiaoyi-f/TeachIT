<script setup>
/**
 * Bilibili 风格播放器
 * - 控制栏：点赞 / 投币 / 收藏 · 截图 · 倍速 · 全屏
 * - 底部栏：笔记 → 弹幕开关 → 输入 → 发送
 */
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Artplayer from 'artplayer'
import artplayerPluginDanmuku from 'artplayer-plugin-danmuku'
import { DEMO_DANMAKU } from '../mockData.js'

const props = defineProps({
  url: { type: String, required: true },
  title: { type: String, default: '' },
  authorName: { type: String, default: '' },
  coverUrl: { type: String, default: '' },
  onlineCount: { type: Number, default: 1286 },
})

const emit = defineEmits(['ready', 'episode-ended', 'timeupdate'])

const shellRef = ref(null)
const playerRef = ref(null)
const danmuUiMountRef = ref(null)
const playerLoading = ref(true)
const currentTime = ref(0)
const isPlaying = ref(false)
const isShellFullscreen = ref(false)
const showNotePanel = ref(false)
const noteDraft = ref('')
const notes = ref([])
const danmuText = ref('')
const danmuVisible = ref(true)
const toast = ref('')
const currentSpeed = ref(1)

const liked = ref(false)
const coined = ref(false)
const favorited = ref(false)
const likeCount = ref(12846)
const coinCount = ref(3260)
const favCount = ref(8912)

let toastTimer = null
let player = null

const SPEED_RATES = Artplayer.PLAYBACK_RATE?.length
  ? Artplayer.PLAYBACK_RATE
  : [0.5, 0.75, 1, 1.25, 1.5, 2]

const speedButtonText = (rate) => Number(rate).toFixed(1)

const formatCount = (n) => {
  if (n >= 10000) return `${(n / 10000).toFixed(n >= 100000 ? 0 : 1)}万`
  return String(n)
}

const secToLabel = (sec) => {
  const s = Math.max(0, Math.floor(sec || 0))
  const m = Math.floor(s / 60)
  const ss = s % 60
  return `${m}:${String(ss).padStart(2, '0')}`
}

const showToast = (msg) => {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = '' }, 1400)
}

const getDanmakuPlugin = () => player?.plugins?.artplayerPluginDanmuku || null

const getVideoEl = (art = player) =>
  art?.template?.$video || art?.video || null

/** 直接改 video，保证倍速真正生效；并写 defaultPlaybackRate 以便切源后保留 */
const applyPlaybackRate = (rate, art = player) => {
  const value = Number(rate)
  if (!Number.isFinite(value) || value <= 0) return currentSpeed.value
  currentSpeed.value = value
  const video = getVideoEl(art)
  if (video) {
    video.defaultPlaybackRate = value
    video.playbackRate = value
  }
  return value
}

const FS_ICON_ON = '<svg class="ctrl-icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>'
const FS_ICON_OFF = '<svg class="ctrl-icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>'

const LIKE_ICON = '<svg class="ctrl-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M7.5 21h-2A1.5 1.5 0 0 1 4 19.5v-7A1.5 1.5 0 0 1 5.5 11H8l2.2-5.3A2 2 0 0 1 12 4.5c1 0 1.7.9 1.5 1.9L12.8 11H18a2 2 0 0 1 1.9 2.5l-1.2 5A2 2 0 0 1 16.8 21H7.5Z"/></svg>'
const COIN_ICON = '<svg class="ctrl-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="8.2"/><path d="M12 7.8v8.4M9.5 9.7c.5-.7 1.4-1.1 2.5-1.1 1.6 0 2.6.9 2.6 2.2s-.9 2-2.4 2.4l-1.2.3c-1.4.3-2.1 1-2.1 2 0 1.2 1.1 2.1 2.8 2.1 1.1 0 2-.4 2.7-1.1" stroke-linecap="round"/></svg>'
const FAV_ICON = '<svg class="ctrl-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="m12 4.6 2.1 4.3 4.7.7-3.4 3.3.8 4.7L12 15.4l-4.2 2.2.8-4.7-3.4-3.3 4.7-.7L12 4.6Z"/></svg>'

const reactControlHtml = (icon, label, count, on) =>
  `<span class="react-ctrl${on ? ' is-on' : ''}"><span class="react-ico">${icon}</span><span class="react-txt"><i>${label}</i><b>${formatCount(count)}</b></span></span>`

const hidePluginDanmakuUi = () => {
  const roots = [playerRef.value, shellRef.value].filter(Boolean)
  roots.forEach((root) => {
    root.querySelectorAll('.artplayer-plugin-danmuku').forEach((el) => {
      el.style.display = 'none'
    })
  })
}

const getFullscreenElement = () =>
  document.fullscreenElement || document.webkitFullscreenElement || null

const enterShellFullscreen = async () => {
  const el = shellRef.value
  if (!el) return
  try {
    if (el.requestFullscreen) await el.requestFullscreen()
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen()
  } catch {
    showToast('无法进入全屏')
  }
}

const exitShellFullscreen = async () => {
  try {
    if (document.exitFullscreen) await document.exitFullscreen()
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen()
  } catch {}
}

const toggleShellFullscreen = async () => {
  if (getFullscreenElement()) await exitShellFullscreen()
  else await enterShellFullscreen()
}

const onFullscreenChange = () => {
  isShellFullscreen.value = getFullscreenElement() === shellRef.value
  nextTick(() => {
    hidePluginDanmakuUi()
    syncFullscreenIcon()
  })
}

const destroyPlayer = () => {
  if (!player) return
  try { player.destroy(false) } catch {}
  player = null
}

const syncFullscreenIcon = () => {
  const btn = playerRef.value?.querySelector('.art-control-shell-fullscreen')
  if (!btn) return
  btn.innerHTML = isShellFullscreen.value ? FS_ICON_OFF : FS_ICON_ON
}

const syncReactControls = () => {
  const root = playerRef.value
  if (!root) return
  const like = root.querySelector('.art-control-react-like')
  const coin = root.querySelector('.art-control-react-coin')
  const fav = root.querySelector('.art-control-react-fav')
  if (like) {
    like.innerHTML = reactControlHtml(LIKE_ICON, '点赞', likeCount.value, liked.value)
  }
  if (coin) {
    coin.innerHTML = reactControlHtml(COIN_ICON, '投币', coinCount.value, coined.value)
  }
  if (fav) {
    fav.innerHTML = reactControlHtml(FAV_ICON, '收藏', favCount.value, favorited.value)
  }
}

const toggleLike = () => {
  liked.value = !liked.value
  likeCount.value += liked.value ? 1 : -1
  syncReactControls()
  showToast(liked.value ? '点赞成功' : '已取消点赞')
}

const toggleCoin = () => {
  if (coined.value) {
    showToast('本视频已投过币')
    return
  }
  coined.value = true
  coinCount.value += 1
  syncReactControls()
  showToast('投币成功 +1')
}

const toggleFavorite = () => {
  favorited.value = !favorited.value
  favCount.value += favorited.value ? 1 : -1
  syncReactControls()
  showToast(favorited.value ? '已收藏' : '已取消收藏')
}

const initPlayer = async () => {
  if (!playerRef.value) return
  destroyPlayer()
  await nextTick()

  Artplayer.CONTEXTMENU = false
  Artplayer.AUTO_PLAYBACK_MAX = 20
  Artplayer.AUTO_PLAYBACK_MIN = 5

  const speedSelector = SPEED_RATES.map((rate) => ({
    html: Number(rate).toFixed(1),
    value: rate,
    default: rate === currentSpeed.value,
  }))

  player = new Artplayer({
    container: playerRef.value,
    url: props.url,
    type: 'mp4',
    theme: '#fb7299',
    volume: 0.7,
    autoplay: true,
    muted: true,
    fullscreen: false,
    fullscreenWeb: false,
    setting: false,
    pip: false,
    playbackRate: false,
    flip: false,
    aspectRatio: false,
    miniProgressBar: true,
    screenshot: true,
    autoPlayback: true,
    hotkey: true,
    preload: 'auto',
    lang: 'zh-cn',
    controls: [
      // 截图内置 index=20，互动三项紧挨着放在它前面
      {
        name: 'react-like',
        position: 'right',
        index: 17,
        html: reactControlHtml(LIKE_ICON, '点赞', likeCount.value, liked.value),
        tooltip: `点赞 ${formatCount(likeCount.value)}`,
        click: () => toggleLike(),
      },
      {
        name: 'react-coin',
        position: 'right',
        index: 18,
        html: reactControlHtml(COIN_ICON, '投币', coinCount.value, coined.value),
        tooltip: `投币 ${formatCount(coinCount.value)}`,
        click: () => toggleCoin(),
      },
      {
        name: 'react-fav',
        position: 'right',
        index: 19,
        html: reactControlHtml(FAV_ICON, '收藏', favCount.value, favorited.value),
        tooltip: `收藏 ${formatCount(favCount.value)}`,
        click: () => toggleFavorite(),
      },
      {
        name: 'playback-speed',
        position: 'right',
        index: 70,
        html: speedButtonText(currentSpeed.value),
        // 不设 tooltip，避免悬浮提示挡住倍速菜单
        selector: speedSelector,
        onSelect(item) {
          const rate = applyPlaybackRate(item?.value, this)
          return speedButtonText(rate)
        },
      },
      {
        name: 'shell-fullscreen',
        position: 'right',
        index: 80,
        html: FS_ICON_ON,
        tooltip: '全屏',
        click: () => toggleShellFullscreen(),
      },
    ],
    plugins: [
      artplayerPluginDanmuku({
        mount: danmuUiMountRef.value,
        theme: 'dark',
        emitter: false,
        visible: true,
        speed: 7.5,
        opacity: 0.92,
        fontSize: 22,
        color: '#FFFFFF',
        danmuku: () => Promise.resolve([...DEMO_DANMAKU]),
      }),
    ],
  })

  hidePluginDanmakuUi()
  player.on('resize', () => nextTick(hidePluginDanmakuUi))

  player.on('video:loadstart', () => { playerLoading.value = true })
  player.on('video:canplay', () => {
    playerLoading.value = false
    applyPlaybackRate(currentSpeed.value)
  })
  player.on('video:play', () => {
    isPlaying.value = true
    playerLoading.value = false
    // 部分浏览器在 play 时会把 rate 重置为 1，这里强制写回
    applyPlaybackRate(currentSpeed.value)
  })
  player.on('video:pause', () => { isPlaying.value = false })
  player.on('video:ended', () => {
    isPlaying.value = false
    emit('episode-ended')
  })
  player.on('video:timeupdate', () => {
    if (!player) return
    currentTime.value = player.currentTime || 0
    emit('timeupdate', currentTime.value)
  })
  player.on('ready', () => {
    emit('ready')
    hidePluginDanmakuUi()
    syncDanmakuVisible()
    syncFullscreenIcon()
    syncReactControls()
    applyPlaybackRate(currentSpeed.value)
    // 关掉倍速悬浮提示，避免挡住下拉菜单（hint.css 读 aria-label）
    try {
      const el = playerRef.value?.querySelector('.art-control-playback-speed')
      if (el) {
        el.removeAttribute('aria-label')
        el.removeAttribute('title')
        el.classList.remove('hint--rounded', 'hint--top', 'hint--bottom', 'hint--left', 'hint--right')
      }
      const speedCtrl = player.controls?.['playback-speed']
      if (speedCtrl) speedCtrl.tooltip = ''
    } catch {}
  })
  player.on('video:error', () => {
    playerLoading.value = true
    showToast('视频加载失败，可切换其他分 P 试试')
  })
}

const syncDanmakuVisible = () => {
  const plugin = getDanmakuPlugin()
  if (!plugin) return
  if (danmuVisible.value) plugin.show()
  else plugin.hide()
}

const toggleDanmaku = () => {
  danmuVisible.value = !danmuVisible.value
  syncDanmakuVisible()
}

const toggleNotePanel = () => {
  showNotePanel.value = !showNotePanel.value
}

const sendDanmaku = () => {
  const text = danmuText.value.trim()
  if (!text || !player) return

  const danmu = {
    text,
    time: player.currentTime,
    color: '#ffffff',
    border: false,
    mode: 0,
  }

  const plugin = getDanmakuPlugin()
  if (plugin?.emit) plugin.emit(danmu)
  else {
    DEMO_DANMAKU.push(danmu)
    plugin?.load?.()
  }

  danmuText.value = ''
  showToast('弹幕已发送')
}

const jumpTo = (sec) => {
  if (!player) return
  player.currentTime = sec
  showToast(`跳转到 ${secToLabel(sec)}`)
}

const addNote = () => {
  const content = noteDraft.value.trim()
  if (!content) return
  notes.value.unshift({
    id: Date.now(),
    time: currentTime.value,
    content,
  })
  noteDraft.value = ''
  showToast('笔记已保存')
}

const onKeydown = (e) => {
  const tag = (e.target?.tagName || '').toLowerCase()
  if (tag === 'input' || tag === 'textarea') return
  if (!player) return

  if (e.code === 'Space') {
    e.preventDefault()
    player.toggle()
  } else if (e.code === 'ArrowRight') {
    player.currentTime = Math.min((player.currentTime || 0) + 5, player.duration || 0)
    showToast('+5s')
  } else if (e.code === 'ArrowLeft') {
    player.currentTime = Math.max((player.currentTime || 0) - 5, 0)
    showToast('-5s')
  } else if (e.key.toLowerCase() === 'f') {
    e.preventDefault()
    toggleShellFullscreen()
  } else if (e.key.toLowerCase() === 'm') {
    player.muted = !player.muted
    showToast(player.muted ? '已静音' : '取消静音')
  }
}

watch(isShellFullscreen, () => nextTick(syncFullscreenIcon))

watch(() => props.url, async (url) => {
  if (!url) return
  playerLoading.value = true
  if (!player) {
    await initPlayer()
    return
  }
  try {
    await player.switchUrl(url)
    nextTick(() => {
      hidePluginDanmakuUi()
      syncDanmakuVisible()
      syncFullscreenIcon()
      syncReactControls()
      applyPlaybackRate(currentSpeed.value)
    })
  } catch {
    showToast('切换分 P 失败')
  }
})

onMounted(async () => {
  await initPlayer()
  window.addEventListener('keydown', onKeydown)
  document.addEventListener('fullscreenchange', onFullscreenChange)
  document.addEventListener('webkitfullscreenchange', onFullscreenChange)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  document.removeEventListener('webkitfullscreenchange', onFullscreenChange)
  clearTimeout(toastTimer)
  if (getFullscreenElement() === shellRef.value) exitShellFullscreen()
  destroyPlayer()
})
</script>

<template>
  <div ref="shellRef" class="bili-player" :class="{ 'is-fs': isShellFullscreen }">
    <div class="stage">
      <div ref="playerRef" class="art-box"></div>
      <div ref="danmuUiMountRef" class="danmu-ui-mount" aria-hidden="true"></div>

      <Transition name="fade">
        <div v-if="playerLoading" class="loading">
          <div
            v-if="coverUrl"
            class="loading-cover"
            :style="{ backgroundImage: `url(${coverUrl})` }"
          />
          <div class="loading-mask" />
          <div class="loading-card">
            <div class="spin" />
            <div class="loading-title">{{ title || '视频启动中' }}</div>
            <div class="loading-sub">请稍候，精彩内容马上呈现</div>
            <div v-if="authorName" class="loading-meta">@ {{ authorName }}</div>
          </div>
        </div>
      </Transition>

      <div class="online">
        <span class="dot" />
        {{ onlineCount.toLocaleString() }} 人正在看
      </div>

      <div v-if="toast" class="toast">{{ toast }}</div>
    </div>

    <div class="danmu-bar">
      <button
        class="bar-btn note-btn"
        :class="{ on: showNotePanel }"
        title="打开笔记"
        @click="toggleNotePanel"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
          <path
            d="M7 3.75h7.5L19 8.25V20a.75.75 0 0 1-.75.75H7A.75.75 0 0 1 6.25 20V4.5A.75.75 0 0 1 7 3.75Z"
            stroke="currentColor"
            stroke-width="1.6"
          />
          <path d="M14.25 3.75V8.5H19" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
          <path d="M9 12.25h6M9 15.75h4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        </svg>
        <span>笔记</span>
      </button>

      <button
        class="bar-btn danmu-toggle"
        :class="{ off: !danmuVisible }"
        :title="danmuVisible ? '关闭弹幕' : '开启弹幕'"
        @click="toggleDanmaku"
      >
        <svg v-if="danmuVisible" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            fill="currentColor"
            d="M5 5.5A2.5 2.5 0 0 1 7.5 3h9A2.5 2.5 0 0 1 19 5.5v7A2.5 2.5 0 0 1 16.5 15H10l-3.8 2.85A.75.75 0 0 1 5 17.25V5.5Zm3.25 3.25a.75.75 0 0 0 0 1.5h7.5a.75.75 0 0 0 0-1.5h-7.5Zm0 3a.75.75 0 0 0 0 1.5H14a.75.75 0 0 0 0-1.5H8.25Z"
          />
        </svg>
        <svg v-else viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            fill="currentColor"
            opacity="0.55"
            d="M5 5.5A2.5 2.5 0 0 1 7.5 3h9A2.5 2.5 0 0 1 19 5.5v7A2.5 2.5 0 0 1 16.5 15H10l-3.8 2.85A.75.75 0 0 1 5 17.25V5.5Zm3.25 3.25a.75.75 0 0 0 0 1.5h7.5a.75.75 0 0 0 0-1.5h-7.5Zm0 3a.75.75 0 0 0 0 1.5H14a.75.75 0 0 0 0-1.5H8.25Z"
          />
          <path d="M4 5.5 19.5 19" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" />
        </svg>
        <span>弹幕</span>
      </button>

      <input
        v-model="danmuText"
        class="danmu-input"
        maxlength="40"
        :disabled="!danmuVisible"
        :placeholder="danmuVisible ? '发条弹幕见证当下' : '弹幕已关闭'"
        @keyup.enter="sendDanmaku"
      />
      <button class="send" :disabled="!danmuVisible || !danmuText.trim()" @click="sendDanmaku">
        发送
      </button>
    </div>

    <aside v-if="showNotePanel" class="note-panel">
      <div class="note-head">
        <strong>学习笔记</strong>
        <button type="button" @click="showNotePanel = false">关闭</button>
      </div>
      <div class="note-time">当前时间 {{ secToLabel(currentTime) }}</div>
      <textarea v-model="noteDraft" rows="4" placeholder="记下这一刻的想法…" />
      <button class="send full" @click="addNote">保存到此刻</button>
      <div class="note-list">
        <button
          v-for="n in notes"
          :key="n.id"
          type="button"
          class="note-item"
          @click="jumpTo(n.time)"
        >
          <span>{{ secToLabel(n.time) }}</span>
          <p>{{ n.content }}</p>
        </button>
        <div v-if="!notes.length" class="empty">还没有笔记</div>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.bili-player {
  position: relative;
  width: 100%;
  background: #000;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
}
.bili-player.is-fs {
  border-radius: 0;
  width: 100%;
  height: 100%;
  background: #000;
}
.stage {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  flex: 1 1 auto;
  min-height: 0;
}
.bili-player.is-fs .stage {
  aspect-ratio: auto;
  height: calc(100% - 56px);
}
.art-box {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}
.danmu-ui-mount {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
}
.art-box :deep(.artplayer-plugin-danmuku),
.art-box :deep(.apd-config),
.art-box :deep(.apd-toggle),
.art-box :deep(.apd-emitter) {
  display: none !important;
}

/* 点赞/投币/收藏成组，紧挨截图左侧 */
.art-box :deep(.art-control-react-like),
.art-box :deep(.art-control-react-coin),
.art-box :deep(.art-control-react-fav) {
  padding: 0 5px !important;
}
.art-box :deep(.art-control-react-like) {
  margin-left: 4px;
}
.art-box :deep(.art-control-react-fav) {
  margin-right: 6px;
  padding-right: 8px !important;
  border-right: 1px solid rgba(255, 255, 255, 0.18);
}
.art-box :deep(.react-ctrl) {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #fff;
  line-height: 1;
}
.art-box :deep(.react-ctrl.is-on) {
  color: #fb7299;
}
.art-box :deep(.react-ico) {
  display: inline-flex;
}
.art-box :deep(.react-txt) {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1px;
  min-width: 2.2em;
}
.art-box :deep(.react-txt i) {
  font-style: normal;
  font-size: 11px;
  font-weight: 600;
  opacity: 0.95;
}
.art-box :deep(.react-txt b) {
  font-size: 10px;
  font-weight: 500;
  opacity: 0.7;
}
.art-box :deep(.react-ctrl.is-on .react-txt b) {
  opacity: 0.9;
}
.art-box :deep(.ctrl-icon) {
  display: block;
  flex-shrink: 0;
}

.art-box :deep(.art-control-playback-speed) {
  min-width: 40px;
  padding: 0 8px !important;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  letter-spacing: 0.02em;
}

.loading {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: grid;
  place-items: center;
}
.loading-cover {
  position: absolute;
  inset: -8%;
  background-size: cover;
  background-position: center;
  filter: blur(18px) brightness(0.7);
}
.loading-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(15, 18, 28, 0.88), rgba(40, 16, 32, 0.86));
}
.loading-card {
  position: relative;
  z-index: 1;
  width: min(380px, calc(100% - 40px));
  padding: 28px 24px;
  border-radius: 20px;
  text-align: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(251, 114, 153, 0.35);
  backdrop-filter: blur(10px);
}
.spin {
  width: 42px;
  height: 42px;
  margin: 0 auto 14px;
  border-radius: 50%;
  border: 3px solid rgba(251, 114, 153, 0.25);
  border-top-color: #fb7299;
  animation: spin 0.9s linear infinite;
}
.loading-title { font-size: 18px; font-weight: 700; }
.loading-sub,
.loading-meta { margin-top: 8px; color: #c7cdd8; font-size: 13px; }

.online {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 12;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.55);
  font-size: 12px;
}
.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 8px #22c55e;
}

.toast {
  position: absolute;
  left: 50%;
  top: 18%;
  transform: translateX(-50%);
  z-index: 30;
  padding: 8px 14px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.72);
  font-size: 13px;
  pointer-events: none;
}

.danmu-bar {
  flex: 0 0 auto;
  display: grid;
  grid-template-columns: auto auto minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
  padding: 10px 12px;
  background: #141821;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  z-index: 5;
}
.bar-btn {
  height: 36px;
  padding: 0 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  color: #dbe3f0;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  white-space: nowrap;
  transition: background 0.15s, color 0.15s;
  font-size: 13px;
  font-weight: 500;
}
.bar-btn svg {
  flex-shrink: 0;
  display: block;
}
.bar-btn:hover { background: rgba(255, 255, 255, 0.1); }
.bar-btn.on {
  background: rgba(251, 114, 153, 0.2);
  color: #fb7299;
}
.danmu-toggle { min-width: 84px; }
.danmu-toggle.off {
  color: #5c6575;
  background: rgba(255, 255, 255, 0.03);
}
.danmu-toggle.off:hover {
  color: #7a8496;
  background: rgba(255, 255, 255, 0.06);
}
.danmu-input {
  height: 36px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #0f131b;
  color: #fff;
  padding: 0 12px;
  outline: none;
  min-width: 0;
}
.danmu-input:focus { border-color: #fb7299; }
.danmu-input:disabled { opacity: 0.55; cursor: not-allowed; }
.send {
  height: 36px;
  padding: 0 16px;
  border-radius: 10px;
  background: linear-gradient(135deg, #fb7299, #e85a84);
  color: #fff;
  font-weight: 600;
}
.send:disabled { opacity: 0.45; cursor: not-allowed; }
.send.full { width: 100%; margin-top: 8px; }

.note-panel {
  position: absolute;
  top: 12px;
  right: 12px;
  width: min(300px, calc(100% - 24px));
  z-index: 40;
  padding: 12px;
  border-radius: 14px;
  background: rgba(15, 18, 28, 0.94);
  border: 1px solid rgba(251, 114, 153, 0.35);
  backdrop-filter: blur(10px);
}
.note-head,
.note-item {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}
.note-head button { color: #fb7299; }
.note-time { margin: 8px 0; color: #9aa4b2; font-size: 12px; }
textarea {
  width: 100%;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #0f131b;
  color: #fff;
  padding: 10px;
  resize: vertical;
}
.note-list {
  margin-top: 10px;
  max-height: 180px;
  overflow: auto;
  display: grid;
  gap: 8px;
}
.note-item {
  width: 100%;
  text-align: left;
  padding: 8px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  color: inherit;
}
.note-item span { color: #fb7299; font-size: 12px; white-space: nowrap; }
.note-item p { margin: 0; color: #d7dee9; font-size: 13px; }
.empty { text-align: center; color: #6b7280; padding: 16px 0; font-size: 13px; }

.fade-enter-active,
.fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 720px) {
  .bar-btn span { display: none; }
  .danmu-toggle { min-width: 40px; padding: 0 10px; }
  .art-box :deep(.react-txt) { display: none; }
}
</style>
