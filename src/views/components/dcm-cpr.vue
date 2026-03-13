<style lang="less" scoped>
.cpr-anchor {
  width: 50px;
  height: 3px;
  position: absolute;
  z-index: 1000;
  cursor: pointer;
  transform-origin: center center;
  background-image: linear-gradient(
    90deg,
    #e9370e,
    rgba(255, 101, 0, 0) 35%,
    rgba(255, 101, 0, 0) 65%,
    #e9370e
  );
  &::before {
    content: '';
    position: absolute;
    top: -30px;
    right: -20px;
    bottom: -30px;
    left: -20px;
  }
}

.cpr-narrow {
  > div {
    position: absolute;
    z-index: 800;
    // background-color: #5c5c5c;
    background-color: rgba(92, 92, 92, 0.5);
  }
  &.active {
    > div {
      // background-color: #e9370e;
      background-color: rgb(233, 55, 14, 0.5);
      z-index: 801;
    }
  }
  .narrow-line {
    width: 18px;
    height: 1px;
    transform: rotateZ(-36deg);
    transform-origin: left center;
    &.left-direction {
      width: 15px;
      transform: rotateZ(-133deg);
    }
  }
  .narrow-level-line {
    width: 15px;
    height: 1px;
  }
  .narrow-label {
    font-size: 10px;
    height: 14px;
    line-height: 14px;
    padding: 0 5px;
    border-radius: 2px;
    color: #fff;
    cursor: pointer;
    user-select: none;
  }
}

.operate-item.icon-sudu-xian.is-draw {
  color: #0aed1d;
}
</style>

<template>
  <div class="dcm-view dcm-cpr" @dblclick="viewScale(partElId)">
    <div
      class="dcm-content"
      id="dcm-cpr"
      tabindex="-1"
      @mouseenter="partEnter"
      @mouseleave="partLeave"
    >
      <canvas class="cornerstone-canvas"></canvas>
    </div>
    <div class="dcm-content-mask" id="cpr-line" :style="maskStyle">
      <canvas
        class="mask-canvas"
        id="cpr-line-canvas"
        :style="{
          display: isDrawLine ? 'block' : 'none'
        }"
      ></canvas>
    </div>
    <DcmSlide
      :slideKey="partElId"
      :max="imageIds.length"
      :slideNum="slideNum"
      :slideHeight="viewHeight / 3"
      @slideImNumChange="slideImNumChange"
    />
    <DcmMsg
      :part="part"
      :scale-key="partElId"
      :patientMsg="patientMsg"
      :imgIndex="imgIndex"
      :windowWidth="windowWidth"
      :windowCenter="windowCenter"
      :showScale="!isFFR"
      :showPush="!isFFR"
      @refreshImage="refreshImage"
    >
      <template v-slot:default>
        <i
          v-show="isActvieMark"
          :class="['operate-item artery-icon icon-biaoji']"
          title="组合标记"
          @click.stop.prevent="markCombine"
        />
        <i
          :class="[
            'operate-item artery-icon icon-sudu-xian',
            isDrawLine ? 'is-draw' : ''
          ]"
          title="中心线"
          @click.stop="toDrawLine"
        />
      </template>
    </DcmMsg>

    <div
      class="cpr-anchor"
      :style="anchorStyle"
      @mousedown="dragStart"
      @mousewheel="mouseWheel($event)"
    />

    <div
      v-for="item in drawNarrowList"
      :key="`cpr_narrow${item.id}`"
      :class="['cpr-narrow', item.key === narrowActive ? 'active' : '']"
      @mousewheel="mouseWheel($event)"
    >
      <div
        v-show="showAI"
        :class="['narrow-line', item.x > viewWidth / 2 ? 'left-direction' : '']"
        :style="{
          left: `${item.x}px`,
          top: `${item.y}px`
        }"
      />
      <div
        v-show="showAI"
        class="narrow-level-line"
        :style="{
          left: `${item.x > viewWidth / 2 ? item.x - 25 : item.x + 15}px`,
          top: `${item.y - 10}px`
        }"
      />
      <div
        v-show="showAI"
        class="narrow-label"
        :style="narrowStyle(item.x, item.y)"
        @click.stop="setNarrowActive(item.key)"
        @contextmenu.stop.prevent="cancalNarrow($event, item)"
      >
        {{ item.label }}
      </div>
    </div>
  </div>

  <vue3-menus
    v-model:open="isShowMenu"
    :menus="menus"
    :event="menuEvent"
    :zIndex="1001"
    hasIcon
  />
</template>

<script>
import DcmMixin from '@/mixins/dcm'

import arteryBus from '@/utils/arteryBus'
import { loadCenterLine } from '@/utils/artery'

import { disbeledActiveTool, enableActiveTool } from '@/utils/cornerstone'
import { isEmpty, isEmptyObj } from '@/utils/validate'

let centerLine = {}

let lineCanvas = null
let lineCtx = null

function resetData() {
  centerLine = null
  centerLine = {}

  lineCanvas = null
  lineCtx = null
}

export default {
  mixins: [DcmMixin],
  data() {
    return {
      part: 'CPR',
      viewWidth: 0,
      isLoop: true,
      anchorStyle: {
        left: 0,
        top: 0,
        transform: 'rotateZ(0deg)',
        display: 'none'
      },
      angle: 0,
      oriPointIndex: 0,
      cprPointIndex: 0,
      narrowList: [], // 狭窄列表
      narrowActive: '', // 聚焦的狭窄
      drawNarrowList: [],
      isShowMenu: false,
      menus: [],
      menuEvent: null,
      isArteryEdit: false, // 是否血管编辑状态
      showAI: true,
      isDrawLine: false,
      isHasLineDraw: false
    }
  },
  props: {
    linePath: {
      type: Object,
      default: () => ({})
    }
  },
  created() {
    resetData()

    arteryBus.on('renderedListChange', (list) => {
      this.loadData(list)
    })
    // 点转换
    arteryBus.on('setOriPointIndex', (index) => {
      if (this.oriPointIndex !== index) {
        this.oriPointIndex = index
        this.oriPointChange()
      }
    })
    // 设置狭窄列表
    arteryBus.on('setNarrowList', (list) => {
      this.narrowList = list
      this.transNarrow()
    })

    arteryBus.on('setNarrowActive', (key) => {
      if (this.narrowActive !== key) {
        this.narrowActive = key || ''
      }
    })

    // 是否在编辑状态
    arteryBus.on('editArtery', (isEdit) => {
      this.isArteryEdit = isEdit
    })

    // 是否显示AI
    arteryBus.on('toShowAI', (showAI) => {
      this.showAI = showAI
    })
    window.addEventListener('beforeunload', () => {
      console.log('CPR-beforeunload')
      arteryBus.off('*')
      resetData()
      window.removeEventListener('beforeunload', () => {}) // 移除这个监听
    })
  },
  beforeUnmount() {
    resetData()
  },
  methods: {
    toDrawLine() {
      this.isDrawLine = !this.isDrawLine
      this.isHasLineDraw = false
      this.drawLine()
    },
    drawLine() {
      if (!this.isDrawLine || this.isHasLineDraw) {
        return
      }
      if (!(centerLine && centerLine[this.angle])) {
        return
      }
      this.$nextTick(() => {
        let line = centerLine[this.angle].cpr_coord
        if (!lineCanvas) {
          lineCanvas = document.getElementById('cpr-line-canvas')
          lineCtx = lineCanvas.getContext('2d')
          lineCtx.fillStyle = 'rgba(255, 255, 255, 0)'
          lineCtx.globalAlpha = 0
        }
        const content = cornerstone.getEnabledElement(this.dcmElement)
        const { rows: h, columns: w } = content.image
        lineCanvas.width = w
        lineCanvas.height = h
        lineCtx.clearRect(0, 0, w, h)
        lineCtx.beginPath()
        lineCtx.strokeStyle = '#0aed1d'
        lineCtx.lineWidth = 2
        for (let i = 0; i < line.length; i++) {
          const [x, y] = line[i]
          if (i === 0) {
            lineCtx.moveTo(x, y)
          } else {
            lineCtx.lineTo(x, y)
          }
        }
        lineCtx.stroke()
        lineCtx.closePath()
        this.isHasLineDraw = true
        line = null
      })
    },
    // 血管切换
    arteryChange() {
      resetData()
      this.isInitRender = false
      this.angle = 0
      this.cprPointIndex = 0
      this.oriPointIndex = 0
      this.imageIds = []
      this.narrowList = []
      this.drawNarrowList = []
      this.imageIds = []
      this.narrowActive = ''
      this.isHasLineDraw = false
      this.isDrawLine = false
      this.$emit('setRenderedList', this.part, 'remove')
    },
    // 数据下载
    async loadData(list) {
      list = list ? list.split(',') : []
      if (list.includes('Ori') && !this.isInitRender) {
        await this.loadDcmFiles()
        centerLine = await loadCenterLine(
          this.linePath,
          this.activeArtery,
          this.workingPath
        )
        this.oriPointChange()
        this.transNarrow()
      }
    },
    rendered(evt) {
      this.setMaskStyle(evt)
      this.cprRenderChange(evt)
      this.renderSetWwWc(evt)
      this.drawLine()
    },
    // resize
    elementResize(evt) {
      this.viewResize()
      this.$nextTick(() => {
        this.transNarrow()
        this.setAnchorStyle()
      })
    },
    async slideImNumChange(val) {
      this.isHasLineDraw = false
      this.imNumChange(val)
    },
    // 拖拽
    dragStart(evt) {
      disbeledActiveTool('dcm-cpr', this.activeToolsName)
      document.onmousemove = (evt) => this.dargPointIndex(evt)
      document.onmouseup = (evt) => {
        document.onmousemove = null
        document.onmouseup = null
        enableActiveTool('dcm-cpr', this.activeToolsName)
      }
    },
    // 拖拽点
    dargPointIndex(evt) {
      if (centerLine && centerLine[this.angle]) {
        const moveY = evt.clientY - 79
        const element = document.getElementById('dcm-cpr')
        const pos = cornerstone.canvasToPixel(element, {
          x: 0,
          y: moveY
        })
        const posY = Math.floor(pos.y)
        this.cprPointIndex = posY
        this.cprPointChange()
      }
    },
    // 转换
    cprRenderChange(evt) {
      if (evt && evt.detail && evt.detail.element) {
        const content = cornerstone.getEnabledElement(this.dcmElement)
        const index = this.imageIds.findIndex(
          (item) => item === content.image.imageId
        )
        if (
          index >= 0 &&
          this.partDcms &&
          this.partDcms[this.activeArtery] &&
          this.partDcms[this.activeArtery].angles
        ) {
          const angle = this.partDcms[this.activeArtery].angles[index]
          if (this.angle !== angle) {
            this.angle = angle
          }
          this.transNarrow()
          this.setAnchorStyle()
        }
      }
    },
    // cpr点转换
    cprPointChange() {
      if (centerLine && centerLine[this.angle]) {
        const angleCenterLine = centerLine[this.angle]
        const cprToOri =
          angleCenterLine.cl_mapping_cpr_to_ori[this.cprPointIndex]
        if (!isEmpty(cprToOri)) {
          this.setAnchorStyle()
          if (cprToOri !== this.oriPointIndex) {
            arteryBus.emit('setOriPointIndex', cprToOri)
          }
        }
      }
    },
    // 点变化
    oriPointChange() {
      if (centerLine && centerLine[this.angle]) {
        const angleCenterLine = centerLine[this.angle]
        const cprPointIndex =
          angleCenterLine.cl_mapping_ori_to_cpr[this.oriPointIndex]
        if (!isEmpty(cprPointIndex)) {
          this.cprPointIndex = cprPointIndex
          this.setAnchorStyle()
        }
      }
    },
    // 设置 锚点的样式
    setAnchorStyle() {
      if (!this.isInitRender) {
        this.anchorStyle.display = 'none'
        return
      }
      if (centerLine && centerLine[this.angle]) {
        const angleCenterLine = centerLine[this.angle]
        // 获取cpr的pointIndex
        const cprPointIndex =
          angleCenterLine.cl_mapping_ori_to_cpr[this.oriPointIndex]
        // 获取位置
        const pos = angleCenterLine.cpr_coord[cprPointIndex]
        const [x, y] = angleCenterLine.normal_vector[cprPointIndex]
        // 获取角度
        const angle = Math.atan2(y, x)
        const deg = 90 - angle * (180 / Math.PI)

        const pixCtxPos = cornerstone.pixelToCanvas(this.dcmElement, {
          x: pos[0],
          y: pos[1]
        })

        this.anchorStyle = {
          left: `${pixCtxPos.x - 25}px`,
          top: `${pixCtxPos.y - 2}px`,
          transform: `rotateZ(${deg}deg)`,
          display: 'block'
        }
        this.cprPointIndex = cprPointIndex
      }
    },
    // 狭窄聚焦
    setNarrowActive(key) {
      if (key && this.drawNarrowList && this.drawNarrowList.length) {
        const activeItem = this.drawNarrowList.find((item) => item.key === key)
        if (!activeItem) {
          return
        }
        this.narrowActive = key

        arteryBus.emit('setNarrowActive', key)
      }
    },
    // 转换狭窄
    transNarrow() {
      if (!this.narrowList.length) {
        this.drawNarrowList = []
        return
      }
      let drawNarrowList = []
      if (centerLine && centerLine[this.angle]) {
        const angleCenterLine = centerLine[this.angle]
        const element = document.getElementById('dcm-cpr')
        for (const item of this.narrowList) {
          const cprPointIndex =
            angleCenterLine.cl_mapping_ori_to_cpr[item.oriIndex]
          const pos = angleCenterLine.cpr_coord[cprPointIndex]
          if (!pos) {
            continue
          }
          // 获取位置
          const { x, y } = cornerstone.pixelToCanvas(element, {
            x: pos[0],
            y: pos[1]
          })
          drawNarrowList.push({
            ...item,
            x: Number(x.toFixed(2)),
            y: Number(y.toFixed(2))
          })
        }
      }
      this.drawNarrowList = drawNarrowList
      drawNarrowList = null
    },
    // 狭窄样式
    narrowStyle(x, y) {
      if (x > this.viewWidth / 2) {
        return {
          right: `${this.viewWidth - x + 27}px`,
          top: `${y - 16}px`
        }
      } else {
        return {
          left: `${x + 30}px`,
          top: `${y - 16}px`
        }
      }
    },
    // 点击事件
    mouseClick(evt) {
      const mouseUpEvent = evt.detail.event
      this.isShowMenu = false
      if (!(evt.detail.currentPoints && evt.detail.currentPoints.image)) {
        return
      }
      if (mouseUpEvent.which === 3) {
        // if (isEmptyObj(centerLine)) {
        //   return
        // }
        // if (this.isArteryEdit) {
        //   return
        // }
        // this.menuEvent = mouseUpEvent
        // this.menus = [
        //   {
        //     label: '添加狭窄',
        //     click: () => {
        //       const { y } = evt.detail.currentPoints.image
        //       const posY = parseInt(y)
        //       const angleCenterLine = centerLine[this.angle]
        //       const labelToOri = angleCenterLine.cl_mapping_cpr_to_ori[posY]
        //       // 添加的cpr的标注的值
        //       arteryBus.emit('cprLabelIndex', labelToOri)
        //       this.isShowMenu = false
        //     }
        //   },
        //   {
        //     label: '取消',
        //     click: () => {
        //       this.isShowMenu = false
        //     }
        //   }
        // ]
        // // 显示右键菜单
        // this.$nextTick(() => {
        //   this.isShowMenu = true
        // })
      } else if (mouseUpEvent.which === 1) {
        // const { y } = evt.detail.currentPoints.image
        // const posY = parseInt(y)
        // const angleCenterLine = centerLine[this.angle]
        // const cprToOri = angleCenterLine.cl_mapping_cpr_to_ori[posY]
        // if (!isEmpty(cprToOri)) {
        //   this.setAnchorStyle()
        //   if (cprToOri !== this.oriPointIndex) {
        //     arteryBus.emit('setOriPointIndex', cprToOri)
        //   }
        // }
      }
    },
    // 右键取消标注
    cancalNarrow(evt, item) {
      this.isShowMenu = false
      this.menuEvent = evt
      this.menus = [
        {
          label: '移除狭窄',
          click: () => {
            arteryBus.emit('removeNarrow', item)
            this.isShowMenu = false
          }
        },
        {
          label: '取消',
          click: () => {
            this.isShowMenu = false
          }
        }
      ]

      // 显示右键菜单
      this.$nextTick(() => {
        this.isShowMenu = true
      })
    }
  }
}
</script>
