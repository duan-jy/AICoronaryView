<template>
  <transition name="viewer-fade">
    <ElImageViewer
      v-if="show"
      :z-index="zIndex"
      :initial-index="initialIndex"
      :url-list="urlList"
      :append-to-body="appendToBody"
      :mask-closable="maskClosable"
      @switch="switchViewer"
      @close="closeViewer"
    >
      <slot name="viewer">
        <div class="el-image-viewer-msg" v-show="imgdesc" v-html="imgdesc"></div>
      </slot>
    </ElImageViewer>
  </transition>
</template>
<script setup name="PushPreview">
import { computed, defineProps, ref, watch } from 'vue'

import ElImageViewer from 'element-plus/lib/components/image-viewer'

const props = defineProps({
  urlList: {
    type: Array,
    default: () => []
  },
  messages: {
    type: Array,
    default: () => []
  },
  zIndex: {
    type: Number,
    default: 2000
  },
  onSwitch: {
    type: Function,
    default: () => ({})
  },
  initialIndex: {
    type: Number,
    default: 0
  },
  appendToBody: {
    type: Boolean,
    default: true
  },
  maskClosable: {
    type: Boolean,
    default: true
  }
})
const show = ref(false)

const imgdesc = ref('')

const closeViewer = () => {
  show.value = false
}

watch(
  show,
  (newVal, oldVal) => {
    if (newVal) {
      imgdesc.value =
        props.messages.length && props.messages[props.initialIndex]
          ? props.messages[props.initialIndex]
          : ''
    }
  },
  {
    immediate: true
  }
)

const switchViewer = (index) => {
  imgdesc.value =
    props.messages.length && props.messages[index] ? props.messages[index] : ''
  props.onSwitch(index)
}
</script>
