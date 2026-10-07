<template>
  <div class="launch-page">
    <header class="launch-header"><div class="brand">agrilink <span>/ 推演层</span></div><div class="top-right"><LanguageSwitcher /></div></header>
    <div class="layout">
      <aside class="history"><h2>历史推演记录</h2><button class="new-run" @click="formData.simulationRequirement = ''; files = []; seedsEnabled = true">＋ 发起新推演</button><HistoryDatabase /></aside>
      <main class="main">
        <h1>推演发起页</h1>
        <div class="composer">
          <div v-if="agriContext?.facts.length" class="seed-row"><span>▣ 事实层带入 {{ agriContext.facts.length }} 条</span><span v-if="agriContext.relation">◇ 关联层带入 1 条</span><button @click="seedsEnabled = !seedsEnabled">{{ seedsEnabled ? '清空' : '恢复' }}</button></div>
          <div v-if="files.length" class="file-chip">▤ {{ files[0].name }} · {{ Math.ceil(files[0].size / 1024) }} KB <button @click="files = []" aria-label="删除附件">×</button></div>
          <textarea v-model="formData.simulationRequirement" @keydown="onPromptKeydown" rows="5" aria-label="推演要求" placeholder="请输入推演要求"></textarea>
          <div class="actions"><div><button @click="triggerFileInput">＋ 添加附件</button><button @click="showConfig = !showConfig" :aria-expanded="showConfig">⚙ 配置项</button><input ref="fileInput" type="file" hidden accept=".pdf,.doc,.docx,.xls,.xlsx,.md,.txt" @change="handleFileSelect" /></div><button class="send" :disabled="!canSubmit || loading" @click="startSimulation" aria-label="发送">发送</button></div>
          <div v-if="showConfig" class="config"><label>历史数据周期<select v-model="historyPeriod"><option>最近 1 个月</option><option>最近 3 个月</option><option>最近 6 个月</option></select></label><label>推演轮次<input type="range" min="10" max="40" v-model.number="rounds" />{{ rounds }} 轮</label><label>环境模式<select v-model="environment"><option>双环境</option><option>单环境</option></select></label><label>报告风格<select><option>专家风格</option></select></label><button type="button" @click="showConfig = false">保存</button></div>
        </div>
        <p class="hint">请至少输入推演要求、保留系统种子或上传附件</p>
      </main>
      <aside class="recommend"><h2>推荐内容</h2><p>热门推演主题</p><button v-for="item in suggestions" :key="item" @click="useSuggestion(item)"><span>{{ item }}</span><b>↗</b></button></aside>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import HistoryDatabase from '../components/HistoryDatabase.vue'
import LanguageSwitcher from '../components/LanguageSwitcher.vue'

const router = useRouter()
const agriContext = ref(null)
const seedsEnabled = ref(true)
const showConfig = ref(false)
const historyPeriod = ref('最近 3 个月')
const rounds = ref(40)
const environment = ref('双环境')
const suggestions = ['榴莲价格波动推演', '车厘子供应链中断推演', '评估促销对价格的影响']

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
const useSuggestion = (text) => { if (!formData.value.simulationRequirement.trim() || window.confirm('是否覆盖当前内容？')) formData.value.simulationRequirement = text }

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
.launch-page{--line:#dae2dc;--ink:#25352e;--muted:#728178;min-height:100vh;background:#f4f6f2;color:var(--ink);font-family:'Noto Sans SC',system-ui,sans-serif}.launch-header{height:62px;background:white;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;align-items:center;padding:0 25px}.brand{font-size:21px;font-weight:800;letter-spacing:-.04em}.brand span,.top-right{font-size:12px;font-weight:400;color:var(--muted)}.top-right{display:flex;align-items:center;gap:20px}.layout{display:grid;grid-template-columns:235px minmax(420px,1fr) 250px;min-height:calc(100vh - 62px)}.history,.recommend{background:#fafbf8;padding:30px 18px}.history{border-right:1px solid var(--line)}.recommend{border-left:1px solid var(--line)}h2{display:flex;justify-content:space-between;font-size:15px}small{font:10px 'JetBrains Mono',monospace;color:#93a198}.new-run{width:100%;margin:22px 0;padding:11px 15px;text-align:left;color:white;background:#344e40;border:0;border-radius:6px;cursor:pointer}.main{width:min(100%,830px);margin:0 auto;padding:clamp(65px,11vh,140px) clamp(28px,5vw,75px) 45px}.eyebrow{font:11px 'JetBrains Mono',monospace;color:#63856d;letter-spacing:.12em}h1{font-size:clamp(30px,3vw,43px);letter-spacing:-.05em;margin:24px 0 12px}.subtitle{color:var(--muted);font-size:14px;line-height:1.7;margin-bottom:36px}.composer{background:white;border:1px solid var(--line);border-radius:15px;box-shadow:0 18px 45px #253e2e12;padding:17px}.seed-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px}.seed-row span,.file-chip{font-size:11px;padding:7px;background:#ecf3e9;color:#355841;border-radius:5px}.seed-row button,.file-chip button{border:0;background:transparent;color:#af5835;cursor:pointer}.composer textarea{display:block;width:100%;min-height:120px;padding:10px 0;border:0;outline:0;resize:vertical;background:transparent;font:15px/1.7 'Noto Sans SC',sans-serif;color:var(--ink)}.composer textarea::placeholder{color:#9ca8a1}.actions{border-top:1px solid #edf0eb;padding-top:12px;display:flex;justify-content:space-between}.actions div{display:flex;gap:7px}.actions button{padding:7px 10px;background:white;border:1px solid var(--line);border-radius:6px;color:#47614f;cursor:pointer}.actions .send{background:#344e40;border:0;color:white;min-width:64px;height:36px}.send:disabled{opacity:.35;cursor:not-allowed}.hint{color:#89958d;font-size:11px;margin:13px 0 40px}.config{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px;padding-top:14px;border-top:1px solid var(--line)}.config label{font-size:11px;color:var(--muted);display:grid;gap:5px}.config select,.config input{border:1px solid var(--line);background:white;padding:7px}.config p{grid-column:1/-1;font-size:11px;color:var(--muted)}.examples{display:flex;flex-wrap:wrap;gap:8px}.examples span{flex-basis:100%;font-size:12px;color:var(--muted);margin-bottom:4px}.examples button{background:transparent;border:1px solid var(--line);padding:9px;border-radius:5px;color:#52715e;text-align:left;cursor:pointer}.recommend>p{font-size:11px;color:var(--muted);margin:32px 0 8px}.recommend>button{width:100%;display:grid;grid-template-columns:1fr auto;gap:8px;text-align:left;background:none;border:0;border-bottom:1px solid var(--line);padding:18px 0;cursor:pointer;color:var(--ink)}.recommend>button small{grid-column:1/-1;color:#b65838}.recommend>button span{font-size:13px;line-height:1.5}.recommend>button b{color:#b65838}.note{margin-top:45px;background:#edf2e9;padding:15px;font-size:12px}.note p{color:var(--muted);line-height:1.7;margin-top:8px}@media(max-width:1100px){.layout{grid-template-columns:205px minmax(0,1fr)}.recommend{display:none}}@media(max-width:700px){.layout{display:block}.history{padding:15px;border:0}.main{padding:50px 20px}.recommend{display:block;border:0}.top-right{display:none}.config{grid-template-columns:1fr}}
</style>
