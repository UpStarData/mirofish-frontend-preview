<!--
  内置推演报告：同一份数据、两种风格。
  · 专家风格：直接把报告文档（Markdown）排出来，用于逐段阅读；
  · 数据报表风格：按推演的图谱 / 流程 / 指标 / 风险 / 结论分块排列，用本项目的深色玻璃底色与动效。
  数据来自 src/data/builtin（内置，无需后端）。
-->
<template>
  <section class="bi" v-if="item">
    <header class="bi-head">
      <div class="bi-title">
        <span class="tag">{{ item.tag }}</span>
        <h1>{{ item.title }}</h1>
        <p class="req">{{ item.requirement }}</p>
      </div>
      <div class="bi-meta">
        <span>{{ item.rounds }} 轮</span><span>{{ item.agents }} 主体</span><span>{{ item.generatedAt }}</span>
        <span class="bid">{{ item.id }}</span>
      </div>
      <div class="bi-switch" role="tablist" aria-label="报告风格">
        <button v-for="s in styles" :key="s.key" :class="{ on: style === s.key }" role="tab"
          :aria-selected="style === s.key" @click="style = s.key">{{ s.name }}</button>
      </div>
    </header>

    <p class="bi-summary">{{ item.summary }}</p>

    <!-- ============ 数据报表风格 ============ -->
    <template v-if="style === 'data'">
      <div class="bi-kpis">
        <div v-for="k in item.kpis" :key="k.label" class="kpi" :class="'t-' + k.tone">
          <span class="k-label">{{ k.label }}</span>
          <span class="k-value">{{ k.value }}<i>{{ k.unit }}</i></span>
          <span class="k-delta">{{ k.delta }}</span>
        </div>
      </div>

      <section class="blk">
        <h2>推演图谱 <em>{{ item.graph.nodes.length }} 主体 · {{ item.graph.edges.length }} 关系</em></h2>
        <div class="graph">
          <svg :viewBox="`0 0 ${W} ${H}`" role="img" aria-label="推演关系图谱">
            <g class="edges">
              <path v-for="e in laid.edges" :key="e.id" :d="e.d" :class="{ hot: e.weight >= 4 }" />
            </g>
            <g class="nodes">
              <g v-for="n in laid.nodes" :key="n.id" :transform="`translate(${n.x},${n.y})`">
                <circle :r="n.r" :class="'g-' + n.group" />
                <text class="n-name" y="3">{{ n.short }}</text>
                <text class="n-type" :y="n.r + 14">{{ n.type }}</text>
              </g>
            </g>
            <g class="col-head">
              <text v-for="c in laid.cols" :key="c.key" :x="c.x" y="14">{{ c.label }}</text>
            </g>
          </svg>
        </div>
        <div class="onto">
          <div v-for="t in item.ontology.entity_types" :key="t.name" class="chip">
            <b>{{ t.name }}</b><span>{{ t.description }}</span><em>{{ (t.examples || []).join(' · ') }}</em>
          </div>
        </div>
      </section>

      <section class="blk">
        <h2>推演流程</h2>
        <ol class="steps">
          <li v-for="s in item.process" :key="s.step">
            <span class="no">{{ String(s.step).padStart(2, '0') }}</span>
            <div>
              <div class="st-head"><b>{{ s.phase }}</b><span>{{ s.title }}</span><i class="signal">{{ s.signal }}</i></div>
              <p>{{ s.detail }}</p>
              <p class="finding">→ {{ s.finding }}</p>
            </div>
          </li>
        </ol>
      </section>

      <section class="blk">
        <h2>时间线 <em>峰值窗口与到货节奏</em></h2>
        <div class="tl">
          <div v-for="(t, i) in item.timeline" :key="t.t" class="tl-item" :style="{ '--i': i }">
            <span class="tl-t">{{ t.t }}</span>
            <span class="tl-dot"></span>
            <div><b>{{ t.label }}</b><p>{{ t.detail }}</p></div>
          </div>
        </div>
      </section>

      <section class="blk">
        <h2>关键发现</h2>
        <article v-for="f in item.findings" :key="f.no" class="find">
          <div class="find-head"><span class="no">{{ f.no }}</span><h3>{{ f.heading }}</h3></div>
          <p class="find-lead">{{ f.lead }}</p>
          <ul><li v-for="p in f.points" :key="p">{{ p }}</li></ul>
          <blockquote v-for="q in f.quotes" :key="q.text"><em>{{ q.who }}</em>“{{ q.text }}”</blockquote>
          <p class="find-concl">{{ f.conclusion }}</p>
        </article>
      </section>

      <section class="blk two">
        <div>
          <h2>风险矩阵 <em>影响 × 可能性</em></h2>
          <div class="matrix">
            <span v-for="c in 6" :key="'cx' + c" class="grid-line v" :style="{ left: (c - 1) * 20 + '%' }"></span>
            <span v-for="c in 6" :key="'cy' + c" class="grid-line h" :style="{ top: (c - 1) * 20 + '%' }"></span>
            <span v-for="r in item.risks" :key="r.name" class="dot"
              :style="{ left: (r.likelihood - 1) * 20 + 6 + '%', bottom: (r.impact - 1) * 20 + 6 + '%' }"
              :title="r.name + '：' + r.note"><i>{{ r.impact }}{{ r.likelihood }}</i></span>
          </div>
          <ul class="risk-list">
            <li v-for="r in item.risks" :key="r.name"><b>{{ r.name }}</b><span>{{ r.note }}</span></li>
          </ul>
        </div>
        <div>
          <h2>推演结论</h2>
          <ol class="concl"><li v-for="c in item.conclusion" :key="c">{{ c }}</li></ol>
          <h2 class="mt">口径与来源</h2>
          <div class="chips">
            <span v-for="s in item.sources" :key="s.name" class="src"><b>{{ s.type }}</b>{{ s.name }}<em>{{ s.note }}</em></span>
          </div>
        </div>
      </section>
    </template>

    <!-- ============ 专家风格 ============ -->
    <article v-else class="expert" v-html="docHTML"></article>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({ item: { type: Object, required: true } })

const styles = [
  { key: 'data', name: '数据报表风格' },
  { key: 'expert', name: '专家风格' }
]
const style = ref('data')

/* ---------- 图谱布局：按主体分组分列，列内均分 ---------- */
const W = 940, H = 380
const GROUP_ORDER = [
  { key: 'source', label: '产区' }, { key: 'goods', label: '品种' }, { key: 'rule', label: '口岸/制度' },
  { key: 'market', label: '市场' }, { key: 'actor', label: '角色' }, { key: 'metric', label: '指标' }
]
const laid = computed(() => {
  const nodes = props.item.graph.nodes || []
  const cols = GROUP_ORDER.filter((g) => nodes.some((n) => n.group === g.key))
  const colW = (W - 120) / Math.max(1, cols.length - 1)
  const pos = {}
  const out = []
  cols.forEach((c, ci) => {
    const list = nodes.filter((n) => n.group === c.key)
    const x = 60 + ci * colW
    list.forEach((n, ni) => {
      const y = list.length === 1 ? H / 2 : 60 + ni * ((H - 120) / (list.length - 1))
      const p = { id: n.id, x, y, r: 22, group: n.group, type: n.type, short: n.name.length > 5 ? n.name.replace(/市场$/, '') : n.name }
      pos[n.id] = p
      out.push(p)
    })
  })
  const edges = (props.item.graph.edges || []).map((e) => {
    const a = pos[e.source], b = pos[e.target]
    if (!a || !b) return null
    const dx = Math.max(30, (b.x - a.x) / 2)
    const d = `M${a.x + a.r} ${a.y}C${a.x + a.r + dx} ${a.y} ${b.x - b.r - dx} ${b.y} ${b.x - b.r} ${b.y}`
    /* 反向边（后续→前置）也画得出来，弧向外绕一点 */
    const back = b.x < a.x
    return { id: e.id, d: back ? `M${a.x - a.r} ${a.y}C${a.x - a.r - dx} ${a.y} ${b.x + b.r + dx} ${b.y} ${b.x + b.r} ${b.y}` : d, weight: e.weight }
  }).filter(Boolean)
  return { nodes: out, edges, cols: cols.map((c, i) => ({ key: c.key, label: c.label, x: 60 + i * colW })) }
})

/* ---------- 专家风格：把报告文档排成 HTML（只支持文档实际用到的语法） ---------- */
const docHTML = computed(() => {
  const src = String(props.item.doc || '')
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const inline = (s) => esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/_(.+?)_/g, '<i>$1</i>')
  const out = []
  let list = null, quote = false
  const closeList = () => { if (list) { out.push(`</${list}>`); list = null } }
  const closeQuote = () => { if (quote) { out.push('</blockquote>'); quote = false } }
  for (const raw of src.split('\n')) {
    const line = raw.trim()
    if (!line) continue
    const chap = line.match(/^\*\*(\d{2})\*\*$/)
    if (chap) { closeList(); closeQuote(); out.push(`<div class="chap"><span>${chap[1]}</span></div>`); continue }
    if (/^###\s/.test(line)) { closeList(); closeQuote(); out.push(`<h3>${inline(line.replace(/^###\s*/, ''))}</h3>`); continue }
    if (/^>\s?/.test(line)) { closeList(); quote = true; out.push(`<blockquote>${inline(line.replace(/^>\s?/, ''))}</blockquote>`); continue }
    const om = line.match(/^\d+\.\s+(.*)$/)
    if (om) { closeQuote(); if (list !== 'ol') { closeList(); out.push('<ol>'); list = 'ol' } out.push(`<li>${inline(om[1])}</li>`); continue }
    const um = line.match(/^[-•]\s+(.*)$/)
    if (um) { closeQuote(); if (list !== 'ul') { closeList(); out.push('<ul>'); list = 'ul' } out.push(`<li>${inline(um[1])}</li>`); continue }
    closeList(); closeQuote()
    out.push(/^_.+_$/.test(line) ? `<p class="doc-lead">${inline(line)}</p>` : `<p>${inline(line)}</p>`)
  }
  closeList(); closeQuote()
  return out.join('')
})
</script>

<style scoped>
.bi{--ink:#eef2f5;--dim:#9aa6b0;--accent:#ff6236;--ok:#63c6d8;--line:#252b31;--panel:#141a1f;
  background:#0d1114;color:var(--ink);padding:22px 26px 34px;min-height:100%}
.bi-head{display:flex;flex-wrap:wrap;gap:14px;align-items:flex-end;border-bottom:1px solid var(--line);padding-bottom:14px}
.bi-title{flex:1 1 380px}.bi-title h1{margin:6px 0 6px;font-size:24px;letter-spacing:.5px}
.tag{font:700 11px 'JetBrains Mono',monospace;letter-spacing:.08em;color:#ff8a6a;background:#2a1517;border:1px solid #5a2426;padding:2px 7px}
.req{margin:0;color:var(--dim);font-size:12.5px;line-height:1.7;max-width:62ch}
.bi-meta{display:flex;gap:12px;flex-wrap:wrap;font:600 11px 'JetBrains Mono',monospace;color:var(--dim)}
.bi-meta .bid{color:#5c6b76}
.bi-switch{display:flex;gap:6px}.bi-switch button{font:600 12px inherit;color:var(--dim);background:#151b20;border:1px solid var(--line);padding:7px 13px;cursor:pointer;transition:.18s}
.bi-switch button:hover{color:var(--ink);border-color:#3a444c}
.bi-switch button.on{color:#0d1114;background:var(--accent);border-color:var(--accent)}
.bi-summary{margin:16px 0 18px;font-size:13.5px;line-height:1.85;color:#d8e0e6;max-width:96ch;border-left:3px solid var(--accent);padding-left:13px}
.bi-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin-bottom:22px}
.kpi{background:var(--panel);border:1px solid var(--line);padding:13px 15px;display:flex;flex-direction:column;gap:5px;animation:rise .5s both}
.kpi .k-label{font-size:11.5px;color:var(--dim)}.kpi .k-value{font:700 27px 'JetBrains Mono',monospace}
.kpi .k-value i{font:600 12px 'JetBrains Mono',monospace;color:var(--dim);margin-left:5px;font-style:normal}
.kpi .k-delta{font:600 11px 'JetBrains Mono',monospace;color:var(--dim)}
.kpi.t-risk .k-value{color:#ff5a5a}.kpi.t-up .k-value{color:#ffb020}.kpi.t-down .k-value{color:var(--ok)}.kpi.t-flat .k-value{color:#c8f169}
.blk{margin:26px 0 0}.blk h2{font-size:14px;margin:0 0 12px;letter-spacing:.4px;display:flex;align-items:baseline;gap:9px}
.blk h2 em{font:400 11px 'JetBrains Mono',monospace;color:var(--dim);font-style:normal}
.blk h2.mt{margin-top:20px}
.graph{background:var(--panel);border:1px solid var(--line);padding:6px}
.graph svg{display:block;width:100%;height:auto}
.edges path{fill:none;stroke:#33404a;stroke-width:1.4}
.edges path.hot{stroke:#ff6236aa;stroke-width:2}
.nodes circle{fill:#1b2126;stroke:#4a565f;stroke-width:1.6}
.nodes circle.g-source{fill:#1d2a20;stroke:#d9a33c}.nodes circle.g-goods{fill:#14323f;stroke:#63c6d8}
.nodes circle.g-market{fill:#10241c;stroke:#c8f169}.nodes circle.g-actor{fill:#182a3d;stroke:#7fc9b6}
.nodes circle.g-metric{fill:#2b2118;stroke:#e2903f}.nodes circle.g-rule{fill:#241d1a;stroke:#ff6236}
.nodes .n-name{fill:#eef2f5;font:600 11px 'Noto Sans SC',sans-serif;text-anchor:middle}
.nodes .n-type{fill:#8b98a2;font:500 9px 'JetBrains Mono',monospace;text-anchor:middle}
.col-head text{fill:#6f7a84;font:700 10px 'JetBrains Mono',monospace;letter-spacing:.1em;text-anchor:middle}
.onto{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:9px;margin-top:11px}
.chip{background:#12171b;border:1px solid var(--line);padding:10px 12px}
.chip b{display:block;font-size:12px;margin-bottom:4px}.chip span{display:block;font-size:11.5px;color:var(--dim);line-height:1.6}
.chip em{display:block;margin-top:5px;font:400 10px 'JetBrains Mono',monospace;color:#6f7a84;font-style:normal}
.steps{list-style:none;margin:0;padding:0;display:grid;gap:9px}
.steps li{display:grid;grid-template-columns:34px 1fr;gap:12px;background:var(--panel);border:1px solid var(--line);border-left:2px solid #3a444c;padding:12px 14px}
.steps li:hover{border-left-color:var(--accent)}
.steps .no{font:700 15px 'JetBrains Mono',monospace;color:#ff8a6a}
.st-head{display:flex;gap:10px;align-items:baseline;flex-wrap:wrap;margin-bottom:5px}
.st-head b{font-size:10.5px;letter-spacing:.08em;color:#0d1114;background:#63c6d8;padding:2px 6px}
.st-head span{font-size:13px;font-weight:650}.st-head .signal{margin-left:auto;font:600 10.5px 'JetBrains Mono',monospace;color:#ffb020;font-style:normal}
.steps p{margin:0;font-size:12px;line-height:1.75;color:#b9c3cb}
.steps .finding{margin-top:5px;color:#8fd8c8}
.tl{position:relative;display:grid;gap:0;padding-left:66px}
.tl::before{content:"";position:absolute;left:52px;top:6px;bottom:6px;width:1px;background:var(--line)}
.tl-item{position:relative;padding:9px 0 9px 16px;animation:rise .5s both;animation-delay:calc(var(--i) * .06s)}
.tl-t{position:absolute;left:-66px;top:11px;font:700 11px 'JetBrains Mono',monospace;color:#ff8a6a;width:44px;text-align:right}
.tl-dot{position:absolute;left:-19px;top:14px;width:9px;height:9px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 3px #ff623622}
.tl-item b{font-size:12.5px}.tl-item p{margin:4px 0 0;font-size:11.5px;color:var(--dim);line-height:1.65}
.find{background:var(--panel);border:1px solid var(--line);padding:15px 17px;margin-bottom:11px}
.find-head{display:flex;gap:11px;align-items:baseline}.find .no{font:700 14px 'JetBrains Mono',monospace;color:#ff8a6a}
.find h3{margin:0;font-size:15px;line-height:1.5}
.find-lead{margin:8px 0 0;font-size:12.5px;color:#cfd8de}
.find ul{margin:8px 0 0;padding-left:17px}.find li{font-size:12px;color:#b9c3cb;line-height:1.8}
.find blockquote{margin:9px 0 0;padding:8px 12px;border-left:2px solid #63c6d8;background:#101820;font-size:12px;color:#d8e0e6}
.find blockquote em{color:#63c6d8;font-style:normal;margin-right:6px;font-weight:600}
.find-concl{margin:10px 0 0;font-size:12px;color:#ffb020}
.blk.two{display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:24px}
.matrix{position:relative;aspect-ratio:1.6;background:var(--panel);border:1px solid var(--line)}
.grid-line{position:absolute;background:#1e262c}.grid-line.v{top:0;bottom:0;width:1px}.grid-line.h{left:0;right:0;height:1px}
.matrix .dot{position:absolute;width:26px;height:26px;border-radius:50%;background:#ff6236cc;border:1px solid #ff8a6a;
  display:grid;place-items:center;cursor:help;animation:pop .5s both}
.matrix .dot i{font:700 9px 'JetBrains Mono',monospace;color:#1a0e0a;font-style:normal}
.risk-list{list-style:none;margin:11px 0 0;padding:0;display:grid;gap:7px}
.risk-list li{display:grid;grid-template-columns:130px 1fr;gap:10px;font-size:11.5px;color:#b9c3cb}
.risk-list b{color:#eef2f5}
.concl{margin:0;padding-left:19px}.concl li{font-size:12.5px;line-height:1.85;color:#d8e0e6;margin-bottom:7px}
.chips{display:grid;gap:7px}
.src{display:flex;gap:9px;align-items:baseline;font-size:11.5px;color:#cfd8de;background:var(--panel);border:1px solid var(--line);padding:8px 11px}
.src b{font:700 9.5px 'JetBrains Mono',monospace;color:#0d1114;background:#7fc9b6;padding:2px 5px}
.src em{font:400 10.5px 'JetBrains Mono',monospace;color:#6f7a84;font-style:normal;margin-left:auto}
.expert{max-width:78ch;font-size:13.5px;line-height:1.95;color:#dde4e9}
.expert :deep(h3){font-size:17px;margin:8px 0 14px;line-height:1.5;color:#fff}
.expert :deep(.chap){margin:30px 0 10px;font:700 12px 'JetBrains Mono',monospace;color:#ff8a6a;letter-spacing:.2em}
.expert :deep(.doc-lead){font-style:italic;color:#cfd8de;border-left:3px solid var(--accent);padding-left:13px;margin:14px 0}
.expert :deep(blockquote){margin:12px 0;padding:9px 14px;border-left:2px solid #63c6d8;background:#101820;color:#d8e0e6;font-size:12.5px}
.expert :deep(ul),.expert :deep(ol){padding-left:20px}
.expert :deep(li){margin:5px 0}
@keyframes rise{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@keyframes pop{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:none}}
@media (max-width:820px){.bi{padding:16px 14px 26px}.risk-list li{grid-template-columns:1fr}}
</style>
