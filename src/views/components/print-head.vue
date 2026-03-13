<style lang="less" scoped src="@/styles/head.less"></style>
<template>
  <div class="home-head">
    <img class="logo" :src="require('@/assets/logo.png')" />
    <div class="tools-list">
      <i
        v-for="item in otherTools"
        :key="item.name"
        :class="['artery-icon', item.icon]"
        :title="item.desc"
        @click="toolsClick(item.name)"
      />
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
        :class="[
          'artery-icon scale-icon',
          showMsg ? 'icon-yincang' : 'icon-xianshi'
        ]"
        :title="showMsg ? '隐藏信息' : '显示信息'"
        @click="toShowMsg"
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
  </div>
</template>

<script>
import { DocumentCopy } from '@element-plus/icons-vue'

import copyClipoboard from '@/utils/clipboard'

import { toRefs } from 'vue'

export default {
  components: {
    DocumentCopy
  },
  props: {
    showMsg: {
      type: Boolean,
      default: true
    },
    patientId: {
      type: String,
      default: ''
    },
    seriesDesc: {
      type: String,
      default: ''
    },
    activeToolsName: {
      type: String,
      default: ''
    }
  },
  setup(props, { emit }) {
    const { patientId, showMsg } = toRefs(props)

    const copy = (evt) => {
      if (!patientId.value) {
        return
      }
      copyClipoboard(evt)
    }

    const toShowMsg = async() => {
      emit('update:showMsg', !showMsg.value)
    }

    const toolsChange = (name) => {
      // store.dispatch('dcm/setActiveTools', name)
      emit('changeTools', name)
    }

    const toolsClick = (name) => {
      emit('toolsHandler', name)
    }

    return {
      otherTools: [
        {
          name: 'addFilm',
          toolName: 'addFilm',
          icon: 'icon-xinzengjiaopian2',
          desc: '新增胶片'
        },
        {
          name: 'delFilm',
          toolName: 'delFilm',
          icon: 'icon-shanchujiaopian',
          desc: '删除胶片'
        }
      ],
      toolsList: [
        // {
        //   name: 'delImg',
        //   toolName: 'delImg',
        //   icon: 'icon-shanchutuxiang2',
        //   desc: '删除图像'
        // },
        {
          name: 'dargImg',
          toolName: 'dargImg',
          icon: 'icon-tuodongtuxiang2',
          desc: '拖动图像'
        },
        {
          name: 'Pan',
          toolName: 'PanTool',
          icon: 'icon-yidonggongju',
          desc: '移动'
        },
        {
          name: 'Zoom',
          toolName: 'ZoomTool',
          icon: 'icon-fangdajing',
          desc: '缩放'
        },
        {
          name: 'Wwwc',
          toolName: 'WwwcTool',
          icon: 'icon-mask',
          desc: '窗位窗宽'
        }
      ],
      copy,
      toShowMsg,
      toolsChange,
      toolsClick
    }
  }
}
</script>
