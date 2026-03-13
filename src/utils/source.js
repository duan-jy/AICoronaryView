// 工具列表
export const toolsList = [
  {
    name: 'Pan',
    toolName: 'PanTool',
    icon: 'icon-yidonggongju',
    options: {
      mouseButtonMask: 1
    },
    btnMask: '1',
    desc: '移动'
  },
  {
    name: 'ArrowAnnotate',
    toolName: 'ArrowAnnotateTool',
    icon: 'icon-jiantou',
    options: {
      mouseButtonMask: 1
    },
    configuration: {
      drawHandles: false,
      drawHandlesOnHover: false,
      hideHandlesIfMoving: false,
      renderDashed: false
    },
    btnMask: '1',
    desc: '箭头'
  },
  {
    name: 'Length',
    toolName: 'LengthTool',
    icon: 'icon-map-ruler',
    options: {
      mouseButtonMask: 1
    },
    configuration: {
      drawHandles: false,
      drawHandlesOnHover: false,
      hideHandlesIfMoving: false,
      renderDashed: false
    },
    // configuration: {
    // drawHandles: false,
    // drawHandlesOnHover: false,
    // hideHandlesIfMoving: false,
    // renderDashed: false
    // color: 'rgb(0, 255, 0)'
    // },
    desc: '长度'
  },
  {
    name: 'Angle',
    toolName: 'AngleTool',
    icon: 'icon-jiaodu',
    options: {
      mouseButtonMask: 1
    },
    configuration: {
      drawHandles: false,
      drawHandlesOnHover: false,
      hideHandlesIfMoving: false,
      renderDashed: false
    },
    desc: '角度'
  },
  {
    name: 'RectangleRoi',
    toolName: 'RectangleRoiTool',
    icon: 'icon-quyuceliang',
    options: {
      mouseButtonMask: 1
    },
    configuration: {
      drawHandles: false,
      drawHandlesOnHover: false,
      hideHandlesIfMoving: false,
      renderDashed: false
    },
    desc: '区域'
  }
  // {
  //   name: 'FreehandRoi',
  //   toolName: 'FreehandRoiTool',
  //   icon: 'icon-renyizhixian-01',
  //   options: {
  //     mouseButtonMask: 1
  //   },
  //   configuration: {
  //     drawHandles: false,
  //     drawHandlesOnHover: false,
  //     hideHandlesIfMoving: false,
  //     renderDashed: false
  //   },
  //   desc: '自由曲线'
  // }
]

// 血管命名
export const arteryName = {
  LM: '左主干（LM）',
  RI: '中间支（RI）',
  LAD: '左前降支（LAD）',
  pLAD: '近段（pLAD）',
  mLAD: '中段（mLAD）',
  dLAD: '远段（dLAD）',
  D1: '第一对角支（D1）',
  D2: '第二对角支（D2）',
  D3: '第三对角支（D3）',
  D4: '第四对角支（D4）',
  D5: '第五对角支（D5）',
  LCX: '左回旋支（LCX）',
  pLCX: '近段（pLCX）',
  dLCX: '中远段（dLCX）',
  OM1: '第一钝缘支（OM1）',
  OM2: '第二钝缘支（OM2）',
  OM3: '第三钝缘支（OM3）',
  OM4: '第四钝缘支（OM4）',
  OM5: '第五钝缘支（OM5）',
  'L-PDA': '左后降支（L-PDA）',
  'L-PLB': '左室左后支（L-PLB）',
  RCA: '右冠状动脉（RCA）',
  RCB: '右圆锥支（RCB）',
  RV: '右室前支（RV）',
  pRCA: '近段（pRCA）',
  mRCA: '中段（mRCA）',
  dRCA: '远段（dRCA）',
  'R-PDA': '右后降支（R-PDA）',
  'R-PLB': '左室后支（R-PLB）',
  AM1: '第一锐缘支（AM1）',
  AM2: '第二锐缘支（AM2）',
  AM3: '第三锐缘支（AM3）'
}

// 分段信息
export const arterySectionName = {
  pLAD: '近段',
  mLAD: '中段',
  dLAD: '远段',
  pLCX: '近段',
  dLCX: '中远段',
  pRCA: '近段',
  mRCA: '中段',
  dRCA: '远段'
}

export const arteryNameKeys = [
  'LM',
  'LAD',
  'pLAD',
  'mLAD',
  'dLAD',
  'D1',
  'D2',
  'D3',
  'D4',
  'D5',
  'L-PDA',
  'L-PLB',
  'LCX',
  'pLCX',
  'dLCX',
  'OM1',
  'OM2',
  'OM3',
  'OM4',
  'OM5',
  'RI',
  'RCA',
  'pRCA',
  'mRCA',
  'dRCA',
  'RCB',
  'RV',
  'R-PDA',
  'R-PLB',
  'AM1',
  'AM2',
  'AM3'
]

// 标注工具列表
export const makeToolsTypes = [
  'Angle',
  'ArrowAnnotate',
  'Bidirectional',
  'Length',
  'FreehandMouse',
  'EllipticalRoi',
  'CircleRoi',
  'RectangleRoi',
  'FreehandRoi'
]

export const percentage = {
  '-1': '0%',
  0: '1%-24%',
  1: '25%-49%',
  2: '50%-69%',
  3: '70%-99%',
  4: '100%'
}
export const straitnessTypes = {
  '-1': 0,
  0: 13,
  1: 37,
  2: 60,
  3: 85,
  4: 100
}

export const originTypes = {
  1: '左窦',
  2: '右窦'
}

export const dominantTypes = {
  1: '左优势型',
  2: '右优势型',
  3: '均势型'
}

// 狭窄程度
export const narrowObj = {
  '-1': '未见狭窄',
  0: '轻微狭窄',
  1: '轻度狭窄',
  2: '中度狭窄',
  3: '重度狭窄',
  4: '闭塞'
}
// 斑块类型
export const plaqueObj = {
  1: '钙化',
  2: '非钙化',
  3: '混合'
  // 4: '支架',
  // 5: '心肌桥'
}

export const plaqueVObj = {
  1: '钙化',
  2: '非钙化',
  3: '混合',
  4: '支架',
  5: '心肌桥'
}

// 狭窄的list
export const narrowOptions = [
  {
    label: '未见狭窄',
    value: -1
  },
  {
    label: '轻微狭窄',
    value: 0
  },
  {
    label: '轻度狭窄',
    value: 1
  },
  {
    label: '中度狭窄',
    value: 2
  },
  {
    label: '重度狭窄',
    value: 3
  },
  {
    label: '闭塞',
    value: 4
  }
]

// 斑块
export const plaqueOptions = [
  { label: '钙化斑块', value: 1, alias: 'Calcification' },
  { label: '非钙化斑块', value: 2, alias: 'NonCalcification' },
  { label: '混合斑块', value: 3, alias: 'Mixed' }
]

// 心肌桥 支架
export const varyOptions = [
  { label: '心肌桥', value: 1, alias: 'bridge' },
  { label: '支架', value: 2, alias: 'stent' }
  // { label: '心肌桥厚度', value: 3, alias: 'bridge_thickness' },
  // { label: '壁动脉长度', value: 4, alias: 'artery_length' },
  // { label: '支架长度', value: 5, alias: 'stent_length' }
]

export const originKeyText = {
  dominant_type: {
    beginText: '冠状动脉呈',
    data: dominantTypes,
    sort: 1
  },
  origin_left: {
    beginText: '左主干起源于:',
    data: originTypes,
    sort: 2
  },
  origin_right: {
    beginText: '右冠状动脉起源于:',
    data: originTypes,
    sort: 3
  }
}

export const PROJECT_KEY = 'ARTERY_KEY'

// 提示key
export const tableLayout = {
  '3_3': {
    rows: 3,
    cols: 3,
    cellLen: 9
  },
  '3_4': {
    rows: 3,
    cols: 4,
    cellLen: 12
  },
  '3_5': {
    rows: 3,
    cols: 5,
    cellLen: 15
  },
  '4_4': {
    rows: 4,
    cols: 4,
    cellLen: 16
  },
  '4_5': {
    rows: 4,
    cols: 5,
    cellLen: 20
  },
  '4_6': {
    rows: 4,
    cols: 6,
    cellLen: 24
  },
  '5_5': {
    rows: 5,
    cols: 5,
    cellLen: 25
  },
  '5_6': {
    rows: 5,
    cols: 6,
    cellLen: 30
  },
  '5_7': {
    rows: 5,
    cols: 7,
    cellLen: 35
  },
  '6_6': {
    rows: 6,
    cols: 6,
    cellLen: 36
  },
  '7_6': {
    rows: 7,
    cols: 6,
    cellLen: 42
  },
  L1: {
    rows: 3,
    cols: 3,
    cellLen: 6,
    span: [
      {
        row: 0,
        col: 0,
        rowspan: 2,
        colspan: 2
      }
    ]
  },
  L2: {
    rows: 3,
    cols: 3,
    cellLen: 4,
    span: [
      {
        row: 0,
        col: 0,
        rowspan: 2,
        colspan: 3
      }
    ]
  },
  L3: {
    rows: 4,
    cols: 3,
    cellLen: 8,
    span: [
      {
        row: 0,
        col: 0,
        rowspan: 3,
        colspan: 0
      },
      {
        row: 0,
        col: 1,
        rowspan: 3,
        colspan: 0
      }
    ]
  },
  L4: {
    rows: 4,
    cols: 3,
    cellLen: 10,
    span: [
      {
        row: 0,
        col: 0,
        rowspan: 2,
        colspan: 0
      },
      {
        row: 2,
        col: 0,
        rowspan: 2,
        colspan: 0
      }
    ]
  },
  L5: {
    rows: 4,
    cols: 3,
    cellLen: 7,
    span: [
      {
        row: 0,
        col: 0,
        rowspan: 3,
        colspan: 2
      }
    ]
  },
  L6: {
    rows: 5,
    cols: 4,
    cellLen: 15,
    span: [
      {
        row: 0,
        col: 0,
        rowspan: 3,
        colspan: 2
      }
    ]
  },
  L7: {
    rows: 5,
    cols: 4,
    cellLen: 10,
    span: [
      {
        row: 0,
        col: 0,
        rowspan: 3,
        colspan: 2
      },
      {
        row: 0,
        col: 2,
        rowspan: 3,
        colspan: 2
      }
    ]
  }
}

export const commonLayout = [
  '3_3',
  '3_4',
  '3_5',
  '4_4',
  '4_5',
  '4_6',
  '4_7',
  '4_8',
  '4_9',
  // '5_5',
  // '5_6',
  // '5_7',
  '6_6',
  '7_6'
]

export const specialLayout = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7']

export const printPartTypes = [
  {
    label: '全部',
    type: 'ALL'
  },
  {
    label: 'CPR',
    type: 'CPR'
  },
  {
    label: 'SPR',
    type: 'SPR'
  },
  {
    label: 'VR',
    type: 'VR'
  },
  {
    label: 'MIP',
    type: 'MIP'
  }
]

export const printSizeList = [
  {
    label: '14INX17IN',
    value: '14INX17IN',
    ratioW: 14,
    ratioH: 17
  },
  {
    label: '8INX10IN',
    value: '8INX10IN',
    ratioW: 8,
    ratioH: 10
  },
  {
    label: '14INX14IN',
    value: '14INX14IN',
    ratioW: 14,
    ratioH: 14
  },
  {
    label: '11INX14IN',
    value: '11INX14IN',
    ratioW: 11,
    ratioH: 14
  },
  {
    label: '10INX12IN',
    value: '10INX12IN',
    ratioW: 10,
    ratioH: 12
  }
]

// 用于血管排序
export const reportMainVessels = [
  'LM',
  'LAD',
  'D1',
  'D2',
  'D3',
  'D4',
  'D5',
  'LCX',
  'OM1',
  'OM2',
  'OM3',
  'OM4',
  'OM5',
  'L-PDA',
  'L-PLB',
  'RI',
  'RCA',
  'R-PDA',
  'R-PLB',
  'AM1',
  'AM2',
  'AM3',
  'RCB',
  'RV'
]

export const treeName = {
  lad_tree: '左前降支',
  lcx_tree: '左回旋支',
  rca_tree: '右冠状动脉',
  ri_tree: '中间支',
  other_tree: '其他'
}

export const reportSortedBranch = {
  ri_tree: ['RI'],
  lad_tree: ['LAD', 'D1', 'D2', 'D3', 'D4', 'D5'],
  lcx_tree: ['LCX', 'OM1', 'OM2', 'OM3', 'OM4', 'OM5', 'L-PDA', 'L-PLB'],
  rca_tree: ['RCA', 'R-PDA', 'R-PLB', 'RCB', 'RV', 'AM1', 'AM2', 'AM3']
}

// 血管命名
export const reportVesselsTrees = {
  RI: 'ri_tree',
  LAD: 'lad_tree',
  D1: 'lad_tree',
  D2: 'lad_tree',
  D3: 'lad_tree',
  D4: 'lad_tree',
  D5: 'lad_tree',
  LCX: 'lcx_tree',
  OM1: 'lcx_tree',
  OM2: 'lcx_tree',
  OM3: 'lcx_tree',
  OM4: 'lcx_tree',
  OM5: 'lcx_tree',
  'L-PDA': 'lcx_tree',
  'L-PLB': 'lcx_tree',
  RCA: 'rca_tree',
  'R-PDA': 'rca_tree',
  'R-PLB': 'rca_tree',
  RCB: 'rca_tree',
  RV: 'rca_tree',
  AM1: 'rca_tree',
  AM2: 'rca_tree',
  AM3: 'rca_tree'
}
