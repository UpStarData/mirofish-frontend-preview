// Browser-only walkthrough for the public AgriLink preview. No request reaches a server.
const projectId = 'AGRILINK-DEMO-PROJECT'
const graphId = 'AGRILINK-DEMO-GRAPH'
const simulationId = 'AGRILINK-DEMO-SIM'
const reportId = 'AGRILINK-DEMO-REPORT'

const state = {
  requirement: '假设马来西亚榴莲供应增加，推演红星市场的价格、到货量与份额变化。',
  projectReady: false,
  preparePolls: 0,
  runPolls: 0,
  runStatus: 'idle'
}

const ontology = {
  entity_types: [
    { name: '产区', description: '农产品来源及供应能力', examples: ['马来西亚彭亨'] },
    { name: '农产品', description: '交易中的品类', examples: ['榴莲'] },
    { name: '市场', description: '批发及分销目的地', examples: ['长沙红星市场'] },
    { name: '价格指标', description: '成交价及变化', examples: ['批发价'] }
  ],
  edge_types: [
    { name: '供应流向', description: '产区到市场的货物流转' },
    { name: '价格传导', description: '供需变化影响成交价格' }
  ],
  relation_types: [{ name: '供应流向' }, { name: '价格传导' }]
}

const nodes = [
  { uuid: 'agri-n1', name: '马来西亚彭亨', labels: ['Entity', '产区'], summary: '示例产区' },
  { uuid: 'agri-n2', name: '榴莲', labels: ['Entity', '农产品'], summary: '示例交易品类' },
  { uuid: 'agri-n3', name: '长沙红星市场', labels: ['Entity', '市场'], summary: '示例批发市场' },
  { uuid: 'agri-n4', name: '批发价', labels: ['Entity', '价格指标'], summary: '示例价格指标' }
]
const edges = [
  { uuid: 'agri-e1', source_node_uuid: 'agri-n1', target_node_uuid: 'agri-n2', name: '产区供给', fact: '演示：供应变化可能改变可供量' },
  { uuid: 'agri-e2', source_node_uuid: 'agri-n2', target_node_uuid: 'agri-n3', name: '供应流向', fact: '演示：榴莲进入红星市场' },
  { uuid: 'agri-e3', source_node_uuid: 'agri-n3', target_node_uuid: 'agri-n4', name: '价格传导', fact: '演示：到货量变化可能影响批发价' }
]

const profiles = [
  { agent_id: 0, name: 'market_buyer', username: '市场采购商', profession: '采购商', entity_type: '市场', bio: '关注到货量、库存与进货价。', interested_topics: ['榴莲', '批发价'] },
  { agent_id: 1, name: 'importer', username: '进口商', profession: '进口商', entity_type: '经营主体', bio: '关注产区供给与进口物流。', interested_topics: ['产区', '冷链'] },
  { agent_id: 2, name: 'vendor', username: '批发商', profession: '批发商', entity_type: '市场', bio: '关注销售节奏和竞争采购。', interested_topics: ['库存', '份额'] }
]

const simulationConfig = {
  time_config: {
    total_simulation_hours: 8, minutes_per_round: 12,
    agents_per_hour_min: 2, agents_per_hour_max: 5,
    peak_hours: [8, 9, 10], peak_activity_multiplier: 1.5,
    work_hours: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17], work_activity_multiplier: 1,
    morning_hours: [6, 7, 8], morning_activity_multiplier: 1.2,
    off_peak_hours: [0, 1, 2, 3, 4, 5], off_peak_activity_multiplier: 0.5
  },
  agent_configs: profiles.map(p => ({
    agent_id: p.agent_id, entity_name: p.username, entity_type: p.entity_type,
    stance: 'neutral', active_hours: [7, 8, 9, 10, 11, 12, 14, 15, 16],
    posts_per_hour: 2, comments_per_hour: 3, response_delay_min: 2,
    response_delay_max: 8, activity_level: 0.7, sentiment_bias: 0,
    influence_weight: 0.6
  })),
  twitter_config: { recency_weight: 0.6, popularity_weight: 0.3, relevance_weight: 0.8, viral_threshold: 0.7, echo_chamber_strength: 0.2 },
  reddit_config: { recency_weight: 0.4, popularity_weight: 0.4, relevance_weight: 0.9, viral_threshold: 0.6, echo_chamber_strength: 0.3 },
  event_config: {
    narrative_direction: '演示假设：产区增供与市场竞争采购共同影响红星市场的到货量、价格和份额。',
    hot_topics: ['榴莲增供', '批发价', '冷链到货'],
    initial_posts: [
      { poster_type: '采购商', poster_agent_id: 0, content: '演示：今天到货增加，先观察批发价。' },
      { poster_type: '进口商', poster_agent_id: 1, content: '演示：产区供给增加，运输能力仍是约束。' }
    ]
  },
  generation_reasoning: '围绕供给、流通和价格设置角色|用模拟轮次展示不同主体的观点变化'
}

const outline = {
  title: '农产品交易情景推演（演示）',
  summary: '基于示例事实和假设生成的流程演示，不代表真实市场预测。',
  sections: [
    { title: '输入事实与假设' }, { title: '可能的传导路径' }, { title: '待验证的问题' }
  ]
}
const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[c])
const sectionContent = () => [
  `这是**演示数据**。输入的问题是：“${escapeHtml(state.requirement)}”。图谱固定展示一组榴莲交易样例，用来说明事实与关系如何进入流程。`,
  '示例路径：产区增供可能提高市场到货量；冷链能力、竞争采购和需求变化会影响实际结果。此处仅展示一种可讨论的路径，未进行真实计算。',
  '需要核实实际产量、到货台账、冷链运力、成交价和竞争市场采购强度，再判断价格和份额变化。'
]
const reportLogs = () => [
  { action: 'report_start', timestamp: '2026-09-27T00:00:00Z', details: {} },
  { action: 'planning_complete', timestamp: '2026-09-27T00:00:01Z', details: { outline } },
  ...sectionContent().map((content, index) => ({
    action: 'section_complete', section_index: index + 1,
    timestamp: `2026-09-27T00:00:0${index + 2}Z`, details: { content }
  })),
  { action: 'report_complete', timestamp: '2026-09-27T00:00:06Z', details: {} }
]
const actions = [
  { id: 'a1', platform: 'twitter', agent_id: 0, action_type: 'CREATE_POST', content: '演示：到货增加，采购商观察价格。', timestamp: '2026-09-27T00:00:01Z', round_num: 1 },
  { id: 'a2', platform: 'reddit', agent_id: 1, action_type: 'CREATE_COMMENT', content: '演示：冷链能力可能限制供给释放。', timestamp: '2026-09-27T00:00:02Z', round_num: 2 },
  { id: 'a3', platform: 'twitter', agent_id: 2, action_type: 'CREATE_POST', content: '演示：批发商讨论竞争采购对份额的影响。', timestamp: '2026-09-27T00:00:03Z', round_num: 3 }
]

const project = () => ({
  project_id: projectId, graph_id: graphId, name: 'AgriLink 农产品交易演示',
  simulation_requirement: state.requirement, status: 'graph_completed', ontology
})
const graph = () => ({ graph_id: graphId, nodes, edges, node_count: nodes.length, edge_count: edges.length })
const configState = () => ({
  status: 'completed', config_generated: true, config: simulationConfig,
  summary: { total_agents: profiles.length, simulation_hours: 8, initial_posts_count: 2,
    hot_topics_count: 3, has_twitter_config: true, has_reddit_config: true }
})

function body(config) {
  if (config.data instanceof FormData) return config.data
  if (typeof config.data === 'string') {
    try { return JSON.parse(config.data) } catch { return {} }
  }
  return config.data || {}
}

export async function demoResponse(config) {
  const path = config.url.split('?')[0]
  const input = body(config)
  let data
  if (path === '/api/graph/ontology/generate') {
    state.requirement = String(input.get?.('simulation_requirement') || state.requirement).slice(0, 4000)
    state.projectReady = true
    data = { ...project(), status: 'ontology_generated', graph_id: null }
  } else if (path === '/api/graph/build') {
    data = { reused: true, graph_id: graphId }
  } else if (path.startsWith('/api/graph/project/')) {
    data = project()
  } else if (path.startsWith('/api/graph/data/')) {
    data = graph()
  } else if (path.startsWith('/api/graph/task/')) {
    data = { status: 'completed', progress: 100, message: '演示图谱已构建' }
  } else if (path === '/api/simulation/create') {
    data = { simulation_id: simulationId, project_id: projectId }
  } else if (path === '/api/simulation/prepare') {
    state.preparePolls = 0
    data = { task_id: 'AGRILINK-DEMO-PREPARE', expected_entities_count: profiles.length,
      entity_types: ['市场', '经营主体'] }
  } else if (path === '/api/simulation/prepare/status') {
    state.preparePolls++
    data = { status: 'completed', progress: 100, message: '演示环境准备完成',
      progress_detail: { current_stage: 'generating_config', current_stage_name: '生成模拟配置',
        stage_index: 3, total_stages: 3, current_item: 3, total_items: 3, item_description: '演示配置已就绪' } }
  } else if (path.endsWith('/profiles/realtime') || path.endsWith('/profiles')) {
    data = { profiles, total_expected: profiles.length }
  } else if (path.endsWith('/config/realtime')) {
    data = configState()
  } else if (path.endsWith('/config')) {
    data = simulationConfig
  } else if (path === '/api/simulation/start') {
    state.runPolls = 0
    state.runStatus = 'running'
    data = { runner_status: 'running', total_rounds: 4, process_pid: 'demo' }
  } else if (path.endsWith('/run-status/detail')) {
    data = { all_actions: actions.slice(0, Math.max(1, state.runPolls * 2)) }
  } else if (path.endsWith('/run-status')) {
    state.runPolls++
    const finished = state.runPolls >= 2
    if (finished) state.runStatus = 'completed'
    data = { runner_status: state.runStatus, total_rounds: 4,
      twitter_current_round: finished ? 4 : 2, reddit_current_round: finished ? 4 : 2,
      twitter_actions_count: finished ? 2 : 1, reddit_actions_count: 1,
      twitter_running: !finished, reddit_running: !finished,
      twitter_completed: finished, reddit_completed: finished }
  } else if (path === '/api/simulation/stop' || path === '/api/simulation/close-env') {
    state.runStatus = 'stopped'
    data = { stopped: true }
  } else if (path === '/api/simulation/env-status') {
    data = { env_alive: false }
  } else if (path === '/api/simulation/history') {
    data = state.projectReady ? [{ simulation_id: simulationId, project_id: projectId,
      report_id: reportId, simulation_requirement: state.requirement,
      created_at: '2026-09-27T00:00:00Z', status: state.runStatus }] : []
  } else if (path === '/api/simulation/list') {
    data = [{ simulation_id: simulationId, project_id: projectId, status: state.runStatus }]
  } else if (path === '/api/simulation/interview/batch') {
    const interviews = input.interviews || []
    data = { result: { results: Object.fromEntries(interviews.map(({ agent_id }) => [
      `reddit_${agent_id}`, { response: '演示访谈：采购决策会参考到货台账、库存和批发价；此回答由固定样例生成。' }
    ])) } }
  } else if (path.startsWith('/api/simulation/') && !path.includes('/posts') && !path.includes('/timeline') && !path.includes('/actions') && !path.includes('/agent-stats')) {
    data = { simulation_id: simulationId, project_id: projectId, status: state.runStatus }
  } else if (path === '/api/report/generate') {
    data = { report_id: reportId }
  } else if (path === '/api/report/generate/status') {
    data = { status: 'completed', report_id: reportId }
  } else if (path.endsWith('/agent-log')) {
    const from = Number(config.params?.from_line || 0)
    data = { logs: reportLogs().slice(from), from_line: from }
  } else if (path.endsWith('/console-log')) {
    data = { logs: [], from_line: Number(config.params?.from_line || 0) }
  } else if (path === '/api/report/chat') {
    data = { response: '演示回答：这条推演路径需要核实实际到货、价格和竞争采购数据；当前页面没有运行真实模型。' }
  } else if (path.startsWith('/api/report/')) {
    data = { report_id: reportId, simulation_id: simulationId, status: 'completed', outline }
  } else if (path.endsWith('/posts')) {
    data = { posts: [] }
  } else if (path.endsWith('/timeline')) {
    data = { timeline: [] }
  } else if (path.endsWith('/actions')) {
    data = { actions }
  } else if (path.endsWith('/agent-stats')) {
    data = { total_agents: profiles.length }
  } else {
    throw new Error(`演示数据尚未覆盖：${path}`)
  }
  return { data: { success: true, data }, status: 200, statusText: 'OK', headers: {}, config }
}
