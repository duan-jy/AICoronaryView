<style lang="less" scoped>
.spr-scale {
  position: absolute;
  display: inline-block;
  height: 100%;
  left: 0;
  top: 0;
  z-index: 1000;
  cursor: pointer;
  .spr-line {
    width: 2px;
    float: left;
    margin-right: 2px;
    height: 100%;
    // background-color: #0ac8f8;

    &:last-child {
      margin-right: 0;
    }
    &-index1,
    &-index-1 {
      background-image: linear-gradient(
        180deg,
        #0ac8f8,
        rgba(3, 172, 146, 0) 30%,
        rgba(3, 172, 146, 0) 70%,
        #0ac8f8
      );
    }
    &-index2,
    &-index-2 {
      // background-color: #e9370e;
      background-image: linear-gradient(
        180deg,
        #0ac8f8,
        rgba(255, 101, 0, 0) 20%,
        rgba(255, 101, 0, 0) 80%,
        #0ac8f8
      );
    }
    &-index0 {
      // background-color: #e9370e;
      background-image: linear-gradient(
        180deg,
        #e9370e,
        rgba(255, 101, 0, 0) 40%,
        rgba(255, 101, 0, 0) 60%,
        #e9370e
      );
    }
  }
}

.section {
  position: absolute;
  height: 12px;
  top: 50%;
  margin-top: 6px;
  display: inline-block;
  user-select: none;
  .section-item {
    border: 1px solid rgb(141, 141, 141);
    border-top: none;
    border-left: none;
    float: left;
    color: #fff;
    text-align: center;
    font-size: 10px;
    height: 12px;
    line-height: 42px;
    &:first-child {
      border-left: 1px solid rgb(141, 141, 141);
    }
    user-select: none;
  }
}

.spr-narrow {
  > div {
    position: absolute;
    z-index: 800;
    background-color: #5c5c5c;
    top: 50%;
  }
  &.active {
    > div {
      background-color: #e9370e;
      z-index: 801;
    }
  }
  &.odd {
    .narrow-line {
      margin-top: -28px;
    }
    .narrow-label {
      margin-top: -34px;
    }
    .narrow-level-line {
      margin-top: -28px;
    }
  }
  &.even {
    .narrow-line {
      margin-top: 10px;
      height: 28px;
    }
    .narrow-label {
      margin-top: 32px;
    }
    .narrow-level-line {
      margin-top: 38px;
    }
  }
  .narrow-line {
    width: 1px;
    height: 25px;
  }
  .narrow-level-line {
    height: 1px;
    width: 10px;
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
</style>
<template>
  <div class="dcm-view view-bt" @dblclick="viewScale(partElId)">
    <div
      class="dcm-content"
      id="dcm-spr"
      tabindex="-1"
      @mouseenter="partEnter"
      @mouseleave="partLeave"
    >
      <canvas class="cornerstone-canvas" id="spr-cornerstone-canvas"></canvas>
    </div>
    <DcmSlide
      :slide-key="partElId"
      :max="imageIds.length"
      :slide-num="slideNum"
      :slide-height="viewHeight / 3"
      @slideImNumChange="slideImNumChange"
    />
    <DcmMsg
      :part="part"
      :scale-key="partElId"
      :imgIndex="imgIndex"
      :windowWidth="windowWidth"
      :windowCenter="windowCenter"
      @refreshImage="refreshImage"
    >
      <template v-slot:default>
        <i
          v-show="isActvieMark"
          class="operate-item artery-icon icon-biaoji"
          title="组合标记"
          @click.stop.prevent="markCombine"
        />
      </template>
    </DcmMsg>

    <div
      v-show="isShowScale"
      id="spr-scale"
      class="spr-scale"
      :style="scaleStyle"
      @mousedown="dragStart"
      @mousewheel="mouseWheel($event)"
    >
      <div
        v-for="item in scaleLines"
        :key="`spr_scaleLine_${item}`"
        :class="['spr-line', `spr-line-index${item}`]"
      />
    </div>

    <ul
      v-if="sectionList.length"
      class="section"
      :style="{
        left: `${sectionList[0].left}px`
      }"
    >
      <li
        v-for="item in sectionList"
        :key="item.name"
        class="section-item"
        :style="{
          width: `${item.width}px`
        }"
      >
        {{ item.name }}
      </li>
    </ul>

    <div
      v-for="(item, index) in drawNarrowList"
      :key="`spr_narrow${item.id}`"
      :class="[
        'spr-narrow',
        index % 2 ? 'odd' : 'even',
        item.key === narrowActive ? 'active' : ''
      ]"
      @mousewheel="mouseWheel($event)"
    >
      <div
        v-show="showAI"
        class="narrow-line"
        :style="{
          left: `${item.x}px`
        }"
      />
      <div
        v-show="showAI"
        class="narrow-level-line"
        :style="{
          left: `${item.x > viewWidth / 2 ? item.x - 10 : item.x}px`
        }"
      />
      <div
        v-show="showAI"
        class="narrow-label"
        :style="narrowStyle(item.x)"
        @click.stop="setNarrowActive(item.key)"
        @contextmenu.stop.prevent="cancalNarrow($event, item)"
      >
        {{ item.label }}
      </div>
    </div>
  </div>
  <!--添加标注-->
  <vue3-menus
    v-model:open="isShowMenu"
    :menus="menus"
    :event="menuEvent"
    :zIndex="1001"
    hasIcon
  />
  <el-dialog title="添加标注" v-model="dialogVisible" width="500px">
    <el-form
      ref="lableForm"
      :model="lableForm"
      :rules="labelRules"
      label-width="120px"
      class="demo-ruleForm"
      label-position="left"
    >
      <el-form-item prop="plaque_type" label="斑块类型">
        <el-select v-model="lableForm.plaque_type" placeholder="请选择">
          <el-option label="钙化斑块" value="1" />
          <el-option label="非钙化斑块" value="2" />
          <el-option label="混合斑块" value="3" />
          <el-option label="支架" value="4" />
        </el-select>
      </el-form-item>
      <el-form-item prop="strait_factor" label="狭窄程度（%）">
        <el-input
          v-model="lableForm.strait_factor"
          placeholder="请输入狭窄占比（1-100）"
          type="number"
          :min="1"
          :max="100"
        />
      </el-form-item>
      <el-form-item prop="start" label="开始位置">
        <el-input v-model="lableForm.start" type="number" min="0" disabled />
      </el-form-item>
      <el-form-item prop="end" label="结束位置">
        <el-input v-model="lableForm.end" type="number" min="0" disabled />
      </el-form-item>
    </el-form>
    <template v-slot:footer>
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="commitLabel">确 定</el-button>
    </template>
  </el-dialog>
</template>

<script>
import DcmMixin from '@/mixins/dcm'

import { v4 as uuidv4 } from 'uuid'

import arteryBus from '@/utils/arteryBus'

import {
  loadCenterLine,
  SLICE_STEP,
  getSliceZ,
  getNearSliceZ
} from '@/utils/artery'

import { disbeledActiveTool, enableActiveTool } from '@/utils/cornerstone'
import { isEmpty, isEmptyObj } from '@/utils/validate'

import { narrowObj, arteryName, plaqueVObj } from '@/utils/source'
import { mapGetters } from 'vuex'

// const { getters } = cornerstoneTools.getModule('segmentation')

let centerLine = {}

function resetData() {
  centerLine = null
  centerLine = {}
}

export default {
  mixins: [DcmMixin],
  data() {
    return {
      part: 'SPR',
      viewWidth: 0, // 宽度
      isLoop: true,
      isShowScale: false,
      imageScale: 1, // 1
      sliceZ: [],
      scaleActive: 0,
      scaleLines: [],
      scaleLeft: 0, // 左侧值
      oriPointIndex: 0, // 原始图像值
      sectionList: [], // 分段的list
      narrowResult: [], // 狭窄结果
      narrowActive: '', // 聚焦的狭窄
      drawNarrowList: [], // 画狭窄的
      isShowMenu: false,
      menus: [],
      menuEvent: null,
      dialogVisible: false, // 表单
      lableForm: {
        plaque_type: '',
        strait_factor: '',
        start: '',
        end: ''
      },
      labelRules: {
        plaque_type: [
          { required: true, message: '请选择斑块类型', trigger: 'blur' }
        ],
        strait_factor: [
          { required: true, message: '请选择狭窄程度', trigger: 'blur' }
        ]
      },
      isArteryEdit: false,
      showAI: true
    }
  },
  props: {
    linePath: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    ...mapGetters(['rawArteryList']),
    scaleStyle() {
      return {
        transform: `translate(${this.scaleLeft}px, 0px)`
      }
    }
  },
  created() {
    resetData()
    // 渲染列表
    arteryBus.on('renderedListChange', (list) => {
      this.loadData(list)
    })
    // 设置线
    arteryBus.on('setScaleLines', (lines) => {
      this.scaleLines = lines
    })
    // 设置聚焦的线
    arteryBus.on('setScaleActive', (activeIndex) => {
      if (this.scaleActive !== activeIndex) {
        this.scaleActive = activeIndex
        this.emitSprToOri(activeIndex)
        // 设置线
        this.setScaleLeft()
      }
    })
    // 监听原始pointindex的变化
    arteryBus.on('setOriPointIndex', (index) => {
      if (this.oriPointIndex !== index) {
        this.oriPointIndex = index
        this.oriPointChange()
      }
    })
    // 监听狭窄结果
    arteryBus.on('setNarrowVesselResult', (result) => {
      this.narrowResult = result
      this.transNarrowResult()
    })

    arteryBus.on('setNarrowActive', (key) => {
      if (this.narrowActive !== key) {
        this.narrowActive = key || ''
        this.setNarrowActive(key)
      }
    })

    // cpr标注
    arteryBus.on('cprLabelIndex', this.cprLabelLisenter)

    // 是否在编辑状态
    arteryBus.on('editArtery', (isEdit) => {
      this.isArteryEdit = isEdit
    })

    // 是否显示AI
    arteryBus.on('toShowAI', (showAI) => {
      this.showAI = showAI
    })
    window.addEventListener('beforeunload', () => {
      console.log('SPR-beforeunload')
      arteryBus.off('*')
      resetData()
      window.removeEventListener('beforeunload', () => {}) // 移除这个监听
    })
  },
  beforeUnmount() {
    resetData()
  },
  methods: {
    // 清空数据
    arteryChange() {
      resetData()
      this.sliceZ = []
      this.scaleLines = []
      this.drawNarrowList = []
      this.sectionList = []
      this.imageIds = []
      this.scaleActive = 0
      this.oriPointIndex = 0
      this.isInitRender = false
      this.isShowScale = false
      this.narrowActive = ''
      this.$emit('setRenderedList', this.part, 'remove')
    },
    // 加载数据
    async loadData(list) {
      list = list ? list.split(',') : []
      if (list.includes('Ori') && list.includes('CPR') && !this.isInitRender) {
        const image = await this.loadDcmFiles()
        centerLine = await loadCenterLine(
          this.linePath,
          this.activeArtery,
          this.workingPath
        )
        // 获取sliceZ
        this.sliceZ = getSliceZ(image.columns)
        // 设置聚焦点
        const startIndex = centerLine.start_index || 0
        const nearIndex = getNearSliceZ(startIndex)
        this.scaleActive = nearIndex
        this.setScaleLeft()
        this.emitSprToOri(nearIndex)
        // 提交数据
        arteryBus.emit('setScaleActive', nearIndex)
        // 设置分段
        this.setSection()
        // 设置狭窄
        this.transNarrowResult()
      }
    },
    // 渲染信息
    rendered(evt) {
      this.renderSetWwWc(evt)
    },
    // 变化
    elementResize(evt) {
      this.viewResize()
      this.$nextTick(() => {
        this.narrowChange()
        this.setSection()
        this.setScaleLeft()
      })
    },
    // 点变化
    oriPointChange() {
      if (centerLine && centerLine.cl_mapping_ori_to_spr) {
        const oriToSpr = centerLine.cl_mapping_ori_to_spr[this.oriPointIndex]
        // 保证有值
        if (!isEmpty(oriToSpr) && this.sliceZ && this.sliceZ.length) {
          const nearIndex = getNearSliceZ(oriToSpr)
          // 找到狭窄
          if (this.drawNarrowList && this.drawNarrowList.length) {
            const findNarrow = this.drawNarrowList.find(
              (item) => item.nearIndex === nearIndex
            )
            // 狭窄聚焦
            const narrowActive = findNarrow ? findNarrow.key : ''
            this.narrowActive = narrowActive

            arteryBus.emit('setNarrowActive', narrowActive)
          }
          this.scaleActive = nearIndex
          this.setScaleLeft()
          // 提交
          arteryBus.emit('setScaleActive', nearIndex)
        }
      }
    },
    // 拖拽
    dragStart(evt) {
      disbeledActiveTool('dcm-spr', this.activeToolsName)
      document.onmousemove = (evt) => this.moveScale(evt)
      document.onmouseup = (evt) => {
        document.onmousemove = null
        document.onmouseup = null
        enableActiveTool('dcm-spr', this.activeToolsName)
      }
    },
    // 获取值
    emitSprToOri(index) {
      if (
        this.sliceZ.length &&
        index <= this.sliceZ.length - 1 &&
        centerLine &&
        centerLine.cl_mapping_spr_to_ori
      ) {
        const sliceNum = this.sliceZ[0] - this.sliceZ[index]
        const sprToOri = centerLine.cl_mapping_spr_to_ori[sliceNum]
        if (!isEmpty(sprToOri) && sprToOri !== this.oriPointIndex) {
          arteryBus.emit('setOriPointIndex', sprToOri)
        }
      }
    },
    // 移动刻度尺
    moveScale(evt) {
      if (this.sliceZ && this.sliceZ.length) {
        const element = document.getElementById('dcm-spr')
        const { x } = cornerstone.canvasToPixel(element, {
          x: evt.clientX - 111, // 减去左侧的数据
          y: 0
        })
        const diffNum = Math.floor(x)
        if (diffNum > this.sliceZ[0] || diffNum < 0) {
          return
        }
        const nearIndex = getNearSliceZ(diffNum)
        this.emitSprToOri(nearIndex)
      }
    },
    // 设置标尺的左侧值
    setScaleLeft() {
      if (this.isInitRender) {
        const element = document.getElementById('dcm-spr')
        const viewport = cornerstone.getViewport(element)
        const viewScale = viewport.scale
        const sliceZActive = this.sliceZ[0] - this.sliceZ[this.scaleActive]
        const pos = cornerstone.pixelToCanvas(element, {
          x: sliceZActive,
          y: 0
        })
        if (pos && 'x' in pos) {
          const leftNum = this.scaleActive - 2 > 0 ? 2 : this.scaleActive
          const scaleLeft = pos.x - leftNum * 4 - 1
          this.scaleLeft = Number(scaleLeft.toFixed(2))
          this.imageScale = Number(viewScale.toFixed(2))
          this.isShowScale = true
        }
      } else {
        this.isShowScale = false
      }
    },
    // 设置分段信息
    setSection() {
      if (!this.isInitRender) {
        return
      }
      const arteryItem = this.rawArteryList.find(
        (item) => item.id === this.activeArtery
      )
      if (
        arteryItem &&
        arteryItem.subsections &&
        arteryItem.subsections.length
      ) {
        const element = document.getElementById('dcm-spr')
        const oriToSpr = centerLine.cl_mapping_ori_to_spr
        const list = arteryItem.subsections
          .map((item) => {
            // 使用原始图像上的点找到spr上的点
            const start_index = oriToSpr[item.start_cl_idx]
            const end_index = oriToSpr[item.end_cl_idx]
            return {
              ...item,
              start_index,
              end_index
            }
          })
          .sort((a, b) => a.start_index - b.start_index)
          .map((item) => {
            const start = cornerstone.pixelToCanvas(element, {
              x: item.start_index,
              y: 0
            })
            const end = cornerstone.pixelToCanvas(element, {
              x: item.end_index,
              y: 0
            })
            let startX = start.x
            startX = Number(startX.toFixed(2))
            let width = end.x - start.x
            width = Number(width.toFixed(2))
            return {
              left: startX,
              width,
              name: item.name
            }
          })
        this.sectionList = list
      } else {
        this.sectionList = []
      }
    },
    // 设置狭窄聚焦
    setNarrowActive(key) {
      if (!key) {
        this.narrowActive = ''
        return
      }

      if (this.drawNarrowList && this.drawNarrowList.length) {
        const activeItem = this.drawNarrowList.find((item) => item.key === key)
        if (!activeItem) {
          return
        }
        const nearIndex = activeItem.nearIndex
        this.emitSprToOri(nearIndex)

        arteryBus.emit('setNarrowActive', key)
      }
    },
    // 狭窄
    transNarrowResult() {
      if (
        !this.narrowResult.length ||
        isEmptyObj(centerLine) ||
        !this.sliceZ.length ||
        !this.isInitRender
      ) {
        return
      }

      const narrowList = []
      const drawNarrowList = []
      let resultList = []
      const result = this.narrowResult.find(
        (item) => item.id === this.activeArtery
      )
      if (result && result.list) {
        resultList = result.list.filter((item) => item.checked && item.location)
      }
      if (resultList.length) {
        const element = document.getElementById('dcm-spr')
        for (const item of resultList) {
          // const middle = Math.round((item.start + item.end) / 2)
          const nearIndex = getNearSliceZ(item.pointer)
          const sliceNum = this.sliceZ[0] - this.sliceZ[nearIndex]
          // if (centerLine.cl_mapping_spr_to_ori) {
          if (
            centerLine.cl_mapping_spr_to_ori &&
            centerLine.cl_mapping_spr_to_ori[sliceNum]
          ) {
            const label =
              item.plaque_strait === -1
                ? `${plaqueVObj[item.plaque_type]}`
                : `${narrowObj[item.plaque_strait]}`
            // const label = `${narrowObj[item.plaque_strait]}`
            const { x } = cornerstone.pixelToCanvas(element, {
              x: sliceNum,
              y: 0
            })
            // 画的狭窄
            drawNarrowList.push({
              id: item.id,
              key: item.key,
              nearIndex,
              arteryId: item.arteryId,
              x: Number(x.toFixed(2)),
              label
            })

            const sprToOri = centerLine.cl_mapping_spr_to_ori[sliceNum]
            // 狭窄列表
            narrowList.push({
              id: item.id,
              key: item.key,
              oriIndex: sprToOri,
              arteryId: item.arteryId,
              label
            })
          }
        }
      }
      this.drawNarrowList = drawNarrowList
      arteryBus.emit('setNarrowList', narrowList)
      if (this.narrowActive) {
        // 聚焦的狭窄
        this.setNarrowActive(this.narrowActive)
      }
    },
    // 狭窄更改
    narrowChange() {
      if (
        !this.narrowResult.length ||
        isEmptyObj(centerLine) ||
        !this.sliceZ.length ||
        !this.isInitRender
      ) {
        return
      }
      const element = document.getElementById('dcm-spr')
      this.drawNarrowList.forEach((item) => {
        const sliceNum = item.nearIndex * SLICE_STEP
        const { x } = cornerstone.pixelToCanvas(element, {
          x: sliceNum,
          y: 0
        })
        item.x = Number(x.toFixed(2))
      })
    },
    narrowStyle(x) {
      if (x > this.viewWidth / 2) {
        return {
          right: `${this.viewWidth - x + 10}px`
        }
      } else {
        return {
          left: `${x + 10}px`
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
        // if (this.isArteryEdit) {
        //   return
        // }
        // this.menuEvent = mouseUpEvent
        // this.menus = [
        //   {
        //     label: '添加狭窄',
        //     click: () => {
        //       const { x } = evt.detail.currentPoints.image
        //       this.lableForm.start = parseInt(x - SLICE_STEP)
        //       this.lableForm.end = parseInt(x + SLICE_STEP)
        //       this.isShowMenu = false
        //       this.dialogVisible = true
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
        const { x } = evt.detail.currentPoints.image
        const nearIndex = getNearSliceZ(x)
        this.scaleActive = nearIndex
        this.setScaleLeft()
        this.emitSprToOri(nearIndex)
        // 提交数据
        arteryBus.emit('setScaleActive', nearIndex)
      }
    },
    // 监听cpr的标注
    cprLabelLisenter(index) {
      if (isEmptyObj(centerLine)) {
        return
      }
      const sprIndex = centerLine.cl_mapping_ori_to_spr[index]
      this.lableForm.start = parseInt(sprIndex - SLICE_STEP)
      this.lableForm.end = parseInt(sprIndex + SLICE_STEP)
      this.dialogVisible = true
    },
    // 提交标注
    commitLabel() {
      this.$refs.lableForm.validate(async(valid) => {
        if (valid) {
          try {
            const strait_factor = Number(this.lableForm.strait_factor)
            const percent = strait_factor / 100
            const plaque_strait = Math.floor(percent / 0.25)
            const id = uuidv4()
            const rawArtery = this.rawArteryList.find(
              (item) => item.id === this.activeArtery
            )
            const artery = rawArtery.name
            // 提交数据
            arteryBus.emit('addNarrowLabel', {
              arteryId: this.activeArtery,
              artery: artery,
              data: {
                ...this.lableForm,
                id,
                plaque_type: Number(this.lableForm.plaque_type),
                plaque_strait,
                strait_factor,
                strait_percent: percent,
                location: artery,
                checked: true,
                key: `narrow-${artery}-${id}`,
                cnName: arteryName[artery],
                isInArtery: true
              }
            })
            // 重置数据
            this.lableForm = {
              plaque_type: '',
              strait_factor: '',
              start: '',
              end: ''
            }
            this.dialogVisible = false
          } catch (error) {
            this.$message.error('添加失败')
          }
        } else {
          return false
        }
      })
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
