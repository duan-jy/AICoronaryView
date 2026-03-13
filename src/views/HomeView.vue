<script setup lang="ts">
import { ref, onMounted, provide } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useArteryStore } from '@/stores/artery'
import { useViewerStore } from '@/stores/viewer'

import HomeHeader from '@/components/home/HomeHeader.vue'
import ArterySidebar from '@/components/home/ArterySidebar.vue'
import ViewportGrid from '@/components/home/ViewportGrid.vue'
import DiagnosisPanel from '@/components/home/DiagnosisPanel.vue'

const route = useRoute()
const appStore = useAppStore()
const arteryStore = useArteryStore()
const viewerStore = useViewerStore()

const studyId = ref('')
const isInitialized = ref(false)
const initError = ref('')

// Initialize study data
async function initStudy() {
  appStore.setLoading(true, '正在加载影像数据...')

  try {
    // Get study ID from route or query params
    const id = (route.query.studyId as string) || (route.query.id as string) || 'demo'
    studyId.value = id

    // Initialize with demo/fallback data for now
    arteryStore.initStenosisList()
    isInitialized.value = true
  } catch (error: any) {
    console.warn('[HomeView] Init error (expected in demo):', error?.message)
    initError.value = error?.message || '初始化失败'
    // Still show the UI even on error
    isInitialized.value = true
  } finally {
    appStore.setLoading(false)
  }
}

// Provide studyId to child components
provide('studyId', studyId)

onMounted(() => {
  initStudy()
})
</script>

<template>
  <div class="home-view layout-main">
    <!-- Header with logo, tools, patient info -->
    <HomeHeader :study="viewerStore.study" />

    <!-- Main content area -->
    <div class="layout-body">
      <!-- Left sidebar: Artery navigation -->
      <ArterySidebar />

      <!-- Center: Viewport grid -->
      <div class="layout-content">
        <ViewportGrid v-if="isInitialized" />
        <div v-else class="loading-placeholder">
          <div class="loading-spinner"></div>
          <span>正在初始化视口...</span>
        </div>
      </div>

      <!-- Right panel: Diagnosis report -->
      <DiagnosisPanel />
    </div>
  </div>
</template>

<style lang="less" scoped>
.home-view {
  background: var(--bg-primary);
}

.loading-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: var(--text-secondary);
}
</style>
