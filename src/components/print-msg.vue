<style lang="less" scoped>
.dcm-msg {
  position: absolute;
  transform: scale(0.4);
  pointer-events: none;
  &.topLeft {
    left: 2px;
    top: 2px;
    transform-origin: left top;
    text-align: left;
  }

  &.topRight {
    right: 2px;
    top: 2px;
    transform-origin: right top;
    text-align: right;
  }
  &.btRight {
    bottom: 2px;
    right: 2px;
    transform-origin: right bottom;
    text-align: right;
  }
  &.btLeft {
    left: 2px;
    bottom: 2px;
    transform-origin: left bottom;
    text-align: left;
  }
  .msg-item {
    width: 100px;
    font-size: 12px;
    color: #fff;
  }
}
</style>
<template>
  <ul
    v-for="(val, key) in printFilmMsg"
    :key="key"
    :class="['dcm-msg', key]"
    :style="ulStyle"
  >
    <li class="msg-item" v-for="item in val" :key="item">
      <span>{{ item }}</span>
    </li>
  </ul>
</template>

<script setup>
import { defineProps, computed } from 'vue'

const props = defineProps({
  scaleNum: {
    type: Number,
    default: 0.4
  },
  printFilmMsg: {
    type: Object,
    default: () => ({})
  }
})

const ulStyle = computed(() => {
  return {
    transform: `scale(${props.scaleNum})`
  }
})
</script>
