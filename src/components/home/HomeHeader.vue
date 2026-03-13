<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useViewerStore } from '@/stores/viewer'
import type { DicomStudy, ToolName } from '@/types'
import SvgIcon from '@/components/common/SvgIcon.vue'

interface Props {
  study: DicomStudy | null
}

const props = defineProps<Props>()
const router = useRouter()
const viewerStore = useViewerStore()

const activeTool = computed(() => viewerStore.activeTool)

const tools: { name: ToolName; icon: string; label: string }[] = [
  { name: 'Pan', icon: 'move', label: '平移' },
  { name: 'Zoom', icon: 'zoom', label: '缩放' },
  { name: 'WindowLevel', icon: 'contrast', label: '窗宽窗位' },
  { name: 'Length', icon: 'ruler', label: '测量' },
  { name: 'Angle', icon: 'angle', label: '角度' },
  { name: 'Rectangle', icon: 'rectangle', label: '矩形' },
  { name: 'Ellipse', icon: 'ellipse', label: '椭圆' },
  { name: 'Arrow', icon: 'arrow', label: '箭头' },
  { name: 'Eraser', icon: 'eraser', label: '橡皮擦' },
  { name: 'Reset', icon: 'reset', label: '重置' }
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
      <button
        v-for="tool in tools"
        :key="tool.name"
        class="tool-btn"
        :class="{ active: activeTool === tool.name }"
        :title="tool.label"
        @click="selectTool(tool.name)"
      >
        <SvgIcon :name="tool.icon" :size="18" />
      </button>
    </div>
    
    <!-- Spacer -->
    <div class="header-spacer"></div>
    
    <!-- Patient Info -->
    <div class="header-patient">
      <span class="patient-id">{{ patientInfo?.id || 'CT20220707228' }}</span>
      <SvgIcon name="heart" :size="14" color="var(--primary-color)" />
      <span class="patient-progress">{{ progressPercent }}%</span>
    </div>
    
    <!-- Actions -->
    <div class="header-actions">
      <button class="action-btn" @click="$router.push('/')">
        <SvgIcon name="composition" :size="16" />
        <span>组合</span>
      </button>
      <button class="action-btn" @click="goToPrint">
        <SvgIcon name="print" :size="16" />
        <span>打印</span>
      </button>
      <button class="action-btn" @click="goToPush">
        <SvgIcon name="push" :size="16" />
        <span>推送</span>
      </button>
      <button class="action-btn" @click="$router.push('/')">
        <SvgIcon name="report" :size="16" />
        <span>查看报告</span>
      </button>
      <button class="action-btn save" @click="() => {}">
        <SvgIcon name="save" :size="16" />
        <span>保存</span>
      </button>
    </div>
  </header>
</template>

<style lang="less" scoped>
.home-header {
  justify-content: flex-start;
  gap: 12px;
  background: var(--header-bg);
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
  gap: 2px;
  padding: 3px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.tool-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover {
    background: var(--bg-elevated);
    color: var(--text-primary);
  }
  
  &.active {
    background: var(--accent-color);
    color: #fff;
  }
}

.header-spacer {
  flex: 1;
}

.header-patient {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .patient-id {
    color: var(--primary-color);
    font-weight: 500;
    font-size: 13px;
  }
  
  .patient-progress {
    color: var(--text-secondary);
    font-size: 12px;
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  width: 56px;
  height: 40px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 10px;
  transition: all var(--transition-fast);
  
  &:hover {
    border-color: var(--accent-color);
    color: var(--accent-color);
  }
  
  &.save {
    background: var(--accent-color);
    border-color: var(--accent-color);
    color: #fff;
    
    &:hover {
      background: var(--accent-light);
    }
  }
}
</style>
