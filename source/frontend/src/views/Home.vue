<template>
  <div class="launch-page">
    <div class="layout">
      <aside class="history"><h2>历史推演记录</h2><button class="new-run" @click="formData.simulationRequirement = ''; files = []; seedsEnabled = true">＋ 发起新推演</button><HistoryDatabase /></aside>
      <main class="main">
        <div class="composer">
          <div v-if="agriContext?.facts.length" class="seed-row"><span>▣ 事实层带入 {{ agriContext.facts.length }} 条</span><span v-if="agriContext.relation">◇ 关联层带入 1 条</span><button @click="seedsEnabled = !seedsEnabled">{{ seedsEnabled ? '清空' : '恢复' }}</button></div>
          <div v-if="files.length" class="file-chip">▤ {{ files[0].name }} · {{ Math.ceil(files[0].size / 1024) }} KB <button @click="files = []" aria-label="删除附件">×</button></div>
          <textarea v-model="formData.simulationRequirement" @keydown="onPromptKeydown" rows="5" aria-label="推演要求" placeholder="请输入推演要求"></textarea>
          <div class="actions"><div><button @click="triggerFileInput">＋ 添加附件</button><button @click="showConfig = !showConfig" :aria-expanded="showConfig">⚙ 配置项</button><input ref="fileInput" type="file" hidden accept=".pdf,.doc,.docx,.xls,.xlsx,.md,.txt" @change="handleFileSelect" /></div><button class="send" :disabled="!canSubmit || loading" @click="startSimulation" aria-label="发送">发送</button></div>
          <div v-if="showConfig" class="config"><label>历史数据周期<select v-model="historyPeriod"><option>最近 1 个月</option><option>最近 3 个月</option><option>最近 6 个月</option></select></label><label>推演轮次<input type="range" min="10" max="40" v-model.number="rounds" />{{ rounds }} 轮</label><label>环境模式<select v-model="environment"><option>双环境</option><option>单环境</option></select></label><label>报告风格<select><option>专家风格</option></select></label><button type="button" @click="showConfig = false">保存</button></div>
        </div>
        <p class="hint">请至少输入推演要求、保留系统种子或上传附件</p>
      </main>
      <aside class="recommend" aria-label="推荐内容">
        <h2>推荐内容</h2>
        <section class="suggest-group"><h3>热门推演主题</h3>
          <button class="suggest-card" v-for="(item, index) in popularSuggestions" :key="item" @click="useSuggestion(item)">
            <span class="suggest-number">{{ String(index + 1).padStart(2, '0') }}</span>
            <span class="suggest-title">{{ item }}</span><span class="suggest-arrow" aria-hidden="true">↗</span>
          </button>
        </section>
        <section v-if="agriContext?.facts.length" class="suggest-group"><h3>相关推演建议</h3>
          <button class="suggest-card" v-for="(item, index) in relatedSuggestions" :key="item" @click="useSuggestion(item)">
            <span class="suggest-number">{{ String(index + 1).padStart(2, '0') }}</span>
            <span class="suggest-title">{{ item }}</span><span class="suggest-arrow" aria-hidden="true">↗</span>
          </button>
        </section>
      </aside>
    </div>
    <div v-if="pendingSuggestion" class="confirm-backdrop" role="presentation" @click.self="pendingSuggestion = ''">
      <div class="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="replace-title">
        <h2 id="replace-title">是否覆盖当前内容？</h2>
        <div class="confirm-actions"><button @click="pendingSuggestion = ''">取消</button><button class="confirm-primary" @click="confirmSuggestion">确认</button></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import HistoryDatabase from '../components/HistoryDatabase.vue'

const router = useRouter()
const agriContext = ref(null)
const seedsEnabled = ref(true)
const showConfig = ref(false)
const historyPeriod = ref('最近 3 个月')
const rounds = ref(40)
const environment = ref('双环境')
const popularSuggestions = ['榴莲价格波动推演', '车厘子供应链中断推演']
const relatedSuggestions = ['评估促销对价格的影响']
const pendingSuggestion = ref('')

const receiveAgriContext = (event) => {
  if (event.origin !== 'https://upstardata.github.io' && event.origin !== window.location.origin) return
  if (event.source !== window.parent || event.data?.type !== 'agrilink:simulation-context' || event.data.version !== 1) return
  const payload = event.data.context
  if (!payload || !Array.isArray(payload.facts) || typeof payload.requirement !== 'string') return
  const facts = payload.facts.slice(0, 30).filter(f => typeof f.id === 'string' && typeof f.title === 'string')
  const relation = payload.relation && typeof payload.relation.id === 'string' ? payload.relation : null
  agriContext.value = { facts, relation }
  formData.value.simulationRequirement = payload.requirement.slice(0, 4000)
  seedsEnabled.value = true
  const lines = ['AgriLink 推演输入', '', '事实：', ...facts.map(f => `${f.id} | ${f.date || ''} | ${f.region || ''} | ${f.title}`)]
  if (relation) lines.push('', `关系：${relation.id} | ${relation.type || ''} | ${relation.note || ''}`)
  agriContext.value.evidenceText = lines.join('\n')
}
onMounted(() => window.addEventListener('message', receiveAgriContext))
onUnmounted(() => window.removeEventListener('message', receiveAgriContext))

// 表单数据
const formData = ref({
  simulationRequirement: ''
})

// 文件列表
const files = ref([])

// 状态
const loading = ref(false)
const error = ref('')
const isDragOver = ref(false)

// 文件输入引用
const fileInput = ref(null)

const loadSample = () => {
  formData.value.simulationRequirement = '假设马来西亚榴莲供应增加，推演长沙红星市场的到货量、批发价和市场份额如何变化。请区分事实、假设和待验证结论。'
  files.value = []
}

// 计算属性:是否可以提交
const canSubmit = computed(() => {
  return Boolean(formData.value.simulationRequirement.trim() || files.value.length || (seedsEnabled.value && agriContext.value?.facts.length))
})

// 触发文件选择
const triggerFileInput = () => {
  if (!loading.value) {
    fileInput.value?.click()
  }
}

// 处理文件选择
const handleFileSelect = (event) => {
  const selectedFiles = Array.from(event.target.files)
  addFiles(selectedFiles)
}

// 处理拖拽相关
const handleDragOver = (e) => {
  if (!loading.value) {
    isDragOver.value = true
  }
}

const handleDragLeave = (e) => {
  isDragOver.value = false
}

const handleDrop = (e) => {
  isDragOver.value = false
  if (loading.value) return
  
  const droppedFiles = Array.from(e.dataTransfer.files)
  addFiles(droppedFiles)
}

// 添加文件
const addFiles = (newFiles) => {
  const validFiles = newFiles.filter(file => {
    const ext = file.name.split('.').pop().toLowerCase()
    return ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'md', 'txt'].includes(ext)
  })
  files.value = validFiles.slice(0, 1)
}

// 移除文件
const removeFile = (index) => {
  files.value.splice(index, 1)
}

// 滚动到底部
const onPromptKeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); startSimulation() } }
const useSuggestion = (text) => { if (formData.value.simulationRequirement.trim()) pendingSuggestion.value = text; else formData.value.simulationRequirement = text }
const confirmSuggestion = () => { formData.value.simulationRequirement = pendingSuggestion.value; pendingSuggestion.value = '' }

// 开始模拟 - 立即跳转，API调用在Process页面进行
const startSimulation = () => {
  if (!canSubmit.value || loading.value) return
  
  // 存储待上传的数据
  import('../store/pendingUpload.js').then(({ setPendingUpload }) => {
    const seedText = seedsEnabled.value && agriContext.value?.evidenceText || '演示流程：没有带入真实证据；所有生成内容均为模拟数据。'
    const evidence = files.value.length ? files.value : [new File([seedText], '推演输入-演示.txt', { type: 'text/plain' })]
    setPendingUpload(evidence, formData.value.simulationRequirement || '分析所选依据的供需、价格和流通影响。')
    
    // 立即跳转到Process页面（使用特殊标识表示新建项目）
    router.push({
      name: 'Process',
      params: { projectId: 'new' }
    })
  })
}
</script>

<style scoped>
.launch-page{--line:#e5e7eb;--ink:#111827;--muted:#6b7280;--accent:#ff6236;min-height:100vh;background:#fff;color:var(--ink);font-family:'Space Grotesk','Noto Sans SC',system-ui,sans-serif}
.layout{display:grid;grid-template-columns:240px minmax(420px,1fr) 315px;min-height:100vh}
.history,.recommend{padding:28px 18px;background:#fbfbfb}.history{border-right:1px solid var(--line)}.recommend{border-left:1px solid var(--line)}
h2{font-size:14px;font-weight:700;letter-spacing:-.01em}.new-run{width:100%;margin:20px 0;padding:11px 13px;text-align:left;color:#fff;background:#161616;border:1px solid #161616;border-radius:6px;font:600 12px inherit;cursor:pointer;transition:background .2s}.new-run:hover{background:#343434}
.main{width:min(100%,840px);margin:0 auto;padding:clamp(80px,17vh,180px) clamp(28px,5vw,74px) 45px}
.composer{background:#fff;border:1px solid #d1d5db;border-radius:12px;box-shadow:0 13px 42px #1a1a1a10;padding:18px;transition:border-color .2s,box-shadow .2s}.composer:focus-within{border-color:#ff895f;box-shadow:0 13px 44px #ff62361c}
.seed-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px}.seed-row span,.file-chip{font-size:11px;padding:7px 9px;background:#fff2ec;color:#b74c2c;border:1px solid #ffddce;border-radius:5px}.seed-row button,.file-chip button{border:0;background:transparent;color:#a84325;cursor:pointer}
.composer textarea{display:block;width:100%;min-height:140px;padding:10px 0;border:0;outline:0;resize:vertical;background:transparent;font:15px/1.7 'Space Grotesk','Noto Sans SC',system-ui,sans-serif;color:var(--ink)}.composer textarea::placeholder{color:#9ca3af}
.actions{border-top:1px solid var(--line);padding-top:12px;display:flex;justify-content:space-between;gap:10px}.actions div{display:flex;gap:7px;flex-wrap:wrap}.actions button,.confirm-actions button{padding:8px 12px;background:#fff;border:1px solid #d1d5db;border-radius:6px;color:#333;font:600 12px 'Space Grotesk','Noto Sans SC',system-ui,sans-serif;cursor:pointer;transition:border-color .2s,background .2s}.actions button:hover,.confirm-actions button:hover{border-color:#111;background:#fafafa}.actions .send,.confirm-actions .confirm-primary{background:var(--accent);border-color:var(--accent);color:#fff;min-width:65px}.actions .send:hover,.confirm-actions .confirm-primary:hover{background:#df4a20;border-color:#df4a20}.send:disabled{opacity:.4;cursor:not-allowed}
.hint{color:#6b7280;font-size:11px;margin:13px 0 40px}.config{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:15px;padding:17px;border:1px solid var(--line);border-radius:8px;background:#fafafa}.config label{font-size:12px;color:var(--muted);display:grid;gap:7px}.config select,.config input{min-width:0;border:1px solid #d1d5db;background:#fff;border-radius:5px;padding:8px;font:inherit;accent-color:var(--accent)}.config button{justify-self:start}
.suggest-group{margin-top:28px}.suggest-group h3{font-size:11px;font-weight:700;letter-spacing:.07em;color:#6b7280;margin-bottom:10px}.suggest-card{width:100%;display:grid;grid-template-columns:25px minmax(0,1fr) 15px;align-items:start;gap:9px;margin:8px 0;padding:15px 11px;text-align:left;background:#fff;border:1px solid #e5e7eb;border-radius:8px;box-shadow:0 2px 7px #11111108;color:var(--ink);cursor:pointer;transition:transform .18s,border-color .18s,box-shadow .18s}.suggest-card:hover,.suggest-card:focus-visible{transform:translateY(-2px);border-color:#ff9a74;box-shadow:0 9px 23px #ff623621;outline:0}.suggest-number{font:700 11px 'JetBrains Mono',monospace;color:var(--accent);padding-top:3px}.suggest-title{font-size:13px;line-height:1.6;font-weight:600}.suggest-arrow{color:var(--accent);font-size:17px;line-height:1}
.suggest-card{position:relative;min-height:104px;align-items:center;grid-template-columns:30px minmax(0,1fr) 27px;gap:12px;padding:17px 14px 17px 18px;border-color:#e4e6e8;background:linear-gradient(145deg,#fff 55%,#fff9f5);box-shadow:0 7px 22px #1f29370b;overflow:hidden}.suggest-card::before{content:"";position:absolute;left:0;top:13px;bottom:13px;width:3px;border-radius:0 4px 4px 0;background:var(--accent);opacity:.75}.suggest-number{font-size:16px;color:#df5430;align-self:start;padding-top:2px}.suggest-title{font-size:14px;font-weight:650;line-height:1.55}.suggest-arrow{width:26px;height:26px;border:1px solid #ffddcf;border-radius:50%;display:grid;place-items:center;background:#fff6f1;font-size:16px}.suggest-card:hover,.suggest-card:focus-visible{border-color:#fb9775;box-shadow:0 12px 28px #e8623624}.suggest-card:hover .suggest-arrow{background:var(--accent);border-color:var(--accent);color:#fff}
.confirm-backdrop{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;background:#11182780;backdrop-filter:blur(3px)}.confirm-dialog{width:min(360px,calc(100vw - 32px));padding:24px;background:#fff;border:1px solid var(--line);border-radius:10px;box-shadow:0 25px 80px #0004}.confirm-dialog h2{font-size:16px}.confirm-actions{display:flex;justify-content:flex-end;gap:9px;margin-top:25px}
@media(max-width:1080px){.layout{grid-template-columns:210px minmax(0,1fr)}.recommend{grid-column:2;border-left:0;border-top:1px solid var(--line);display:grid;grid-template-columns:1fr 1fr;gap:0 16px}.recommend h2{grid-column:1/-1}.suggest-group{margin-top:16px}}
@media(max-width:700px){.layout{display:block}.history{padding:15px;border-right:0;border-bottom:1px solid var(--line)}.main{padding:65px 20px 35px}.recommend{display:block;border-top:1px solid var(--line)}.config{grid-template-columns:1fr}}
</style>
