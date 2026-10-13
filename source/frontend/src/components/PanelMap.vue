<!--
  推演层左侧「地图模式」：把推演图谱里的本体按名称匹配到经纬度，画在简化中国轮廓上。
  与图谱模式共用同一份数据（graphData），默认仍是图谱；这里只是另一种看法。
-->
<template>
  <div class="panel-map">
    <div class="pm-head">
      <span class="pm-title">推演地图</span>
      <span class="pm-stat">{{ placed.length }} / {{ nodes.length }} 个本体已定位</span>
    </div>
    <div class="pm-canvas">
      <svg :viewBox="`0 0 ${W} ${H}`" role="img" aria-label="推演本体地图">
        <path :d="outlinePath" class="pm-land" />
        <g class="pm-edges">
          <line v-for="e in laidEdges" :key="e.id" :x1="e.x1" :y1="e.y1" :x2="e.x2" :y2="e.y2" />
        </g>
        <g class="pm-nodes">
          <g v-for="n in placed" :key="n.id" :transform="`translate(${n.x},${n.y})`">
            <circle :r="n.r" :fill="n.color" :fill-opacity=".85" stroke="#fff" stroke-width="1.2" />
            <text v-if="n.big" class="pm-label" y="-8">{{ n.short }}</text>
          </g>
        </g>
      </svg>
    </div>
    <div class="pm-legend">
      <span v-for="t in legend" :key="t.type"><i :style="{ background: t.color }"></i>{{ t.type }} {{ t.n }}</span>
    </div>
    <p class="pm-note">未定位的本体（{{ nodes.length - placed.length }} 个）多为指标、事件类，没有地理坐标，只在图谱模式里出现。</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { chinaOutline, coordOf } from '../data/geo-lite'

const props = defineProps({ graphData: { type: Object, default: null } })

const W = 900, H = 620
/* 经纬度 → 画布坐标（中国范围大致 73–136E / 17–54N，留边距） */
const B = { w: 73, e: 136, s: 17, n: 54 }
const px = (lng, lat) => [(lng - B.w) / (B.e - B.w) * W, H - (lat - B.s) / (B.n - B.s) * H]

const outlinePath = computed(() => chinaOutline.map((c, i) => {
  const [x, y] = px(c[0], c[1]); return (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1)
}).join(' ') + ' Z')

const TYPE_COLOR = { 产区: '#d97706', 农产品: '#0e7490', 市场: '#16a34a', 角色: '#7c3aed', 指标: '#b45309', 制度: '#0f766e' }

const nodes = computed(() => (props.graphData?.nodes || []))
const placed = computed(() => nodes.value.map((n) => {
  const type = (n.labels || [])[1] || '其他'
  const c = coordOf(n.name)
  if (!c) return null
  const [x, y] = px(c[0], c[1])
  const deg = n.degree || 0
  return { id: n.uuid, name: n.name, short: n.name.length > 6 ? n.name.slice(0, 6) : n.name,
    x, y, r: Math.min(12, 3.5 + Math.sqrt(deg) * 1.6), big: deg >= 8, color: TYPE_COLOR[type] || '#64748b' }
}).filter(Boolean))

const laidEdges = computed(() => {
  const at = {}
  placed.value.forEach((n) => { at[n.id] = n })
  return (props.graphData?.edges || []).map((e) => {
    const a = at[e.source_node_uuid], b = at[e.target_node_uuid]
    if (!a || !b) return null
    return { id: e.uuid, x1: a.x, y1: a.y, x2: b.x, y2: b.y }
  }).filter(Boolean)
})

const legend = computed(() => {
  const m = {}
  placed.value.forEach((n) => { const t = n.name; void t })
  const counts = {}
  nodes.value.forEach((n) => { const t = (n.labels || [])[1] || '其他'; counts[t] = (counts[t] || 0) + 1 })
  return Object.keys(counts).map((t) => ({ type: t, n: counts[t], color: TYPE_COLOR[t] || '#64748b' }))
})
</script>

<style scoped>
.panel-map{display:flex;flex-direction:column;height:100%;background:#fbfdff}
.pm-head{display:flex;align-items:baseline;gap:10px;padding:10px 14px;border-bottom:1px solid #e3e8f3;background:#fff}
.pm-title{font-size:13px;font-weight:650;color:#0f172a}
.pm-stat{font:600 11px 'JetBrains Mono',monospace;color:#64748b}
.pm-canvas{flex:1;min-height:0;padding:8px}
.pm-canvas svg{display:block;width:100%;height:100%}
.pm-land{fill:#eef4ff;stroke:#bcd0f0;stroke-width:1.4}
.pm-edges line{stroke:#c9d6ef;stroke-width:1}
.pm-nodes circle{transition:r .2s}
.pm-label{fill:#0f172a;font:600 9px 'Noto Sans SC',sans-serif;text-anchor:middle}
.pm-legend{display:flex;flex-wrap:wrap;gap:10px;padding:8px 14px;border-top:1px solid #e3e8f3;background:#fff;font-size:11px;color:#64748b}
.pm-legend i{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:5px}
.pm-note{margin:0;padding:8px 14px 12px;font-size:11px;color:#94a3b8;background:#fff}
</style>
