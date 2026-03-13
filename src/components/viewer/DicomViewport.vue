<script setup lang="ts">
import { ref, computed, watch, onMounted, inject } from 'vue'
import { useViewport } from '@/composables/useViewport'
import { useArteryStore } from '@/stores/artery'
import { useViewerStore } from '@/stores/viewer'
import { api } from '@/api'
import type { ViewportType, DicomImage } from '@/types'

interface Props {
  viewportId: string
  viewportType: ViewportType
  arteryId: string
  isActive?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'toggle-fullscreen'): void
}>()

const arteryStore = useArteryStore()
const viewerStore = useViewerStore()
const studyId = inject<{ value: string }>('studyId')

const viewportElement = ref<HTMLDivElement | null>(null)
const {
  isReady,
  isLoading,
  currentImageIndex,
  totalImages,
  windowWidth,
  windowCenter,
  loadImages,
  reset,
  flipH,
  flipV,
  rotate,
  invert,
  getImage
} = useViewport(viewportElement, {
  viewportId: props.viewportId,
  toolGroupId: 'mainToolGroup'
})

// Get images for current viewport type
const images = computed<DicomImage[]>(() => {
  const arteryImages = arteryStore.arteryImages[props.arteryId] || []
  return arteryImages.filter(img => img.type === props.viewportType)
})

// Load images when artery or type changes
async function loadViewportImages() {
  if (!isReady.value || images.value.length === 0) return
  
  const urls = images.value.map(img => 
    api.getImageUrl(studyId?.value || 'demo', img.imageId)
  )
  await loadImages(urls)
}

// Watch for changes
watch([() => props.arteryId, () => props.viewportType, isReady], () => {
  if (isReady.value) {
    loadViewportImages()
  }
})

// Viewport info overlay
const viewportInfo = computed(() => ({
  type: props.viewportType,
  position: `IM: ${currentImageIndex.value + 1}`,
  windowLevel: `WW:${windowWidth.value} WC:${windowCenter.value}`
}))

// Patient info from study
const patientInfo = computed(() => {
  const study = viewerStore.study
  if (!study) return null
  return {
    institution: study.institution || 'neibuceshi',
    name: study.patientName || '',
    date: study.studyDate || ''
  }
})

function handleFullscreen() {
  emit('toggle-fullscreen')
}

function handleReset() {
  reset()
}

onMounted(() => {
  // Images will load when isReady becomes true
})
</script>

<template>
  <div class="dicom-viewport viewport" :class="{ active: isActive }">
    <!-- Cornerstone canvas container -->
    <div ref="viewportElement" class="viewport-canvas"></div>
    
    <!-- Loading overlay -->
    <div v-if="isLoading" class="viewport-loading">
      <div class="loading-spinner"></div>
    </div>
    
    <!-- Top-left info overlay -->
    <div class="viewport-overlay top-left">
      <div class="viewport-info">
        <div>{{ viewportInfo.type }}</div>
        <div>{{ viewportInfo.position }}</div>
      </div>
    </div>
    
    <!-- Top-right info overlay -->
    <div class="viewport-overlay top-right">
      <div class="viewport-info" style="text-align: right;">
        <div v-if="patientInfo">{{ patientInfo.institution }}</div>
        <div v-if="patientInfo">{{ patientInfo.name }}</div>
        <div v-if="patientInfo">{{ patientInfo.date }}</div>
      </div>
    </div>
    
    <!-- Bottom-left info overlay -->
    <div class="viewport-overlay bottom-left">
      <div class="viewport-info">
        <div>{{ viewportInfo.windowLevel }}</div>
      </div>
    </div>
    
    <!-- Bottom toolbar -->
    <div class="viewport-tools">
      <button class="tool-btn" title="重置" @click="handleReset">
        <span class="icon">&#x21BA;</span>
      </button>
      <button class="tool-btn" title="水平翻转" @click="flipH">
        <span class="icon">&#x21C4;</span>
      </button>
      <button class="tool-btn" title="垂直翻转" @click="flipV">
        <span class="icon">&#x21C5;</span>
      </button>
      <button class="tool-btn" title="旋转" @click="rotate(90)">
        <span class="icon">&#x21BB;</span>
      </button>
      <button class="tool-btn" title="反色" @click="invert">
        <span class="icon">&#x25D1;</span>
      </button>
      <button class="tool-btn" title="全屏" @click="handleFullscreen">
        <span class="icon">&#x26F6;</span>
      </button>
    </div>
  </div>
</template>

<style lang="less" scoped>
.dicom-viewport {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
}

.viewport-canvas {
  width: 100%;
  height: 100%;
}

.viewport-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  z-index: 20;
}

.viewport-overlay {
  position: absolute;
  z-index: 10;
  pointer-events: none;
  
  &.top-left {
    top: 8px;
    left: 8px;
  }
  
  &.top-right {
    top: 8px;
    right: 8px;
  }
  
  &.bottom-left {
    bottom: 40px;
    left: 8px;
  }
  
  &.bottom-right {
    bottom: 40px;
    right: 8px;
  }
}

.viewport-info {
  font-size: 11px;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  line-height: 1.4;
}

.viewport-tools {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 4px;
  padding: 4px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 6px;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 15;
  
  .dicom-viewport:hover & {
    opacity: 1;
  }
}

.tool-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  transition: background 0.15s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  
  .icon {
    font-size: 14px;
  }
}
</style>
