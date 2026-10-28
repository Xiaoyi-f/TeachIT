<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Map as MapLibreMap, Marker } from 'maplibre-gl'
import { provinces, shortName, type Place } from './places'
import 'maplibre-gl/dist/maplibre-gl.css'

const INIT = { center: [104.2, 35.5] as [number, number], zoom: 3.8 }

const props = defineProps<{ place: Place | null; resetToken: number }>()
const emit = defineEmits<{ select: [Place] }>()

const el = ref<HTMLDivElement | null>(null)

let map: MapLibreMap | null = null
let pin: Marker | null = null
const labels: Marker[] = []

const tiles = [1, 2, 3, 4].map(
  (n) =>
    `https://webrd0${n}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}`,
)

function clearPin() {
  pin?.remove()
  pin = null
}

function addProvinceLabels() {
  if (!map) return
  for (const prov of provinces()) {
    const node = document.createElement('button')
    node.type = 'button'
    node.className = 'prov-label'
    node.textContent = shortName(prov.name)
    node.title = prov.name
    node.addEventListener('click', (e) => {
      e.stopPropagation()
      emit('select', prov)
    })
    labels.push(new Marker({ element: node, anchor: 'center' }).setLngLat([prov.lng, prov.lat]).addTo(map))
  }
}

function resetView() {
  if (!map) return
  clearPin()
  map.easeTo({ center: INIT.center, zoom: INIT.zoom, duration: 600 })
}

onMounted(() => {
  if (!el.value) return
  map = new MapLibreMap({
    container: el.value,
    style: {
      version: 8,
      sources: {
        gaode: { type: 'raster', tiles, tileSize: 256, maxzoom: 18 },
      },
      layers: [{ id: 'gaode', type: 'raster', source: 'gaode' }],
    },
    center: INIT.center,
    zoom: INIT.zoom,
    minZoom: 3,
    maxZoom: 18,
    attributionControl: false,
    dragRotate: false,
  })
  map.on('load', addProvinceLabels)
})

onBeforeUnmount(() => {
  clearPin()
  labels.forEach((m) => m.remove())
  labels.length = 0
  map?.remove()
  map = null
})

watch(
  () => props.place,
  (place) => {
    if (!map) return
    if (!place) {
      clearPin()
      return
    }
    clearPin()
    const node = document.createElement('div')
    node.className = 'pin'
    pin = new Marker({ element: node, anchor: 'bottom' }).setLngLat([place.lng, place.lat]).addTo(map)
    map.easeTo({ center: [place.lng, place.lat], zoom: Math.max(map.getZoom(), 11), duration: 800 })
  },
)

watch(
  () => props.resetToken,
  (token) => {
    if (token > 0) resetView()
  },
)
</script>

<template>
  <div ref="el" class="map" />
</template>
