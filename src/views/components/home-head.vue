<style lang="less" scoped src="@/styles/head.less"></style>
<template>
  <div class="home-head">
    <img class="logo" :src="require('@/assets/logo.png')" />
    <div class="tools-list">
      <i
        v-for="item in toolsList"
        :key="item.name"
        :class="[
          'artery-icon',
          item.icon,
          item.name === activeToolsName ? 'active' : ''
        ]"
        :title="item.desc"
        @click="toolsChange(item.name)"
      />
      <i
        class="artery-icon icon-qingkong"
        title="复原"
        @click="toolsChange('reset')"
      />
      <i
        class="artery-icon icon-qingchubiaozhu"
        title="清除标注"
        @click="toolsChange('clearLabel')"
      />
      <i
        :class="[
          'artery-icon scale-icon',
          showMsg ? 'icon-yincang' : 'icon-xianshi'
        ]"
        :title="showMsg ? '隐藏信息' : '显示信息'"
        @click="toShowMsg"
      />
      <i
        class="artery-icon icon-hengshupingyishezhi"
        :title="isVertical ? '横屏' : '竖屏'"
        @click="setVertical"
      />
      <i
        :class="[
          'artery-icon scale-icon',
          showAI ? 'icon-shanguangdeng-an' : 'icon-shanguangdeng-liang'
        ]"
        :title="!showAI ? '显示AI' : '隐藏AI'"
        @click="toShowAI"
      />
      <i
        :class="['artery-icon scale-icon icon-biaoji']"
        :title="!isActvieMark ? '显示标记' : '隐藏标记'"
        @click="setActvieMark"
      />
    </div>
    <div class="series-msg">
      <div class="patient" :title="patientId">
        <span>{{ patientId }}</span>
        <el-icon
          class="copy"
          title="复制"
          :size="16"
          color="#0ac8f8"
          :data-clipboard-text="patientId"
          @click.stop="copy"
        >
          <document-copy />
        </el-icon>
      </div>
      <div class="series-desc" :title="seriesDesc">{{ seriesDesc }}</div>
    </div>

    <div class="head-btns">
      <div
        v-for="btn in headBtns"
        :key="btn.name"
        class="head-btn"
        @click="headBtnHandler(btn.name)"
      >
        <i :class="['artery-icon', btn.icon]" />
        <p>{{ btn.title }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { DocumentCopy } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

import { toolsList } from '@/utils/source'
import copyClipoboard from '@/utils/clipboard'

import arteryBus from '@/utils/arteryBus'

import { toRefs, ref, computed, nextTick } from 'vue'
import { useStore } from 'vuex'

const headBtns = [
  {
    icon: 'icon-zhaoxiangji',
    title: '组合',
    name: 'makeup'
  },
  {
    icon: 'icon-dayin',
    title: '打印',
    name: 'print'
  },
  {
    icon: 'icon-huaban',
    title: '推送',
    name: 'push'
  },
  {
    icon: 'icon-chakan',
    title: '查看报告',
    name: 'view'
  },
  {
    icon: 'icon-baogao',
    title: '保存',
    name: 'save'
  }
]

const props = defineProps({
  patientId: {
    type: String,
    default: ''
  },
  seriesDesc: {
    type: String,
    default: ''
  }
})

const emits = defineEmits(['jumpNext', 'viewReport', 'saveResult'])

const showMsg = ref(true)
const isArteryEdit = ref(false)
const showAI = ref(true)

const { patientId } = toRefs(props)

const store = useStore()
const isVertical = computed(() => store.getters.isVertical)
const isActvieMark = computed(() => store.getters.isActvieMark)
const activeToolsName = ref('')

const copy = (evt) => {
  if (!patientId.value) {
    return
  }
  copyClipoboard(evt)
}

const toShowMsg = async() => {
  showMsg.value = !showMsg.value
  await nextTick()
  arteryBus.emit('toShowMsg', showMsg.value)
}

const toShowAI = async() => {
  showAI.value = !showAI.value
  arteryBus.emit('toShowAI', showAI.value)
}

const setVertical = () => {
  store.dispatch('dcm/setVertical', !isVertical.value)
}

const setActvieMark = () => {
  store.dispatch('artery/setActvieMark', !isActvieMark.value)
}
const toolsChange = (name) => {
  arteryBus.emit('activeToolsChange', {
    newVal: name,
    oldVal: activeToolsName.value
  })
  if (toolsList.findIndex((item) => item.name === name) > -1) {
    activeToolsName.value = name
  }
}

const headBtnHandler = (name) => {
  if (isArteryEdit.value) {
    ElMessage.warning('血管正在编辑状态中,请取消或提交血管编辑结果')
    return
  }
  switch (name) {
    case 'print':
    case 'push':
      emits('jumpNext', name)
      break
    case 'view':
      emits('viewReport')
      break
    case 'save':
      emits('saveResult')
      break
    case 'makeup':
      arteryBus.emit('makeup-Drawer')
      break
    default:
      break
  }
}

arteryBus.on('editArtery', (isEdit) => {
  isArteryEdit.value = isEdit
})
</script>
