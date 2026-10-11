<!--
  数据报表风格：一页一页的报表（封皮 → 概览 → 流程 → 发现 → 风险与结论 → 来源）。
  参照旧版 V0.0 的"整页 HTML / 像 PDF"的读法：白纸页 + 页眉页脚 + 翻页，可打印。
  数据来自内置推演（src/data/builtin/mirofish），与专家风格同一份来源。
-->
<template>
  <div class="rpt">
    <div class="rpt-bar">
      <span class="rpt-brand">AgriLink · 推演报告</span>
      <span class="rpt-file">{{ item.title }} · {{ item.tag }} · {{ item.generatedAt }}</span>
      <span class="rpt-nav">
        <button @click="go(-1)" :disabled="page === 0">← 上一页</button>
        <b>{{ page + 1 }} / {{ pages.length }}</b>
        <button @click="go(1)" :disabled="page === pages.length - 1">下一页 →</button>
        <button class="to-expert" @click="$emit('switch-style', 'expert')">专家风格</button>
      </span>
    </div>

    <div class="rpt-stage" @keydown="onKey" tabindex="0" ref="stage">
      <!-- 01 封皮 -->
      <section v-if="page === 0" class="sheet cover">
        <div class="cover-top">
          <span class="cover-brand">AGRILINK · SIMULATION REPORT</span>
          <span class="cover-no">NO. {{ item.id.replace('builtin-', '').toUpperCase() }}-{{ item.generatedAt.replace(/-/g, '') }}</span>
        </div>
        <h1>{{ item.title }}</h1>
        <p class="cover-req">{{ item.requirement }}</p>
        <p class="cover-sum">{{ d.summary }}</p>
        <div class="cover-kpis">
          <div v-for="k in d.kpis" :key="k.label"><b>{{ k.value }}<i>{{ k.unit }}</i></b><span>{{ k.label }}</span><em>{{ k.delta }}</em></div>
        </div>
        <div class="cover-foot">
          <span>{{ item.rounds }} 轮 · {{ item.profiles.length }} 主体 · 双平台</span>
          <span>数据口径：{{ d.sources.map((s) => s.name).slice(0, 3).join(' / ') }}…</span>
        </div>
      </section>

      <!-- 02 概览：左图右数 -->
      <section v-else-if="page === 1" class="sheet">
        <header class="ph"><h2>一、总体概览</h2><span>图谱 {{ item.nodes.length }} 主体 / {{ item.edges.length }} 关系</span></header>
        <div class="split">
          <div class="map">
            <svg :viewBox="`0 0 ${W} ${Gh}`" role="img" aria-label="推演图谱">
              <g class="ed"><path v-for="e in laid.edges" :key="e.id" :d="e.d" :class="{ hot: e.weight >= 4 }" /></g>
              <g class="nd">
                <g v-for="n in laid.nodes" :key="n.id" :transform="`translate(${n.x},${n.y})`">
                  <circle :r="n.r" :class="'g-' + n.group" />
                  <text class="nm" y="3">{{ n.short }}</text>
                </g>
              </g>
              <g class="ch"><text v-for="c in laid.cols" :key="c.key" :x="c.x" y="12">{{ c.label }}</text></g>
            </svg>
          </div>
          <div class="side">
            <table class="tbl">
              <tr><th>关键指标</th><th>数值</th><th>变化</th></tr>
              <tr v-for="k in d.kpis" :key="k.label"><td>{{ k.label }}</td><td class="num">{{ k.value }}{{ k.unit }}</td><td>{{ k.delta }}</td></tr>
            </table>
            <h3>本体与关系</h3>
            <ul class="onto">
              <li v-for="t in d.ontology.entity_types" :key="t.name"><b>{{ t.name }}</b>{{ t.description }}</li>
            </ul>
            <h3>结论摘要</h3>
            <ol class="mini"><li v-for="c in d.conclusion" :key="c">{{ c }}</li></ol>
          </div>
        </div>
      </section>

      <!-- 03 推演流程与时间线 -->
      <section v-else-if="page === 2" class="sheet">
        <header class="ph"><h2>二、推演流程</h2><span>{{ d.process.length }} 步 · {{ item.rounds }} 轮</span></header>
        <table class="tbl flow">
          <tr><th style="width:44px">步</th><th style="width:96px">阶段</th><th>动作</th><th>该步结论</th></tr>
          <tr v-for="s in d.process" :key="s.step">
            <td class="num">{{ String(s.step).padStart(2, '0') }}</td>
            <td>{{ s.phase }}</td>
            <td>{{ s.title }}<em>{{ s.detail }}</em></td>
            <td class="ok">{{ s.finding }}</td>
          </tr>
        </table>
        <header class="ph mt"><h2>时间线</h2><span>峰值窗口与节奏</span></header>
        <div class="tl">
          <div v-for="t in d.timeline" :key="t.t" class="tl-i"><span class="tl-t">{{ t.t }}</span><div><b>{{ t.label }}</b><p>{{ t.detail }}</p></div></div>
        </div>
      </section>

      <!-- 04 关键发现 -->
      <section v-else-if="page === 3" class="sheet">
        <header class="ph"><h2>三、关键发现</h2><span>{{ d.findings.length }} 条</span></header>
        <div class="grid2">
          <article v-for="f in d.findings" :key="f.no" class="fd">
            <div class="fd-h"><span>{{ f.no }}</span><h3>{{ f.heading }}</h3></div>
            <p class="fd-l">{{ f.lead }}</p>
            <ul><li v-for="p in f.points" :key="p">{{ p }}</li></ul>
            <blockquote v-for="q in f.quotes" :key="q.text">{{ q.who }}：{{ q.text }}</blockquote>
            <p class="fd-c">{{ f.conclusion }}</p>
          </article>
        </div>
      </section>

      <!-- 05 风险与结论 -->
      <section v-else-if="page === 4" class="sheet">
        <header class="ph"><h2>四、风险与结论</h2><span>影响 × 可能性</span></header>
        <div class="split">
          <div>
            <div class="mx">
              <span v-for="c in 6" :key="'a' + c" class="gl v" :style="{ left: (c - 1) * 20 + '%' }"></span>
              <span v-for="c in 6" :key="'b' + c" class="gl h" :style="{ top: (c - 1) * 20 + '%' }"></span>
              <span v-for="r in d.risks" :key="r.name" class="dot"
                :style="{ left: (r.likelihood - 1) * 20 + 6 + '%', bottom: (r.impact - 1) * 20 + 6 + '%' }">{{ r.impact }}{{ r.likelihood }}</span>
            </div>
            <table class="tbl mt">
              <tr><th>风险</th><th>说明</th></tr>
              <tr v-for="r in d.risks" :key="r.name"><td>{{ r.name }}</td><td>{{ r.note }}</td></tr>
            </table>
          </div>
          <div>
            <h3>推演结论</h3>
            <ol class="concl"><li v-for="c in d.conclusion" :key="c">{{ c }}</li></ol>
          </div>
        </div>
      </section>

      <!-- 06 口径与来源 -->
      <section v-else class="sheet">
        <header class="ph"><h2>五、口径与来源</h2><span>{{ d.sources.length }} 个来源</span></header>
        <table class="tbl">
          <tr><th style="width:110px">类型</th><th style="width:200px">名称</th><th>口径说明</th></tr>
          <tr v-for="s in d.sources" :key="s.name"><td>{{ s.type }}</td><td>{{ s.name }}</td><td>{{ s.note }}</td></tr>
        </table>
        <header class="ph mt"><h2>阅读方式</h2></header>
        <p class="note">本报告为内置推演样例：图谱、环境、双平台逐轮行为与结论均由内置数据生成，未运行真实模型。
          同一份数据另有<b>专家风格</b>版本（逐段论述、含角色原话），可用右上角按钮切换。</p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({ item: { type: Object, required: true } })
defineEmits(['switch-style'])

const d = computed(() => props.item.dataset)
const pages = [0, 1, 2, 3, 4, 5]
const page = ref(0)
const stage = ref(null)
const go = (delta) => {
  page.value = Math.min(pages.length - 1, Math.max(0, page.value + delta))
  stage.value?.scrollTo?.({ top: 0, behavior: 'smooth' })
}
const onKey = (e) => { if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1) }
/* 换另一份推演时回到封皮，别停在上一次的页号 */
watch(() => props.item && props.item.id, () => { page.value = 0 })

/* 图谱：按主体分组分列（与流程本体同一套） */
const W = 560, Gh = 300
const GROUP = [{ key: 'source', label: '产区' }, { key: 'goods', label: '品种' }, { key: 'rule', label: '口岸/制度' }, { key: 'market', label: '市场' }, { key: 'actor', label: '角色' }, { key: 'metric', label: '指标' }]
const laid = computed(() => {
  const nodes = props.item.nodes || []
  const cols = GROUP.filter((g) => nodes.some((n) => (n.labels || [])[1] === g.label))
  const colW = (W - 90) / Math.max(1, cols.length - 1)
  const pos = {}; const out = []
  cols.forEach((c, ci) => {
    const list = nodes.filter((n) => (n.labels || [])[1] === c.label)
    list.forEach((n, ni) => {
      const p = { id: n.uuid, x: 45 + ci * colW, y: list.length === 1 ? Gh / 2 : 46 + ni * ((Gh - 92) / (list.length - 1)), r: 18, group: c.key, short: n.name.length > 4 ? n.name.slice(0, 4) : n.name }
      pos[n.uuid] = p; out.push(p)
    })
  })
  const edges = (props.item.edges || []).map((e) => {
    const a = pos[e.source_node_uuid], b = pos[e.target_node_uuid]
    if (!a || !b) return null
    const dx = Math.max(26, Math.abs(b.x - a.x) / 2)
    return { id: e.uuid, d: b.x < a.x
      ? `M${a.x - a.r} ${a.y}C${a.x - a.r - dx} ${a.y} ${b.x + b.r + dx} ${b.y} ${b.x + b.r} ${b.y}`
      : `M${a.x + a.r} ${a.y}C${a.x + a.r + dx} ${a.y} ${b.x - b.r - dx} ${b.y} ${b.x - b.r} ${b.y}` }
  }).filter(Boolean)
  return { nodes: out, edges, cols: cols.map((c, i) => ({ key: c.key, label: c.label, x: 45 + i * colW })) }
})
</script>

<style scoped>
.rpt{display:flex;flex-direction:column;height:100%;min-height:0;background:#eef0f2}
.rpt-bar{display:flex;align-items:center;gap:12px;padding:8px 14px;background:#16191c;color:#e8edf1;border-bottom:1px solid #2a3137}
.rpt-brand{font:700 11px 'JetBrains Mono',monospace;letter-spacing:.12em;color:#ff8a6a}
.rpt-file{font-size:11.5px;color:#a7b2bb;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rpt-nav{margin-left:auto;display:flex;align-items:center;gap:7px}
.rpt-nav button{font:600 11.5px inherit;color:#e8edf1;background:#232a30;border:1px solid #384149;padding:5px 10px;cursor:pointer}
.rpt-nav button:disabled{opacity:.4;cursor:default}
.rpt-nav b{font:600 11px 'JetBrains Mono',monospace;color:#a7b2bb}
.rpt-nav .to-expert{color:#ff8a6a;border-color:#5a3430}
.rpt-stage{flex:1;min-height:0;overflow:auto;padding:18px;outline:0}
.sheet{background:#fff;color:#15181b;max-width:1000px;margin:0 auto;padding:30px 34px 36px;box-shadow:0 2px 14px #0b0d0f1f;
  border-top:3px solid #ff6236;animation:pg .35s ease both}
@keyframes pg{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.sheet h1{font-size:30px;margin:14px 0 10px;letter-spacing:.5px}
.sheet h2{font-size:15px;margin:0;letter-spacing:.3px}.sheet h3{font-size:12.5px;margin:16px 0 7px;color:#3d464e}
.sheet h2.mt,.mt{margin-top:20px}
.ph{display:flex;align-items:baseline;gap:10px;border-bottom:2px solid #15181b;padding-bottom:7px;margin-bottom:14px}
.ph span{font:600 10.5px 'JetBrains Mono',monospace;color:#7b858d}
.cover{background:#12161a;color:#eef2f5;border-top-color:#ff6236;padding-bottom:34px}
.cover-top{display:flex;justify-content:space-between;font:600 10.5px 'JetBrains Mono',monospace;color:#8d99a3;letter-spacing:.1em}
.cover-no{color:#ff8a6a}
.cover h1{font-size:40px;margin:36px 0 12px;color:#fff}
.cover-req{font-size:12.5px;color:#a7b2bb;margin:0 0 20px;max-width:70ch}
.cover-sum{font-size:13.5px;line-height:1.9;color:#dbe3e9;max-width:76ch;border-left:3px solid #ff6236;padding-left:14px}
.cover-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin:26px 0 24px}
.cover-kpis div{border:1px solid #2a3137;background:#181d22;padding:11px 13px}
.cover-kpis b{display:block;font:700 22px 'JetBrains Mono',monospace;color:#fff}
.cover-kpis b i{font-size:11px;color:#a7b2bb;margin-left:4px;font-style:normal}
.cover-kpis span{display:block;font-size:11px;color:#a7b2bb;margin-top:4px}
.cover-kpis em{display:block;font:600 10.5px 'JetBrains Mono',monospace;color:#ffb020;font-style:normal;margin-top:3px}
.cover-foot{display:flex;justify-content:space-between;gap:12px;font:500 10.5px 'JetBrains Mono',monospace;color:#7b858d;border-top:1px solid #2a3137;padding-top:12px}
.split{display:grid;grid-template-columns:1.05fr .95fr;gap:20px;align-items:start}
.tbl{width:100%;border-collapse:collapse;font-size:11.5px}
.tbl th{text-align:left;font:600 10.5px 'JetBrains Mono',monospace;color:#5d666e;border-bottom:1px solid #cfd5d9;padding:6px 7px}
.tbl td{border-bottom:1px solid #e8ebee;padding:7px;vertical-align:top;line-height:1.7}
.tbl td em{display:block;color:#7b858d;font-style:normal;font-size:11px;margin-top:3px}
.tbl .num{font:600 12px 'JetBrains Mono',monospace}.tbl .ok{color:#166b52}
.flow td:nth-child(3){max-width:320px}
.map{border:1px solid #e1e5e9;background:#fbfcfd;padding:4px}
.map svg{display:block;width:100%;height:auto}
.ed path{fill:none;stroke:#c3cbd2;stroke-width:1.2}.ed path.hot{stroke:#ff6236aa;stroke-width:1.8}
.nd circle{fill:#fff;stroke:#5d666e;stroke-width:1.4}
.nd circle.g-source{stroke:#c98a1f}.nd circle.g-goods{stroke:#2a7f95}.nd circle.g-market{stroke:#4c8b2a}
.nd circle.g-actor{stroke:#3f8f7d}.nd circle.g-metric{stroke:#b5713a}.nd circle.g-rule{stroke:#c2451f}
.nd .nm{fill:#15181b;font:600 9.5px 'Noto Sans SC',sans-serif;text-anchor:middle}
.ch text{fill:#7b858d;font:700 9px 'JetBrains Mono',monospace;letter-spacing:.08em;text-anchor:middle}
.onto{list-style:none;margin:0;padding:0;font-size:11.5px}
.onto li{padding:5px 0;border-bottom:1px dashed #e8ebee;line-height:1.6}
.onto b{display:inline-block;min-width:62px;color:#15181b}
.mini{margin:0;padding-left:17px;font-size:11.5px;line-height:1.8;color:#3d464e}
.tl{display:grid;gap:0;padding-left:58px;position:relative}
.tl::before{content:"";position:absolute;left:44px;top:8px;bottom:8px;width:1px;background:#cfd5d9}
.tl-i{position:relative;padding:8px 0 8px 14px}
.tl-t{position:absolute;left:-58px;top:10px;width:36px;text-align:right;font:700 10.5px 'JetBrains Mono',monospace;color:#c2451f}
.tl-i b{font-size:12px}.tl-i p{margin:3px 0 0;font-size:11px;color:#5d666e;line-height:1.65}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.fd{border:1px solid #e1e5e9;padding:13px 15px}
.fd-h{display:flex;gap:9px;align-items:baseline;border-bottom:1px solid #eef0f2;padding-bottom:6px;margin-bottom:8px}
.fd-h span{font:700 12px 'JetBrains Mono',monospace;color:#c2451f}
.fd-h h3{margin:0;font-size:13px;color:#15181b}
.fd-l{margin:0 0 6px;font-size:11.5px;color:#3d464e}
.fd ul{margin:0;padding-left:16px;font-size:11px;color:#5d666e;line-height:1.8}
.fd blockquote{margin:7px 0 0;padding:6px 10px;border-left:2px solid #2a7f95;background:#f4f8fa;font-size:11px;color:#2f3a42}
.fd-c{margin:8px 0 0;font-size:11px;color:#a35a00}
.mx{position:relative;aspect-ratio:1.9;border:1px solid #e1e5e9;background:#fbfcfd}
.gl{position:absolute;background:#e8ebee}.gl.v{top:0;bottom:0;width:1px}.gl.h{left:0;right:0;height:1px}
.mx .dot{position:absolute;width:22px;height:22px;border-radius:50%;background:#ff6236;color:#fff;display:grid;place-items:center;
  font:700 8.5px 'JetBrains Mono',monospace}
.concl{margin:0;padding-left:18px;font-size:11.5px;line-height:1.9;color:#3d464e}
.note{font-size:12px;line-height:1.9;color:#3d464e;max-width:88ch}
@media (max-width:900px){.split,.grid2{grid-template-columns:1fr}.sheet{padding:22px 18px}.cover h1{font-size:28px}}
@media print{.rpt-bar{display:none}.rpt-stage{overflow:visible;padding:0}.sheet{box-shadow:none;page-break-after:always;max-width:none}}
</style>
