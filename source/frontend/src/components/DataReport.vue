<!--
  数据报表风格：把专家风格的文字变成一页一页的报表。
  配色取自旧版 V0.0（agri-llm-demo 首页）：底 #f4f6fa / 面 #fff / 墨 #10151f / 主色 #1d4ed8 /
  橙 #f97316 / 绿 #16a34a / 紫 #7c3aed / 警示 #b45309，配入场与数字动效，可打印。
  数据与文字同一来源：内置推演（src/data/builtin/mirofish）。
-->
<template>
  <div class="rpt">
    <div class="rpt-bar">
      <span class="rpt-brand">AGRI · 推演报告</span>
      <span class="rpt-file">{{ item.title }} · {{ item.tag }} · {{ item.generatedAt }}</span>
      <span class="rpt-nav">
        <button @click="go(-1)" :disabled="page === 0">← 上一页</button>
        <b>{{ page + 1 }} / {{ pages.length }}</b>
        <button @click="go(1)" :disabled="page === pages.length - 1">下一页 →</button>
        <button class="to-expert" @click="$emit('switch-style', 'expert')">专家风格</button>
      </span>
    </div>

    <div class="rpt-stage" tabindex="0" ref="stage" @keydown="onKey">
      <!-- 封皮 -->
      <section v-if="page === 0" class="sheet cover">
        <div class="cover-band">
          <span>AGRILINK · SIMULATION REPORT</span>
          <span>NO. {{ item.id.replace('builtin-', '').toUpperCase() }}-{{ item.generatedAt.replace(/-/g, '') }}</span>
        </div>
        <h1>{{ item.title }}</h1>
        <p class="cover-req">{{ item.requirement }}</p>
        <p class="cover-sum">{{ d.summary }}</p>
        <div class="kpi-row">
          <div v-for="(k, i) in d.kpis" :key="k.label" class="kpi anim" :style="{ '--i': i }">
            <span class="k-l">{{ k.label }}</span>
            <b class="k-v">{{ k.value }}<i>{{ k.unit }}</i></b>
            <span class="k-d">{{ k.delta }}</span>
            <span class="k-bar" :style="{ '--w': kpiWidth(k) }"></span>
          </div>
        </div>
        <div class="cover-foot">
          <span>{{ item.rounds }} 轮 · {{ item.profiles.length }} 主体 · {{ item.wave1Count }}+{{ item.nodeTotal - item.wave1Count }} 本体</span>
          <span>市场交易环境 × 产业协作环境并行</span>
        </div>
      </section>

      <!-- 概览：左图右数 -->
      <section v-else-if="page === 1" class="sheet">
        <header class="ph"><h2>01 · 总体概览</h2><span>{{ item.nodeTotal }} 本体 / {{ item.edges.length }} 关系</span></header>
        <div class="split">
          <div class="panel map anim" style="--i:0">
            <svg :viewBox="`0 0 ${W} ${Gh}`" role="img" aria-label="推演图谱">
              <g class="ed"><path v-for="e in drawn.edges" :key="e.id" :d="e.d" :class="{ hot: e.hot }" :style="{ '--i': e.i }" /></g>
              <g class="nd"><g v-for="n in drawn.nodes" :key="n.id" :transform="`translate(${n.x},${n.y})`" class="anim" :style="{ '--i': n.i }">
                <circle :r="n.r" :class="'g-' + n.group" /><text class="nm" y="3">{{ n.short }}</text>
              </g></g>
              <g class="ch"><text v-for="c in drawn.cols" :key="c.key" :x="c.x" y="12">{{ c.label }}</text></g>
            </svg>
            <p class="cap">图谱按本体类型分列；波浪线为跨类传导关系，橙色为强关系。</p>
          </div>
          <div class="side">
            <table class="tbl anim" style="--i:1"><tr><th>关键指标</th><th>数值</th><th>变化</th></tr>
              <tr v-for="k in d.kpis" :key="k.label"><td>{{ k.label }}</td><td class="num">{{ k.value }}{{ k.unit }}</td><td>{{ k.delta }}</td></tr>
            </table>
            <h3 class="anim" style="--i:2">本体分布</h3>
            <ul class="onto anim" style="--i:3">
              <li v-for="g in typeCounts" :key="g.type"><b>{{ g.type }}</b><span>{{ g.n }} 个</span><em>{{ g.sample }}</em></li>
            </ul>
            <h3 class="anim" style="--i:4">结论摘要</h3>
            <ol class="mini anim" style="--i:5"><li v-for="c in d.conclusion" :key="c">{{ c }}</li></ol>
          </div>
        </div>
      </section>

      <!-- 推演流程与时间线 -->
      <section v-else-if="page === 2" class="sheet">
        <header class="ph"><h2>02 · 推演流程</h2><span>{{ d.process.length }} 步 · 双环境并行 {{ item.rounds }} 轮</span></header>
        <table class="tbl flow">
          <tr><th style="width:40px">步</th><th style="width:92px">阶段</th><th>动作</th><th>该步结论</th></tr>
          <tr v-for="(s, i) in d.process" :key="s.step" class="anim" :style="{ '--i': i }">
            <td class="num">{{ String(s.step).padStart(2, '0') }}</td><td>{{ s.phase }}</td>
            <td>{{ s.title }}<em>{{ s.detail }}</em></td><td class="ok">{{ s.finding }}</td>
          </tr>
        </table>
        <header class="ph mt"><h2>时间线</h2><span>峰值窗口与节奏</span></header>
        <div class="tl">
          <div v-for="(t, i) in d.timeline" :key="t.t" class="tl-i anim" :style="{ '--i': i }">
            <span class="tl-t">{{ t.t }}</span><div><b>{{ t.label }}</b><p>{{ t.detail }}</p></div>
          </div>
        </div>
        <header class="ph mt"><h2>双环境并行</h2><span>两侧各自推进</span></header>
        <div class="envs">
          <div class="env anim" style="--i:0"><b>市场交易环境</b><span>报价、成交、调运、库存与终端价格</span>
            <em>{{ envCount('twitter') }} 条动作</em></div>
          <div class="env anim" style="--i:1"><b>产业协作环境并行</b><span>共建、共配、标准与信息互通</span>
            <em>{{ envCount('reddit') }} 条动作</em></div>
        </div>
      </section>

      <!-- 专家章节：每节一页（文字 + 支撑数据） -->
      <section v-else-if="page - 3 < narratives.length" class="sheet">
        <header class="ph"><h2>{{ String(page - 2).padStart(2, '0') }} · {{ narratives[page - 3].title }}</h2>
          <span>专家风格正文</span></header>
        <div class="split text">
          <article class="narr" v-html="narratives[page - 3].html"></article>
          <div class="side">
            <component v-for="(blk, bi) in [narratives[page - 3].block]" :key="bi" :is="blocks[blk] || 'div'" />
          </div>
        </div>
      </section>

      <!-- 风险与结论 -->
      <section v-else-if="page === pages.length - 2" class="sheet">
        <header class="ph"><h2>风险与结论</h2><span>影响 × 可能性</span></header>
        <div class="split">
          <div>
            <div class="mx panel">
              <span v-for="c in 6" :key="'a' + c" class="gl v" :style="{ left: (c - 1) * 20 + '%' }"></span>
              <span v-for="c in 6" :key="'b' + c" class="gl h" :style="{ top: (c - 1) * 20 + '%' }"></span>
              <span v-for="(r, i) in d.risks" :key="r.name" class="dot anim" :style="{ '--i': i,
                left: (r.likelihood - 1) * 20 + 6 + '%', bottom: (r.impact - 1) * 20 + 6 + '%' }">{{ r.impact }}{{ r.likelihood }}</span>
            </div>
            <table class="tbl mt"><tr><th>风险</th><th>说明</th></tr>
              <tr v-for="r in d.risks" :key="r.name"><td>{{ r.name }}</td><td>{{ r.note }}</td></tr>
            </table>
          </div>
          <div><h3>推演结论</h3><ol class="concl"><li v-for="c in d.conclusion" :key="c">{{ c }}</li></ol></div>
        </div>
      </section>

      <!-- 口径与来源 -->
      <section v-else class="sheet">
        <header class="ph"><h2>口径与来源</h2><span>{{ d.sources.length }} 个来源</span></header>
        <table class="tbl"><tr><th style="width:100px">类型</th><th style="width:190px">名称</th><th>口径说明</th></tr>
          <tr v-for="s in d.sources" :key="s.name"><td>{{ s.type }}</td><td>{{ s.name }}</td><td>{{ s.note }}</td></tr>
        </table>
        <header class="ph mt"><h2>阅读方式</h2></header>
        <p class="note">本报告为内置推演样例：图谱、环境、双环境并行行为与结论均由内置数据生成，未运行真实模型。
          同一份数据另有<b>专家风格</b>版本（逐段论述、含角色原话），可用右上角按钮切换。</p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'

const props = defineProps({ item: { type: Object, required: true } })
defineEmits(['switch-style'])

const d = computed(() => props.item.dataset)
const page = ref(0)
const stage = ref(null)
const go = (delta) => {
  page.value = Math.min(pages.value.length - 1, Math.max(0, page.value + delta))
  stage.value?.scrollTo?.({ top: 0, behavior: 'smooth' })
}
const onKey = (e) => { if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1) }
watch(() => props.item && props.item.id, () => { page.value = 0 })
onMounted(() => stage.value?.focus?.())

/* 专家文字：取自报告日志里的逐节正文（与专家风格同一份） */
const mdInline = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
  .replace(/_(.+?)_/g, '<i>$1</i>')
const narratives = computed(() => {
  const logs = (props.item.reportLogs || []).filter((l) => l.action === 'section_complete')
  const titles = (props.item.outline?.sections || []).map((s) => s.title)
  return logs.map((l, i) => {
    const raw = String(l.details?.content || '')
    const html = raw.split('\n').filter((x) => x.trim()).map((line) => {
      const t = line.trim()
      if (t.startsWith('>')) return '<blockquote>' + mdInline(t.replace(/^>\s?/, '')) + '</blockquote>'
      if (/^\d+\.\s/.test(t)) return '<p class="li">' + mdInline(t) + '</p>'
      return '<p>' + mdInline(t) + '</p>'
    }).join('')
    return { title: titles[i] || ('章节 ' + (i + 1)), html, block: i }
  })
})
const blocks = {}   /* 每节可挂一个数据块；暂用右侧留白，保持排版简单 */

/* 图表：按本体类型分列，只画前若干列以免过密 */
const W = 560, Gh = 300
const GROUP = [{ key: 'source', label: '产区' }, { key: 'goods', label: '品种' }, { key: 'rule', label: '口岸/制度' }, { key: 'market', label: '市场' }, { key: 'actor', label: '角色' }, { key: 'metric', label: '指标' }]
const drawn = computed(() => {
  const all = props.item.nodes || []
  const perCol = 4
  const cols = GROUP.filter((g) => all.some((n) => (n.labels || [])[1] === g.label))
  const colW = (W - 90) / Math.max(1, cols.length - 1)
  const pos = {}; const out = []
  cols.forEach((c, ci) => {
    const list = all.filter((n) => (n.labels || [])[1] === c.label).slice(0, perCol)
    list.forEach((n, ni) => {
      const p = { id: n.uuid, x: 45 + ci * colW, y: 46 + ni * ((Gh - 92) / Math.max(1, list.length - 1)), r: 17, group: c.key,
        short: n.name.length > 5 ? n.name.slice(0, 5) : n.name, i: ci * perCol + ni }
      pos[n.uuid] = p; out.push(p)
    })
  })
  const edges = (props.item.edges || []).map((e, idx) => {
    const a = pos[e.source_node_uuid], b = pos[e.target_node_uuid]
    if (!a || !b) return null
    const dx = Math.max(24, Math.abs(b.x - a.x) / 2)
    return { id: e.uuid, i: idx % 24, hot: (e.fact || '').length > 14,
      d: b.x < a.x ? `M${a.x - a.r} ${a.y}C${a.x - a.r - dx} ${a.y} ${b.x + b.r + dx} ${b.y} ${b.x + b.r} ${b.y}`
                   : `M${a.x + a.r} ${a.y}C${a.x + a.r + dx} ${a.y} ${b.x - b.r - dx} ${b.y} ${b.x - b.r} ${b.y}` }
  }).filter(Boolean)
  return { nodes: out, edges, cols: cols.map((c, i) => ({ key: c.key, label: c.label, x: 45 + i * colW })) }
})
const typeCounts = computed(() => {
  const m = {}
  ;(props.item.nodes || []).forEach((n) => {
    const t = (n.labels || [])[1] || '其他'
    m[t] = m[t] || { type: t, n: 0, sample: [] }
    m[t].n += 1
    if (m[t].sample.length < 2) m[t].sample.push(n.name)
  })
  return Object.values(m).sort((a, b) => b.n - a.n)
})
const envCount = (platform) => (props.item.actions || []).filter((a) => a.platform === platform).length
const kpiWidth = (k) => (k.tone === 'risk' ? '92%' : k.tone === 'up' ? '74%' : k.tone === 'down' ? '58%' : '46%')

const pages = computed(() => {
  const base = 3            /* 封皮 + 概览 + 流程 */
  const tail = 2            /* 风险与结论 + 口径与来源 */
  return Array.from({ length: base + narratives.value.length + tail })
})
</script>

<style scoped>
.rpt{--bg:#f4f6fa;--panel:#fff;--ink:#10151f;--dim:#64707f;--accent:#1d4ed8;--soft:#eaf0fd;
  --orange:#f97316;--orange-ink:#c2410c;--green:#16a34a;--green-ink:#15803d;--purple:#7c3aed;--warn:#b45309;--line:#e2e6ee;
  display:flex;flex-direction:column;height:100%;min-height:0;background:var(--bg);color:var(--ink)}
.rpt-bar{display:flex;align-items:center;gap:12px;padding:9px 16px;background:var(--panel);border-bottom:1px solid var(--line)}
.rpt-brand{font:700 11px 'JetBrains Mono',monospace;letter-spacing:.12em;color:var(--accent)}
.rpt-file{font-size:11.5px;color:var(--dim);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rpt-nav{margin-left:auto;display:flex;align-items:center;gap:7px}
.rpt-nav button{font:600 11.5px inherit;color:var(--ink);background:var(--panel);border:1px solid var(--line);padding:5px 11px;cursor:pointer;transition:.18s}
.rpt-nav button:hover:not(:disabled){border-color:var(--accent);color:var(--accent);box-shadow:0 2px 8px #1d4ed81a}
.rpt-nav button:disabled{opacity:.4;cursor:default}
.rpt-nav b{font:600 11px 'JetBrains Mono',monospace;color:var(--dim)}
.rpt-nav .to-expert{color:var(--accent);border-color:#c7d7fb;background:var(--soft)}
.rpt-stage{flex:1;min-height:0;overflow:auto;padding:20px;outline:0}
.sheet{background:var(--panel);max-width:1000px;margin:0 auto;padding:30px 34px 36px;border:1px solid var(--line);
  box-shadow:0 6px 22px #10151f0f;border-top:3px solid var(--accent);animation:pg .4s cubic-bezier(.22,1,.36,1) both}
@keyframes pg{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.anim{animation:rise .5s cubic-bezier(.22,1,.36,1) both;animation-delay:calc(var(--i,0) * 70ms)}
@keyframes rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.sheet h1{font-size:32px;margin:16px 0 10px;letter-spacing:.4px}
.sheet h2{font-size:15px;margin:0}.sheet h3{font-size:12.5px;margin:16px 0 7px;color:#39424f}
.mt{margin-top:20px}
.ph{display:flex;align-items:baseline;gap:10px;border-bottom:2px solid var(--ink);padding-bottom:7px;margin-bottom:14px}
.ph span{font:600 10.5px 'JetBrains Mono',monospace;color:var(--dim)}
.cover{padding-top:0}
.cover-band{display:flex;justify-content:space-between;background:var(--accent);color:#fff;margin:0 -34px 0;padding:9px 34px;
  font:700 10.5px 'JetBrains Mono',monospace;letter-spacing:.12em}
.cover-req{font-size:12.5px;color:var(--dim);margin:0 0 18px;max-width:70ch}
.cover-sum{font-size:14px;line-height:1.95;max-width:78ch;border-left:3px solid var(--accent);padding-left:14px;background:var(--soft)}
.kpi-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin:26px 0 22px}
.kpi{border:1px solid var(--line);padding:12px 14px;position:relative;overflow:hidden}
.k-l{display:block;font-size:11.5px;color:var(--dim)}
.k-v{display:block;font:700 24px 'JetBrains Mono',monospace;color:var(--accent);margin-top:5px}
.k-v i{font-size:11px;color:var(--dim);margin-left:4px;font-style:normal}
.k-d{display:block;font:600 10.5px 'JetBrains Mono',monospace;color:var(--orange-ink);margin-top:4px}
.k-bar{position:absolute;left:0;bottom:0;height:3px;background:var(--accent);width:0;animation:barw .9s .25s cubic-bezier(.22,1,.36,1) forwards}
@keyframes barw{to{width:var(--w)}}
.cover-foot{display:flex;justify-content:space-between;gap:12px;font:500 10.5px 'JetBrains Mono',monospace;color:var(--dim);border-top:1px solid var(--line);padding-top:12px}
.split{display:grid;grid-template-columns:1.05fr .95fr;gap:20px;align-items:start}
.split.text{grid-template-columns:1.25fr .75fr}
.panel{border:1px solid var(--line);background:var(--panel)}
.map{padding:4px}
.map svg{display:block;width:100%;height:auto}
.ed path{fill:none;stroke:#c9d3e6;stroke-width:1.1;animation:fadein .6s both;animation-delay:calc(var(--i,0) * 25ms)}
.ed path.hot{stroke:var(--orange);stroke-width:1.6}
@keyframes fadein{from{opacity:0}to{opacity:1}}
.nd circle{fill:var(--panel);stroke:#7d8798;stroke-width:1.4}
.nd circle.g-source{stroke:var(--orange)}.nd circle.g-goods{stroke:var(--accent)}
.nd circle.g-market{stroke:var(--green)}.nd circle.g-actor{stroke:var(--purple)}
.nd circle.g-metric{stroke:var(--warn)}.nd circle.g-rule{stroke:#0f766e}
.nd .nm{fill:var(--ink);font:600 9.5px 'Noto Sans SC',sans-serif;text-anchor:middle}
.ch text{fill:var(--dim);font:700 9px 'JetBrains Mono',monospace;letter-spacing:.08em;text-anchor:middle}
.cap{margin:6px 2px 0;font-size:10.5px;color:var(--dim)}
.tbl{width:100%;border-collapse:collapse;font-size:11.5px}
.tbl th{text-align:left;font:600 10.5px 'JetBrains Mono',monospace;color:var(--dim);border-bottom:1px solid var(--line);padding:6px 7px}
.tbl td{border-bottom:1px solid #eef1f6;padding:7px;vertical-align:top;line-height:1.7}
.tbl td em{display:block;color:var(--dim);font-style:normal;font-size:11px;margin-top:3px}
.tbl .num{font:600 12px 'JetBrains Mono',monospace;color:var(--accent)}.tbl .ok{color:var(--green-ink)}
.flow tr{animation:rise .45s both;animation-delay:calc(var(--i,0) * 60ms)}
.onto{list-style:none;margin:0;padding:0;font-size:11.5px}
.onto li{display:flex;gap:8px;padding:5px 0;border-bottom:1px dashed var(--line)}
.onto b{min-width:58px}.onto span{color:var(--accent);font:600 11px 'JetBrains Mono',monospace}
.onto em{color:var(--dim);font-style:normal;margin-left:auto;font-size:10.5px}
.mini{margin:0;padding-left:17px;font-size:11.5px;line-height:1.85;color:#39424f}
.tl{display:grid;padding-left:58px;position:relative}
.tl::before{content:"";position:absolute;left:44px;top:8px;bottom:8px;width:1px;background:#ccd5e6}
.tl-i{position:relative;padding:8px 0 8px 14px}
.tl-t{position:absolute;left:-58px;top:10px;width:36px;text-align:right;font:700 10.5px 'JetBrains Mono',monospace;color:var(--accent)}
.tl-i b{font-size:12px}.tl-i p{margin:3px 0 0;font-size:11px;color:var(--dim);line-height:1.65}
.envs{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.env{border:1px solid var(--line);border-left:3px solid var(--accent);padding:11px 13px;background:var(--soft)}
.env:last-child{border-left-color:var(--purple);background:#f5f1fe}
.env b{display:block;font-size:12.5px}.env span{display:block;font-size:11px;color:var(--dim);margin-top:4px}
.env em{display:block;margin-top:6px;font:600 10.5px 'JetBrains Mono',monospace;color:var(--accent);font-style:normal}
.narr{font-size:12.5px;line-height:2;color:#20293a}
.narr :deep(p){margin:0 0 11px}
.narr :deep(p.li){padding-left:14px}
.narr :deep(blockquote){margin:10px 0;padding:9px 13px;border-left:2px solid var(--accent);background:var(--soft);font-size:12px;color:#2b3446}
.narr :deep(b){color:var(--ink)}
.mx{position:relative;aspect-ratio:1.9}
.gl{position:absolute;background:#eef1f6}.gl.v{top:0;bottom:0;width:1px}.gl.h{left:0;right:0;height:1px}
.mx .dot{position:absolute;width:22px;height:22px;border-radius:50%;background:var(--orange-ink);color:#fff;display:grid;place-items:center;
  font:700 8.5px 'JetBrains Mono',monospace;box-shadow:0 0 0 3px #f9731622}
.concl{margin:0;padding-left:18px;font-size:11.5px;line-height:1.95;color:#39424f}
.note{font-size:12px;line-height:1.95;color:#39424f;max-width:88ch}
@media (max-width:900px){.split,.split.text,.kpi-row,.envs{grid-template-columns:1fr}.sheet{padding:22px 18px}.cover-band{margin:0 -18px;padding:9px 18px}}
@media print{.rpt-bar{display:none}.rpt-stage{overflow:visible;padding:0}.sheet{box-shadow:none;page-break-after:always;max-width:none;border-top:0}}
</style>
