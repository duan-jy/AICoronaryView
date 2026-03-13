<style lang="less" scoped>
.artery-icon {
  &.icon-xinzang {
    font-size: 18px;
    background-color: #1c2541;

    &.active {
      background-color: #223368;
    }
  }
}
</style>
<template>
  <div class="artery-three" @dblclick="viewScale('artery-3d')">
    <div id="dcm-mip_inv" class="dcm-content" tabindex="-1" @mouseenter="partEnter" @mouseleave="partLeave">
      <canvas class="cornerstone-canvas"></canvas>
    </div>
    <DcmSlide :slideKey="partElId" :max="imageIds.length" :slideNum="slideNum" :slideHeight="viewHeight / 3"
      @slideImNumChange="slideImNumChange" />
    <DcmMsg :part="part" :partKey="'MIP_Inv'" scale-key="artery-3d" :hasBlTools="true" :patientMsg="patientMsg"
      :imgIndex="imgIndex" :windowWidth="windowWidth" :windowCenter="windowCenter" @refreshImage="refreshImage">
      <i v-show="isActvieMark" :class="['operate-item artery-icon icon-biaoji']" title="组合标记"
        @click.stop.prevent="markCombine" />
    </DcmMsg>
  </div>
</template>

<script>
import DcmMixin from '@/mixins/dcm'

import { loadImage } from '@/utils/cornerstone'

import { dcmload } from '@/api/index'

import arteryBus from '@/utils/arteryBus'

let timeId = null
let timeId1 = null
let timeId2 = null

function resetData() {
  if (timeId !== null) {
    clearTimeout(timeId)
  }
  timeId = null
  if (timeId1 !== null) {
    clearTimeout(timeId1)
  }
  timeId1 = null
  if (timeId2 !== null) {
    clearTimeout(timeId1)
  }
  timeId2 = null
}

export default {
  mixins: [DcmMixin],
  props: {
    partHeartDcms: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      part: 'MIP_Inv',
      isArtery: false,
      isLoop: true,
      heartShow: false,
      isSyncWwWc: false
    }
  },
  watch: {
    scaleView(newVal, oldVal) {
      this.resizeView()
    },
    isVertical() {
      this.resizeView()
    }
  },
  computed: {
    partHeartImgIds() {
      const files = this.partHeartDcms.DCMS || []
      return files.map((item) => dcmload(`${this.workingPath}/${item}`, false))
    },
    partImagIds() {
      const files = this.partDcms.DCMS || []
      return files.map((item) => dcmload(`${this.workingPath}/${item}`, false))
    }
  },
  created() {
    resetData()
    arteryBus.on('renderedListChange', (list) => {
      this.loadData(list)
    })
    window.addEventListener('beforeunload', () => {
      console.log('MIP-INV-beforeunload')
      arteryBus.off('*')
      resetData()
      window.removeEventListener('beforeunload', () => { }) // 移除这个监听
    })
  },
  beforeUnmount() {
    resetData()
  },
  methods: {
    loadData(list) {
      if (this.isInitRender) {
        return
      }
      list = list ? list.split(',') : []
      if (
        list.includes('Ori') &&
        list.includes('SPR') &&
        list.includes('CPR') &&
        list.includes('PROBE')
      ) {
        this.loadDcmFiles()
      }
    },
    loadDcmFiles(initIm = 1) {
      // eslint-disable-next-line no-async-promise-executor
      return new Promise(async (resolve, reject) => {
        try {
          const imageIds = this.heartShow
            ? this.partHeartImgIds
            : this.partImagIds
          if (!imageIds.length) {
            resolve()
            return
          }
          const image = await loadImage(imageIds[initIm - 1])
          // 显示初始化第一张
          await this.initShowDcm(this.dcmElement, image)
          this.slideNum = imageIds.length - (initIm - 1)
          this.imageIds = imageIds
          this.isInitRender = true
          resolve(null)
        } catch (error) {
          reject(error)
        }
      })
    },
    rendered(evt) {
      this.renderSetWwWc(evt)
    },
    resizeView() { }
  }
}
</script>
