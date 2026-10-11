<template>
  <div class="standalone">
    <div class="sa-bar">
      <span class="sa-brand">AgriLink · 推演报告</span>
      <span class="sa-title" v-if="item">{{ item.title }}</span>
      <a class="sa-back" :href="backHref">← 回到推演</a>
    </div>
    <div v-if="item && style === 'expert'" class="expert-doc">
      <article v-for="(s, i) in docSections" :key="i" class="doc-part">
        <div class="doc-no">{{ String(i + 1).padStart(2, '0') }}</div>
        <h2>{{ s.title }}</h2>
        <div v-html="s.html"></div>
      </article>
    </div>
    <DataReport v-else-if="item" :item="item" :key="item.id" standalone />
    <p v-else class="sa-missing">没有找到这份报告（{{ reportId }}）。</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import DataReport from '../components/DataReport.vue'
import { builtinFlows } from '../data/builtin/mirofish'

const route = useRoute()
const reportId = computed(() => String(route.params.reportId || ''))
const item = computed(() => builtinFlows.find((b) => reportId.value.startsWith(b.report_id)) || null)
const style = computed(() => (String(route.query.style || 'data') === 'expert' ? 'expert' : 'data'))
/* 专家风格：直接排报告文档（与数据报表底层同一份内容） */
const docSections = computed(() => {
  const logs = (item.value?.reportLogs || []).filter((l) => l.action === 'section_complete')
  const titles = (item.value?.outline?.sections || []).map((s) => s.title)
  const inline = (x) => String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/_(.+?)_/g, '<i>$1</i>')
  return logs.map((l, i) => ({
    title: titles[i] || ('章节 ' + (i + 1)),
    html: String(l.details?.content || '').split('\n').filter((x) => x.trim()).map((line) => {
      const t = line.trim()
      if (t.startsWith('>')) return '<blockquote>' + inline(t.replace(/^>\s?/, '')) + '</blockquote>'
      return '<p>' + inline(t) + '</p>'
    }).join('')
  }))
})
const backHref = computed(() => location.href.split('#')[0] + '#/report/' + reportId.value)
</script>

<style scoped>
.standalone{height:100vh;display:flex;flex-direction:column;background:#f2f5fb}
.sa-bar{display:flex;align-items:center;gap:14px;padding:10px 20px;background:#fff;border-bottom:1px solid #e3e8f3}
.sa-brand{font:700 11px 'JetBrains Mono',monospace;letter-spacing:.12em;color:#1d4ed8}
.sa-title{font-size:12.5px;color:#0f172a}
.sa-back{margin-left:auto;font-size:12px;color:#1d4ed8;text-decoration:none;border:1px solid #c7d7fb;background:#eaf0fd;padding:5px 11px;border-radius:8px}
.sa-missing{padding:40px;color:#64748b}
.expert-doc{flex:1;min-height:0;overflow:auto;padding:26px 20px 40px}
.doc-part{max-width:78ch;margin:0 auto 26px;background:#fff;border:1px solid #e3e8f3;border-radius:12px;padding:20px 24px}
.doc-no{font:700 11px 'JetBrains Mono',monospace;color:#1d4ed8;letter-spacing:.16em}
.doc-part h2{font-size:17px;margin:6px 0 12px}
.doc-part :deep(p){margin:0 0 10px;font-size:13px;line-height:1.95;color:#26324a}
.doc-part :deep(blockquote){margin:10px 0;padding:9px 13px;border-left:3px solid #1d4ed8;background:#eaf0fd;border-radius:0 10px 10px 0;font-size:12.5px}
.standalone :deep(.rp){flex:1;min-height:0}
</style>
