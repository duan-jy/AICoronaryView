<style lang="less" scoped>
.probe-swiper {
  height: 100%;
}
.probe-line {
  position: absolute;
  z-index: 1000;
  width: 1px;
  height: 20%;
  left: 50%;
  background-color: #0ac8f8;
  &-index0 {
    height: 25%;
    background-color: #e9370e;
  }
  &.probe-topline {
    top: 0;
  }
  &.probe-btline {
    bottom: 0;
  }
}
.dcm-content {
  position: relative;
}
.probe-list {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  li {
    float: left;
    .cornerstone-canvas {
      width: 100%;
      height: 100%;
    }
  }
}
.operate-item.artery-icon.icon-combine {
  font-size: 20px;
  background-color: #e9370e;
}
</style>
<template>
  <div
    class="dcm-view view-bt view-bt-probe"
    @mousedown.prevent="changWwwc"
    @dblclick="viewScale('dcm-spr')"
  >
    <div
      class="dcm-content"
      id="dcm-probe"
      ref="view-probe"
      @mousewheel="probeWheel"
    >
      <ul
        class="probe-list"
        :style="{
          width: `${itemHeight * probeViews.length}px`,
          height: itemHeight + 'px'
        }"
      >
        <li
          v-for="item in probeViews"
          class="probe-item"
          :id="`probe-item-${item.index}`"
          :key="`probe-item-${item.index}`"
          :style="{
            width: itemHeight + 'px',
            height: itemHeight + 'px'
          }"
        >
          <canvas class="cornerstone-canvas"></canvas>
        </li>
      </ul>
    </div>
    <DcmMsg
      :part="part"
      :scale-key="partElId"
      :patientMsg="patientMsg"
      :windowWidth="windowWidth"
      :windowCenter="windowCenter"
      :imgIndex="0"
      :show-scale="false"
      :show-push="false"
      :showRefresh="false"
    >
      <template v-slot:otherMsg>
        <div class="msg-item" v-if="probeZ">Z：{{ probeZ }}</div>
      </template>
      <template v-slot:default>
        <i
          v-show="isActvieMark"
          class="operate-item artery-icon icon-biaoji"
          title="组合标记"
          @click.stop.prevent="markCombine"
        />
        <i
          class="operate-item artery-icon icon-combine"
          title="组合图像"
          @click.stop.prevent="combineImage"
        />
      </template>
    </DcmMsg>
    <div
      v-for="item in scaleLines"
      :key="`probe_topline_${item.index}`"
      :style="item.style"
      :class="['probe-line', 'probe-topline', `probe-line-index${item.index}`]"
    />
    <div
      v-for="item in scaleLines"
      :key="`probe_btline_${item.index}`"
      :style="item.style"
      :class="['probe-line', 'probe-btline', `probe-line-index${item.index}`]"
    />
  </div>
</template>

<script>
import { Mousewheel } from 'swiper'

import { mapGetters } from 'vuex'
import { ElMessage } from 'element-plus'

import {
  niftiImageId,
  loadImage,
  isEnabledElement,
  clearToolsState
} from '@/utils/cornerstone'
import { niiload } from '@/api/index'
import { getSliceZ, setScaleLines, SLICE_STEP } from '@/utils/artery'
import DcmMixin from '@/mixins/dcm'

import { toolsList } from '@/utils/source'
import arteryBus from '@/utils/arteryBus'

let timeId1 = null
let timeId2 = null
let timeId3 = null

let imageIdObj_z = null

function resetData() {
  if (timeId1 !== null) {
    clearTimeout(timeId1)
  }
  timeId1 = null
  if (timeId2 !== null) {
    clearTimeout(timeId2)
  }
  timeId2 = null
  if (timeId3 !== null) {
    clearTimeout(timeId3)
  }
  timeId3 = null

  imageIdObj_z = null
}

export default {
  mixins: [DcmMixin],
  setup() {
    return {
      modules: [Mousewheel]
    }
  },
  data() {
    return {
      part: 'PROBE',
      sliceZ: [],
      initialSlide: 0,
      activeIndex: 0,
      scaleLines: [],
      itemHeight: 80,
      probeViews: []
    }
  },
  computed: {
    ...mapGetters(['isVertical', 'isActvieMark']),
    probeZ() {
      if (this.sliceZ.length && this.sliceZ[this.activeIndex]) {
        const noNum = this.sliceZ[0] - this.sliceZ[this.activeIndex]
        return noNum + ''
      } else {
        return ''
      }
    }
  },
  watch: {
    scaleView(newVal, oldVal) {
      if (newVal === 'dcm-spr' || oldVal === 'dcm-spr') {
        this.getViewWidth()
      }
    },
    isVertical() {
      this.$nextTick(() => {
        this.getViewWidth()
      })
    }
  },
  created() {
    resetData()
    // 获取图像的宽度
    this.getViewWidth()

    arteryBus.on('renderedListChange', (list) => {
      this.loadData(list)
    })

    arteryBus.on('activeToolsChange', ({ newVal, oldVal }) => {
      this.setToolsActive(newVal, oldVal)
    })
    // 设置聚集
    arteryBus.on('setScaleActive', (activeIndex) => {
      if (this.activeIndex !== activeIndex) {
        this.activeIndex = activeIndex
        this.$store.dispatch('artery/setProbeIndex', this.probeZ)
        // this.setScaleLines()
        if (timeId3 !== null) {
          clearTimeout(timeId3)
        }
        this.toSliceImage()
      }
    })
    window.addEventListener('beforeunload', () => {
      console.log('PROBE-beforeunload')
      arteryBus.off('*')
      resetData()
      window.removeEventListener('resize', () => {}) // 移除这个监听
      window.removeEventListener('beforeunload', () => {}) // 移除这个监听
    })
  },
  beforeUnmount() {
    resetData()
  },
  methods: {
    viewScale(scaleKey) {
      if (!this.isInitRender) {
        return
      }
      const key = this.scaleView === scaleKey ? '' : scaleKey
      this.$store.dispatch('dcm/setScaleView', key)
    },
    // 获取窗口大小
    getViewWidth() {
      const minusPercent = this.isVertical ? 0.7 : 1

      const scale = this.scaleView === 'dcm-spr' ? 0.3 : 0.15
      const itemHeight = Math.ceil(
        (document.body.clientHeight * minusPercent - 78) * scale - 16
      )

      const resultWidth = this.isVertical ? 0 : 340
      const viewWidth = document.body.clientWidth - 100 - resultWidth

      let number = Math.ceil(viewWidth / itemHeight)
      number = number % 2 ? number : number + 1

      this.itemHeight = itemHeight
      this.probeViews = Array.from({ length: number }, (v, i) => ({
        index: i
      }))

      this.toSliceImage()
    },
    // 滚动
    probeWheel(evt) {
      if (evt && 'wheelDelta' in evt) {
        const wheelDelta = evt.wheelDelta
        const diff = wheelDelta / 120
        const next = this.activeIndex - diff
        if (next > this.sliceZ.length - 1 || next < 0) {
          return
        }
        this.activeIndex = next
        this.$store.dispatch('artery/setProbeIndex', this.probeZ)
        arteryBus.emit('setScaleActive', this.activeIndex)
        this.toSliceImage()
      }
    },
    // 血管
    arteryChange() {
      resetData()
      this.sliceZ = []
      this.activeIndex = 0
      this.scaleLines = []
      this.initialSlide = 0
      this.isInitRender = false
      this.mapSliceZ = []
      this.$store.dispatch('artery/setProbeIndex', 0)
      this.$emit('setRenderedList', this.part, 'remove')
    },
    // 设置刻度尺
    setScaleLines() {
      if (!this.isInitRender) {
        return
      }
      const scaleLines = setScaleLines(this.sliceZ, this.activeIndex)
      arteryBus.emit('setScaleLines', scaleLines)

      this.scaleLines = scaleLines.map((index) => {
        const lateX = index * this.itemHeight + (index >= 0 ? 0.5 : -0.5)
        return {
          index,
          style: { transform: `translateX(${lateX}px)` }
        }
      })
    },
    // 加载数据
    loadData(list) {
      list = list ? list.split(',') : []
      if (
        list.includes('Ori') &&
        list.includes('CPR') &&
        list.includes('SPR') &&
        !this.isInitRender
      ) {
        this.loadNii()
      }
    },
    async loadNii() {
      // 清除无用的元素启用
      // cornerstone.drawInvalidated()
      return new Promise(async(resolve, reject) => {
        try {
          if (
            this.partDcms &&
            this.partDcms[this.activeArtery] &&
            this.partDcms[this.activeArtery].DCMS
          ) {
            const file = this.partDcms[this.activeArtery].DCMS || []
            const url = niiload(`${this.workingPath}/${file}`)
            const imageObj = niftiImageId.fromURL(`nifti:${url}`)
            imageIdObj_z = niftiImageId.fromURL(`nifti:${imageObj.filePath}#z`)
            // 要先加载图像
            let imageId = imageIdObj_z.url
            await loadImage(imageId)
            // z轴分割
            let numberOfSlices_z = cornerstone.metaData.get(
              'multiFrameModule',
              imageIdObj_z.url
            ).numberOfFrames
            // 分割翻转
            this.sliceZ = getSliceZ(numberOfSlices_z)
            imageId = null
            numberOfSlices_z = null
            // 分割图像
            this.toSliceImage()
            this.$store.dispatch('artery/setProbeIndex', this.probeZ)
            resolve(this.sliceZ)
          } else {
            reject(new Error('加载失败'))
          }
        } catch (error) {
          reject(error)
        }
      })
    },
    async toSliceImage() {
      if (!imageIdObj_z) {
        return
      }
      // cornerstone.drawInvalidated()
      this.$nextTick(async() => {
        const activeIndex = this.activeIndex
        // 超出的部分不做操作
        if (!this.sliceZ[activeIndex]) {
          return
        }

        const len = this.probeViews.length
        const middle = Math.floor(len / 2)
        for (const item of this.probeViews) {
          const { index } = item
          // 图像index值
          const imageIndex = activeIndex + (index - middle)
          let element = document.getElementById(`probe-item-${index}`)
          const isEnable = isEnabledElement(element)

          if (
            imageIndex > this.sliceZ.length - 1 ||
            imageIndex < 0 ||
            !this.sliceZ[imageIndex]
          ) {
            if (isEnable) {
              // 清除
              cornerstone.disable(element)
            }
            continue
          }

          if (!isEnable) {
            cornerstone.enable(element)
            // 添加工具
            this.addToolForElement(element)
          }
          const imageId = `nifti:${imageIdObj_z.filePath}#${imageIdObj_z.slice.dimension}-${this.sliceZ[imageIndex]},t-0`
          let image = await loadImage(imageId)
          // 调窗
          let viewport = cornerstone.getDefaultViewportForImage(element, image)
          viewport.voi.windowWidth = this.asyncWindowWidth
          viewport.voi.windowCenter = this.asyncWindowCenter
          cornerstone.displayImage(element, image, viewport)
          // resize
          cornerstone.resize(element, true)
          element = null
          viewport = null
          image = null
        }
        if (!this.isInitRender) {
          this.$emit('setRenderedList', this.part, 'add')
          this.isInitRender = true
        }
        // 设置刻度线
        this.setScaleLines()
      })
    },
    // 同步窗位窗宽
    toAsyncWwWc(ww, wc) {
      this.windowWidth = ww
      this.windowCenter = wc
      if (this.sliceZ.length && this.isInitRender) {
        for (const item of this.probeViews) {
          let element = document.getElementById(`probe-item-${item.index}`)
          if (!element) {
            continue
          }
          const isEnable = isEnabledElement(element)
          if (!isEnable) {
            continue
          }
          let elViewPort = cornerstone.getViewport(element)
          elViewPort.voi.windowWidth = ww
          elViewPort.voi.windowCenter = wc
          cornerstone.setViewport(element, elViewPort)
          element = null
          elViewPort = null
        }
      }
    },
    // 修改窗值
    changWwwc(evt) {
      if (!this.isInitRender) {
        return
      }
      if (evt.which === 3) {
        let lastX = evt.pageX
        let lastY = evt.pageY
        document.onmousemove = (e) => {
          const deltaX = e.pageX - lastX
          const deltaY = e.pageY - lastY
          lastX = e.pageX
          lastY = e.pageY
          let element = document.getElementsByClassName('probe-item')[0]
          if (!element || !this.isInitRender) {
            return
          }
          const viewport = cornerstone.getViewport(element)
          if (!viewport) {
            return
          }
          const ww = viewport.voi.windowWidth + (deltaX / viewport.scale) * 5
          const wc = viewport.voi.windowCenter + (deltaY / viewport.scale) * 5
          this.$emit('update:asyncWwWc', `${ww}_${wc}`)
          element = null
        }
        document.onmouseup = (e) => {
          document.onmousemove = null
          document.onmouseup = null
        }
      }
    },
    addToolForElement(element) {
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
    },
    async combineImage() {
      try {
        arteryBus.emit('makeupPrint')
      } catch (error) {
        ElMessage.error('组合图像出错，请稍候重试')
      }
    },
    async markCombine() {
      try {
        const len = this.probeViews.length
        const middle = Math.floor(len / 2)
        this.$emit('markCombine', `probe-item-${middle}`, {
          part: this.part,
          isArtery: false
        })
      } catch (error) {
        ElMessage.error('标记图像出错，请稍候重试')
      }
    },
    setToolsActive(toolName, oldToolName) {
      if (!this.isInitRender) {
        return
      }
      if (toolName === 'clearLabel') {
        for (const item of this.probeViews) {
          const element = document.getElementById(`probe-item-${item.index}`)
          const isEnable = isEnabledElement(element)
          if (isEnable) {
            clearToolsState(element, true)
          }
        }
        return
      }
      if (toolName === 'reset') {
        for (const item of this.probeViews) {
          const element = document.getElementById(`probe-item-${item.index}`)
          const isEnable = isEnabledElement(element)
          if (isEnable) {
            cornerstone.reset(element)
            if (this.isSyncWwWc) {
              const viewport = cornerstone.getViewport(element)
              viewport.voi.windowWidth = this.windowWidth
              viewport.voi.windowCenter = this.windowCenter
              cornerstone.setViewport(element, viewport)
            }
          }
        }
        return
      }
      const tool = toolsList.find((item) => item.name === toolName)
      if (!tool) {
        // 未找到工具
        return
      }
      for (const item of this.probeViews) {
        const element = document.getElementById(`probe-item-${item.index}`)
        const isEnable = isEnabledElement(element)
        if (isEnable) {
          cornerstoneTools.setToolActiveForElement(
            element,
            tool.name,
            tool.options
          )
        }
      }
      // cornerstoneTools.setToolActive(tool.name, tool.options)
    }
  }
}
</script>
