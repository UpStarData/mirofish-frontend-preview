// 推演发起页「热门推演主题」的演示条目与封面配色。
// 封面图形按 AgriLink 的蓝绿底色与橙／铜强调色重画，不使用任何外部图片。
export const suggestThemes = [
  {
    title: '榴莲价格波动推演',
    tag: '价格',
    desc: '产地季重叠、到货量变化对批发价与份额的影响',
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
    art: {
      no: '02',
      title: '车厘子',
      sub: 'SUPPLY INTERRUPT',
      from: '#2b2118',
      to: '#14100c',
      accent: '#e2903f',
      motif: `
        <circle cx="382" cy="216" r="40" stroke="#e2903f" stroke-width="6"/>
        <circle cx="452" cy="252" r="40" stroke="#e2903f" stroke-width="6"/>
        <path d="M382 176c-6-34 14-58 44-64M452 212c6-32 26-46 48-54"
          stroke="rgba(255,255,255,.5)" stroke-width="5"/>
        <path d="M508 122h102" stroke="rgba(255,255,255,.34)"
          stroke-width="6" stroke-dasharray="14 12"/>
        <path d="M538 104l30 36M568 104l-30 36" stroke="#ff6236" stroke-width="8"/>`
    }
  },
  {
    title: '泰越产地竞争与到货量推演',
    tag: '到货量',
    desc: '两个产地同期上市后的到货节奏与价格分工',
    art: {
      no: '03',
      title: '产地竞争',
      sub: 'ORIGIN RIVALRY',
      from: '#10323a',
      to: '#08191f',
      accent: '#63c6d8',
      motif: `
        <circle cx="366" cy="112" r="27" stroke="#63c6d8" stroke-width="5"/>
        <circle cx="366" cy="242" r="27" stroke="rgba(255,255,255,.42)" stroke-width="5"/>
        <path d="M394 118c44 14 66 34 80 62M394 236c44-14 66-32 80-58"
          stroke="#63c6d8" stroke-width="5"/>
        <path d="M456 190l18-12 4 22" stroke="#63c6d8" stroke-width="5"/>
        <path d="M456 164l18 12 4-22" stroke="rgba(255,255,255,.42)" stroke-width="5"/>
        <rect x="502" y="152" width="84" height="84" rx="6" stroke="#63c6d8" stroke-width="5"/>
        <path d="M526 194h36" stroke="#63c6d8" stroke-width="7"/>
        <path d="M526 208h22" stroke="rgba(255,255,255,.42)" stroke-width="5"/>`
    }
  },
  {
    title: '冷链损耗与温控风险推演',
    tag: '冷链',
    desc: '断链时长与温控失效对损耗率的影响区间',
    art: {
      no: '04',
      title: '冷链温控',
      sub: 'COLD CHAIN BREACH',
      from: '#182a3d',
      to: '#0b1723',
      accent: '#7fc9b6',
      motif: `
        <path d="M382 104v92M345 127l74 46M419 127l-74 46"
          stroke="#7fc9b6" stroke-width="5"/>
        <circle cx="382" cy="150" r="15" stroke="#7fc9b6" stroke-width="5"/>
        <path d="M470 300l38-58 34 44 44-86" stroke="#7fc9b6" stroke-width="6"/>
        <path d="M586 200l24-46" stroke="rgba(255,255,255,.34)" stroke-width="5" stroke-dasharray="10 9"/>
        <path d="M456 152h164" stroke="#ff6236" stroke-width="4" stroke-dasharray="8 8"/>
        <path d="M478 138l14 14M492 138l-14 14" stroke="#ff6236" stroke-width="5"/>`
    }
  },
  {
    title: '口岸通关时效与价格传导推演',
    tag: '通关',
    desc: '通关时长变化经在途库存影响终端价格的路径',
    art: {
      no: '05',
      title: '口岸通关',
      sub: 'CUSTOMS CLEARANCE',
      from: '#1d2a20',
      to: '#0d150f',
      accent: '#d9a33c',
      motif: `
        <g stroke="#d9a33c" stroke-width="5">
          <rect x="344" y="250" width="72" height="30" rx="3"/>
          <rect x="344" y="214" width="72" height="30" rx="3"/>
          <rect x="344" y="178" width="72" height="30" rx="3"/>
        </g>
        <path d="M432 280V188l40-24 40 24v92" stroke="rgba(255,255,255,.42)" stroke-width="5"/>
        <circle cx="552" cy="132" r="52" stroke="#d9a33c" stroke-width="5"/>
        <path d="M552 100v34l26 16" stroke="#d9a33c" stroke-width="6"/>
        <path d="M524 208h56" stroke="#ff6236" stroke-width="6"/>`
    }
  }
]

export const relatedSuggestions = ['评估促销对价格的影响']
