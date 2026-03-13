<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  studyId: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const progress = computed(() => 75) // Placeholder
</script>

<template>
  <header class="print-header">
    <div class="header-left">
      <div class="logo">
        <img src="@/assets/logo.png" alt="Logo" />
      </div>
    </div>

    <div class="header-center">
      <span class="study-id">{{ studyId }}</span>
      <div class="progress-indicator">
        <i class="iconfont icon-folder" />
        <span>{{ progress }}%</span>
      </div>
    </div>

    <div class="header-right">
      <span class="title">选择图像</span>
    </div>
  </header>
</template>

<style lang="less" scoped>
.print-header {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
}

.header-left {
  .logo {
    height: 32px;
    
    img {
      height: 100%;
      width: auto;
    }
  }
}

.header-center {
  display: flex;
  align-items: center;
  gap: 16px;
  
  .study-id {
    color: var(--primary-color);
    font-size: 14px;
  }
  
  .progress-indicator {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--text-secondary);
    font-size: 13px;
    
    .iconfont {
      font-size: 16px;
    }
  }
}

.header-right {
  .title {
    color: var(--text-primary);
    font-size: 14px;
    font-weight: 500;
  }
}
</style>
