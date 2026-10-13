<!--
  推演层左侧「3D 地球模式」：与关联层的三维视图同一套观感（自转球体 + 经纬网 + 本体点），
  数据仍来自同一份 graphData；点按名称匹配坐标（geo-lite），匹配不到的只在图谱/地图模式里出现。
-->
<template>
  <div class="pg">
    <div class="pg-head"><span class="pg-t">推演地球</span><span class="pg-s">{{ placed.length }} / {{ nodes.length }} 个本体已定位</span></div>
    <canvas ref="cv" class="pg-cv" @pointerdown="onDown" @pointermove="onMove" @pointerup="onUp" @pointerleave="onUp" />
    <div class="pg-foot"><span>拖动可旋转 · 松手后缓慢自转</span><span>{{ rotated.toFixed(0) }}°</span></div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { coordOf } from '../data/geo-lite'

const props = defineProps({ graphData: { type: Object, default: null } })
const cv = ref(null)
const rotated = ref(0)
let raf = 0, spin = -20, drag = null, dragging = false, cw = 0, ch = 0

const nodes = computed(() => (props.graphData?.nodes || []))
const placed = computed(() => nodes.value.map((n) => {
  const c = coordOf(n.name)
  if (!c) return null
  const type = (n.labels || [])[1] || '其他'
  return { lng: c[0], lat: c[1], r: Math.min(9, 2.5 + Math.sqrt(n.degree || 0) * 1.3), type }
}).filter(Boolean))
const TYPE_COLOR = { 产区: '#f59e0b', 农产品: '#22d3ee', 市场: '#34d399', 角色: '#a78bfa', 指标: '#fbbf24', 制度: '#2dd4bf' }

function project(lng, lat, rot) {
  const phi = (90 - lat) * Math.PI / 180, theta = (lng + rot) * Math.PI / 180
  const x = Math.sin(phi) * Math.cos(theta), y = Math.cos(phi), z = Math.sin(phi) * Math.sin(theta)
  const R = Math.min(cw, ch) * 0.42
  return { x: cw / 2 + x * R, y: ch / 2 - y * R, z, R }
}
function draw() {
  const el = cv.value; if (!el) return
  const ctx = el.getContext('2d')
  ctx.clearRect(0, 0, cw, ch)
  const R = Math.min(cw, ch) * 0.42, cx = cw / 2, cy = ch / 2
  const g = ctx.createRadialGradient(cx - R * .3, cy - R * .35, R * .1, cx, cy, R)
  g.addColorStop(0, '#f7fbfd'); g.addColorStop(.7, '#dbeafe'); g.addColorStop(1, '#c7ddf6')
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill()
  ctx.strokeStyle = 'rgba(120,160,220,.5)'; ctx.lineWidth = 1
  for (let lat = -60; lat <= 60; lat += 30) {                       /* 纬线 */
    ctx.beginPath()
    for (let lng = -180; lng <= 180; lng += 4) { const q = project(lng, lat, spin); (lng === -180 ? ctx.moveTo : ctx.lineTo).call(ctx, q.x, q.y) }
    ctx.stroke()
  }
  for (let lng = -180; lng < 180; lng += 30) {                      /* 经线 */
    ctx.beginPath()
    for (let lat = -90; lat <= 90; lat += 4) { const q = project(lng, lat, spin); (lat === -90 ? ctx.moveTo : ctx.lineTo).call(ctx, q.x, q.y) }
    ctx.stroke()
  }
  placed.value.slice().sort((a, b) => project(a.lng, a.lat, spin).z - project(b.lng, b.lat, spin).z).forEach((n) => {
    const q = project(n.lng, n.lat, spin)
    const front = q.z > -0.1
    ctx.beginPath(); ctx.arc(q.x, q.y, n.r * (front ? 1 : .55), 0, Math.PI * 2)
    ctx.fillStyle = (TYPE_COLOR[n.type] || '#64748b') + (front ? 'e6' : '40'); ctx.fill()
    ctx.strokeStyle = front ? '#fff' : 'rgba(255,255,255,.4)'; ctx.lineWidth = 1; ctx.stroke()
  })
}
function loop() { raf = requestAnimationFrame(loop); if (!dragging) spin -= 0.12; rotated.value = ((spin % 360) + 540) % 360 - 180; draw() }
function onDown(e) { dragging = true; drag = { x: e.clientX, rot: spin } }
function onMove(e) { if (dragging && drag) { spin = drag.rot + (e.clientX - drag.x) * 0.35; draw() } }
function onUp() { dragging = false; drag = null }
function size() { const el = cv.value; if (!el) return; const box = el.parentElement.getBoundingClientRect(); cw = el.width = box.width; ch = el.height = Math.max(220, box.height); draw() }
onMounted(() => { size(); loop(); window.addEventListener('resize', size) })
onUnmounted(() => { cancelAnimationFrame(raf); window.removeEventListener('resize', size) })
</script>

<style scoped>
.pg{display:flex;flex-direction:column;height:100%;background:#fbfdff}
.pg-head{display:flex;align-items:baseline;gap:10px;padding:10px 14px;border-bottom:1px solid #e3e8f3;background:#fff}
.pg-t{font-size:13px;font-weight:650;color:#0f172a}
.pg-s{font:600 11px 'JetBrains Mono',monospace;color:#64748b}
.pg-cv{flex:1;min-height:0;width:100%;display:block;cursor:grab}
.pg-foot{display:flex;justify-content:space-between;padding:8px 14px;border-top:1px solid #e3e8f3;background:#fff;font:600 10.5px 'JetBrains Mono',monospace;color:#94a3b8}
</style>
