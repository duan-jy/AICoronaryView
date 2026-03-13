<style lang="less">
.slider-block {
  width: 40px;
  position: absolute;
  right: 0;
  bottom: 50px;
  z-index: 100;
  // overflow: hidden;
  .el-slider.is-vertical {
    .el-slider__runway {
      width: 4px;
      margin: 0 18px;
    }
    .el-slider__button {
      margin-left: -3px;
      left: 50%;
    }
    .el-slider__bar {
      width: 4px;
    }
  }
  .el-slider__bar {
    background: linear-gradient(-1deg, #7c7c7c 0%, #303030 100%);
  }
  .el-slider__button {
    border: none;
    background-color: #5e5e5e;
    width: 9px;
    height: 9px;
  }
  .el-slider__runway {
    background-color: #303030;
  }
}
</style>
<template>
  <div
    v-if="max > 1 && slideNum"
    class="slider-block"
    @mouseenter="isActiveTools(false)"
    @mouseleave="isActiveTools(true)"
  >
    <el-slider
      v-model="slideVal"
      vertical
      :height="`${slideHeight >= 100 ? 100 : slideHeight}px`"
      :min="1"
      :max="max"
      :show-tooltip="false"
      @input="inputChange"
    />
  </div>
</template>

<script>
import { disbeledActiveTool, enableActiveTool } from '@/utils/cornerstone'
import { toRefs, watch, ref } from 'vue'

export default {
  props: {
    max: {
      type: Number,
      default: 1
    },
    slideNum: {
      type: Number,
      default: 1
    },
    slideKey: {
      type: String,
      default: ''
    },
    slideHeight: {
      type: Number,
      default: 35
    },
    activeToolsName: {
      type: String,
      default: ''
    }
  },
  emits: ['slideImNumChange'],
  setup(props, { emit }) {
    const { slideNum, slideKey, activeToolsName } = toRefs(props)

    const isActiveTools = (isDisable) => {
      if (isDisable) {
        disbeledActiveTool(slideKey.value, activeToolsName.value)
      } else {
        enableActiveTool(slideKey.value, activeToolsName.value)
      }
    }

    const slideVal = ref(0)

    watch(slideNum, (newVal, oldVal) => {
      if (slideVal.value !== newVal) {
        slideVal.value = newVal
        // emit('slideImNumChange', newVal, slideKey.value)
      }
    })

    const inputChange = (val) => {
      emit('slideImNumChange', val)
    }

    return {
      slideVal,
      isActiveTools,
      inputChange
    }
  }
}
</script>
