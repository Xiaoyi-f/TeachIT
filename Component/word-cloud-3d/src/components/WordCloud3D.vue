<script setup>
/**
 * 从主项目 SPRightSidebar.vue 提取的 3D 词云核心逻辑
 * ----------------------------------------------------
 * 学习要点：
 * 1. CanvasTexture + Sprite 把文字画成可点的 3D 精灵
 * 2. 球面分布（phi / theta）摆放词节点
 * 3. OrbitControls 拖拽旋转 / 自动旋转
 * 4. Raycaster 点击命中精灵，高亮关联连线并触发检索
 */
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const props = defineProps({
  /** @type {{ id: string, name: string, value: number }[]} */
  nodes: { type: Array, default: () => [] },
  /** 文章/话题列表，用于根据共同标签生成关系边 */
  topics: { type: Array, default: () => [] },
  height: { type: Number, default: 420 },
})

const emit = defineEmits(['word-click'])

const cloudEl = ref(null)
const hoveredWord = ref('')

let scene = null
let camera = null
let renderer = null
let controls = null
let animationId = null
let raycaster = null
let mouse = null
let group = null
const spriteMap = new Map()
const linesMap = new Map()

/** 用 Canvas 画文字，再贴到 Sprite 上 */
const createTextSprite = (text, size = 26, color = '#3b82f6') => {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  canvas.width = 512
  canvas.height = 256

  context.clearRect(0, 0, canvas.width, canvas.height)
  context.font = `700 ${size * 4}px "PingFang SC","Microsoft YaHei",sans-serif`
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.strokeStyle = 'rgba(255,255,255,0.9)'
  context.lineWidth = 12
  context.strokeText(text, canvas.width / 2, canvas.height / 2)
  context.fillStyle = color
  context.fillText(text, canvas.width / 2, canvas.height / 2)

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
  })
  return new THREE.Sprite(material)
}

/**
 * 根据文章 tags 的共现关系生成连线
 * 若没有共现，就以权重最高的词为中心做星形连接，保证画面有结构
 */
const buildRelations = (data) => {
  const nodeSet = new Set(data.map((n) => n.id))
  const pairMap = new Map()

  props.topics.forEach((topic) => {
    const tags = (topic.tags || [])
      .map((t) => String(t).trim().toLowerCase())
      .filter((t) => nodeSet.has(t))
    const uniq = [...new Set(tags)]
    for (let i = 0; i < uniq.length; i++) {
      for (let j = i + 1; j < uniq.length; j++) {
        const a = uniq[i]
        const b = uniq[j]
        const key = a < b ? `${a}__${b}` : `${b}__${a}`
        pairMap.set(key, (pairMap.get(key) || 0) + 1)
      }
    }
  })

  const links = Array.from(pairMap.entries())
    .map(([k, w]) => {
      const [s, t] = k.split('__')
      return { s, t, w }
    })
    .sort((a, b) => b.w - a.w)
    .slice(0, 30)

  if (links.length === 0 && data.length > 1) {
    const center = data[0].id
    return data.slice(1, Math.min(data.length, 10)).map((n, idx) => ({
      s: center,
      t: n.id,
      w: 5 - idx * 0.3,
    }))
  }
  return links
}

const destroyThreeCloud = () => {
  if (animationId) cancelAnimationFrame(animationId)
  animationId = null
  window.removeEventListener('resize', onResize)
  renderer?.domElement.removeEventListener('click', onCanvasClick)
  renderer?.domElement.removeEventListener('pointermove', onPointerMove)
  controls?.dispose()
  renderer?.dispose()
  spriteMap.forEach((sprite) => {
    sprite.material.map?.dispose()
    sprite.material.dispose()
  })
  linesMap.forEach((line) => {
    line.geometry.dispose()
    line.material.dispose()
  })
  spriteMap.clear()
  linesMap.clear()
  if (cloudEl.value) cloudEl.value.innerHTML = ''
  scene = camera = renderer = controls = raycaster = mouse = group = null
}

const initThreeCloud = () => {
  if (!cloudEl.value || !props.nodes.length) return
  destroyThreeCloud()

  scene = new THREE.Scene()
  scene.background = new THREE.Color('#f8fbff')

  const width = Math.max(cloudEl.value.clientWidth, 280)
  const height = props.height

  camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000)
  camera.position.set(0, 0, 220)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  cloudEl.value.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enablePan = false
  controls.enableDamping = true
  controls.autoRotate = true
  controls.autoRotateSpeed = 0.8
  controls.minDistance = 140
  controls.maxDistance = 360

  scene.add(new THREE.AmbientLight(0xffffff, 0.95))
  const light = new THREE.DirectionalLight(0xffffff, 0.8)
  light.position.set(0, 1, 1)
  scene.add(light)

  group = new THREE.Group()
  scene.add(group)

  // 球面均匀分布：Fibonacci 风格的 phi / theta
  const radius = 88
  props.nodes.forEach((node, index) => {
    const phi = Math.acos(-1 + (2 * index) / Math.max(1, props.nodes.length))
    const theta = Math.sqrt(props.nodes.length * Math.PI) * phi
    const x = radius * Math.cos(theta) * Math.sin(phi)
    const y = radius * Math.sin(theta) * Math.sin(phi)
    const z = radius * Math.cos(phi)

    const sprite = createTextSprite(node.name, 18 + Math.min(16, node.value / 3), '#2563eb')
    sprite.position.set(x, y, z)
    const s = 16 + Math.min(18, node.value * 0.35)
    sprite.scale.set(s * 1.9, s, 1)
    sprite.userData.word = node.name
    sprite.userData.id = node.id
    group.add(sprite)
    spriteMap.set(node.id, sprite)
  })

  buildRelations(props.nodes).forEach((link) => {
    const s = spriteMap.get(link.s)
    const t = spriteMap.get(link.t)
    if (!s || !t) return
    const geometry = new THREE.BufferGeometry().setFromPoints([
      s.position.clone(),
      t.position.clone(),
    ])
    const material = new THREE.LineBasicMaterial({
      color: '#60a5fa',
      transparent: true,
      opacity: Math.min(0.95, 0.2 + link.w * 0.18),
    })
    const line = new THREE.Line(geometry, material)
    group.add(line)
    linesMap.set(`${link.s}__${link.t}`, line)
  })

  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()
  renderer.domElement.addEventListener('click', onCanvasClick)
  renderer.domElement.addEventListener('pointermove', onPointerMove)
  window.addEventListener('resize', onResize)
  animate()
}

const pickSprite = (event) => {
  if (!renderer || !camera || !raycaster || !mouse) return null
  const rect = renderer.domElement.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects([...spriteMap.values()], false)
  return intersects[0]?.object || null
}

const onCanvasClick = (event) => {
  const hit = pickSprite(event)
  if (!hit) return
  const word = hit.userData.word
  const hitId = hit.userData.id
  emit('word-click', word)

  linesMap.forEach((line, key) => {
    const material = line.material
    const related = key.includes(hitId)
    material.color.set(related ? '#2563eb' : '#94a3b8')
    material.opacity = related ? 1 : 0.22
  })
}

const onPointerMove = (event) => {
  const hit = pickSprite(event)
  hoveredWord.value = hit?.userData.word || ''
  if (renderer) renderer.domElement.style.cursor = hit ? 'pointer' : 'grab'
}

const onResize = () => {
  if (!cloudEl.value || !camera || !renderer) return
  const width = Math.max(cloudEl.value.clientWidth, 280)
  const height = props.height
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

const animate = () => {
  if (!renderer || !scene || !camera || !controls) return
  controls.update()
  renderer.render(scene, camera)
  animationId = requestAnimationFrame(animate)
}

const rebuild = async () => {
  await nextTick()
  initThreeCloud()
}

watch(() => [props.nodes, props.topics], rebuild, { deep: true })
onMounted(rebuild)
onUnmounted(destroyThreeCloud)

defineExpose({ rebuild })
</script>

<template>
  <div class="cloud-shell">
    <div ref="cloudEl" class="cloud-canvas" :style="{ height: `${height}px` }"></div>
    <div v-if="!nodes.length" class="cloud-empty">暂无词云数据</div>
    <div v-if="hoveredWord" class="cloud-hint">悬停：{{ hoveredWord }} · 点击可检索</div>
  </div>
</template>

<style scoped>
.cloud-shell {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #dbe7ff;
  background: linear-gradient(160deg, #f8fbff, #eef6ff);
}
.cloud-canvas { width: 100%; }
.cloud-empty {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: #94a3b8;
}
.cloud-hint {
  position: absolute;
  left: 12px;
  bottom: 12px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.72);
  color: #fff;
  font-size: 12px;
}
</style>
