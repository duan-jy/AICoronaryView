<script setup lang="ts">
import { ref, nextTick, provide, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAppStore } from './stores/app'

const appStore = useAppStore()
const isRouterActive = ref(true)

const reload = () => {
  isRouterActive.value = false
  nextTick(() => {
    isRouterActive.value = true
  })
}

provide('reload', reload)

onMounted(() => {
  // Try to load config, but don't crash if API is unavailable
  appStore.getAppConfig().catch(() => {})
})
</script>

<template>
  <div class="app-container">
    <RouterView v-if="isRouterActive" />

    <!-- Global Loading Overlay -->
    <Transition name="fade">
      <div v-if="appStore.loading" class="loading-overlay">
        <div class="loading-spinner"></div>
        <span class="loading-text">{{ appStore.loadingText || '加载中...' }}</span>
      </div>
    </Transition>
  </div>
</template>

<style lang="less">
.app-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  gap: 16px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  color: var(--text-secondary);
  font-size: 14px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
