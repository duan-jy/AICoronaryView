import { makeToolsTypes, toolsList } from './source'

/** 加载并缓存图像
 *
 * @param {string} imageId
 * @returns
 */
export function loadCacheImage(imageId) {
  return new Promise((resolve, reject) => {
    cornerstone.loadAndCacheImage(imageId).then(
      (image) => {
        resolve(image)
      },
      (err) => {
        reject(err)
      }
    )
  })
}

/** 图像加载
 *
 * @param {string} imageId
 * @returns
 */
export function loadImage(imageId) {
  return new Promise((resovle, reject) => {
    cornerstone.loadImage(imageId).then(
      (image) => {
        resovle(image)
      },
      (err) => {
        console.log(err)
        reject(err)
      }
    )
  })
}

// nii imageId
export const niftiImageId = cornerstoneNIFTIImageLoader.nifti.ImageId
console.log(niftiImageId)

/** 清除工具状态
 *
 * @param {element} element
 * @param {boolean} isLabel 是否标注
 */
export function clearToolsState(element, isLabel = true) {
  const allToolTypes = isLabel
    ? [].concat(makeToolsTypes)
    : ['Pan', 'Wwwc'].concat(makeToolsTypes)
  for (const toolType of allToolTypes) {
    const elementToolData = cornerstoneTools.getToolState(element, toolType)
    if (!elementToolData) {
      continue
    }
    if (toolType === 'FreehandRoi') {
      cornerstoneTools.setToolDisabled(toolType)
      cornerstoneTools.clearToolState(element, toolType)
      cornerstoneTools.setToolActive(toolType, {
        mouseButtonMask: 1
      })
    } else {
      cornerstoneTools.clearToolState(element, toolType)
    }
    cornerstone.updateImage(element)
  }
  element = null
}

/** 禁用聚焦的工具
 *
 * @param {string} elementId element 的 id
 * @param {string} activeToolsName 聚焦工具名称
 * @returns
 */
export function disbeledActiveTool(elementId, activeToolsName) {
  let element = document.getElementById(elementId)
  if (!element) {
    return
  }
  if (activeToolsName && activeToolsName !== 'reset') {
    cornerstoneTools.setToolDisabledForElement(element, activeToolsName)
  }
  element = null
}

/** 启用聚焦的工具
 *
 * @param {string} elementId element 的 id
 * @param {string} activeToolsName 聚焦工具名称
 * @returns
 */
export function enableActiveTool(elementId, activeToolsName) {
  let element = document.getElementById(elementId)
  if (!element) {
    return
  }
  if (activeToolsName && activeToolsName !== 'reset') {
    const tool = toolsList.find((item) => item.name === activeToolsName)
    if (tool) {
      cornerstoneTools.setToolEnabledForElement(element, activeToolsName)
      cornerstoneTools.setToolActiveForElement(
        element,
        activeToolsName,
        tool.options
      )
    }
  }
  element = null
}

/** 清除缓存
 *
 */
export function clearCache() {
  cornerstone.imageCache.purgeCache()
  cornerstoneWADOImageLoader.wadouri.dataSetCacheManager.purge()
  cornerstoneWADOImageLoader.wadouri.fileManager.purge()
}

/** 元素是否enable
 *
 * @param {Element} element
 * @returns
 */
export function isEnabledElement(element) {
  try {
    cornerstone.getEnabledElement(element)
    return true
  } catch (error) {
    return false
  }
}

/** 默认初始化enable element
 *
 * @param {Element} element
 * @returns
 */
export function initEnabledDefault(element, isAddTools = true) {
  return new Promise((resolve, reject) => {
    const isEnable = isEnabledElement(element)
    if (isEnable) {
      resolve()
      return
    }
    try {
      cornerstone.enable(element)
      // 添加调窗工具
      if (isAddTools) {
        cornerstoneTools.addToolForElement(element, cornerstoneTools.WwwcTool)
        cornerstoneTools.setToolActiveForElement(element, 'Wwwc', {
          mouseButtonMask: 2
        })
        // 缩放工具
        cornerstoneTools.addToolForElement(element, cornerstoneTools.ZoomTool)
        cornerstoneTools.setToolActiveForElement(element, 'Zoom', {
          mouseButtonMask: 4
        })
        // 移动工具
        // cornerstoneTools.addToolForElement(
        //   element,
        //   cornerstoneTools.PanTool
        // )
        // cornerstoneTools.setToolActiveForElement(element, 'Pan', {
        //   mouseButtonMask: 1
        // })
      }
      resolve()
    } catch (error) {
      reject(error)
    }
  })
}

// 四角信息
export const dcmtags = {
  topRight: [
    {
      tag: '0010,0010',
      label: 'PatientName',
      pos: 'topRight'
    },
    {
      tag: '0010,1010',
      label: 'PatientAge',
      pos: 'topRight'
    },

    {
      tag: '0010,0040',
      label: 'PatientSex',
      pos: 'topRight'
    }
  ],
  topLeft: [
    {
      tag: '0008,0060',
      label: 'Modality',
      pos: 'topLeft'
    },
    {
      tag: '0010,0020',
      label: 'PatientID',
      pos: 'topLeft'
    },
    {
      tag: '0008,0050',
      label: 'AccessionNumber',
      pos: 'topLeft'
    },
    {
      tag: '0008,0080',
      label: 'InstitutionName',
      pos: 'topLeft'
    }
  ],
  btLeft: [
    {
      tag: '0008,0020',
      label: 'StudyDate',
      pos: 'btRight'
    }
  ]
}

export const scrollToIndex =
  cornerstoneTools.importInternal('util/scrollToIndex')

export const wwwcSynchronizer = new cornerstoneTools.Synchronizer(
  'cornerstoneimagerendered',
  cornerstoneTools.wwwcSynchronizer
)
export const panZoomSynchronizer = new cornerstoneTools.Synchronizer(
  'cornerstoneimagerendered',
  cornerstoneTools.panZoomSynchronizer
)
export const WwwcTool = cornerstoneTools.WwwcTool
export const getRGBPixels = cornerstoneTools.importInternal('util/getRGBPixels')
