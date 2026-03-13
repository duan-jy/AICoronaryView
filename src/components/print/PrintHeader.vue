<script setup lang="ts">
import SvgIcon from '@/components/common/SvgIcon.vue'

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <header class="print-header">
    <div class="header-left">
      <img src="@/assets/logo.png" alt="Logo" class="logo-img" />
    </div>

    <div class="header-center">
      <div class="header-tools">
        <button class="tool-btn" title="窗宽窗位">
          <SvgIcon name="contrast" :size="16" />
        </button>
        <button class="tool-btn" title="布局">
          <SvgIcon name="layout" :size="16" />
        </button>
        <button class="tool-btn" title="缩放">
          <SvgIcon name="zoom" :size="16" />
        </button>
        <button class="tool-btn" title="旋转">
          <SvgIcon name="refresh" :size="16" />
        </button>
        <button class="tool-btn" title="链接">
          <SvgIcon name="link" :size="16" />
        </button>
      </div>
    </div>

    <div class="header-right">
      <span class="study-id">CT20220707228</span>
      <SvgIcon name="heart" :size="14" color="var(--primary-color)" />
      <span class="progress">75%</span>
    </div>
  </header>
</template>

<style lang="less" scoped>
.print-header {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: var(--header-bg);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.header-left {
  .logo-img {
    height: 28px;
    width: auto;
  }
}

.header-center {
  .header-tools {
    display: flex;
    gap: 4px;
  }
}

.tool-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--bg-tertiary);
  border: none;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover {
    color: var(--text-primary);
    background: var(--bg-elevated);
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .study-id {
    color: var(--primary-color);
    font-size: 13px;
  }
  
  .progress {
    color: var(--text-secondary);
    font-size: 12px;
  }
}
</style>
