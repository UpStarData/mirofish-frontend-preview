<!--
  推演主题封面。封面在页面内联生成，不请求外部图片：
  版式与取色参考 Cola Skill（https://colaskill.com/zh/）上公开技能卡的封面样式
  —— 深色底、大字号标题、单一强调色和一个几何图形；图形与配色按本项目重画。
-->
<template>
  <span class="cover-art" v-html="markup" />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  art: { type: Object, required: true }
})

const SANS = "'Space Grotesk','Noto Sans SC','PingFang SC',sans-serif"
const MONO = "'JetBrains Mono','SF Mono',monospace"

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// 网格、角标、渐晕等公共底板
const plate = (art) => `
  <rect width="640" height="360" fill="url(#bg)"/>
  <g stroke="rgba(255,255,255,.055)" stroke-width="1">
    ${Array.from({ length: 19 }, (_, i) => `<path d="M${(i + 1) * 32} 0V360"/>`).join('')}
    ${Array.from({ length: 11 }, (_, i) => `<path d="M0 ${(i + 1) * 32}H640"/>`).join('')}
  </g>
  <circle cx="486" cy="150" r="188" fill="url(#glow)"/>
  <text x="566" y="252" font-size="150" font-weight="700" fill="rgba(255,255,255,.05)"
        font-family="${MONO}" text-anchor="middle">${esc(art.no)}</text>
  <path d="M28 40h7M28 40v7M612 40h-7M612 40v7M28 320h7M28 320v-7M612 320h-7M612 320v-7"
        stroke="rgba(255,255,255,.34)" stroke-width="2" fill="none"/>`

const markup = computed(() => {
  const art = props.art
  return `<svg viewBox="0 0 640 360" role="img" aria-label="${esc(art.title)} ${esc(art.sub)}"
    xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2=".75" y2="1">
        <stop offset="0" stop-color="${art.from}"/><stop offset="1" stop-color="${art.to}"/>
      </linearGradient>
      <radialGradient id="glow">
        <stop offset="0" stop-color="${art.accent}" stop-opacity=".22"/>
        <stop offset="1" stop-color="${art.accent}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    ${plate(art)}
    <g stroke="${art.accent}" fill="none" stroke-linecap="round" stroke-linejoin="round">${art.motif}</g>
    <text x="28" y="86" font-family="${MONO}" font-size="13" letter-spacing="3"
          fill="rgba(255,255,255,.55)">AGRI &#183; 热门推演 ${esc(art.no)}</text>
    <text x="27" y="176" font-family="${SANS}" font-size="66" font-weight="700"
          letter-spacing="2" fill="#f5f8f9">${esc(art.title)}</text>
    <rect x="29" y="196" width="86" height="5" rx="2.5" fill="${art.accent}"/>
    <text x="29" y="232" font-family="${MONO}" font-size="19" letter-spacing="2.6"
          fill="rgba(255,255,255,.62)">${esc(art.sub)}</text>
  </svg>`
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
