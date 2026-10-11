// 内置推演（MiroFish 流程格式）：图谱 / 环境配置 / 双平台逐轮行为 / 报告。
// 由 agri-llm-demo-visual-v0810/tools/gen-builtin.mjs 生成，字段与 api/demo.js 的端点一致。
import durian from './builtin-durian.json'
import origin from './builtin-origin.json'

export const builtinFlows = [durian, origin]

const norm = (s) => String(s || '').replace(/\s+/g, '')
/* 需求描述 → 内置推演：右侧卡片标题（榴莲价格波动推演 / 泰越产地竞争与到货量推演）直接命中 */
export function matchRequirement(text) {
  const t = norm(text)
  if (!t) return null
  if (/榴莲|durian/i.test(t)) return durian
  if (/产地之争|泰越|产地竞争|价差/i.test(t)) return origin
  for (const b of builtinFlows) if (t.includes(norm(b.title)) || t.includes(norm(b.topic))) return b
  return null
}
export const byProjectId = (path) => builtinFlows.find((b) => path.includes(b.project_id)) || null
export const bySimulationId = (path) => builtinFlows.find((b) => path.includes(b.simulation_id)) || null
export const byReportId = (path) => builtinFlows.find((b) => path.includes(b.report_id)) || null
export const byAnyId = (path) => byProjectId(path) || bySimulationId(path) || byReportId(path)
