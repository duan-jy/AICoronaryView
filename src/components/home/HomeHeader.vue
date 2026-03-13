<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useViewerStore } from '@/stores/viewer'
import type { DicomStudy, ToolName } from '@/types'
import ToolButton from '@/components/common/ToolButton.vue'

interface Props {
  study: DicomStudy | null
}

const props = defineProps<Props>()
const router = useRouter()
const viewerStore = useViewerStore()

const activeTool = computed(() => viewerStore.activeTool)

const tools: { name: ToolName; icon: string; label: string }[] = [
  { name: 'Pan', icon: 'icon-move', label: '平移' },
  { name: 'Zoom', icon: 'icon-zoom', label: '缩放' },
  { name: 'WindowLevel', icon: 'icon-contrast', label: '窗宽窗位' },
  { name: 'Length', icon: 'icon-ruler', label: '测量' },
  { name: 'Angle', icon: 'icon-angle', label: '角度' },
  { name: 'Rectangle', icon: 'icon-rect', label: '矩形' },
  { name: 'Ellipse', icon: 'icon-ellipse', label: '椭圆' },
  { name: 'Arrow', icon: 'icon-arrow', label: '箭头' },
  { name: 'Eraser', icon: 'icon-eraser', label: '橡皮擦' },
  { name: 'Reset', icon: 'icon-reset', label: '重置' }
]

function selectTool(toolName: ToolName) {
  viewerStore.setActiveTool(toolName)
}

function goToPrint() {
  router.push('/print')
}

function goToPush() {
  router.push('/push')
}

const patientInfo = computed(() => {
  if (!props.study) return null
  return {
    id: props.study.patientId,
    name: props.study.patientName,
    date: props.study.studyDate
  }
})

const progressPercent = computed(() => {
  return props.study?.progress || viewerStore.progress || 75
})
</script>

<template>
  <header class="home-header layout-header">
    <!-- Logo -->
    <div class="header-logo">
      <img src="@/assets/logo.png" alt="MSUNHEALTH" class="logo-img" />
    </div>
    
    <!-- Tools -->
    <div class="header-tools">
      <ToolButton
        v-for="tool in tools"
        :key="tool.name"
        :icon="tool.icon"
        :label="tool.label"
        :active="activeTool === tool.name"
        @click="selectTool(tool.name)"
      />
    </div>
    
    <!-- Spacer -->
    <div class="header-spacer"></div>
    
    <!-- Patient Info -->
    <div v-if="patientInfo" class="header-patient">
      <span class="patient-id">{{ patientInfo.id }}</span>
      <span class="patient-progress">{{ progressPercent }}%</span>
    </div>
    
    <!-- Actions -->
    <div class="header-actions">
      <button class="btn btn-secondary btn-sm" @click="goToPrint">
        <span class="icon icon-print"></span>
        打印
      </button>
      <button class="btn btn-secondary btn-sm" @click="goToPush">
        <span class="icon icon-push"></span>
        推送
      </button>
      <button class="btn btn-primary btn-sm">
        <span class="icon icon-save"></span>
        保存
      </button>
    </div>
  </header>
</template>

<style lang="less" scoped>
.home-header {
  justify-content: flex-start;
  gap: 24px;
}

.header-logo {
  display: flex;
  align-items: center;
  
  .logo-img {
    height: 28px;
    width: auto;
  }
}

.header-tools {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.header-spacer {
  flex: 1;
}

.header-patient {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  
  .patient-id {
    color: var(--primary-color);
    font-weight: 500;
  }
  
  .patient-progress {
    color: var(--text-secondary);
    font-size: 12px;
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
