// 内置推演：两份完整样例（数据 + 专家风格文档），不需要后端即可在预览环境里走完整报告。
// 数据字段见 card-styles 之外的报告契约：kpis / ontology / graph / process / timeline / findings / risks / conclusion / sources
import durian from './durian.json'
import origin from './origin.json'
import durianDoc from './durian.expert.md?raw'
import originDoc from './origin.expert.md?raw'

export const builtins = [
  { ...durian, doc: durianDoc },
  { ...origin, doc: originDoc }
]

export const builtinById = (id) => builtins.find((b) => b.id === id) || null
