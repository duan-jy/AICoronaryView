<style lang="less" scoped>
.ori-anchor {
  display: block;
  width: 20px;
  height: 20px;
  line-height: 20px;
  text-align: center;
  position: absolute;
  transform-origin: center;
  margin-top: -10px;
  margin-left: -10px;
  z-index: 200;
  color: rgba(208, 30, 99, 1);
  font-size: 12px;
  pointer-events: none;
}

.setting-item {
  height: 45px;
  border-bottom: 1px solid #050d14;
  padding: 0 10px;
  color: #fff;
  font-size: 14px;
  background-color: #1c2541;
  display: flex;
  flex-direction: row;
  align-items: center;

  &:last-child {
    border-bottom: none;
  }

  .layout-title {
    font-size: 12px;
    color: #fff;
    line-height: 44px;
    display: block;
    width: 60px;
  }

  .setitem-input {
    flex: 1;
  }
}

.print-range {
  .el-radio {
    margin-right: 5px;
    color: #fff;
  }

  .range-input {
    flex: 1;
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;

    &.active {
      span {
        color: #3b7cff;
      }
    }

    >span {
      font-size: 12px;
    }
  }
}

.simple-btn {
  height: 30px;
  padding: 0 10px;
  // text-align: right;
  color: #f4721b;
  font-weight: bold;
  font-size: 12px;
  border: 1px solid #f4721b;
  line-height: 28px;
  border-radius: 4px;
  cursor: pointer;
  display: inline-block;
  margin-right: 10px;

  &:last-child {
    margin-right: 0;
  }

  &.cancle {
    color: #3b7cff;
    border-color: #3b7cff;
  }
}

.operate-item.icon-mask {
  background-color: #e9370e;

  &.is-show {
    background-color: #f4721b;
  }
}
</style>

<template>
  <div class="view-leftcontent dcm-ori dcm-view" @dblclick="viewScale(partElId)">
    <div class="dcm-content" id="dcm-ori" tabindex="-1" @mouseenter="partEnter" @mouseleave="partLeave">
      <canvas class="cornerstone-canvas"></canvas>
    </div>
    <div class="dcm-content-mask" id="ori-mask" :style="maskStyle">
      <canvas class="mask-canvas" id="ori-mask-canvas" :style="{
    display: isShowMask ? 'block' : 'none'
  }"></canvas>
    </div>
    <DcmSlide :slide-key="partElId" :max="imageIds.length" :slide-num="slideNum" :slide-height="viewHeight / 3"
      @slideImNumChange="slideImNumChange($event, true)" />
    <DcmMsg :part="part" :scale-key="partElId" :patientMsg="patientMsg" :imgIndex="imgIndex" :imageHu="imageHu"
      :windowWidth="windowWidth" :windowCenter="windowCenter" :show-push="false" :showRefresh="false"
      :showScale="!isFFR">
      <template v-slot:otherMsg>
        <div class="msg-item" v-if="imagePos.x && imagePos.y">
          X：{{ imagePos.x }} Y：{{ imagePos.y }}
        </div>
      </template>
      <template v-slot:default>
        <i v-show="isActvieMark" :class="['operate-item artery-icon icon-biaoji']" title="组合标记"
          @click.stop.prevent="markCombine" />
        <!-- <i
          :class="[
            'operate-item artery-icon icon-mask',
            isShowMask ? 'is-show' : ''
          ]"
          @click.stop.prevent="toShowMask"
          title="掩膜"
        /> -->
        <i class="operate-item artery-icon icon-dayin" title="打印" @click.stop.prevent="dialogVisible = true" />
      </template>
    </DcmMsg>
    <i class="ori-anchor artery-icon icon-shizix-copy" :style="anchorStyle" @mousemove="anchorMove" />
  </div>

  <el-dialog v-model="dialogVisible" title="打印设置" width="440px" custom-class="ori-print-dialog">
    <div class="setting-item print-range">
      <span class="layout-title">图像数量：</span>
      <span class="layout-title" style="color: #f4721b; font-weight: bold; font-size: 16px">
        {{ imageIds.length }}
      </span>
      <span class="layout-title" style="width: 70px">层厚(mm)：</span>
      <span class="layout-title" style="color: #f4721b; font-weight: bold; font-size: 16px">
        {{ sliceTinkness }}
      </span>
    </div>
    <div class="setting-item print-range">
      <span class="layout-title">打印范围：</span>
      <div class="range-radio">
        <el-radio v-model="printRange" :label="1" size="small"> 全部 </el-radio>
        <el-radio v-model="printRange" :label="2" size="small"> 当前 </el-radio>
        <el-radio v-model="printRange" :label="3" size="small" class="range-start-end">
        </el-radio>
      </div>
      <div :class="['range-input', printRange === 3 ? 'active' : '']">
        <span class="range-item">从</span>
        <el-input v-model="printStart" class="range-item" :disabled="printRange !== 3" type="number" :min="1" />
        <span class="range-item" style="margin-left: 5px">到</span>
        <el-input v-model="printEnd" class="range-item" :disabled="printRange !== 3" type="number" :min="1" />
      </div>
    </div>
    <div class="setting-item print-input">
      <span class="layout-title">打印间隔：</span>
      <el-input-number class="common-numberinput" v-model="printStep" :disabled="printRange === 2" :min="1" :max="20"
        size="small" />
    </div>
    <template #footer>
      <span class="dialog-footer">
        <div class="simple-btn cancle" @click="dialogVisible = false">取消</div>
        <el-button class="simple-btn printsimple-btn" size="small" @click="oriPrint">
          添加打印
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import { ElMessage } from 'element-plus'

import DcmMixin from '@/mixins/dcm'

import { loadCenterLine, transOriImLine } from '@/utils/artery'
import { loadImage, niftiImageId } from '@/utils/cornerstone'
import { niiload } from '@/api/index'

import arteryBus from '@/utils/arteryBus'

let allImages = {}
let imCenterLine = {} // ori 的im值对应的中心线数据
let centerLine = [] // 原始的centerLine数据
let maskCanvas = null
let maskCtx = null

function resetData() {
  // 将值重置为null 然后让内存回收
  allImages = null
  allImages = {}

  imCenterLine = null
  imCenterLine = {}

  centerLine = null
  centerLine = []

  maskCanvas = null
  maskCtx = null
}

export default {
  mixins: [DcmMixin],
  data() {
    return {
      part: 'Ori',
      isArtery: false,
      anchorStyle: {
        left: 0,
        top: 0,
        display: 'none'
      },
      imageHu: '',
      oriPointIndex: 0,
      isAllLoad: false,
      imagePos: {
        x: '',
        y: ''
      },
      dialogVisible: false,
      printRange: 1,
      printStart: '',
      printEnd: '',
      printStep: 1,
      sliceTinkness: '', // 层厚
      maskNiiUrl: null,
      isShowMask: false, // 是否显示掩膜
      maskStyle: {
        width: 0,
        height: 0,
        transform:
          'translate(-50%, -50%) scale(1) translate(0px, 0px) rotate(0deg)'
      }
    }
  },
  props: {
    linePath: {
      type: Object,
      default: () => ({})
    },
    maskPath: {
      type: String,
      default: ''
    }
  },
  created() {
    resetData()
    // 渲染列表变化
    arteryBus.on('renderedListChange', (list) => {
      this.loadALlDcms(list)
    })
    arteryBus.on('setOriPointIndex', (index) => {
      if (this.oriPointIndex !== index) {
        this.oriPointIndex = index
        this.oriPointChange()
      }
    })
    window.addEventListener('beforeunload', () => {
      console.log('ORI-beforeunload')
      arteryBus.off('*')
      resetData()
      window.removeEventListener('beforeunload', () => { }) // 移除这个监听
    })
  },
  beforeUnmount() {
    resetData()
  },
  methods: {
    toShowMask() {
      this.isShowMask = !this.isShowMask
      this.$nextTick(() => {
        this.loadMask()
      })
    },
    // 加载mask nii
    async loadMaskNii() {
      return new Promise(async (resolve, reject) => {
        try {
          if (!this.maskPath) {
            reject(new Error('now mask path'))
            return
          }
          if (this.maskNiiUrl) {
            resolve()
            return
          }
          const url = niiload(`${this.workingPath}/${this.maskPath}`)
          const imageObj = niftiImageId.fromURL(`nifti:${url}`)
          this.maskNiiUrl = niftiImageId.fromURL(`nifti:${imageObj.filePath}#z`)
          // 要先加载图像
          const imageId = this.maskNiiUrl.url
          await loadImage(imageId)
          resolve()
        } catch (error) {
          reject(error)
        }
      })
    },
    async loadMask() {
      await this.loadMaskNii()
      if (!this.isShowMask) {
        return
      }
      if (!maskCanvas) {
        maskCanvas = document.getElementById('ori-mask-canvas')
        maskCtx = maskCanvas.getContext('2d')
        maskCtx.fillStyle = 'rgba(255, 255, 255, 0)'
        maskCtx.globalAlpha = 0
      }
      const numberOfSlices_z = cornerstone.metaData.get(
        'multiFrameModule',
        this.maskNiiUrl.url
      ).numberOfFrames
      // 加载掩膜
      const maskId = `nifti:${this.maskNiiUrl.filePath}#${this.maskNiiUrl.slice.dimension
        }-${numberOfSlices_z - this.imgIndex},t-0`
      const maskImage = await loadImage(maskId)
      const { rows, columns } = maskImage
      maskCanvas.width = columns
      maskCanvas.height = rows
      let pixelData = maskImage.getPixelData()
      const length = pixelData.length
      let imageDataArr = new Uint8ClampedArray(length * 4)
      const colors = [
        [0, 0, 0, 0],
        [255, 0, 0, 102],
        [0, 255, 0, 102]
      ]
      // 进行翻转
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
          const index = i * rows + (columns - 1 - j)
          const n = (i * rows + j) * 4
          if (pixelData[index] === 0) {
            continue
          }
          const color = colors[pixelData[index]]
          imageDataArr[n] = color[0]
          imageDataArr[n + 1] = color[1]
          imageDataArr[n + 2] = color[2]
          imageDataArr[n + 3] = color[3]
        }
      }
      let imageData = new ImageData(imageDataArr, columns, rows)
      maskCtx.putImageData(imageData, 0, 0)
      pixelData = null
      imageDataArr = null
      imageData = null
    },
    async arteryChange() {
      // 清除之前的数据
      imCenterLine = null
      imCenterLine = {}

      centerLine = null
      centerLine = []

      this.$emit('setRenderedList', this.part, 'remove')
      this.isInitRender = false
      // 中心线数据
      const { ori_image_coord } = await loadCenterLine(
        this.linePath,
        this.activeArtery,
        this.workingPath
      )
      centerLine = ori_image_coord

      imCenterLine = transOriImLine(ori_image_coord)
      if (!centerLine.length) {
        this.$message.error('无中心线数据，请联系管理员')
        return
      }
      const firstIm = Math.round(centerLine[0][2])
      // 隐藏
      this.anchorStyle.display = 'none'

      // 加载图像
      await this.lodaDcms(firstIm)
      // 画十字
      const { point } = this.getPoint(firstIm)
      this.setAnchorStyle(point)
    },
    // 加载图像
    lodaDcms(initIm) {
      return new Promise(async (resolve, reject) => {
        if (this.imageIds.length) {
          this.$emit('setRenderedList', this.part, 'add')
          this.isInitRender = true
          this.slideImNumChange(this.imageIds.length - (initIm - 1))
          resolve()
          return
        }
        try {
          await this.loadDcmFiles(initIm)
          await this.loadMaskNii()
          resolve()
        } catch (error) {
          reject(error)
        }
      })
    },

    async slideImNumChange(val, isUpdate = true) {
      if (!this.isInitRender || this.slideNum === val) {
        return
      }
      // 向上还是向下
      const updown = this.slideNum > val ? 2 : 1
      this.slideNum = val
      // const element = document.getElementById(id)
      const imageIndex = this.imageIds.length - val
      const imageId = this.imageIds[imageIndex]
      let image = null
      // 从缓存中取出
      // const key = `Ori_image_${imageIndex}`
      // if (key in allImages) {
      //   image = allImages[key]
      // } else {
      //   // allImages[key] = image
      // }
      console.log('加载图像')
      image = await loadImage(imageId)
      cornerstone.displayImage(this.dcmElement, image)
      // this.loadMask()
      // 设置移动锚点
      const im = this.imgIndex
      const { index, point } = this.getPoint(im, updown)
      // image = null
      // 图像
      if (!point) {
        this.anchorStyle.display = 'none'
        return
      }
      if (index !== this.oriPointIndex && isUpdate) {
        arteryBus.emit('setOriPointIndex', index)
      }
      this.setAnchorStyle(point)
    },
    // 转换值
    oriPointChange() {
      if (centerLine && centerLine.length && centerLine[this.oriPointIndex]) {
        // 在中心线上找到这个点
        const point = centerLine[this.oriPointIndex]
        const z = point[2]
        const im = Math.round(z)

        if (Number(this.imgIndex) !== im) {
          this.slideImNumChange(this.imageIds.length - (im - 1), false)
        } else {
          const { point } = this.getPoint(im)
          this.setAnchorStyle(point)
        }
      }
    },
    // 设置十字线信息
    setAnchorStyle(point) {
      if (!point) {
        return
      }
      if (!this.isInitRender) {
        return
      }
      const element = document.getElementById('dcm-ori')
      const { x, y } = cornerstone.pixelToCanvas(element, point)
      this.anchorStyle = {
        left: `${x}px`,
        top: `${y}px`,
        display: 'block'
      }
    },
    // 获取点
    getPoint(im, updown = 0) {
      // 如果向上就是1 向下就是2 ，无变化就是0
      let point = null
      let index = this.oriPointIndex
      if (imCenterLine && imCenterLine[im]) {
        if (this.oriPointIndex in imCenterLine[im]) {
          index = this.oriPointIndex
        } else {
          const keys = Object.keys(imCenterLine[im])
          if (updown === 0) {
            index = keys[0]
          } else {
            // 根据向上向下取一个最近的点
            if (updown === 1) {
              const diff = keys
                .map((item) => this.oriPointIndex - Number(item))
                .filter((item) => item >= 0)
                .sort()[0]
              index = this.oriPointIndex - diff
            } else {
              const diff = keys
                .map((item) => Number(item) - this.oriPointIndex)
                .filter((item) => item >= 0)
                .sort()[0]
              index = this.oriPointIndex + diff
            }
          }
        }
        point = imCenterLine[im][index]
      }
      index = Number(index)
      return {
        point,
        index
      }
    },
    // 渲染信息
    rendered(evt) {
      this.setMaskStyle(evt)
      const { point } = this.getPoint(this.imgIndex)
      if (point) {
        this.setAnchorStyle(point)
      }
      this.renderSetWwWc(evt)
      if (!this.sliceTinkness && evt && evt.detail && evt.detail.image) {
        this.sliceTinkness = evt.detail.image.data.string('x00180050')
      }
    },
    // resize
    elementResize(evt) {
      this.viewResize()
      this.$nextTick(() => {
        const { point } = this.getPoint(this.imgIndex)
        this.setAnchorStyle(point)
      })
    },
    // 在标线上移动
    anchorMove(evt) {
      if (!this.isInitRender) {
        return
      }
      const { x, y } = cornerstone.canvasToPixel(this.dcmElement, {
        x: evt.clientX - 99,
        y: evt.clientY - 79
      })
      this.getImageHU(x, y)
    },
    // 鼠标移动
    mouseMove(evt) {
      if (evt && evt.detail && evt.detail.element) {
        const { x, y } = evt.detail.lastPoints.image
        this.getImageHU(x, y)
      }
    },
    // 获取图像的anchorMove
    getImageHU(x, y) {
      const pointPx = cornerstone.getPixels(this.dcmElement, x, y, 1, 1)
      let hu = pointPx && pointPx.length ? pointPx[0] : ''
      hu = Number.isNaN(hu) ? '' : hu
      this.imageHu = hu + ''
      this.imagePos = {
        x: x.toFixed(2),
        y: y.toFixed(2)
      }
    },
    // 把原始图像的所有图像缓存起来
    async loadALlDcms(list) {
      if (this.isAllLoad) {
        return
      }
      list = list ? list.split(',') : []
      if (
        list.includes('Ori') &&
        list.includes('SPR') &&
        list.includes('CPR') &&
        list.includes('PROBE') &&
        list.includes('ARTERY-THREE')
      ) {
        this.isAllLoad = true
        // 加载全部原始图像
        // 分段加载针对网速低的时候，有时候滚动出现白色
        // const step = 3
        // const arr = Array.from(
        //   { length: Math.ceil(this.imageIds.length / step) },
        //   (v, i) => i
        // )
        // for (const index of arr) {
        //   const slicePromise = this.imageIds
        //     .slice(index * step, (index + 1) * step)
        //     .map(async(item) => loadImage(item))
        //   const images = await Promise.all(slicePromise)
        //   for (const image of images) {
        //     const imgIndex = this.imageIds.indexOf(image.imageId)
        //     const key = `Ori_image_${imgIndex}`
        //     // if (!(key in allImages)) {
        //     //   allImages[key] = image
        //     // }
        //   }
        // }
        ElMessage.success('图像加载完成')
      }
    },
    setpStartEnd(start, end, step = 1) {
      const arr = []
      for (let i = start; i < end; i += step) {
        arr.push(i)
      }
      if (!arr.includes(end)) {
        arr.push(end)
      }
      return arr
    },
    oriPrint() {
      let indexs = []
      if (this.printRange === 1) {
        indexs = this.setpStartEnd(0, this.imageIds.length - 1, this.printStep)
      } else if (this.printRange === 3) {
        let start = Number(this.printStart)
        let end = Number(this.printEnd)
        if (start > end) {
          ElMessage.warning('请输入正确的范围')
          return
        }
        start = start < 1 ? 1 : start
        end = end > this.imageIds.length ? this.imageIds.length : end
        indexs = this.setpStartEnd(start - 1, end - 1, this.printStep)
      } else {
        indexs = [this.imgIndex - 1]
      }
      // if(this.)
      for (const index of indexs) {
        arteryBus.emit('pushDcmToPD', {
          part: this.part,
          index,
          isArtery: this.isArtery,
          windowWidth: this.windowWidth,
          windowCenter: this.windowCenter,
          type: 'D',
          isShowMsg: false
        })
      }
      ElMessage.success('添加打印成功')
      this.dialogVisible = false
    }
  }
}
</script>
