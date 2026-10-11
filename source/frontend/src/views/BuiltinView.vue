<template>
  <div class="builtin-view">
    <div class="bv-bar">
      <button class="back" @click="router.push('/')">← 返回</button>
      <span class="bv-note">内置推演 · 无需后端 · 两种风格可切换</span>
      <span class="bv-pick">
        <button v-for="b in builtins" :key="b.id" :class="{ on: b.id === id }" @click="go(b.id)">{{ b.topic }}</button>
      </span>
    </div>
    <BuiltinReport v-if="item" :item="item" :key="item.id" />
    <p v-else class="missing">没有找到这份内置推演（{{ id }}）。</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BuiltinReport from '../components/BuiltinReport.vue'
import { builtins, builtinById } from '../data/builtin'

const route = useRoute()
const router = useRouter()
const id = computed(() => String(route.params.id || ''))
const item = computed(() => builtinById(id.value))
const go = (next) => router.push('/builtin/' + next)
</script>

<style scoped>
.builtin-view{min-height:100vh;background:#0d1114}
.bv-bar{display:flex;align-items:center;gap:14px;padding:11px 26px;border-bottom:1px solid #252b31;background:#10161a;position:sticky;top:0;z-index:5}
.bv-bar .back{font:600 12px inherit;color:#eef2f5;background:#1a2126;border:1px solid #2c343b;padding:6px 12px;cursor:pointer}
.bv-bar .back:hover{border-color:#4a565f}
.bv-note{font:600 11px 'JetBrains Mono',monospace;color:#7c8892}
.bv-pick{margin-left:auto;display:flex;gap:6px}
.bv-pick button{font:600 12px inherit;color:#9aa6b0;background:#151b20;border:1px solid #252b31;padding:6px 12px;cursor:pointer}
.bv-pick button.on{color:#0d1114;background:#ff6236;border-color:#ff6236}
.bv-pick button:hover:not(.on){color:#eef2f5;border-color:#3a444c}
.missing{padding:40px 26px;color:#9aa6b0}
</style>
