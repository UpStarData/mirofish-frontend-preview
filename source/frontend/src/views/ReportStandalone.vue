<template>
  <div class="standalone">
    <div class="sa-bar">
      <span class="sa-brand">AgriLink · 推演报告</span>
      <span class="sa-title" v-if="item">{{ item.title }}</span>
      <a class="sa-back" :href="backHref">← 回到推演</a>
    </div>
    <DataReport v-if="item" :item="item" :key="item.id" standalone />
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
const backHref = computed(() => location.href.split('#')[0] + '#/report/' + reportId.value)
</script>

<style scoped>
.standalone{height:100vh;display:flex;flex-direction:column;background:#f2f5fb}
.sa-bar{display:flex;align-items:center;gap:14px;padding:10px 20px;background:#fff;border-bottom:1px solid #e3e8f3}
.sa-brand{font:700 11px 'JetBrains Mono',monospace;letter-spacing:.12em;color:#1d4ed8}
.sa-title{font-size:12.5px;color:#0f172a}
.sa-back{margin-left:auto;font-size:12px;color:#1d4ed8;text-decoration:none;border:1px solid #c7d7fb;background:#eaf0fd;padding:5px 11px;border-radius:8px}
.sa-missing{padding:40px;color:#64748b}
.standalone :deep(.rp){flex:1;min-height:0}
</style>
