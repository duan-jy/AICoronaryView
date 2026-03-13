/* eslint-disable no-async-promise-executor */
import { loadImage, clearToolsState, clearCache } from '@/utils/cornerstone'

import { toolsList } from '@/utils/source'
import { dcmload } from '@/api/index'

import DcmSlide from '@/components/dcm-slide.vue'
import DcmMsg from '@/components/dcm-msg.vue'

import { mapGetters } from 'vuex'
import arteryBus from '@/utils/arteryBus'

export default {
  props: {
    partDcms: {
      type: Object,
      default: () => ({})
    },
    patientMsg: {
      type: Object,
      default: () => ({})
    },
    workingPath: {
      type: String,
      default: ''
    },
    asyncWwWc: {
      type: String,
      default: '800_300'
    },
    showMsg: {
      type: Boolean,
      default: false
    },
    renderedList: {
      type: String,
      default: ''
    },
    isFFR: {
      // 是不是ffr
      type: Boolean,
      default: false
    }
  },
  components: {
    DcmSlide,
    DcmMsg
  },
  data() {
    return {
      part: '',
      isSyncWwWc: true,
      partMsg: {},
      slideNum: 0, // 切换的slideNum
      isInitRender: false, // 是否初始加载图像完成
      isArtery: true, // 是否需要切换血管加载
      isEnabled: false, // 是否已经enabled
      isLoop: false, // 是否滚动slide形成环路
      imageIds: [], // 当前的值
      angleDegs: [], // 当前的值
      partElId: '', // 当前的元素id
      viewHeight: 115, // 当前元素的高度
      viewWidth: 0, // 当前元素的宽度
      windowCenter: 300, // 窗位
      windowWidth: 800, // 窗宽
      asyncWindowWidth: 800,
      asyncWindowCenter: 300,
      dcmElement: null, // 设置当前的element
      reShowTimeId: null,
      activeToolsName: 'Pan', // 当前工具
      maskStyle: {
        width: 0,
        height: 0,
        transform:
          'translate(-50%, -50%) scale(1) translate(0px, 0px) rotate(0deg)'
      }
    }
  },
  computed: {
    ...mapGetters([
      'scaleView',
      'isVertical',
      'activeArtery',
      'isActvieMark',
      'activeSprDcmName'
    ]),
    imgIndex() {
      return this.imageIds.length - Number(this.slideNum) + 1
    },
    partKey() {
      return this.part
    }
  },
  watch: {
    activeArtery(newVal, oldVal) {
      if (newVal) {
        this.arteryChange()
      }
    },
    asyncWwWc(newVal, oldVal) {
      if (newVal) {
        let [ww, wc] = newVal.split('_')
        ww = Number(ww)
        wc = Number(wc)
        this.asyncWindowWidth = ww
        this.asyncWindowCenter = wc
        this.toAsyncWwWc(ww, wc)
      }
    },
    isVertical() {
      this.$nextTick(() => {
        this.cornerstoneResize()
      })
    },
    scaleView(newVal, oldVal) {
      // 重新显示图像
      this.reShowImage(newVal, oldVal)
    }
  },
  created() {
    this.partElId = `dcm-${this.part}`.toLowerCase()

    arteryBus.on('activeToolsChange', ({ newVal, oldVal }) => {
      this.setToolsActive(newVal, oldVal)
    })
  },
  mounted() {
    this.dcmElement = document.getElementById(this.partElId)
    this.viewResize()
  },
  beforeUnmount() {
    // 移除事件监听
    if (this.dcmElement && this.part !== 'PROBE') {
      this.clearDetached(this.dcmElement, () => {
        this.dcmElement = null
      })
      // this.dcmElement = null
    }
  },
  methods: {
    async refreshImage() {
      // 先清除缓存重新加载
      clearCache()
      const imageId = this.imageIds[this.imageIds.length - this.slideNum]
      const image = await loadImage(imageId)
      cornerstone.displayImage(this.dcmElement, image)
    },
    clearDetached(element, cb) {
      element.removeEventListener(
        cornerstone.EVENTS.IMAGE_RENDERED,
        this.rendered
      )
      element.removeEventListener(
        cornerstone.EVENTS.ELEMENT_RESIZED,
        this.elementResize
      )
      element.removeEventListener(
        cornerstoneTools.EVENTS.MOUSE_MOVE,
        this.mouseMove
      )
      element.removeEventListener(
        cornerstoneTools.EVENTS.MOUSE_WHEEL,
        this.mouseWheel
      )

      element.removeEventListener(
        cornerstoneTools.EVENTS.MOUSE_DRAG,
        this.mouseDrag
      )

      element.removeEventListener(
        cornerstoneTools.EVENTS.MOUSE_CLICK,
        this.mouseClick
      )

      // cornerstone.removeElementData(element, 'rgb')
      // cornerstone.removeElementData(element, 'iint16')
      // cornerstone.removeElementData(element, 'uint16')
      // cornerstone.removeElementData(element, 'int8')
      // cornerstone.removeElementData(element, 'uint8')

      // cornerstone.drawInvalidated()
      // cornerstone.invalidate(element)

      cornerstone.disable(element)

      // 执行回调
      element = null
      cb()
    },
    viewScale(scaleKey) {
      if (!this.isEnabled || !this.dcmElement || !this.isInitRender) {
        return
      }
      const key = this.scaleView === scaleKey ? '' : scaleKey
      this.$store.dispatch('dcm/setScaleView', key)
    },
    viewResize() {
      // const element = document.getElementById(this.partElId)
      this.viewHeight = this.dcmElement.clientHeight
      this.viewWidth = this.dcmElement.clientWidth
    },
    setToolsActive(toolName, oldToolName) {
      if (!this.dcmElement || !this.isInitRender) {
        return
      }
      // 其他工具探针不需要
      if (this.part === 'PROBE') {
        return
      }

      if (toolName === 'clearLabel') {
        clearToolsState(this.dcmElement, true)
        return
      }

      if (toolName === 'reset') {
        if (this.part !== 'PROBE') {
          cornerstone.reset(this.dcmElement)
          if (this.isSyncWwWc) {
            const viewport = cornerstone.getViewport(this.dcmElement)
            viewport.voi.windowWidth = 800
            viewport.voi.windowCenter = 300
            cornerstone.setViewport(this.dcmElement, viewport)
          }
        }
        if (
          this.part === 'Ori' &&
          (this.asyncWindowWidth !== 800 || this.asyncWindowCenter !== 300)
        ) {
          this.$emit('update:asyncWwWc', '800_300')
        }
      }

      const tool = toolsList.find((item) => item.name === toolName)
      if (!tool) {
        // 未找到工具
        return
      }
      // spr 不要移动，移动后，分段会出问题
      if (toolName === 'Pan' && this.part === 'SPR') {
        const oldTool = toolsList.find((item) => item.name === oldToolName)
        if (oldTool) {
          cornerstoneTools.setToolDisabledForElement(
            this.dcmElement,
            oldTool.name,
            oldTool.options
          )
        }
        return
      }

      cornerstoneTools.setToolActiveForElement(
        this.dcmElement,
        tool.name,
        tool.options
      )
    },
    // 初始化定义element
    initElement(element) {
      return new Promise((resolve, reject) => {
        if (this.isEnabled) {
          resolve(element)
          return
        }
        try {
          cornerstone.enable(element)
          // window.addEventListener('resize', this.resizeElement)
          // 渲染
          element.addEventListener(
            cornerstone.EVENTS.IMAGE_RENDERED,
            this.rendered
          )
          // rize
          element.addEventListener(
            cornerstone.EVENTS.ELEMENT_RESIZED,
            this.elementResize
          )
          // 鼠标移动
          element.addEventListener(
            cornerstoneTools.EVENTS.MOUSE_MOVE,
            this.mouseMove
          )
          // 鼠标滚轮
          element.addEventListener(
            cornerstoneTools.EVENTS.MOUSE_WHEEL,
            this.mouseWheel
          )
          // 监听拖拽
          element.addEventListener(
            cornerstoneTools.EVENTS.MOUSE_DRAG,
            this.mouseDrag
          )

          // 鼠标点击事件
          element.addEventListener(
            cornerstoneTools.EVENTS.MOUSE_CLICK,
            this.mouseClick
          )
          // 默认右键调窗
          // 添加调窗工具
          cornerstoneTools.addToolForElement(element, cornerstoneTools.WwwcTool)
          cornerstoneTools.setToolActiveForElement(element, 'Wwwc', {
            mouseButtonMask: 2
          })

          // 缩放工具
          cornerstoneTools.addToolForElement(element, cornerstoneTools.ZoomTool)
          cornerstoneTools.setToolActiveForElement(element, 'Zoom', {
            mouseButtonMask: 4
          })

          cornerstoneTools.toolColors.setToolColor('rgba(0, 255, 0, 1)')

          if (this.part !== 'SPR') {
            // 移动工具
            // cornerstoneTools.addToolForElement(
            //   element,
            //   cornerstoneTools.PanTool
            // )
            // cornerstoneTools.setToolActiveForElement(element, 'Pan', {
            //   mouseButtonMask: 1
            // })
          }
          // 添加工具到element
          for (let index = 0; index < toolsList.length; index++) {
            const tool = toolsList[index]
            const NOW_TOOL = cornerstoneTools[tool.toolName]
            if (NOW_TOOL) {
              cornerstoneTools.addToolForElement(element, NOW_TOOL, {
                configuration: tool.configuration || {}
              })
            }
          }
          this.isEnabled = true
          element = null
          resolve()
        } catch (error) {
          reject(error)
        }
      })
    },
    async initShowDcm(element, image) {
      return new Promise(async(resolve, reject) => {
        try {
          if (!element) {
            reject(new Error('为找到元素'))
            return
          }
          // 等待enable元素
          await this.initElement(element)
          let viewport = cornerstone.getDefaultViewportForImage(element, image)
          if (this.isSyncWwWc) {
            viewport.voi.windowWidth = this.asyncWindowWidth
            viewport.voi.windowCenter = this.asyncWindowCenter
          }
          cornerstone.displayImage(element, image, viewport)
          cornerstone.resize(element, true)

          viewport = null
          element = null
          // image = null
          resolve()
        } catch (error) {
          reject(error)
        }
      })
    },
    async loadDcmFiles(initIm = 1) {
      return new Promise(async(resolve, reject) => {
        // 清除缓存
        let files = []
        let angles = []
        // const elementId = this.partElId
        // 是否需要血管的作为获取
        try {
          if (this.isArtery) {
            files = this.partDcms[this.activeArtery].DCMS || []
          } else {
            files = this.partDcms.DCMS || []
          }
          if (this.isArtery) {
            angles = this.partDcms[this.activeArtery].angles || []
          } else {
            angles = []
          }
          if (!files.length) {
            reject(new Error('无DCM文件'))
            return
          }
          if (!files[initIm - 1]) {
            reject(new Error('无DCM文件'))
            return
          }
          this.angleDegs = angles
          let imageId = dcmload(`${this.workingPath}/${files[initIm - 1]}`)
          if (this.part === 'SPR') {
            const sprFilePath = files[initIm - 1].split('/')
            const sprDcmName = sprFilePath[sprFilePath.length - 1]
            const anglesDeg = angles[initIm - 1] || 0
            if (sprDcmName) {
              this.$store.dispatch('artery/setSprDcmName', sprDcmName)
              this.$store.dispatch('artery/setSprAnglesDeg', anglesDeg)
            }
          }
          // 原始图像 缓存图像
          const image = await loadImage(imageId)

          // 显示初始化第一张
          await this.initShowDcm(this.dcmElement, image)

          // 初步渲染结束
          if (!this.isInitRender) {
            this.isInitRender = true
            this.$emit('setRenderedList', this.part, 'add')
          }

          this.slideNum = files.length - (initIm - 1)
          if (!this.imageIds.length) {
            this.imageIds = files.map((item, index) =>
              dcmload(`${this.workingPath}/${item}`)
            )
          }
          imageId = null
          resolve(image)
        } catch (error) {
          this.$message.error(error.message || '加载错误')
          reject(error)
        }
      })
    },
    // 渲染是设置信息
    renderSetWwWc(evt) {
      if (evt && evt.detail && evt.detail.element) {
        const ww = evt.detail.viewport.voi.windowWidth
        const wc = evt.detail.viewport.voi.windowCenter
        if (
          this.isEnabled &&
          this.isSyncWwWc &&
          (ww !== this.asyncWindowWidth || wc !== this.asyncWindowCenter)
        ) {
          this.$emit('update:asyncWwWc', `${ww}_${wc}`)
        }

        this.windowCenter = wc
        this.windowWidth = ww
      }
    },
    // 同步窗位窗宽
    toAsyncWwWc(ww, wc) {
      if (!this.isSyncWwWc || this.part === 'PROBE') {
        return
      }
      // const element = document.getElementById(this.partElId)
      if (!this.dcmElement) {
        return
      }
      this.setEelementWwWc(this.dcmElement, ww, wc)
    },
    // 设置element窗位窗宽
    setEelementWwWc(element, windowWidth, windowCenter) {
      if (!this.isEnabled) {
        return
      }
      const elViewPort = cornerstone.getViewport(element)
      if (!elViewPort) {
        return
      }
      elViewPort.voi.windowWidth = windowWidth
      elViewPort.voi.windowCenter = windowCenter
      cornerstone.setViewport(element, elViewPort)
    },
    // 滚动转动
    async imNumChange(val) {
      if (!this.isInitRender) {
        return
      }
      if (this.slideNum === val) {
        return
      }
      this.slideNum = val
      // const element = document.getElementById(id)
      const imagesLen = this.imageIds.length
      const index = imagesLen - val
      const imageId = this.imageIds[index]
      if (this.part === 'SPR') {
        const imageIdPath = imageId.split('&')[0]
        const sprFilePath = imageIdPath.split('%2F')
        const sprDcmName = sprFilePath[sprFilePath.length - 1]
        if (sprDcmName) {
          this.$store.dispatch('artery/setSprDcmName', sprDcmName)
          this.$store.dispatch('artery/setSprAnglesDeg', this.angleDegs[index])
        }
      }
      // 图像
      let image = await loadImage(imageId)
      cornerstone.displayImage(this.dcmElement, image)
      image = null
    },
    // 滚动转动
    async slideImNumChange(val) {
      this.imNumChange(val)
    },
    cornerstoneResize() {
      let element = document.getElementById(this.partElId)

      if (!this.isEnabled || !element || !this.isInitRender) {
        return
      }
      cornerstone.resize(element, true)
      element = null
    },
    mouseWheel(evt) {
      const wheelDelta =
        evt &&
        evt.detail &&
        evt.detail.detail &&
        'wheelDelta' in evt.detail.detail
          ? evt.detail.detail.wheelDelta
          : evt && 'wheelDelta' in evt
            ? evt.wheelDelta
            : null
      if (!wheelDelta) {
        return
      }
      const diff = wheelDelta / Math.abs(wheelDelta)
      this.diffSlideImChange(diff)
    },
    diffSlideImChange(diff) {
      let nowSildeNum = this.slideNum + diff
      if (nowSildeNum > this.imageIds.length) {
        nowSildeNum = this.isLoop ? 1 : this.imageIds.length
      } else if (nowSildeNum < 1) {
        nowSildeNum = this.isLoop ? this.imageIds.length : 1
      }
      nowSildeNum = Math.round(nowSildeNum)
      this.slideImNumChange(nowSildeNum, true)
    },
    async reShowImage(newVal, oldVal) {
      if (this.reShowTimeId !== null) {
        clearTimeout(this.reShowTimeId)
      }
      // SPR 和 探针不需要
      // this.reShowTimeId =
      this.$nextTick(async() => {
        if (!(this.part === 'SPR' || this.part === 'PROBE')) {
          // 更新显示图像
          if (
            this.imageIds.length &&
            this.isInitRender &&
            this.isEnabled &&
            !newVal &&
            oldVal !== this.partElId
          ) {
            const image = await loadImage(this.imageIds[this.imgIndex - 1])
            cornerstone.displayImage(this.dcmElement, image)
            cornerstone.updateImage(this.dcmElement)
          }
        }
        this.cornerstoneResize()
      })
    },
    // 鼠标进入
    partEnter() {
      this.dcmElement.onkeydown = (evt) => {
        const keyCode = evt.keyCode
        if (keyCode === 40) {
          this.diffSlideImChange(-1)
        } else if (keyCode === 38) {
          this.diffSlideImChange(1)
        } else {
          const typeCode = {
            68: 'D',
            84: 'T',
            80: 'P'
          }
          if (typeCode[String(keyCode)]) {
            arteryBus.emit('pushDcmToPD', {
              index: this.imgIndex - 1,
              part: this.partKey,
              isArtery: this.isArtery,
              windowWidth: this.windowWidth,
              windowCenter: this.windowCenter,
              type: typeCode[String(keyCode)],
              isShowMsg: true
            })
          }
        }
      }
      this.dcmElement.focus()
    },
    // 鼠标移除
    partLeave() {
      this.dcmElement.blur()
      this.dcmElement.onkeydown = null
    },
    elementResize(evt) {
      this.viewResize()
    },
    rendered(evt) {},
    mouseMove(evt) {},
    arteryChange() {},
    mouseDrag(evt) {},
    mouseClick(evt) {},
    markCombine() {
      this.$emit('markCombine', this.partElId, {
        part: this.part,
        isArtery: this.isArtery
      })
    },
    setMaskStyle(evt) {
      if (!(evt && evt.detail)) {
        return
      }
      const { image, viewport } = evt.detail
      const w = image.columns
      const h = image.rows
      this.maskStyle = {
        width: `${w}px`,
        height: `${h}px`,
        transform: `translate(-50%, -50%) scale(${viewport.scale}) translate(${viewport.translation.x}px, ${viewport.translation.y}px) rotate(${viewport.rotation}deg)`
      }
    }
  }
}
