// 推演发起页「热门推演主题」的演示条目与封面数据。
// 封面全部在页面内联生成（SVG），不使用任何外部图片。
// 每张卡按主题语义挑一套风格（style 字段）：A 暗色工程 / B 蓝图 / C 纸感台账 / D 地块地图 / E 告警面板。
// 风格规格见工程目录 card-styles/STYLES.md 与 presets.json。
export const suggestThemes = [
  {
    title: '榴莲价格波动推演',
    tag: '价格',
    desc: '产地季重叠、到货量变化对批发价与份额的影响',
    style: 'A',
    art: {
      no: '01',
      title: '榴莲价格',
      sub: 'PRICE VOLATILITY',
      from: '#14323f',
      to: '#0a1d27',
      accent: '#ff6236',
      motif: `
        <g stroke="rgba(255,255,255,.20)" stroke-width="14" stroke-linecap="butt">
          <path d="M368 300V236M412 300V250M456 300V210M500 300V226M544 300V172M588 300V146"/>
        </g>
        <polyline points="348,264 392,240 436,254 480,208 524,190 570,124"
          stroke="#ff6236" stroke-width="6"/>
        <circle cx="570" cy="124" r="11" fill="#ff6236" stroke="none"/>
        <path d="M570 96V58" stroke="rgba(255,255,255,.42)" stroke-width="4" stroke-dasharray="9 9"/>
        <path d="M558 76l12-16 12 16" stroke="#ff6236" stroke-width="5"/>`
    }
  },
  {
    title: '车厘子供应链中断推演',
    tag: '供应链',
    desc: '口岸滞留与运力中断的传导路径和替代方案',
    style: 'B',
    art: {
      no: '02',
      title: '车厘子',
      sub: 'SUPPLY INTERRUPT',
      accent: '#7fd1ff',
      /* 蓝图语言：箱体 + 传输路径 + 断点标注 + 尺寸引线 */
      motif: `
        <g stroke="rgba(255,255,255,.42)" stroke-width="1.5" fill="none">
          <rect x="320" y="196" width="104" height="52"/><path d="M320 222h104M372 196v52"/>
          <rect x="320" y="132" width="104" height="52" stroke-dasharray="8 5"/><path d="M320 158h104"/>
        </g>
        <path d="M436 240h48" stroke="#7fd1ff" stroke-width="3"/>
        <path d="M496 216l28 24-28 24" stroke="rgba(255,255,255,.42)" stroke-width="1.5" fill="none"/>
        <g stroke="#7fd1ff" stroke-width="3" fill="none">
          <path d="M524 240h44"/><circle cx="600" cy="240" r="5"/>
          <circle cx="586" cy="240" r="18" stroke-opacity=".45" stroke-width="1.5"/>
        </g>
        <g stroke="#ff6b5a" stroke-width="4">
          <path d="M528 224l24 32M552 224l-24 32"/>
        </g>
        <g stroke="rgba(255,255,255,.5)" stroke-width="1.5"><path d="M320 296h280" stroke-dasharray="10 6"/>
          <path d="M320 288v16M600 288v16"/></g>
        <text x="352" y="288" font-family="'JetBrains Mono',monospace" font-size="14" fill="rgba(255,255,255,.72)">T + 48 h</text>
        <text x="320" y="120" font-family="'JetBrains Mono',monospace" font-size="13" fill="rgba(255,255,255,.5)">ORIGIN · 装载</text>`
    }
  },
  {
    title: '泰越产地竞争与到货量推演',
    tag: '到货量',
    desc: '两个产地同期上市后的到货节奏与价格分工',
    style: 'D',
    art: {
      no: '03',
      title: '产地竞争',
      sub: 'ORIGIN RIVALRY',
      accent: '#c8f169',
      /* 地块地图语言：两块产区 + 两条路线汇到一个市场节点 */
      parcels: ['M312 232l84-38 88 28-14 72-92 12z', 'M452 104l72 20-8 60-68-14z'],
      routes: ['M330 262c46-42 96-52 132-64', 'M512 156c26 34 22 62 44 84'],
      nodes: [[330, 262], [512, 156], [588, 240]],
      scale: '500 km'
    }
  },
  {
    title: '冷链损耗与温控风险推演',
    tag: '冷链',
    desc: '断链时长与温控失效对损耗率的影响区间',
    style: 'E',
    art: {
      no: '04',
      title: '冷链损耗',
      sub: 'COLD CHAIN BREACH',
      accent: '#ff4d4f',
      big: '4.8',
      unit: '%',
      threshold: '阈值 2.0',
      status: '高危 · 4.8%',
      bars: [262, 278, 238, 252, 206, 216, 140]
    }
  },
  {
    title: '口岸通关时效与价格传导推演',
    tag: '通关',
    desc: '通关时长变化经在途库存影响终端价格的路径',
    style: 'C',
    art: {
      no: '05',
      title: '口岸通关',
      sub: 'CUSTOMS CLEARANCE',
      accent: '#b3261e',
      /* 纸感台账语言：申报到放行的台账 + 重点下划 + 复核章 */
      head: ['口岸', '放行'],
      rows: [['A 港', '18 h'], ['B 港', '34 h'], ['C 港', '52 h']],
      hit: 2,
      stamp: '复核',
      footer: '口径：申报到放行 · 单位 小时 · 复核 2026-10'
    }
  }
]

export const relatedSuggestions = ['评估促销对价格的影响']
