<style lang="less" scoped>
.scaledcm {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: transparent;
  left: 0;
  top: 0;
  z-index: 100;
  .scaledcm-mask {
    width: 100%;
    height: 100%;
    position: relative;
  }
  .scaleclick-mask {
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 100;
  }
  .scaledcm-pos {
    width: 400px;
    height: 600px;
    position: absolute;
    left: 50%;
    top: 50%;
    margin-left: -300px;
    margin-top: -300px;
    border: 1px solid #ececec;
    z-index: 200;
    .scaledcm-content {
      width: 100%;
      height: 100%;
      position: relative;
      z-index: 1000;
      /deep/ .dcm-msg {
        .msg-item {
          width: 200px;
          font-size: 26px;
        }
      }
      .artery {
        width: 100%;
        height: 14px;
        text-align: center;
        position: absolute;
        left: 0;
        top: 0;
        z-index: 2;
        color: #fff;
        font-weight: bold;
        font-size: 12px;
      }
      .push-print {
        width: 30px;
        height: 30px;
        position: absolute;
        right: 2px;
        bottom: 2px;
        background-color: #f4721b;
        z-index: 2;
        color: #fff;
        border-radius: 4px;
        line-height: 30px;
        text-align: center;
        cursor: pointer;
        &.hasSelect {
          background-color: #3b7cff;
        }
        .artery-icon {
          font-size: 20px;
        }
      }
      .scale-close {
        position: absolute;
        right: -20px;
        top: -20px;
        z-index: 100;
      }
    }
  }

  #scaledcm-canvas {
    width: 100%;
    height: 100%;
    z-index: 1000;
    .cornerstone-canvas {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
<template>
  <div class="scaledcm" v-show="isShowScale">
    <div class="scaledcm-mask">
      <div class="scaleclick-mask" @click="isShowScale = false"></div>
      <div class="scaledcm-pos" @mousewheel="scaleMouseWheel">
        <div class="scaledcm-content">
          <div id="scaledcm-canvas">
            <canvas class="cornerstone-canvas"></canvas>
          </div>
          <div class="artery">
            {{
              scaleImages[scaleImageIndex]
                ? scaleImages[scaleImageIndex].artery
                  ? scaleImages[scaleImageIndex].artery
                  : scaleImages[scaleImageIndex].part
                : ""
            }}
            {{
              scaleImages[scaleImageIndex] && scaleImages[scaleImageIndex].angle
                ? `${scaleImages[scaleImageIndex].angle}&deg;`
                : ""
            }}
          </div>
          <PrintMsg :printFilmMsg="printFilmMsg" />

          <div
            :class="[
              'push-print',
              hasSelect(scaleImages[scaleImageIndex] || '') ? 'hasSelect' : '',
            ]"
            v-show="isShowIcon"
            @click.stop="pushPrint(scaleImages[scaleImageIndex] || '')"
          >
            <i
              :class="['artery-icon', isPush ? 'icon-huaban' : 'icon-dayin']"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { dcmload } from '@/api/index'

import PrintMsg from './print-msg.vue'

import { isEmpty } from '@/utils/validate'

import {
  defineProps,
  defineEmits,
  defineExpose,
  onMounted,
  ref,
  nextTick,
  onUnmounted,
  computed
} from 'vue'

import { loadImage, initEnabledDefault } from '@/utils/cornerstone'

let scaleDcmEl = null

const props = defineProps({
  msg: {
    type: Object,
    default: () => ({})
  },
  isPush: {
    type: Boolean,
    default: false
  },
  selectImages: {
    type: Array,
    default: () => []
  }
})

const emits = defineEmits(['pushPrint', 'checkImage', 'changeWwWc'])

const scaleImageIndex = ref(0)
const isShowIcon = ref(false)
const scaleImages = ref([])

const isShowScale = ref(false)

const windowWidthNow = ref(0)
const windowCenterNow = ref(0)

const printFilmMsg = computed(() => {
  const btLeft = props.msg.btLeft || []
  return {
    ...props.msg,
    btLeft: [
      `ww:${parseInt(windowWidthNow.value)} wc:${parseInt(
        windowCenterNow.value
      )}`,
      ...btLeft
    ]
  }
})

onMounted(async() => {
  scaleDcmEl = document.getElementById('scaledcm-canvas')
  await initEnabledDefault(scaleDcmEl).then(() => {
    scaleDcmEl.addEventListener(cornerstone.EVENTS.IMAGE_RENDERED, rendered)
  })
})

onUnmounted(() => {
  scaleDcmEl.removeEventListener(cornerstone.EVENTS.IMAGE_RENDERED, rendered)
})

const rendered = (evt) => {
  if (evt && evt.detail) {
    //
    const viewport = evt.detail.viewport
    if (
      viewport.voi.windowCenter !== windowCenterNow.value ||
      viewport.voi.windowWidth !== windowWidthNow.value
    ) {
      windowWidthNow.value = viewport.voi.windowWidth
      windowCenterNow.value = viewport.voi.windowCenter
      const nowItem = scaleImages.value[scaleImageIndex.value]
      // 更改窗位窗宽
      emits('changeWwWc', {
        ...nowItem,
        windowWidth: viewport.voi.windowWidth,
        windowCenter: viewport.voi.windowCenter
      })
    }
  }
}

const toShowScale = async(images, index, showIcon) => {
  scaleImages.value = images
  scaleImageIndex.value = index
  isShowIcon.value = showIcon
  isShowScale.value = true
  await nextTick()
  toShowScaleImage()
}
// 暴露出去
defineExpose({
  toShowScale
})

const scaleMouseWheel = (evt) => {
  if (evt && 'wheelDelta' in evt) {
    const wheelDelta = evt.wheelDelta
    const diff = wheelDelta / Math.abs(wheelDelta)
    let index = scaleImageIndex.value - diff
    if (index > scaleImages.value.length - 1) {
      index = scaleImages.value.length - 1
    } else if (index < 0) {
      index = 0
    }
    scaleImageIndex.value = Math.round(index)
    toShowScaleImage()
  }
}

const toShowScaleImage = async() => {
  const nowItem = scaleImages.value[scaleImageIndex.value]
  const image = await loadImage(dcmload(nowItem.dcm))
  const viewport = cornerstone.getDefaultViewportForImage(scaleDcmEl, image)
  if (nowItem.isSpr) {
    viewport.rotation = 90
  }
  // 选中的图像的窗值
  const selectItem = props.selectImages.find(
    (item) => item && item.key && item.key === nowItem.key
  )

  const windowWidth =
    selectItem && !isEmpty(selectItem.windowWidth)
      ? selectItem.windowWidth
      : nowItem.artery
        ? 800
        : viewport.voi.windowWidth
  const windowCenter =
    selectItem && !isEmpty(selectItem.windowCenter)
      ? selectItem.windowCenter
      : nowItem.artery
        ? 300
        : viewport.voi.windowCenter
  // 设置windowWidth windowCenter
  viewport.voi.windowWidth = windowWidth
  viewport.voi.windowCenter = windowCenter

  windowWidthNow.value = windowWidth
  windowCenterNow.value = windowCenter

  cornerstone.displayImage(scaleDcmEl, image, viewport)
  cornerstone.resize(scaleDcmEl, true)
  // cornerstone.updateImage(scaleDcmEl)
}

const hasSelect = (item) => {
  if (!props.selectImages.length) {
    return false
  }
  if (item) {
    return (
      props.selectImages.findIndex(
        (select) => select && select.key === item.key
      ) > -1
    )
  } else {
    return false
  }
}

// 推送及打印
const pushPrint = (item) => {
  if (!scaleDcmEl || !item) {
    return
  }
  const viewport = cornerstone.getViewport(scaleDcmEl)
  emits('pushPrint', {
    ...item,
    windowWidth: viewport.voi.windowWidth,
    windowCenter: viewport.voi.windowCenter
  })
}
</script>
