<script setup lang="ts">
interface Props {
  icon: string
  label: string
  active?: boolean
  disabled?: boolean
}

defineProps<Props>()
</script>

<template>
  <button
    class="tool-button"
    :class="{ active, disabled }"
    :disabled="disabled"
    :title="label"
  >
    <span class="icon" :class="icon"></span>
  </button>
</template>

<style lang="less" scoped>
.tool-button {
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
  
  &:hover:not(:disabled) {
    background: var(--bg-elevated);
    color: var(--text-primary);
  }
  
  &.active {
    background: var(--primary-color);
    color: #fff;
  }
  
  &.disabled,
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .icon {
    font-size: 16px;
  }
}
</style>
