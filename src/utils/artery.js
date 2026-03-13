/* eslint-disable no-async-promise-executor */
import { ElMessage } from 'element-plus'

import { Lut } from 'three/examples/jsm/math/Lut.js'

import { getJsonData } from '@/api'
import { isEmpty } from './validate'
import { v4 } from 'uuid'

import {
  tableLayout,
  reportMainVessels,
  treeName,
  plaqueOptions,
  plaqueObj,
  narrowObj,
  percentage
} from './source'
import { el } from 'element-plus/es/locale'

// 分割步长
export const SLICE_STEP = 3

// 获取z轴近点
export function getNearSliceZ(number) {
  return Math.round(number / SLICE_STEP)
}

/** 是不是unkown的血管
 *
 * @param {string} name
 * @returns boolean true标识unknown
 */
export function isUnkown(name) {
  return name.toUpperCase().indexOf('UNKNOW') > -1
}

/** 获取血管列表
 *
 * @param {string} workingPath 工作路径
 * @returns
 */
export function getArteryList(workingPath, vesselNames, isFFr = false) {
  return new Promise(async(resolve, reject) => {
    try {
      const treePath = `${workingPath}/centerline/vessels_info.json`
      const res = await getJsonData(treePath)
      const arteryList = []
      if (res) {
        // 不可编辑的树
        const noEditTree = ['ri_tree', 'other_tree']
        const vessels = res.vessels
        // 重组数据
        for (const key in vessels) {
          if (
            Object.hasOwnProperty.call(vessels, key) &&
            vesselNames.includes(key)
          ) {
            const item = vessels[key]
            if (isFFr && noEditTree.includes(item.tree)) {
              continue
            }
            const mainIndex = reportMainVessels.indexOf(item.vessel_name)
            arteryList.push({
              id: item.id,
              name: item.vessel_name,
              tree: item.tree || '',
              canEdit: key !== 'other_tree',
              isEdit: false,
              subsections: item.subsections || [],
              sort: mainIndex > -1 ? mainIndex : reportMainVessels.length
            })
          }
        }
      }
      arteryList.sort((a, b) => a.sort - b.sort)
      resolve(arteryList)
    } catch (error) {
      ElMessage.error('加载血管数据错误')
      reject()
    }
  })
}

/** 获取当前树形排列
 *
 * @param {Array} arteryList
 * @param {Boolean} isEdit
 * @returns
 */
export function getTreeByList(arteryList) {
  const renderTree = {}
  // tree排序
  for (const tree in treeName) {
    if (Object.hasOwnProperty.call(treeName, tree)) {
      const name = treeName[tree]
      let list = arteryList
        .filter((item) => item.tree === tree)
        .sort((a, b) => a.sort - b.sort)
      if (!list.length) {
        list = null
        continue
      }
      renderTree[tree] = {
        name,
        tree,
        list,
        isFold: false
      }
      list = null
    }
  }
  return renderTree
}
/** 加载中心线
 *
 * @param { object } centerLine 中心线json数据
 * @param { string } artery 血管
 * @param { string } workingPath 路径
 * @returns
 */
export function loadCenterLine(centerLine, artery, workingPath) {
  return new Promise(async(resolve, reject) => {
    try {
      if (centerLine && centerLine[artery]) {
        const jsonData = await getJsonData(
          `${workingPath}/${centerLine[artery]}`
        )
        resolve(jsonData || {})
      } else {
        resolve({})
      }
    } catch (error) {
      reject(error)
    }
  })
}
/** 转换一下
 *
 * @param {object} centerLine
 * @returns
 */
export function transOriImLine(centerLine) {
  const lineObj = {}
  for (let index = 0; index < centerLine.length; index++) {
    const point = centerLine[index]
    const [x, y, z] = point
    const im = Math.round(z)
    const item = {
      x,
      y
    }
    if (im in lineObj) {
      lineObj[im][index] = item
    } else {
      lineObj[im] = {
        [index]: item
      }
    }
  }
  return lineObj
}

/** 按照一个步长来取值数组
 *
 * @param {Array} arr 需要剪切的数组
 * @param {number} step 步长
 * @returns
 */
export function stepArr(arr = [], step = 1) {
  return Array.from(
    {
      length: Math.floor(arr.length / step)
    },
    (v, i) => i
  ).map((item) => {
    return arr[item * step]
  })
}

/** 左右按照左右分出第个
 *
 * @param {Array} arr
 * @param {number} index
 * @param {number} step
 */
export function sliceArrStep(arr, index, step = 5) {
  arr = [].concat(arr)
  if (step % 2 === 0) {
    step = step + 1
  }
  const lrStep = (step - 1) / 2
  const begin = index - lrStep < 0 ? 0 : index - lrStep
  const end = index + lrStep + 1 > arr.length ? arr.length : index + lrStep + 1
  return {
    arr: [...arr.slice(begin, end)],
    index: index - lrStep < 0 ? index : lrStep
  }
}

/** 获取最近的点
 *
 * @param {number} number
 * @param {number} sliceStep
 * @returns
 */
export function getNearStep(number, sliceStep) {
  if (number % sliceStep === 0) {
    return number
  }
  if (number % sliceStep <= sliceStep / 2) {
    return number - (number % sliceStep)
  }
  return number + (sliceStep - (number % sliceStep))
}

/** 按照长度获取z轴
 *
 * @param {number} len
 * @returns
 */

export function getSliceZ(len) {
  const numArr = Array.from({ length: len }, (v, i) => {
    return i
  }).reverse()

  return stepArr(numArr, SLICE_STEP)
}

/** 是否显示优势性
 *
 * @param {*} orginResult
 * @param {*} key
 * @returns
 */
export function isShowOrgin(orginResult, key = '') {
  if (key) {
    return key in orginResult && !isEmpty(orginResult[key])
  }
  const keys = ['origin_left', 'origin_right', 'dominant_type']
  let isShow = true
  for (const key of keys) {
    if (!(key in orginResult && !isEmpty(orginResult[key]))) {
      isShow = false
      break
    }
  }
  return isShow
}

/** 设置刻度尺
 *
 * @param {Array} sliceZ
 * @param {number} activeIndex
 * @returns
 */
export function setScaleLines(sliceZ, activeIndex) {
  const sliceLines = sliceArrStep(sliceZ, activeIndex > 0 ? activeIndex : 0, 5)
  // 提上去
  const scaleLines = sliceLines.arr.map(
    (item, index) => index - sliceLines.index
  )
  return scaleLines
}

/** 生成sort
 *
 * @param {string} part
 * @param {string} artery
 * @param {string} index
 */
export function createDcmSort(part, artery, index) {
  const pushParts = ['Ori', 'VR', 'VR_with_heart', 'MIP', 'MIP_with_heart']
  const partIndex = pushParts.indexOf(part)
  const partScore = partIndex > -1 ? 500 * (partIndex + 1) : 4000
  const arteryIndex = reportMainVessels.indexOf(artery)
  // const arterPartScore = part === 'SPR' ? -50 : 0
  const arterPartScore = part === 'SPR' ? 50 : 0
  const arteryScore =
    arteryIndex > -1
      ? 100 * arteryIndex + 100 + arterPartScore
      : partIndex > -1
        ? 50
        : reportMainVessels.length * 100 + 100
  return partScore + arteryScore + index
}

/** 转换值
 *
 * @param {string} workingPath
 * @param {Array} dcms
 * @param {object} options 配置
 * @param {Array} options.angles 角度
 * @param {string} options.part 部分
 * @param {string} options.indexs 需要添加的indexs
 * @param {string} options.artery 血管名
 * @param {string} options.arteryId 血管id
 * @returns
 */
export function tranDcmsToImg(workingPath, dcms, options, types = []) {
  options = {
    part: '',
    angles: [],
    artery: '',
    arteryId: '',
    indexs: [],
    ...options
  }
  const { angles, artery, arteryId, indexs } = options
  const partKey = options.part.toUpperCase()
  const images = []
  for (let index = 0; index < dcms.length; index++) {
    if (indexs.length && !indexs.includes(index)) {
      continue
    }
    const dcm = dcms[index]
    const dcmSplitArray = dcm.split('/')
    const key = artery ? `${artery}_${partKey}-${index}` : `${partKey}-${index}`
    const sort = createDcmSort(options.part, artery, index)
    images.push({
      dcm: `${workingPath}/${dcm}`,
      img: `${workingPath}/${dcm.substring(0, dcm.lastIndexOf('.'))}.jpg`,
      angle:
        angles && angles.length && !isEmpty(angles[index])
          ? angles[index] + ''
          : '',
      isSpr:
        options.part.indexOf('SPR') > -1 ||
        options.part.indexOf('Synthesis') > -1,
      isCheck: false,
      part: options.part,
      artery,
      text: artery,
      saveTo: `${workingPath}/Push/${
        dcmSplitArray[dcmSplitArray.length - 2] || v4()
      }-${dcmSplitArray[dcmSplitArray.length - 1]}`,
      arteryId,
      key,
      index,
      sort
    })
  }
  return images
}

/** 获取推送的图像
 *
 * @param {array} arteryList 血管列表
 * @param {object} partDcms  图像dcms
 * @param {string} workingPath 工作路径
 * @returns
 */

export function getPushDcms(arteryList, partDcms, workingPath) {
  const pushImages = {}
  const VR_MIP = ['VR', 'VR_with_heart', 'MIP', 'MIP_with_heart']
  const parts = ['CPR', 'SPR', 'Synthesis']
  if (partDcms['MAKEUP']) {
    for (const item of partDcms['MAKEUP']) {
      console.log(item)
      pushImages.push({
        dcm: `${workingPath}/${item.imagePath}`,
        img: `${workingPath}/${item.imagePath.substring(
          0,
          item.imagePath.lastIndexOf('.')
        )}.jpg`,
        angle: '',
        isSpr: true,
        isCheck: false,
        part: item.part,
        artery: '',
        text: '',
        // saveTo: `${workingPath}/Push/${dcmSplitArray[dcmSplitArray.length - 1]}`,
        arteryId: '',
        key: 'Synthesis' + item.index,
        index: item.index,
        sort: item.index
      })
    }
  }
  for (const item of arteryList) {
    const { name, id } = item
    if (isUnkown(name)) {
      continue
    }
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const data = partDcms[part]
      if (!data) {
        continue
      }
      if (id in data && data[id].DCMS && data[id].DCMS.length) {
        let images = tranDcmsToImg(workingPath, data[id].DCMS, {
          part,
          angles: data[id].angles || [],
          artery: name,
          arteryId: id
        })
        pushImages[`${id}_${part}`] = {
          isIndeterminate: false,
          isCheckAll: false,
          isFold: true,
          images,
          name: `${name}_${part}`
        }
        images = null
      }
    }
  }

  for (let i = 0; i < VR_MIP.length; i++) {
    const part = VR_MIP[i]
    const data = partDcms[part]
    if (!data) {
      continue
    }
    if (data.DCMS && data.DCMS.length) {
      let images = tranDcmsToImg(workingPath, data.DCMS, {
        part,
        angles: data.angles || []
      })
      pushImages[part] = {
        isIndeterminate: false,
        isCheckAll: false,
        isFold: true,
        images,
        name: part
      }
      images = null
    }
  }
  return pushImages
}

/** 获取打印的图像列表
 *
 * @param {*} arteryList
 * @param {*} partDcms
 * @param {*} workingPath
 */
export function getPrintImgs(arteryList, partDcms, workingPath) {
  let pushImages = []
  const VR_MIP = ['VR', 'VR_with_heart', 'MIP', 'MIP_Inv', 'MIP_with_heart']
  const parts = ['CPR', 'SPR', 'Synthesis']

  for (const item of arteryList) {
    // 剔除unkown血管
    const { name, id } = item
    if (isUnkown(name)) {
      continue
    }

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const data = partDcms[part]
      if (!data) {
        continue
      }
      if (id in data && data[id].DCMS && data[id].DCMS.length) {
        let images = tranDcmsToImg(
          workingPath,
          data[id].DCMS,
          {
            part,
            angles: data[id].angles || [],
            artery: name,
            arteryId: id
          },
          data[id].types
        )
        pushImages = pushImages.concat(images)
        images = null
      }
    }
  }
  // VR MIP
  for (let i = 0; i < VR_MIP.length; i++) {
    const part = VR_MIP[i]
    const data = partDcms[part]
    if (!data) {
      continue
    }
    if (data.DCMS && data.DCMS.length) {
      let images = tranDcmsToImg(workingPath, data.DCMS, {
        part,
        angles: data.angles || []
      })
      pushImages = pushImages.concat(images)
      images = null
    }
  }
  if (partDcms['MAKEUP']) {
    for (const item of partDcms['MAKEUP']) {
      console.log(item)
      pushImages.push({
        dcm: `${workingPath}/${item.imagePath}`,
        img: `${workingPath}/${item.imagePath.substring(
          0,
          item.imagePath.lastIndexOf('.')
        )}.jpg`,
        angle: '',
        isSpr: true,
        isCheck: false,
        part: item.part,
        artery: '',
        text: '',
        // saveTo: `${workingPath}/Push/${dcmSplitArray[dcmSplitArray.length - 1]}`,
        arteryId: '',
        key: 'Synthesis' + item.index,
        index: 15000 + item.index,
        sort: 15000 + item.index
      })
    }
  }

  return pushImages
}

/** 获取智能排版的图像
 *
 * @param {*} arteryList
 * @param {*} partDcms
 * @param {*} workingPath
 * @returns
 */
export function getSmartLayoutImgs(arteryList, partDcms, workingPath) {
  let images = []
  const vr_mip_indexs = [3, 9, 14, 21]
  const cprSpr = [
    {
      part: 'CPR',
      indexs: [6, 14, 19]
    },
    {
      part: 'SPR',
      indexs: [11]
    }
  ]
  const mipVrParts = ['VR_with_heart', 'VR', 'MIP_with_heart', 'MIP']

  for (const part of mipVrParts) {
    if (!(part in partDcms)) {
      continue
    }
    const data = partDcms[part]
    const pushImages = tranDcmsToImg(workingPath, data.DCMS || [], {
      angles: data.angles || [],
      indexs: vr_mip_indexs,
      part
    })
    images = images.concat(pushImages)
  }

  for (let i = 0; i < arteryList.length; i++) {
    const { id, name } = arteryList[i]
    let arteryImages = []

    for (let j = 0; j < cprSpr.length; j++) {
      const item = cprSpr[j]
      const data = partDcms[item.part]
      if (!data) {
        continue
      }
      if (id in data && data[id].DCMS && data[id].DCMS.length) {
        const pushImages = tranDcmsToImg(workingPath, data[id].DCMS || [], {
          artery: name,
          arteryId: id,
          indexs: item.indexs,
          angles: data[id].angles || [],
          part: item.part
        })
        arteryImages = arteryImages.concat(pushImages)
      }
    }

    images = images.concat(arteryImages)
    arteryImages = null
  }
  return images
}

/** 通过类型获取布局
 *
 * @param {string} type 自定义布局按照 `3_8`传
 * @returns
 */
export function getLayoutByType(type) {
  let layout = null
  if (type in tableLayout) {
    layout = tableLayout[type]
  } else {
    // TODO: 自定义布局
    const [rowNum, colNum] = type.split('_')
    layout = {
      rows: rowNum,
      cols: colNum,
      cellLen: rowNum * colNum
    }
  }
  return layout
}

/** 获取打印布局
 *
 * @param {string} type 布局类型
 * @param {number} width 宽
 * @param {number} height 高
 * @param {number} start 开始
 * @returns
 */

export function getLayoutTable(type, width, height, start = 0) {
  const begin = start

  const layout = getLayoutByType(type)
  const cellLen = layout.cellLen
  const span = layout.span || []
  const rows = layout.rows
  const cols = layout.cols

  const table = []
  // 单元格的宽高
  const tdW = Math.floor((width - (cols + 1)) / cols)
  const tdH = Math.floor((height - (rows + 1)) / rows)

  for (let i = 0; i < rows; i++) {
    const row = []

    for (let j = 0; j < cols; j++) {
      let isJump = false

      for (let k = 0; k < span.length; k++) {
        const item = span[k]
        // 当行和列都有是跳出
        if (i === item.row && j === item.col) {
          break
        }

        if (i === item.row && j < item.col + item.colspan) {
          isJump = true
          break
        }
        // 符合合并的
        if (
          i < item.row + item.rowspan &&
          (j === item.col || j < item.col + item.colspan)
        ) {
          isJump = true
          break
        }
      }
      if (isJump) {
        continue
      }

      // 找到合并行和列项
      const itemSpan = span.find((item) => item.row === i && item.col === j)
      const rowspan = itemSpan && 'rowspan' in itemSpan ? itemSpan.rowspan : 0
      const colspan = itemSpan && 'colspan' in itemSpan ? itemSpan.colspan : 0

      const itemWidth = colspan < 2 ? tdW : (tdW - 1) * colspan
      const itemHeight = rowspan < 2 ? tdH : (tdH - 1) * rowspan

      row.push({
        index: start,
        src: '',
        rowspan: rowspan < 2 ? '' : rowspan,
        colspan: colspan < 2 ? '' : colspan,
        width: itemWidth,
        height: itemHeight,
        uuid: `${type}_td_${start}`
      })

      start++
    }
    table.push({
      row,
      uuid: `${type}_tr_${start}`
    })
  }
  return {
    table: {
      width,
      height,
      type,
      cellLen,
      rows: table,
      start: begin,
      end: start, // 最后一个table的索引
      uuid: `${type}_table_${start}`
    },
    cellLen
  }
}

/** 更改布局table
 *
 * @param {string} nextType 下个类型
 * @param {array} tables 当前的tables的多少
 * @param {array} images 当前的图像
 * @param {object} options
 * @param {number} options.width 表格宽度
 * @param {number} options.height 表格高度
 * @param {number} options.index 当前的表格
 * @param {number} options.cellTotal 表格单元格总数
 * @param {boolean} options.isChangeAll 是否全部更改
 * @returns
 */

export function changeLayoutTable(nextType, tables, images, options) {
  options = {
    width: 420,
    height: 500,
    index: 0,
    cellTotal: 0,
    isChangeAll: false,
    ...options
  }
  tables = [].concat(tables)

  const { isChangeAll, cellTotal, index, width, height } = options

  // 获取下一个布局
  const nextLayout = getLayoutByType(nextType)
  const nextLen = nextLayout.cellLen

  // 如果用全部
  if (isChangeAll) {
    let total = 0
    // 找一个当前全部替换的最小值，节约资源
    const num = Math.min(
      Math.ceil(images.length / nextLen),
      Math.ceil(cellTotal / nextLen)
    )

    const newTables = []
    // 递归将所有的更改
    for (let index = 0; index < num; index++) {
      const { table, cellLen } = getLayoutTable(nextType, width, height, total)
      newTables.push(table)
      total = total + cellLen
      console.log(total, 'total')
    }
    tables = null
    return {
      tables: newTables,
      total
    }
  } else {
    // 多少表格
    const nowTableLen = tables.length
    let tabelLens = tables.length

    const nowItem = tables[index]
    const nowType = nowItem.type
    // 如果最后一个变了，然后后边变成最后的类型
    const lastType =
      index === nowTableLen - 1 ? nextType : tables[nowTableLen - 1].type
    // 起始值
    let total = index === 0 ? 0 : tables[index - 1].end
    // 获取单元格的数
    const nowLayout = getLayoutByType(nowType)
    // TODO: 大布局变小布局 长度得增加， 小布局变大布局没事
    const nowLen = nowLayout.cellLen

    const nextCellTotal = cellTotal - nowLen + nextLen
    // 如果后边生成单元格数比图像数量少 多的话，就不再添加啦，
    if (images.length > nextCellTotal) {
      // 是否最后1个，如果是最后一个就看能生成几个
      const diff =
        index === nowTableLen - 1 ? Math.ceil((nowLen - nextLen) / nextLen) : 1
      tabelLens = tabelLens + diff
    }
    // 先截取之前的
    const newTables = tables.slice(0, index)
    // 从这里开始递归布局，重新修改
    for (let i = index; i < tabelLens; i++) {
      console.log(total, 'total')
      const type =
        i === index ? nextType : i >= nowTableLen ? lastType : tables[i].type
      const { table, cellLen } = getLayoutTable(type, width, height, total)
      newTables.push(table)
      total = total + cellLen
      console.log(cellLen, 'cellLen')
    }
    tables = null
    return {
      tables: newTables,
      total
    }
  }
}

/** 通过名称或者uuid获取原始
 *
 * @param {*} nameOruuid
 * @param {Array} nowArterys
 * @param {Array} rawArterys
 */

export function getRawVal(nameOruuid, nowArterys, rawArterys) {
  const nowItem = nowArterys.find(
    (item) => item.name === nameOruuid || item.uuid === nameOruuid
  )
  if (nowItem < 0) {
    return ''
  }
  const rawItem = rawArterys.find((item) => nowItem.uuid === item.uuid)
  return rawItem
}

export const ffrColorMap = [
  [0.0, 0xff0000],
  [0.5, 0xff6800],
  [0.7, 0xf6ff00],
  [0.75, 0x36ff00],
  [0.8, 0x00ff7c],
  [0.85, 0x00fffc],
  [0.9, 0x007eff],
  [0.95, 0x0045ff],
  [1, 0x0000ff]
  // [0.0, 0xff0000],
  // [0.4, 0xff4444],
  // [0.55, 0xffd700],
  // [0.7, 0x00fa9a],
  // [0.85, 0x00b4ff],
  // [1, 0x0055ff]
]

export function getPointChart(point) {
  // const
  const barData = point * 100
  let ffrLut = new Lut()
  ffrLut.addColorMap('ffrColor', ffrColorMap)
  const lutMax = 100
  ffrLut.setMax(lutMax)
  ffrLut.setMin(0)
  const colorVal = lutMax * (1 - point)
  const color = ffrLut.getColor(colorVal)
  const barColor = `#${color.getHexString()}`
  ffrLut = null

  const option = {
    title: [
      {
        text: '测量值',
        x: 'center',
        top: '50%',
        textStyle: {
          color: '#FFFFFF',
          fontSize: 14,
          fontWeight: '100'
        }
      },
      {
        text: `${point}`,
        x: 'center',
        top: '30%',
        textStyle: {
          fontSize: 18,
          color: '#FFFFFF',
          foontWeight: '600'
        }
      }
    ],
    backgroundColor: '',
    polar: {
      radius: ['72%', '82%'],
      center: ['50%', '50%']
    },
    angleAxis: {
      max: 100,
      show: false
    },
    radiusAxis: {
      type: 'category',
      show: true,
      axisLabel: {
        show: false
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      }
    },
    series: [
      {
        name: '',
        type: 'bar',
        roundCap: true,
        barWidth: 90,
        showBackground: true,
        backgroundStyle: {
          color: 'rgba(66, 66, 66, .3)'
        },
        data: [barData],
        coordinateSystem: 'polar',
        itemStyle: {
          normal: {
            color: barColor
          }
        }
      },
      {
        name: '',
        type: 'pie',
        startAngle: 80,
        radius: ['90%'],
        hoverAnimation: false,
        center: ['50%', '50%'],
        itemStyle: {
          color: 'rgba(66, 66, 66, .1)',
          borderWidth: 1,
          borderColor: '#5269EE'
        },
        data: [100]
      },
      {
        name: '',
        type: 'pie',
        startAngle: 80,
        radius: ['60%'],
        hoverAnimation: false,
        center: ['50%', '50%'],
        itemStyle: {
          color: 'rgba(66, 66, 66, .1)',
          borderWidth: 1,
          borderColor: '#5269EE'
        },
        data: [100]
      }
    ]
  }
  return option
}

export function transFFrNarrow(points, narrow) {
  const len = points.length
  const narrowPos = []
  const narrowLines = []
  for (const item of narrow) {
    const start = item.start
    if (start > len) {
      continue
    }
    let end = item.end
    end = end > len ? len : end
    const pos = Math.round((start + end) / 2)
    const location = item.location
    narrowPos.push(pos)
    narrowLines.push({
      name: `${location}`,
      xAxis: pos,
      label: {
        formatter: `${location}${narrowObj[item.plaque_strait]}`,
        fontSize: 12,
        align: 'center'
      }
    })
  }
  return {
    narrowPos,
    narrowLines
  }
}

/** ffr折线
 *
 * @param {Array} points 点
 * @param {Array} narrowLines 狭窄
 * @returns
 */
export function setFFrChartSeries(points, narrowLines) {
  return [
    {
      id: 'pointline',
      type: 'line',
      data: points,
      symbol: 'none', // 去除小圆点
      lineStyle: {
        color: '#056cc6'
      },
      markLine: {
        symbol: 'none',
        silent: true,
        data: narrowLines,
        emphasis: {
          lineStyle: {
            width: 1
          }
        },
        lineStyle: {
          color: '#ff0000',
          type: 'solid'
        }
      }
    }
  ]
}

/** 设置坐标轴
 *
 * @param {Array} points 点
 * @param {Array} segment 分段
 * @returns
 */

export function setFFrChartAxis(points, segment) {
  const len = points.length
  let xLabels = Array.from({ length: len }, (v, i) => '')
  const xShowIndexs = []
  if (segment.length) {
    const begin = segment[0].start_index
    if (begin > 0) {
      segment.unshift({
        name: '',
        start_index: 0,
        end_index: begin
      })
    }
    for (const item of segment) {
      const start = item.start_index
      if (start >= len - 1) {
        continue
      }
      let end = item.end_index
      end = end > len ? len : end
      const pos = Math.floor((start + end) / 2)
      xLabels[pos] = item.name
      xShowIndexs.push(pos)
    }
  } else {
    xLabels = ['']
  }
  return {
    xAxis: {
      id: 'ffr-xAxis',
      type: 'category',
      data: xLabels,
      axisTick: {
        show: false
      },
      axisLine: {
        lineStyle: {
          color: '#223368'
        }
      },
      axisLabel: {
        textStyle: {
          color: '#056cc6'
        },
        interval: (index, value) => {
          return xShowIndexs.includes(index)
        }
      }
    },
    yAxis: {
      id: 'ffr-yAxis',
      type: 'value',
      min: 0.4,
      max: 1,
      position: 'right',
      nameLocation: 'start',
      axisLine: {
        show: false,
        lineStyle: {
          color: '#223368'
        }
      },
      axisLabel: {
        textStyle: {
          color: '#056cc6'
        }
      },
      splitLine: {
        lineStyle: {
          color: ['#223368']
        }
      },
      axisTick: {
        show: false
      }
    },
    grid: {
      x: 5,
      x2: 30,
      y: 25,
      y2: 22
    }
  }
}

/**
 *
 * @param {number} startX 坐标
 * @param {number} endX 坐标
 * @param {number} y
 * @param {numArr} diff
 */
export function setFFrLinkLine(startX, endX, y, diff) {
  const isEmptyEnd = isEmpty(endX)
  const min = isEmptyEnd ? 0 : Math.min(startX, endX)
  const max = isEmptyEnd ? 1 : Math.max(startX, endX)
  const middle = (min + max) / 2
  const lineEnd = isEmptyEnd ? startX + 1 : endX
  return [
    {
      type: 'line',
      id: 'linkline',
      cursor: 'none',
      silent: true,
      invisible: isEmptyEnd,
      z: 99,
      shape: { x1: startX, x2: lineEnd, y1: 0, y2: 0 },
      position: [0, y],
      style: {
        stroke: '#ffd700',
        lineDash: [2, 2]
      }
    },
    {
      type: 'circle',
      id: 'linkcircle',
      cursor: 'none',
      silent: true,
      invisible: false,
      z: 99,
      shape: { cx: startX, cy: y, r: 2 },
      style: {
        stroke: '#ffd700',
        fill: '#fff'
      }
    },
    {
      type: 'text',
      id: 'linktext',
      cursor: 'none',
      silent: true,
      invisible: isEmptyEnd,
      z: 99,
      position: [middle, y - 15],
      style: {
        text: `${diff}`,
        textAlign: 'center',
        fill: '#ffd700'
      }
    }
  ]
}

/**
 *
 * @param {*} grid
 * @param {*} height
 * @param {*} start
 * @param {*} drag
 * @returns
 */
export function setFFrDragLine(grid, height, start, drag) {
  return [
    {
      type: 'line',
      id: 'dargline',
      cursor: 'col-resize',
      shape: { x1: 0, x2: 0, y1: grid.y, y2: height - grid.y2 },
      position: [start, 0],
      z: 99,
      draggable: true,
      // invisible: true,
      style: {
        stroke: '#f4721b'
      },
      ondrag: drag
    }
  ]
}

/** 获取num距离数组最小的index
 *
 */
export function getRecentIndex(num, arr) {
  const list = arr.map((item) => Math.abs(num - item))
  let min = list[0]
  let minIndex = 0
  list.forEach((item, index) => {
    if (min > item) {
      min = item
      minIndex = index
    }
  })
  return {
    near: arr[minIndex],
    minIndex
  }
}

/** 部位文字
 *
 * @param {object} part
 * @returns
 */

export function reconfigPartText(part) {
  return part.arteryName
}

export function partText(part, plaqueTypes = [], isDiagnose = false) {
  let typeText = plaqueTypes.map((item) => plaqueObj[item]).join('、')
  const partPlaqueStrait = part.straitness
  if (!partPlaqueStrait && typeText) typeText = ''
  const { bridge, stent, stent_length } = part
  let bridgeText = bridge ? `局部走行于心肌内，` : ''
  let stentText = ''
  if (bridge) {
    if (part.bridge_thickness) {
      bridgeText += `心肌桥深度约${part.bridge_thickness}mm，`
    }
    if (part.artery_length) {
      bridgeText += `壁冠状动脉长度约${part.artery_length}mm，`
    }
    if (!part.bridge_thickness && !part.artery_length) {
      bridgeText = ''
    }
  }
  if (stent) {
    stentText = `可见高度支架影，长约${stent_length}mm，`
  }
  let lumen = `未见明显狭窄`
  if (typeText || bridgeText || stentText) {
    lumen = `管腔${narrowObj[part.plaque_strait]}`
  }
  let partDiagnose = ''
  if (!isDiagnose && typeText) {
    partDiagnose = partPlaqueStrait ? `，狭窄程度约${partPlaqueStrait}%` : ''
  }
  if (isDiagnose) {
    if (!bridgeText && !stentText && !typeText) return ''
    // if (typeText && !stentText) typeText = ''
    if (part.plaque_strait === -1) lumen = ''
    if (!bridgeText && !stentText && !typeText && !lumen && !partDiagnose) {
      return ''
    }
  }
  let lastResult = `${part.sectionName}${bridgeText}${stentText}${
    typeText ? `管壁${isDiagnose ? '' : '可见'}${typeText}斑块，` : ''
  }${lumen}${partDiagnose}`
  if (lastResult.charAt(lastResult.length - 1) === '，') {
    lastResult = lastResult.slice(0, -1)
  }
  return lastResult
}

/** 过滤文字
 *
 * @param {Array} filterList
 * @returns
 */
[
  { label: '钙化斑块', value: 1, alias: 'Calcification' },
  { label: '非钙化斑块', value: 2, alias: 'NonCalcification' },
  { label: '混合斑块', value: 3, alias: 'Mixed' }
]
const plaqueCompare = {
  Mixed: '混合斑块',
  Calcification: '钙化斑块',
  NonCalcification: '非钙化斑块'
}
export function filterItemList(filterList) {
  const isFrontName = filterList.length > 1
  const result = []
  for (const item of filterList) {
    if (!item.checked) continue
    const frontName = isFrontName ? item.cnName : ''
    let diagnoseName = frontName
    const defaultText = '未见斑块及明显狭窄'
    // 斑块描述
    const plaqueText = judgePlaqueText(item.plaque)
    // 狭窄描述
    const narrowText = judgeNarrowText(item.straitness, item.plaque_strait)
    const narrowTextDiag = judgeNarrowText(
      item.straitness,
      item.plaque_strait,
      true
    )
    // 斑块描述的最终版
    const plaqueDesc =
      plaqueText && narrowText
        ? `${plaqueText},${narrowText}`
        : `${defaultText}`
    const plaqueDescDiag =
      plaqueText && narrowTextDiag
        ? `${plaqueText},${narrowTextDiag}`
        : `${defaultText}`
    const stentText = judgeStentText(item.stent, item.stent_length)
    const stentTextDiag = judgeStentText(item.stent, item.stent_length, true)
    const bridgeText = judgeBridgeText(
      item.bridge,
      item.bridge_thickness,
      item.artery_length
    )
    const bridgeTextDiag = judgeBridgeText(
      item.bridge,
      item.bridge_thickness,
      item.artery_length,
      true
    )

    if (!plaqueDescDiag && !stentTextDiag && !bridgeTextDiag) {
      diagnoseName = ''
    }
    result.push({
      ...item,
      text: `${frontName}${stentText}${judgeSemi([
        stentText
      ])}${bridgeText}${judgeSemi([bridgeText])}${plaqueDesc}`,
      diagnose: `${diagnoseName}${stentTextDiag}${judgeSemiDiag(
        [stentTextDiag],
        true
      )}${bridgeTextDiag}${judgeSemiDiag(
        [bridgeTextDiag],
        `${plaqueDescDiag}`
      )}${plaqueDescDiag}`
    })
  }
  const textObject = {
    copyText: '',
    diagnoseText: ''
  }
  if (result.length > 1) {
    const item = filterList[0]
    const filterResult = result.filter(
      (lItem) => lItem.text === `${lItem.cnName}未见斑块及明显狭窄`
    )
    if (filterResult.length === result.length) {
      textObject.copyText = `${item.arteryName}未见斑块及明显狭窄\r\n`
    } else {
      // const mapResult = result.map((lItem) => lItem.text).filter(lItem => lItem).join('；')
      const mapResult = fusion(result)
      const mapResultDiag = fusion(result, 'diagnose')
      textObject.copyText = `${item.arteryName.split('（')[0]}${mapResult}\r\n`
      textObject.diagnoseText = `${
        item.arteryName.split('（')[0]
      }${mapResultDiag}\r\n`
    }
  } else {
    if (!result.length) {
      textObject.copyText = ''
      textObject.diagnoseText = ''
    } else {
      const item = filterList[0]
      textObject.copyText = `${item.arteryName}${result[0].text}\r\n`
      if (result[0].text !== `未见斑块及明显狭窄`) {
        textObject.diagnoseText = `${item.arteryName}${result[0].diagnose}\r\n`
      }
    }
  }
  return { list: result, ...textObject }
}
function fusion(result, type = 'text') {
  const compare = []
  const compareList = []
  const textArray = []
  let text = ''
  for (let i = 0; i < result.length; i++) {
    const item = result[i]
    if (item[type] === `${item.cnName}未见斑块及明显狭窄`) {
      compareList.push(i)
      compare.push({
        index: i,
        topName: item.cnName.slice(0, 2),
        name: item.cnName,
        fusion: true
      })
    }
  }
  if (compare.length === 2) {
    text = `${compare.map((item) => item.topName).join('、')}未见斑块及明显狭窄`
  }
  for (let i = 0; i < result.length; i++) {
    if (compareList.indexOf(i) !== -1) {
      continue
    }
    textArray.push(result[i][type])
  }
  if (text) {
    textArray.push(text)
  }
  return textArray.join('；')
}

function judgeSemi(textArray) {
  if (!textArray.length) return ''
  const textNotEmpty = textArray.filter((item) => item)
  if (!textNotEmpty.length) return ''
  return '；'
}
function judgeSemiDiag(textArray, leftArray) {
  if (!textArray.length || !leftArray) return ''
  const textNotEmpty = textArray.filter((item) => item)
  if (!textNotEmpty.length) return ''
  return '；'
}

function judgePlaqueText(plaque) {
  let result = ''
  for (const key in plaque) {
    if (!plaque[key]) continue
    result += `${plaqueCompare[key]},`
  }
  return result ? `管壁可见${result.slice(0, -1)}` : ''
}
function judgeNarrowText(narrow, type, isDiagnose) {
  if (!narrow) return ''
  return isDiagnose || narrow == 100
    ? `管腔${narrowObj[type]}`
    : `管腔${narrowObj[type]}约${narrow}%`
}
function judgeStentText(stent, stent_length, isDiagnose) {
  if (!stent || !stent_length) return ''
  return isDiagnose
    ? `可见高密度支架影`
    : `可见高密度支架影，长度约${(stent_length * 10).toFixed(0) / 10}mm`
  // return `可见高密度支架影，长度约${(stent_length * 10).toFixed(0) / 10}mm`
}
function judgeBridgeText(bridge, bridge_thickness, artery_length, isDiagnose) {
  if (!bridge) return ''
  if (!bridge_thickness && !artery_length) return ''
  let result = '局部走行于心肌内'
  if (bridge_thickness) {
    result += isDiagnose
      ? ''
      : `，心肌桥深度约${(bridge_thickness * 10).toFixed(0) / 10}mm`
  }
  if (artery_length) {
    // 判断当前需要不需要添加逗号
    result += isDiagnose
      ? ''
      : `${result.length > 12 ? '，' : ''}壁冠状动脉长度约${
        (artery_length * 10).toFixed(0) / 10
      }mm`
  }
  return `${result}`
}
