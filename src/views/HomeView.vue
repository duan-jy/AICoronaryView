<script setup lang="ts">
import { ref, onMounted, provide } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useArteryStore } from '@/stores/artery'
import { useViewerStore } from '@/stores/viewer'
import { api } from '@/api'

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

// Initialize study data
async function initStudy() {
  appStore.setLoading(true, '正在加载影像数据...')
  
  try {
    // Get study ID from route or query params
    const id = route.query.studyId as string || route.query.id as string || 'demo'
    studyId.value = id
    
    // Load study info
    const study = await api.getStudyInfo(id)
    viewerStore.setStudy(study)
    
    // Load all artery images
    await loadArteryImages(id)
    
    // Load diagnostic report
    await loadReport(id)
    
    // Initialize stenosis list
    arteryStore.initStenosisList()
    
    isInitialized.value = true
  } catch (error) {
    console.error('[HomeView] Failed to initialize study:', error)
  } finally {
    appStore.setLoading(false)
  }
}

async function loadArteryImages(id: string) {
  try {
    const allImages = await api.getAllArteryImages(id)
    arteryStore.setAllArteryImages(allImages)
  } catch (error) {
    console.error('[HomeView] Failed to load artery images:', error)
  }
}

async function loadReport(id: string) {
  try {
    const report = await api.getReport(id)
    arteryStore.updateReport(report)
  } catch (error) {
    console.error('[HomeView] Failed to load report:', error)
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
