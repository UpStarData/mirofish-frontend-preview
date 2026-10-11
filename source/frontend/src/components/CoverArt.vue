<!--
  推演主题封面。封面在页面内联生成，不请求外部图片。
  五套风格（A 暗色工程 / B 蓝图 / C 纸感台账 / D 地块地图 / E 告警面板）共用一套骨架：
  左上小标 + 左下主标题/强调短线/英文副标 + 右侧一个视觉隐喻 + 右下编号水印；
  只换底板、图形语言与排版。规格见工程目录 card-styles/STYLES.md。
  版式与取色最初参考 Cola Skill（https://colaskill.com/zh/）上公开技能卡的封面样式，图形与配色按本项目重画。
-->
<template>
  <span class="cover-art" v-html="markup" />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  skin: { type: String, default: 'A' },
  art: { type: Object, required: true }
})

const SANS = "'Space Grotesk','Noto Sans SC','PingFang SC',sans-serif"
const MONO = "'JetBrains Mono','SF Mono',monospace"
const SERIF = "'Songti SC','Noto Serif SC','PingFang SC',serif"

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/* 公共零件 */
const grid = (step, color, op, w = 640, h = 360) => {
  const p = []
  for (let x = step; x < w; x += step) p.push(`<path d="M${x} 0V${h}"/>`)
  for (let y = step; y < h; y += step) p.push(`<path d="M0 ${y}H${w}"/>`)
  return `<g stroke="${color}" stroke-opacity="${op}" stroke-width="1">${p.join('')}</g>`
}
const ticks = (c, op) =>
  `<path d="M28 40h7M28 40v7M612 40h-7M612 40v7M28 320h7M28 320v-7M612 320h-7M612 320v-7" stroke="${c}" stroke-opacity="${op}" stroke-width="2" fill="none"/>`
const wm = (t, fill, family = MONO, size = 150, x = 566, y = 252, extra = '') =>
  `<text x="${x}" y="${y}" font-size="${size}" font-weight="700" fill="${fill}" font-family="${family}" text-anchor="middle"${extra}>${esc(t)}</text>`
/* 小标 + 主标题 + 强调短线 + 英文副标（五套共用版式，只换字色/字级） */
const typeBlock = (a, o) => `
  <text x="28" y="${o.labelY}" font-family="${MONO}" font-size="${o.labelSize}" letter-spacing="3" fill="${o.labelFill}">${o.label}</text>
  <text x="${o.titleX}" y="${o.titleY}" font-family="${o.titleFamily || SANS}" font-size="${o.titleSize}" font-weight="700" letter-spacing="${o.titleSpacing || 2}" fill="${o.titleFill}">${esc(a.title)}</text>
  <rect x="${o.ruleX}" y="${o.ruleY}" width="${o.ruleW}" height="${o.ruleH}" rx="${o.ruleH / 2}" fill="${o.ruleFill}"/>
  <text x="${o.subX}" y="${o.subY}" font-family="${MONO}" font-size="${o.subSize}" letter-spacing="${o.subSpacing}" fill="${o.subFill}">${esc(a.sub)}</text>`

/* ---------------- 五套风格 ---------------- */
const STYLES = {
  /* A 暗色工程：深底 + 网格 + 光晕 + 单强调色线稿 */
  A: (a) => `
    <defs>
      <linearGradient id="bgA" x1="0" y1="0" x2=".75" y2="1"><stop offset="0" stop-color="${a.from}"/><stop offset="1" stop-color="${a.to}"/></linearGradient>
      <radialGradient id="glowA"><stop offset="0" stop-color="${a.accent}" stop-opacity=".22"/><stop offset="1" stop-color="${a.accent}" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="640" height="360" fill="url(#bgA)"/>
    ${grid(32, '#fff', .055)}
    <circle cx="486" cy="150" r="188" fill="url(#glowA)"/>
    ${wm(a.no, 'rgba(255,255,255,.05)')}
    ${ticks('#fff', .34)}
    <g stroke="${a.accent}" fill="none" stroke-linecap="round" stroke-linejoin="round">${a.motif}</g>
    ${typeBlock(a, { label: 'AGRI &#183; 热门推演 ' + a.no, labelY: 86, labelSize: 13, labelFill: 'rgba(255,255,255,.55)', titleX: 27, titleY: 176, titleSize: 66, titleFill: '#f5f8f9', ruleX: 29, ruleY: 196, ruleW: 86, ruleH: 5, ruleFill: a.accent, subX: 29, subY: 232, subSize: 19, subSpacing: 2.6, subFill: 'rgba(255,255,255,.62)' })}`,

  /* B 蓝图：深蓝底 + 双层网格 + 刻度尺 + 白细线 + 尺寸标注 */
  B: (a) => `
    <defs><linearGradient id="bgB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0b2545"/><stop offset="1" stop-color="#071a33"/></linearGradient></defs>
    <rect width="640" height="360" fill="url(#bgB)"/>
    ${grid(40, '#ffffff', .07)}${grid(8, '#ffffff', .032)}
    <g stroke="rgba(255,255,255,.5)" stroke-width="1.5">
      <path d="M0 20H12M0 60H12M0 100H12M0 140H12M0 180H12M0 220H12M0 260H12M0 300H12M0 340H12"/>
      <path d="M620 20h12M620 60h12M620 100h12M620 140h12M620 180h12M620 220h12M620 260h12M620 300h12M620 340h12"/>
      <path d="M60 8V16M100 8V16M140 8V16M180 8V16M220 8V16M260 8V16M300 8V16M340 8V16M380 8V16M420 8V16M460 8V16M500 8V16M540 8V16M580 8V16"/>
    </g>
    ${wm(a.no, 'none', MONO, 150, 596, 252, ` stroke="rgba(255,255,255,.16)" stroke-width="2"`)}
    <g stroke="${a.accent}" fill="none" stroke-linecap="round" stroke-linejoin="round">${a.motif}</g>
    ${typeBlock(a, { label: 'AGRI &#183; HOT TOPIC ' + a.no, labelY: 86, labelSize: 13, labelFill: 'rgba(200,225,245,.75)', titleX: 27, titleY: 172, titleSize: 58, titleFill: '#eef6ff', ruleX: 29, ruleY: 192, ruleW: 70, ruleH: 3, ruleFill: a.accent, subX: 29, subY: 224, subSize: 16, subSpacing: 2.4, subFill: a.accent })}`,

  /* C 纸感台账：米白纸 + 极淡横线 + 账本红竖线 + 表格 + 复核章 */
  C: (a) => {
    const rows = a.rows || []
    const top = 108, rh = 36, x0 = 336, w = 252
    const lines = [0, 1, 2, 3].map((i) => `<path d="M${x0} ${top + i * rh}h${w}"/>`).join('')
    const body = rows.map((r, i) => `
      <text x="${x0 + 16}" y="${top + i * rh + 25}" font-family="${MONO}" font-size="15" fill="#1f1c17">${esc(r[0])}</text>
      <text x="${x0 + 128}" y="${top + i * rh + 25}" font-family="${MONO}" font-size="15" ${i === a.hit ? `fill="${a.accent}" font-weight="700"` : 'fill="#1f1c17"'}>${esc(r[1])}</text>`).join('')
    return `
    <rect width="640" height="360" fill="#f6f1e7"/>
    ${grid(24, '#1f1c17', .06)}
    <g stroke="#b3261e" stroke-opacity=".35" stroke-width="1"><path d="M52 0V360M588 0V360"/></g>
    <rect width="640" height="360" fill="url(#noiseC)" opacity=".05"/>
    <defs><pattern id="noiseC" width="6" height="6" patternUnits="userSpaceOnUse">
      <circle cx="1" cy="1" r=".7" fill="#1f1c17"/><circle cx="4" cy="4" r=".5" fill="#1f1c17"/></pattern></defs>
    ${wm(a.no, 'rgba(31,28,23,.045)', SERIF)}
    <g stroke="#1f1c17" stroke-opacity=".85" stroke-width="2" fill="none">
      <rect x="${x0}" y="${top}" width="${w}" height="${rh * 3}"/><path d="M${x0 + 112} ${top}v${rh * 3}"/>${lines}
    </g>
    <g font-family="${MONO}" font-size="15" fill="#1f1c17">
      <text x="${x0 + 16}" y="${top + 25}" font-weight="700">${esc((a.head || ['', ''])[0])}</text>
      <text x="${x0 + 128}" y="${top + 25}" font-weight="700">${esc((a.head || ['', ''])[1])}</text>
    </g>
    ${body}
    <path d="M${x0 + 122} ${top + (a.hit + 1) * rh - 8}h56" stroke="${a.accent}" stroke-width="4"/>
    <g transform="rotate(-8 ${x0 - 50} ${top + 158})">
      <rect x="${x0 - 100}" y="${top + 142}" width="104" height="34" fill="none" stroke="${a.accent}" stroke-width="3"/>
      <text x="${x0 - 48}" y="${top + 165}" font-family="${SERIF}" font-size="17" fill="${a.accent}" text-anchor="middle">${esc(a.stamp)}</text>
    </g>
    ${typeBlock(a, { label: 'AGRI &#183; 热门推演 ' + a.no, labelY: 86, labelSize: 12, labelFill: '#8a8577', titleX: 27, titleY: 176, titleSize: 60, titleSpacing: 1, titleFill: '#1f1c17', ruleX: 29, ruleY: 196, ruleW: 86, ruleH: 4, ruleFill: a.accent, subX: 29, subY: 232, subSize: 18, subSpacing: 2.4, subFill: '#7a7466' })}
    <text x="28" y="336" font-family="${MONO}" font-size="11" letter-spacing="1.6" fill="#8a8577">${esc(a.footer || '')}</text>`
  },

  /* D 地块地图：深绿底 + 等高线 + 地块多边形 + 路线节点 + 比例尺 */
  D: (a) => `
    <defs><linearGradient id="bgD" x1="0" y1="0" x2=".8" y2="1"><stop offset="0" stop-color="#10241c"/><stop offset="1" stop-color="#071610"/></linearGradient></defs>
    <rect width="640" height="360" fill="url(#bgD)"/>
    <g stroke="#ffffff" stroke-opacity=".10" stroke-width="1.4" fill="none">
      <path d="M0 90c70 24 120-18 190 4s140 44 210 12 140-40 240-6"/>
      <path d="M0 150c80 20 130-16 200 6s150 40 220 10 130-34 220-4"/>
      <path d="M0 214c70 22 128-20 196 2s146 42 214 12 138-36 230-8"/>
    </g>
    <g fill="#ffffff" fill-opacity=".13" stroke="#ffffff" stroke-opacity=".34" stroke-width="1.6" stroke-dasharray="7 5">
      ${(a.parcels || []).map((d) => `<path d="${d}"/>`).join('')}
    </g>
    ${(a.routes || []).map((d) => `<path d="${d}" stroke="${a.accent}" stroke-width="5" fill="none" stroke-linecap="round"/>`).join('')}
    ${(a.nodes || []).map((n, i) => `
      <circle cx="${n[0]}" cy="${n[1]}" r="${i === (a.nodes.length - 1) ? 9 : 7}" fill="${a.accent}"/>
      <circle cx="${n[0]}" cy="${n[1]}" r="${i === (a.nodes.length - 1) ? 18 : 16}" fill="none" stroke="#ffffff" stroke-opacity=".38" stroke-width="2"/>`).join('')}
    <g stroke="#ffffff" stroke-opacity=".55" stroke-width="2" fill="none"><path d="M470 62v18M461 71h18"/></g>
    <text x="486" y="70" font-family="${MONO}" font-size="13" fill="rgba(255,255,255,.6)">N</text>
    <g stroke="#ffffff" stroke-opacity=".5" stroke-width="2"><path d="M28 326h96M28 320v12M76 320v12M124 320v12"/></g>
    <text x="132" y="331" font-family="${MONO}" font-size="12" fill="rgba(255,255,255,.6)">${esc(a.scale || '')}</text>
    ${wm(a.no, 'rgba(255,255,255,.035)', MONO, 132, 590, 262)}
    ${typeBlock(a, { label: 'AGRI &#183; 热门推演 ' + a.no, labelY: 86, labelSize: 13, labelFill: 'rgba(255,255,255,.55)', titleX: 27, titleY: 172, titleSize: 62, titleFill: '#f2fbf0', ruleX: 29, ruleY: 192, ruleW: 80, ruleH: 5, ruleFill: a.accent, subX: 29, subY: 226, subSize: 18, subSpacing: 2.4, subFill: 'rgba(233,246,230,.66)' })}`,

  /* E 告警面板：近黑底 + 细网格 + 大数字 + 阈值线 + 尖峰（唯一允许两色：主色 + 琥珀辅色） */
  E: (a) => {
    const bars = a.bars || []
    const x0 = 358, step = 36, base = 320
    const body = bars.map((h, i) => `<path d="M${x0 + i * step} ${base}V${h}"/>`).join('')
    const last = bars.length - 1
    return `
    <defs><linearGradient id="bgE" x1="0" y1="0" x2=".7" y2="1"><stop offset="0" stop-color="#101418"/><stop offset="1" stop-color="#0a0d10"/></linearGradient></defs>
    <rect width="640" height="360" fill="url(#bgE)"/>
    ${grid(20, '#ffffff', .045)}
    <rect x="0" y="0" width="640" height="6" fill="${a.accent}"/>
    ${wm('2.4\u00d7', 'rgba(255,255,255,.045)', MONO, 112, 600, 330, ' text-anchor="end"')}
    <g stroke="rgba(255,255,255,.16)" stroke-width="16">${body}</g>
    <path d="M${x0 + last * step} ${base}V${bars[last]}" stroke="${a.accent}" stroke-width="16"/>
    <path d="M${x0 - 14} ${bars[0] - 10}h246" stroke="#ffb020" stroke-width="3" stroke-dasharray="12 8"/>
    <text x="${x0 - 10}" y="${bars[0] - 18}" font-family="${MONO}" font-size="13" fill="#ffb020">${esc(a.threshold || '')}</text>
    <circle cx="${x0 + last * step}" cy="${bars[last]}" r="13" fill="none" stroke="${a.accent}" stroke-width="5"/>
    <circle cx="${x0 + last * step}" cy="${bars[last]}" r="26" fill="none" stroke="${a.accent}" stroke-width="2" stroke-opacity=".5"/>
    <g transform="translate(${x0 + last * step - 136} ${bars[last] - 44})">
      <rect width="118" height="30" fill="${a.accent}"/>
      <text x="59" y="21" font-family="${MONO}" font-size="15" font-weight="700" fill="#14090a" text-anchor="middle">${esc(a.status || '')}</text>
    </g>
    <text x="28" y="80" font-family="${MONO}" font-size="12" letter-spacing="3" fill="rgba(255,255,255,.5)">AGRI &#183; 热门推演 ${a.no}</text>
    <text x="27" y="134" font-family="${SANS}" font-size="42" font-weight="700" fill="#f4f7f9">${esc(a.title)}</text>
    <text x="25" y="216" font-size="86" font-weight="700" font-family="${MONO}" fill="#ffffff">${esc(a.big || '')}</text>
    <text x="212" y="216" font-family="${MONO}" font-size="19" fill="rgba(255,255,255,.5)">${esc(a.unit || '')}</text>
    <text x="29" y="252" font-family="${MONO}" font-size="15" letter-spacing="2.2" fill="rgba(255,255,255,.6)">${esc(a.sub)}</text>
    <rect x="27" y="264" width="300" height="3" fill="${a.accent}" fill-opacity=".55"/>`
  }
}

const markup = computed(() => {
  const a = props.art
  const draw = STYLES[props.skin] || STYLES.A
  return `<svg viewBox="0 0 640 360" role="img" aria-label="${esc(a.title)} ${esc(a.sub)}"
    xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">${draw(a)}</svg>`
})
</script>

<style scoped>
.cover-art,
.cover-art :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
