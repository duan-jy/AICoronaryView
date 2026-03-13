<style lang="less" scoped>
.msg-corner {
  width: 40%;
  max-width: 150px;
  position: absolute;
  z-index: 100;
  .msg-br {
    max-width: 250px;
  }
}

.msg-tl {
  left: 10px;
  top: 10px;
}
.msg-bl {
  left: 10px;
  bottom: 10px;
  &.has-bltools {
    bottom: 60px;
  }
}
.msg-tr {
  top: 10px;
  right: 10px;
  text-align: right;
}
.msg-br {
  right: 10px;
  bottom: 5px;
  text-align: right;
}
.msg-item {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  pointer-events: none;
}
</style>
<template>
  <div v-if="showMsg" class="msg-tl msg-corner">
    <div v-if="part" class="msg-item">{{ part.toUpperCase() }}</div>
    <div v-if="patientMsg.modality && part === 'Ori'" class="msg-item">
      {{ patientMsg.modality }}
    </div>
    <div v-if="imgIndex" class="msg-item">IM: {{ imgIndex }}</div>
    <slot name="otherMsg"></slot>
  </div>
  <div v-if="showMsg" class="msg-tr msg-corner">
    <div v-if="patientMsg.hospital_name" class="msg-item">
      {{ patientMsg.hospital_name }}
    </div>
    <div v-if="patientMsg.patient_name" class="msg-item">
      {{ patientMsg.patient_name }}
    </div>
    <div v-if="patientMsg.series_date" class="msg-item">
      {{ patientMsg.series_date }}
    </div>
  </div>
  <div
    v-if="showMsg"
    :class="['msg-bl', 'msg-corner', hasBlTools ? 'has-bltools' : '']"
  >
    <div v-if="isShowWwWc" class="msg-item">
      WW:{{ Math.ceil(windowWidth) }} WC:{{ Math.ceil(windowCenter) }}
    </div>
    <div class="msg-item" v-if="imageHu">HU: {{ imageHu }}</div>
  </div>
  <div class="msg-br msg-corner">
    <div class="msg-operate">
      <i
        v-if="showRefresh"
        class="operate-item artery-icon"
        title="刷新"
        @click.stop="emits('refreshImage')"
      >
        <el-icon size="16"><refresh /></el-icon>
      </i>
      <slot />
      <i
        v-if="showPush"
        :class="[
          'operate-item artery-icon icon-huaban',
          isPush ? 'hasPush' : ''
        ]"
        title="推送"
        @click.stop="pushImage"
      />
      <i
        v-if="showScale"
        :class="[
          'operate-item',
          'artery-icon',
          'scale-icon',
          scaleView === scaleKey ? 'icon-suoxiao' : 'icon-fangda1'
        ]"
        :title="scaleView === scaleKey ? '缩小' : '放大'"
        @click.stop="setScaleView"
      />
    </div>
  </div>
</template>

<script setup>
import arteryBus from '@/utils/arteryBus'
import { useStore } from 'vuex'
import { computed, ref, defineProps, defineEmits } from 'vue'

import { Refresh } from '@element-plus/icons-vue'
import { truncate } from 'lodash'

const props = defineProps({
  part: {
    type: String,
    default: ''
  },
  partKey: {
    type: String,
    default: ''
  },
  scaleKey: {
    type: String,
    default: ''
  },
  hasBlTools: {
    // 是否有左侧的工具
    type: Boolean,
    default: false
  },
  showScale: {
    // 是否显示放大
    type: Boolean,
    default: true
  },
  showPush: {
    // 是否显示推送
    type: Boolean,
    default: true
  },
  showRefresh: {
    // 是否显示刷新
    type: Boolean,
    default: false
  },
  // 窗位
  windowCenter: {
    type: Number,
    default: 300
  },
  // 窗宽
  windowWidth: {
    type: Number,
    default: 800
  },
  isShowWwWc: {
    type: Boolean,
    default: true
  },
  imageHu: {
    type: String,
    default: ''
  },
  patientMsg: {
    type: Object,
    default: () => ({})
  },
  imgIndex: {
    type: Number,
    default: 1
  }
})

const emits = defineEmits(['refreshImage'])

const store = useStore()
const scaleView = computed(() => store.getters.scaleView)
const activeArtery = computed(() => store.getters.activeArtery)
const rawArteryList = computed(() => store.getters.rawArteryList)
const pushImages = computed(() => store.getters.pushImages)

const arteryName = computed(() => {
  const artery = rawArteryList.value.find(
    (item) => item.id === activeArtery.value
  )
  return artery && artery.name ? artery.name : ''
})

const isArtery = computed(() => {
  return !(props.part.indexOf('VR') > -1 || props.part.indexOf('MIP') > -1)
})

const key = computed(() => {
  let partKey = props.partKey || props.part
  partKey = partKey.toUpperCase()
  return isArtery.value
    ? `${arteryName.value}_${partKey}-${props.imgIndex - 1}`
    : `${partKey}-${props.imgIndex - 1}`
})

// 是否已推送
const isPush = computed(
  () => pushImages.value.findIndex((item) => item.key === key.value) > -1
)

const showMsg = ref(true)

const pushImage = () => {
  arteryBus.emit('pushDcmToPD', {
    part: props.part,
    index: props.imgIndex - 1,
    isArtery: isArtery.value,
    windowWidth: props.windowWidth,
    windowCenter: props.windowCenter,
    type: 'T',
    isShowMsg: true
  })
}

const setScaleView = () => {
  const key = scaleView.value === props.scaleKey ? '' : props.scaleKey
  store.dispatch('dcm/setScaleView', key)
}

arteryBus.on('toShowMsg', (isShowMsg) => {
  showMsg.value = isShowMsg
})
</script>
