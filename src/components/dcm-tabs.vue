<style lang="less" scoped>
.tabs {
  position: absolute;
  z-index: 1000;
  left: 8px;
  bottom: 5px;
  display: inline-block;
  .tab {
    display: inline-block;
    width: 40px;
    height: 40px;
    border: 1px solid #7C7C7C;
    margin-right: 8px;
    &:hover,
    &.active {
      border-color: #3FEBD6;
    }
    img{
      width: 100%;
      height: 100%;
    }
  }
}
</style>
<template>
  <ul class="tabs">
    <li
      v-for="(item, index) in tabList"
      :key="item.key"
      :class="['tab', activeIndex === index ? 'active' : '']"
      @click="activeTab(item, index)"
    >
      <img :id="`${item.key}_img`" :src="item.src">
    </li>
  </ul>
</template>

<script>
import { ref, toRefs } from 'vue'

export default {
  props: {
    tabList: {
      type: Array,
      default: () => {
        return []
      }
    },
    disable: {
      type: Boolean,
      default: () => false
    }
  },
  emits: ['activeTab'],
  setup(props, { emit }) {
    const activeIndex = ref(0)
    const { disable } = toRefs(props)
    const activeTab = (item, index) => {
      if (disable.value) { // 如果禁用
        return
      }
      if (item.disable) {
        return
      }
      activeIndex.value = index
      emit('activeTab', index)
    }
    return {
      activeIndex,
      activeTab
    }
  }
}
</script>
