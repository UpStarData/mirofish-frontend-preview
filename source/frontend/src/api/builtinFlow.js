// 内置推演在浏览器里跑完整流程：图谱 → 环境 → 双平台推演 → 报告，全部由内置数据驱动，不请求后端。
import { matchRequirement, byAnyId } from '../data/builtin/mirofish'

const state = { active: null, preparePolls: 0, runPolls: 0, reportStyle: 'expert', logPoll: 0, simStarted: false, graphPolls: 0 }

const project = (b) => ({
  project_id: b.project_id, graph_id: b.graph_id, name: b.title,
  simulation_requirement: b.requirement, status: 'graph_completed', ontology: b.ontology
})
const graph = (b) => ({
  graph_id: b.graph_id, nodes: b.nodes, edges: b.edges,
  node_count: b.nodes.length, edge_count: b.edges.length,
  /* 分批：第一批 wave1_count 个（图谱阶段逐步出现），启动双平台后再补 wave2_count 个 */
  wave1_count: b.wave1Count, wave2_count: b.nodeTotal - b.wave1Count
})
const configState = (b) => ({
  status: 'completed', config_generated: true, config: b.simulationConfig,
  summary: {
    total_agents: b.profiles.length, simulation_hours: b.simulationConfig.time_config.total_simulation_hours,
    initial_posts_count: b.simulationConfig.event_config.initial_posts.length,
    hot_topics_count: b.simulationConfig.event_config.hot_topics.length,
    has_twitter_config: true, has_reddit_config: true
  }
})
const reportPayload = (b) => ({
  report_id: b.report_id, simulation_id: b.simulation_id, project_id: b.project_id,
  status: 'completed', outline: b.outline, builtin_id: b.id, report_style: state.reportStyle
})

/* 返回 null 表示"不是内置推演的请求"，交回原来的演示数据分支 */
export function respondWithBuiltin(path, input) {
  const field = (k) => input?.[k] ?? input?.get?.(k)
  if (path === '/api/graph/ontology/generate') {
    const hit = matchRequirement(field('simulation_requirement'))
    if (!hit) { state.active = null; return null }
    state.active = hit
    state.preparePolls = 0; state.runPolls = 0; state.graphPolls = 0; state.logPoll = 0
    const style = String(field('report_style') || '')
    if (/数据|data/i.test(style)) state.reportStyle = 'data'
    else if (/专家|expert/i.test(style)) state.reportStyle = 'expert'
    return { ...project(hit), status: 'ontology_generated', graph_id: null }
  }
  const b = byAnyId(path) || state.active
  if (!b) return null
  state.active = b

  if (path === '/api/graph/build') return { reused: true, graph_id: b.graph_id }
  if (path.startsWith('/api/graph/project/')) {
    const pct = Math.min(100, (state.graphPolls || 0) * 18)
    return { ...project(b), status: pct >= 100 ? 'graph_completed' : (pct === 0 ? 'ontology_generated' : 'graph_building') }
  }
  if (path.startsWith('/api/graph/data/')) return graph(b)
  if (path.startsWith('/api/graph/task/')) {
    /* 分几步走：本体生成 → GraphRAG 构建 → 完成，每步停一会儿，图谱才有"分批长出来"的观感 */
    state.graphPolls = (state.graphPolls || 0) + 1
    const pct = Math.min(100, state.graphPolls * 18)
    const done = pct >= 100
    return { status: done ? 'completed' : 'processing', progress: pct,
      message: done ? '内置图谱已就绪（' + b.nodes.length + ' 主体 / ' + b.edges.length + ' 关系）'
        : (pct < 55 ? '正在生成本体（' + b.wave1Count + ' 个待建）' : 'GraphRAG 构建中：写入实体与关系') }
  }

  if (path === '/api/simulation/create') return { simulation_id: b.simulation_id, project_id: b.project_id }
  if (path === '/api/simulation/prepare') {
    state.preparePolls = 0
    return { task_id: b.id + '-PREPARE', expected_entities_count: b.profiles.length, entity_types: [...new Set(b.profiles.map((p) => p.entity_type))] }
  }
  if (path === '/api/simulation/prepare/status') {
    state.preparePolls++
    const done = state.preparePolls >= 2
    return {
      status: done ? 'completed' : 'processing', progress: done ? 100 : 62,
      message: done ? '环境准备完成：' + b.profiles.length + ' 个主体、双平台配置已生成' : '生成主体档案与推演配置',
      progress_detail: {
        current_stage: done ? 'generating_config' : 'generating_profiles',
        current_stage_name: done ? '生成模拟配置' : '生成主体档案',
        stage_index: done ? 3 : 2, total_stages: 3,
        current_item: Math.min(b.profiles.length, state.preparePolls * 4), total_items: b.profiles.length,
        item_description: done ? '双平台与事件配置已就绪' : '按本体主体生成角色档案'
      }
    }
  }
  if (path.endsWith('/profiles/realtime') || path.endsWith('/profiles')) return { profiles: b.profiles, total_expected: b.profiles.length }
  if (path.endsWith('/config/realtime')) return configState(b)
  if (path.endsWith('/config')) return b.simulationConfig

  if (path === '/api/simulation/start') {
    state.runPolls = 0; state.simStarted = true
    /* 图谱面板听这个事件：启动双平台后再补第二批节点 */
    try { window.dispatchEvent(new CustomEvent('agrilink:sim-start', { detail: { id: b.id } })) } catch (e) {}
    return { runner_status: 'running', total_rounds: b.rounds, process_pid: 'builtin' }
  }
  if (path.endsWith('/run-status/detail')) return { all_actions: b.actions.slice(0, Math.max(2, state.runPolls * 6)) }
  if (path.endsWith('/run-status')) {
    state.runPolls++
    /* 一次一轮：两侧逐轮流动，而不是一次把 96 条全灌进去 */
    const shown = Math.min(b.rounds, Math.max(1, state.runPolls))
    const done = shown >= b.rounds
    const half = Math.floor(shown / 2)
    const count = (p) => b.actions.filter((a) => a.platform === p && a.round_num <= shown).length
    return {
      runner_status: done ? 'completed' : 'running', total_rounds: b.rounds,
      twitter_current_round: shown, reddit_current_round: Math.max(1, half),
      twitter_actions_count: count('twitter'), reddit_actions_count: count('reddit'),
      twitter_running: !done, reddit_running: !done, twitter_completed: done, reddit_completed: done
    }
  }
  if (path === '/api/simulation/stop' || path === '/api/simulation/close-env') return { stopped: true }
  if (path === '/api/simulation/env-status') return { env_alive: false }
  if (path === '/api/simulation/history') return [{
    simulation_id: b.simulation_id, project_id: b.project_id, report_id: b.report_id,
    simulation_requirement: b.requirement, created_at: '2026-10-12T00:00:00Z', status: 'completed'
  }]
  if (path === '/api/simulation/list') return [{ simulation_id: b.simulation_id, project_id: b.project_id, status: 'completed' }]
  if (path === '/api/simulation/interview/batch') {
    const list = input?.interviews || []
    return { result: { results: Object.fromEntries(list.map(({ agent_id }) => {
      const p = b.profiles.find((x) => x.agent_id === agent_id) || b.profiles[0]
      return ['reddit_' + agent_id, { response: p.username + '：' + p.bio + '本轮观察到的关键变化是「' + b.timeline[Math.min(b.timeline.length - 1, 2)].label + '」。' }]
    })) } }
  }
  if (path.endsWith('/posts')) return { posts: b.actions.filter((a) => a.action_type === 'CREATE_POST').map((a) => ({ id: a.id, platform: a.platform, content: a.content, round: a.round_num })) }
  if (path.endsWith('/timeline')) return { timeline: b.timeline || b.actions.map((a) => ({ t: 'R' + a.round_num, label: a.platform, detail: a.content })) }
  if (path.endsWith('/actions')) return { actions: b.actions }
  if (path.endsWith('/agent-stats')) return { total_agents: b.profiles.length, by_platform: { twitter: b.actions.filter((a) => a.platform === 'twitter').length, reddit: b.actions.filter((a) => a.platform === 'reddit').length } }

  if (path === '/api/report/generate') return { report_id: b.report_id }
  if (path === '/api/report/generate/status') return { status: 'completed', report_id: b.report_id }
  if (path.endsWith('/agent-log')) {
    const from = Number(field('from_line') || 0)
    /* 报告是一步一步生成的：第 1 次轮询给"开始 + 大纲"，之后每轮多生成一节，最后收尾 */
    const sections = b.outline.sections.length
    state.logPoll++
    const upto = Math.min(b.reportLogs.length, 2 + Math.max(0, state.logPoll - 1) * 3)
    const logs = b.reportLogs.slice(from, Math.max(from, upto))
    return { logs, from_line: from + logs.length, total_lines: b.reportLogs.length, generating: from + logs.length < b.reportLogs.length }
  }
  if (path.endsWith('/console-log')) return { logs: [], from_line: Number(field('from_line') || 0) }
  if (path === '/api/report/chat') return { response: '这份内置推演的回答基于内置数据：' + b.summary }
  if (path.startsWith('/api/report/')) return reportPayload(b)
  if (path.startsWith('/api/simulation/')) return { simulation_id: b.simulation_id, project_id: b.project_id, status: 'completed' }
  return null
}

export const builtinReportStyle = () => state.reportStyle
