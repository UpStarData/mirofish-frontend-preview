<!--
  数据报表风格：参照旧版 V0.0（agri-llm-demo 首页）的观感——
  浅蓝白底、蓝色主色 #1d4ed8、橙色强调、白色数据卡；
  第 1 页封皮（落地页式）→ 第 2 页左地球右数据 → 之后逐页数据报表与专家正文。
  翻页：整屏滚动（scroll-snap）+ 右侧细点指示，没有顶栏按钮。
-->
<template>
  <div class="rp" ref="root">
    <a v-if="!standalone" class="open-tab" :href="standaloneHref" target="_blank" rel="noopener" title="在浏览器打开这份报告">在浏览器打开 ↗</a>
    <nav class="dots" aria-label="页面导航">
      <button v-for="(p, i) in pageDefs" :key="i" :class="{ on: i === page }" :title="p.name" @click="goto(i)"></button>
    </nav>

    <div class="pages" ref="scroller" @scroll.passive="onScroll">
      <!-- 01 封皮 -->
      <section class="page cover">
        <header class="cv-top">
          <span class="cv-logo">🌾</span>
          <div><b>农链 AgriLink</b><em>推演报告 · {{ item.tag }}</em></div>
          <span class="cv-chip">AGRILINK</span>
        </header>
        <h1>{{ hero }}</h1>
        <p class="cv-sub">{{ item.requirement }}</p>
        <ol class="cv-list">
          <li v-for="(f, i) in d.findings" :key="f.no"><span>{{ String(i + 1).padStart(2, '0') }}</span><b>{{ f.heading }}</b><em>{{ f.lead }}</em></li>
        </ol>
        <div class="cv-actions">
          <button class="cv-go" @click="goto(1)">进入报告 →</button>
          <span class="cv-note">{{ item.rounds }} 轮 · {{ item.profiles.length }} 主体 · 双环境并行 · {{ item.nodeTotal }} 本体</span>
        </div>
        <footer class="cv-foot">
          <p><b>数据口径</b>{{ d.summary }}</p>
          <p><b>独立性声明</b>本报告为内置推演样例，数值用于确认展示形态与信息结构，不代表真实市场预测。</p>
        </footer>
      </section>

      <!-- 02 左地球 · 右数据 -->
      <section class="page globe-page">
        <div class="gl-wrap">
          <div class="gl-card chip-row"><span class="chip">L1 全球</span><em>来源国产区 · 流向与量级</em></div>
          <div class="globe">
            <svg viewBox="0 0 520 520" role="img" aria-label="全球货源流向示意">
              <defs>
                <radialGradient id="sphere" cx="38%" cy="30%"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#dbe7fb"/></radialGradient>
                <linearGradient id="arcHot" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f97316"/><stop offset="1" stop-color="#fb923c"/></linearGradient>
              </defs>
              <circle cx="260" cy="260" r="238" fill="url(#sphere)" stroke="#c9d9fb" stroke-width="2"/>
              <g class="spin" stroke="#b9cdf5" fill="none" stroke-width="1" clip-path="circle(238px at 260px 260px)">
                <ellipse cx="260" cy="260" rx="238" ry="238"/>
                <ellipse cx="260" cy="260" rx="178" ry="238"/><ellipse cx="260" cy="260" rx="115" ry="238"/><ellipse cx="260" cy="260" rx="52" ry="238"/>
                <ellipse cx="260" cy="260" rx="238" ry="52"/><ellipse cx="260" cy="260" rx="238" ry="115"/><ellipse cx="260" cy="260" rx="238" ry="178"/>
              </g>
              <g class="arcs" fill="none" stroke-linecap="round">
                <path d="M120 170C210 60 380 90 420 200" stroke="url(#arcHot)" stroke-width="3" class="draw" style="--d:0"/>
                <path d="M96 250C200 210 330 300 430 250" stroke="#93c5fd" stroke-width="2.5" class="draw" style="--d:.6s"/>
                <path d="M150 380C220 300 360 320 400 370" stroke="url(#arcHot)" stroke-width="3" class="draw" style="--d:1.2s"/>
              </g>
              <g class="pins">
                <circle cx="120" cy="170" r="6" fill="#f97316"/><circle cx="420" cy="200" r="6" fill="#f97316"/>
                <circle cx="150" cy="380" r="6" fill="#fdba74"/><circle cx="400" cy="370" r="6" fill="#fdba74"/>
                <circle cx="262" cy="130" r="9" fill="#1d4ed8"/><text x="276" y="134" class="pin-label">中国</text>
              </g>
            </svg>
          </div>
          <div class="gl-legend">
            <span><i style="background:#f97316"></i>主产区 → 中国</span>
            <span><i style="background:#93c5fd"></i>替代路径</span>
            <span><i style="background:#1d4ed8"></i>目的市场</span>
          </div>
        </div>
        <aside class="gl-side">
          <div class="chip-row"><span class="chip">L1 全球</span><em>全局概览</em><span class="tag-warn">示例数据</span></div>
          <h2>{{ item.title }}</h2>
          <h3>量级</h3>
          <div class="metric-grid">
            <div v-for="k in d.kpis" :key="k.label"><span>{{ k.label }}</span><b>{{ k.value }}<i>{{ k.unit }}</i></b><em>{{ k.delta }}</em></div>
          </div>
          <p class="口径">周期：{{ item.generatedAt }} ｜ 口径：内置推演样例，按品类与环节归并 ｜ 来源：{{ d.sources.map(s => s.name).slice(0, 3).join(' / ') }}</p>
          <div class="hint">点击地球上的弧线与节点可对应右侧明细；本页数据为内置推演结果，用于确认展示形态。</div>
          <h3>同层对象</h3>
          <ul class="peer">
            <li v-for="n in peerNodes" :key="n.uuid"><span>{{ n.name }}</span><em>{{ (n.labels || [])[1] }}</em></li>
          </ul>
        </aside>
      </section>

      <!-- 03 概览（图谱 + 指标 + 本体分布） -->
      <section class="page">
        <header class="ph"><span class="chip">L2 图谱</span><h2>推演图谱总览</h2><em>{{ item.nodeTotal }} 本体 · {{ item.edges.length }} 关系</em></header>
        <div class="cols">
          <div class="card map">
            <svg :viewBox="`0 0 ${W} ${Gh}`" role="img" aria-label="推演图谱">
              <g class="ed"><path v-for="e in drawn.edges" :key="e.id" :d="e.d" :class="{ hot: e.hot }"/></g>
              <g class="nd"><g v-for="n in drawn.nodes" :key="n.id" :transform="`translate(${n.x},${n.y})`">
                <circle :r="n.r" :class="'g-' + n.group"/><text class="nm" y="3">{{ n.short }}</text></g></g>
              <g class="ch"><text v-for="c in drawn.cols" :key="c.key" :x="c.x" y="12">{{ c.label }}</text></g>
            </svg>
            <p class="cap">图谱按本体类型分列；橙色为跨类强关系。第一批 {{ item.wave1Count }} 个在构建阶段生成，启动双环境并行后再补 {{ item.nodeTotal - item.wave1Count }} 个。</p>
          </div>
          <div class="card tbl-card">
            <table class="tbl"><tr><th>关键指标</th><th>数值</th><th>变化</th></tr>
              <tr v-for="k in d.kpis" :key="k.label"><td>{{ k.label }}</td><td class="num">{{ k.value }}{{ k.unit }}</td><td>{{ k.delta }}</td></tr>
            </table>
            <h3>本体分布</h3>
            <ul class="onto"><li v-for="g in typeCounts" :key="g.type"><b>{{ g.type }}</b><span>{{ g.n }} 个</span><em>{{ g.sample.join('、') }}</em></li></ul>
          </div>
        </div>
      </section>

      <!-- 04 推演流程与时间线 -->
      <section class="page">
        <header class="ph"><span class="chip">L3 流程</span><h2>推演流程与时间线</h2><em>{{ d.process.length }} 步 · {{ item.rounds }} 轮</em></header>
        <div class="cols">
          <div class="card">
            <table class="tbl flow"><tr><th style="width:38px">步</th><th style="width:88px">阶段</th><th>动作</th><th>该步结论</th></tr>
              <tr v-for="s in d.process" :key="s.step"><td class="num">{{ String(s.step).padStart(2, '0') }}</td><td>{{ s.phase }}</td>
                <td>{{ s.title }}<em>{{ s.detail }}</em></td><td class="ok">{{ s.finding }}</td></tr>
            </table>
          </div>
          <div class="card">
            <h3>时间线</h3>
            <div class="tl"><div v-for="t in d.timeline" :key="t.t" class="tl-i"><span>{{ t.t }}</span><div><b>{{ t.label }}</b><p>{{ t.detail }}</p></div></div></div>
            <h3>双环境并行</h3>
            <div class="envs">
              <div><b>市场交易环境</b><span>报价、成交、调运、库存与终端价格</span><em>{{ envCount('twitter') }} 条动作</em></div>
              <div><b>产业协作环境并行</b><span>共建、共配、标准与信息互通</span><em>{{ envCount('reddit') }} 条动作</em></div>
            </div>
          </div>
        </div>
      </section>

      <!-- 05+ 专家正文逐节（左文右数据） -->
      <section v-for="(s, si) in narratives" :key="'n' + si" class="page">
        <header class="ph"><span class="chip">{{ String(si + 1).padStart(2, '0') }} 发现</span><h2>{{ s.title }}</h2><em>专家风格正文</em></header>
        <div class="cols text">
          <div class="card narr" v-html="s.html"></div>
          <div class="card side-data">
            <h3>{{ s.title }}</h3>
            <ul class="bullet"><li v-for="p in (d.findings[si] ? d.findings[si].points : [])" :key="p">{{ p }}</li></ul>
            <blockquote v-if="d.findings[si]">{{ d.findings[si].conclusion }}</blockquote>
          </div>
        </div>
      </section>

      <!-- 风险与结论 -->
      <section class="page">
        <header class="ph"><span class="chip">风险</span><h2>风险矩阵与结论</h2><em>影响 × 可能性</em></header>
        <div class="cols">
          <div class="card">
            <div class="mx">
              <span v-for="c in 6" :key="'a' + c" class="gl v" :style="{ left: (c - 1) * 20 + '%' }"></span>
              <span v-for="c in 6" :key="'b' + c" class="gl h" :style="{ top: (c - 1) * 20 + '%' }"></span>
              <span v-for="(r, i) in d.risks" :key="r.name" class="dot" :style="{ '--i': i, left: (r.likelihood - 1) * 20 + 6 + '%', bottom: (r.impact - 1) * 20 + 6 + '%' }">{{ r.impact }}{{ r.likelihood }}</span>
            </div>
            <table class="tbl mt"><tr><th>风险</th><th>说明</th></tr><tr v-for="r in d.risks" :key="r.name"><td>{{ r.name }}</td><td>{{ r.note }}</td></tr></table>
          </div>
          <div class="card"><h3>推演结论</h3><ol class="concl"><li v-for="c in d.conclusion" :key="c">{{ c }}</li></ol>
            <h3>口径与来源</h3>
            <ul class="onto"><li v-for="s in d.sources" :key="s.name"><b>{{ s.type }}</b><span>{{ s.name }}</span><em>{{ s.note }}</em></li></ul>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

const props = defineProps({ item: { type: Object, required: true }, standalone: { type: Boolean, default: false } })
/* 独立链接：报告在浏览器新标签里整页打开 */
const standaloneHref = computed(() => location.href.split('#')[0] + '#/report-standalone/' + props.item.report_id + '?style=data')
const d = computed(() => props.item.dataset)
const page = ref(0)
const root = ref(null)
const scroller = ref(null)

const hero = computed(() => (/产地/.test(props.item.topic) ? '看懂泰越产地的竞争与分工' : '看懂一颗榴莲的价格旅程'))

/* 页面定义（用于右侧指示点） */
const narratives = computed(() => {
  const logs = (props.item.reportLogs || []).filter((l) => l.action === 'section_complete')
  const titles = (props.item.outline?.sections || []).map((s) => s.title)
  return logs.map((l, i) => ({ title: titles[i] || ('章节 ' + (i + 1)), html: renderMd(String(l.details?.content || '')) }))
})
const pageDefs = computed(() => [
  { name: '封皮' }, { name: '全球概览' }, { name: '图谱总览' }, { name: '推演流程' },
  ...narratives.value.map((s, i) => ({ name: '发现 ' + (i + 1) + '：' + s.title })),
  { name: '风险与结论' }
])
const goto = (i) => {
  const el = scroller.value
  if (!el) return
  el.scrollTo({ top: i * el.clientHeight, behavior: 'smooth' })
}
const onScroll = () => {
  const el = scroller.value
  if (!el) return
  page.value = Math.max(0, Math.min(pageDefs.value.length - 1, Math.round(el.scrollTop / el.clientHeight)))
}
onMounted(() => onScroll())

/* 正文：把专家文档的一节排成 HTML */
function renderMd(src) {
  const inline = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/_(.+?)_/g, '<i>$1</i>')
  return src.split('\n').filter((x) => x.trim()).map((line) => {
    const t = line.trim()
    if (t.startsWith('>')) return '<blockquote>' + inline(t.replace(/^>\s?/, '')) + '</blockquote>'
    if (/^\d+\.\s/.test(t)) return '<p class="li">' + inline(t) + '</p>'
    if (/^[-•]\s/.test(t)) return '<p class="li">· ' + inline(t.replace(/^[-•]\s*/, '')) + '</p>'
    return '<p>' + inline(t) + '</p>'
  }).join('')
}

/* 图谱：按本体类型分列，每列取前 4 个，避免过密 */
const W = 620, Gh = 330
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
      const p = { id: n.uuid, x: 45 + ci * colW, y: 52 + ni * ((Gh - 104) / Math.max(1, list.length - 1)), r: 17, group: c.key,
        short: n.name.length > 5 ? n.name.slice(0, 5) : n.name }
      pos[n.uuid] = p; out.push(p)
    })
  })
  const edges = (props.item.edges || []).map((e) => {
    const a = pos[e.source_node_uuid], b = pos[e.target_node_uuid]
    if (!a || !b) return null
    const dx = Math.max(24, Math.abs(b.x - a.x) / 2)
    return { id: e.uuid, hot: (e.fact || '').length > 14,
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
const peerNodes = computed(() => (props.item.nodes || []).filter((n) => n.wave === 1).slice(0, 6))
const envCount = (platform) => (props.item.actions || []).filter((a) => a.platform === platform).length
</script>

<style scoped>
.rp{--bg:#f2f5fb;--panel:#fff;--ink:#0f172a;--dim:#64748b;--accent:#1d4ed8;--soft:#eaf0fd;--line:#e3e8f3;
  --orange:#f97316;--green:#16a34a;--purple:#7c3aed;--warn:#b45309;
  position:relative;height:100%;background:linear-gradient(180deg,#f7f9ff 0%,#eef3fd 100%);color:var(--ink)}
.pages{height:100%;overflow-y:scroll;scroll-snap-type:y mandatory;scroll-behavior:smooth}
.page{min-height:100%;scroll-snap-align:start;padding:34px clamp(18px,4vw,54px) 40px;display:flex;flex-direction:column;gap:16px;max-width:1240px;margin:0 auto}
.open-tab{position:absolute;top:12px;right:14px;z-index:10;font:600 11px 'JetBrains Mono',monospace;color:#1d4ed8;background:#fff;
  border:1px solid #c7d7fb;border-radius:8px;padding:6px 11px;text-decoration:none;box-shadow:0 4px 14px #1d4ed81a;transition:.18s}
.open-tab:hover{background:#eaf0fd;transform:translateY(-1px)}
.dots{position:absolute;right:14px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:10px;z-index:9}
.dots button{width:8px;height:8px;padding:0;border-radius:50%;border:1px solid #a9b8d6;background:#fff;cursor:pointer;transition:.2s}
.dots button.on{background:var(--accent);border-color:var(--accent);transform:scale(1.35);box-shadow:0 0 0 3px #1d4ed81a}
h1{font-size:clamp(34px,5.2vw,60px);line-height:1.14;color:var(--accent);margin:10px 0 4px;letter-spacing:.5px}
.chip{display:inline-block;padding:3px 9px;border-radius:999px;background:var(--soft);color:var(--accent);font:700 10.5px 'JetBrains Mono',monospace;letter-spacing:.06em}
.chip-row{display:flex;align-items:center;gap:9px}
.chip-row em{font-style:normal;font-size:11.5px;color:var(--dim)}
.tag-warn{margin-left:auto;padding:2px 8px;border-radius:999px;background:#fef3c7;color:var(--warn);font:600 10.5px 'JetBrains Mono',monospace}
.card{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:16px 18px;box-shadow:0 6px 20px #0f172a0a}
/* 封皮 */
.cover{justify-content:flex-start;gap:18px}
.cv-top{display:flex;align-items:center;gap:10px;margin-bottom:6px}
.cv-top b{display:block;font-size:14px}.cv-top em{display:block;font-style:normal;font-size:11.5px;color:var(--dim)}
.cv-logo{width:30px;height:30px;border-radius:9px;background:linear-gradient(135deg,#1d4ed8,#3b82f6);display:grid;place-items:center;font-size:15px}
.cv-chip{margin-left:auto;padding:3px 10px;border-radius:999px;background:var(--soft);color:var(--accent);font:700 10px 'JetBrains Mono',monospace;letter-spacing:.1em}
.cv-sub{font-size:15px;color:#334155;margin:0;max-width:76ch}
.cv-list{list-style:none;margin:8px 0 0;padding:0;max-width:900px;border-top:1px solid var(--line)}
.cv-list li{display:grid;grid-template-columns:38px 260px 1fr;gap:12px;padding:11px 0;border-bottom:1px solid var(--line);align-items:baseline;animation:rise .5s both;animation-delay:calc(var(--i,0) * 60ms)}
.cv-list span{font:700 12px 'JetBrains Mono',monospace;color:var(--accent)}
.cv-list b{font-size:13.5px}.cv-list em{font-style:normal;font-size:12px;color:var(--dim)}
.cv-actions{display:flex;align-items:center;gap:14px;margin-top:8px}
.cv-go{padding:12px 26px;border:0;border-radius:10px;background:var(--accent);color:#fff;font:700 14px inherit;cursor:pointer;
  box-shadow:0 8px 20px #1d4ed82e;transition:.2s}
.cv-go:hover{transform:translateY(-2px);box-shadow:0 12px 26px #1d4ed83d}
.cv-note{font-size:12px;color:var(--dim)}
.cv-foot{border-top:1px solid var(--line);padding-top:12px;margin-top:auto}
.cv-foot p{margin:6px 0 0;font-size:11.5px;color:var(--dim);line-height:1.85}
.cv-foot b{margin-right:9px;color:var(--ink)}
/* 地球页 */
.globe-page{display:grid;grid-template-columns:minmax(380px,1.05fr) minmax(320px,.95fr);gap:22px;align-items:center;align-content:center}
.gl-wrap{display:flex;flex-direction:column;gap:12px}
.gl-card{background:var(--panel);border:1px solid var(--line);border-radius:999px;padding:7px 14px;width:fit-content;box-shadow:0 4px 14px #0f172a0a}
.globe{background:radial-gradient(circle at 40% 32%,#ffffff, #e8f0fe 70%, #dfeafc);border-radius:50%;aspect-ratio:1;max-width:520px;width:100%;margin:0 auto;
  box-shadow:0 24px 60px #1d4ed81f, inset 0 0 60px #cfe0fb77}
.globe svg{display:block;width:100%;height:auto}
.spin{transform-origin:260px 260px;animation:gspin 44s linear infinite}
@keyframes gspin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
.arcs .draw{stroke-dasharray:520;stroke-dashoffset:520;animation:dash 2.6s ease forwards;animation-delay:var(--d,0)}
@keyframes dash{to{stroke-dashoffset:0}}
.pin-label{fill:var(--accent);font:700 11px 'Noto Sans SC',sans-serif}
.gl-legend{display:flex;gap:14px;flex-wrap:wrap;font-size:11px;color:var(--dim)}
.gl-legend i{display:inline-block;width:16px;height:3px;border-radius:2px;margin-right:6px;vertical-align:middle}
.gl-side{display:flex;flex-direction:column;gap:11px}
.gl-side h2{margin:0;font-size:22px}
.gl-side h3{margin:6px 0 2px;font-size:12px;color:var(--ink)}
.metric-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}
.metric-grid div{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:11px 12px}
.metric-grid span{display:block;font-size:11px;color:var(--dim)}
.metric-grid b{display:block;margin-top:4px;font:700 20px 'JetBrains Mono',monospace;color:var(--accent)}
.metric-grid b i{font-size:10.5px;font-style:normal;color:var(--dim);margin-left:3px}
.metric-grid em{display:block;margin-top:3px;font:600 10px 'JetBrains Mono',monospace;color:var(--orange);font-style:normal}
.口径{font-size:11px;color:var(--dim);line-height:1.8;margin:2px 0 0}
.hint{background:#f1f5fd;border:1px solid #dbe6fb;border-radius:10px;padding:11px 13px;font-size:11.5px;color:#334155;line-height:1.8}
.peer{list-style:none;margin:0;padding:0}
.peer li{display:flex;justify-content:space-between;gap:10px;padding:8px 0;border-bottom:1px dashed var(--line);font-size:12px}
.peer em{font-style:normal;color:var(--dim);font-size:11px}
/* 数据页 */
.ph{display:flex;align-items:center;gap:10px}
.ph h2{margin:0;font-size:19px}
.ph em{font-style:normal;font-size:11.5px;color:var(--dim);margin-left:auto}
.cols{display:grid;grid-template-columns:1.15fr .85fr;gap:16px;align-items:start}
.cols.text{grid-template-columns:1.3fr .7fr}
.map svg{display:block;width:100%;height:auto}
.ed path{fill:none;stroke:#c9d6ef;stroke-width:1.1}.ed path.hot{stroke:var(--orange);stroke-width:1.6}
.nd circle{fill:#fff;stroke:#7f8ea8;stroke-width:1.5}
.nd circle.g-source{stroke:var(--orange)}.nd circle.g-goods{stroke:var(--accent)}.nd circle.g-market{stroke:var(--green)}
.nd circle.g-actor{stroke:var(--purple)}.nd circle.g-metric{stroke:var(--warn)}.nd circle.g-rule{stroke:#0f766e}
.nd .nm{fill:var(--ink);font:600 10px 'Noto Sans SC',sans-serif;text-anchor:middle}
.ch text{fill:var(--dim);font:700 9px 'JetBrains Mono',monospace;letter-spacing:.06em;text-anchor:middle}
.cap{margin:8px 2px 0;font-size:11px;color:var(--dim);line-height:1.7}
.tbl{width:100%;border-collapse:collapse;font-size:12px}
.tbl th{text-align:left;font:600 10.5px 'JetBrains Mono',monospace;color:var(--dim);border-bottom:1px solid var(--line);padding:6px 7px}
.tbl td{border-bottom:1px solid #eff2f8;padding:8px 7px;vertical-align:top;line-height:1.7}
.tbl td em{display:block;color:var(--dim);font-style:normal;font-size:11px;margin-top:3px}
.tbl .num{font:600 12.5px 'JetBrains Mono',monospace;color:var(--accent)}.tbl .ok{color:#15803d}
.mt{margin-top:12px}
.onto{list-style:none;margin:0;padding:0}
.onto li{display:flex;gap:9px;align-items:baseline;padding:6px 0;border-bottom:1px dashed var(--line);font-size:11.5px}
.onto b{min-width:56px}.onto span{color:var(--accent);font:600 11px 'JetBrains Mono',monospace}
.onto em{margin-left:auto;font-style:normal;color:var(--dim);font-size:10.5px;text-align:right}
.tl{position:relative;padding-left:54px}
.tl::before{content:"";position:absolute;left:42px;top:6px;bottom:6px;width:1px;background:#ccd7ef}
.tl-i{position:relative;padding:7px 0 7px 12px}
.tl-i>span{position:absolute;left:-54px;top:9px;width:34px;text-align:right;font:700 10.5px 'JetBrains Mono',monospace;color:var(--accent)}
.tl-i b{font-size:12.5px}.tl-i p{margin:3px 0 0;font-size:11px;color:var(--dim);line-height:1.65}
.envs{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:6px}
.envs div{border:1px solid var(--line);border-left:3px solid var(--accent);border-radius:10px;padding:10px 12px;background:var(--soft)}
.envs div:last-child{border-left-color:var(--purple);background:#f6f2fe}
.envs b{display:block;font-size:12px}.envs span{display:block;font-size:11px;color:var(--dim);margin-top:3px;line-height:1.6}
.envs em{display:block;margin-top:5px;font:600 10.5px 'JetBrains Mono',monospace;color:var(--accent);font-style:normal}
.narr{font-size:12.5px;line-height:2;color:#26324a}
.narr :deep(p){margin:0 0 11px}.narr :deep(p.li){padding-left:12px}
.narr :deep(blockquote){margin:10px 0;padding:10px 13px;border-left:3px solid var(--accent);background:var(--soft);border-radius:0 10px 10px 0;font-size:12px}
.side-data h3{margin:0 0 8px;font-size:13px}
.bullet{margin:0;padding-left:17px;font-size:11.5px;line-height:1.95;color:#334155}
.side-data blockquote{margin:12px 0 0;padding:9px 12px;background:#fff7ed;border-left:3px solid var(--orange);border-radius:0 10px 10px 0;font-size:11.5px;color:#7c2d12}
.mx{position:relative;aspect-ratio:2}
.gl{position:absolute;background:#eff2f8}.gl.v{top:0;bottom:0;width:1px}.gl.h{left:0;right:0;height:1px}
.mx .dot{position:absolute;width:22px;height:22px;border-radius:50%;background:var(--orange);color:#fff;display:grid;place-items:center;
  font:700 8.5px 'JetBrains Mono',monospace;box-shadow:0 0 0 4px #f9731622;animation:pop .5s both;animation-delay:calc(var(--i,0) * 70ms)}
@keyframes pop{from{opacity:0;transform:scale(.5)}to{opacity:1;transform:none}}
@keyframes rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.concl{margin:0;padding-left:18px;font-size:12px;line-height:1.95;color:#334155}
@media (max-width:1080px){.globe-page,.cols,.cols.text{grid-template-columns:1fr}.globe{max-width:min(78vw,420px)}.dots{right:7px}
  .cv-list li{grid-template-columns:32px 1fr;gap:8px}.cv-list em{grid-column:2}}
@media print{.dots{display:none}.pages{overflow:visible;height:auto;scroll-snap-type:none}.page{page-break-after:always;min-height:auto}}
</style>
