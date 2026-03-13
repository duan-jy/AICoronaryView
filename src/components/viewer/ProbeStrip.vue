<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { useArteryStore } from '@/stores/artery'
import type { ViewportType } from '@/types'

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
const studyId = inject<{ value: string }>('studyId')

const currentIndex = ref(0)

// Get probe images for current artery
const probeImages = computed(() => {
  const arteryImages = arteryStore.arteryImages[props.arteryId] || []
  return arteryImages.filter(img => img.type === 'PROBE')
})

// Generate placeholder images for demo
const placeholderImages = computed(() => {
  return Array.from({ length: 15 }, (_, i) => ({
    id: `probe-${i}`,
    index: i
  }))
})

function handleImageClick(index: number) {
  currentIndex.value = index
}

function handleFullscreen() {
  emit('toggle-fullscreen')
}
</script>

<template>
  <div class="probe-strip viewport" :class="{ active: isActive }">
    <!-- Info overlay -->
    <div class="viewport-overlay top-left">
      <div class="viewport-info">
        <div>PROBE</div>
        <div>Z: 75</div>
      </div>
    </div>
    
    <!-- Probe image strip -->
    <div class="probe-container no-scrollbar">
      <div class="probe-scroll">
        <div
          v-for="(img, index) in placeholderImages"
          :key="img.id"
          class="probe-item"
          :class="{ active: currentIndex === index }"
          @click="handleImageClick(index)"
        >
          <div class="probe-image">
            <!-- Placeholder circular cross-section -->
            <svg viewBox="0 0 100 100" class="probe-svg">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#666" stroke-width="2" />
              <circle cx="50" cy="50" r="30" fill="none" stroke="#888" stroke-width="1" />
              <circle cx="50" cy="50" r="20" fill="none" stroke="#aaa" stroke-width="1" />
            </svg>
          </div>
          <!-- Position indicator line -->
          <div v-if="currentIndex === index" class="probe-indicator"></div>
        </div>
      </div>
    </div>
    
    <!-- Bottom info -->
    <div class="viewport-overlay bottom-left">
      <div class="viewport-info">
        <div>WW:800 WC:300</div>
      </div>
    </div>
    
    <!-- Bottom toolbar -->
    <div class="viewport-tools">
      <button class="tool-btn" title="全屏" @click="handleFullscreen">
        <span class="icon">&#x26F6;</span>
      </button>
    </div>
  </div>
</template>

<style lang="less" scoped>
.probe-strip {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
  display: flex;
  flex-direction: column;
}

.probe-container {
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  display: flex;
  align-items: center;
  padding: 8px;
}

.probe-scroll {
  display: flex;
  gap: 2px;
  height: 100%;
  min-width: max-content;
}

.probe-item {
  position: relative;
  height: 100%;
  aspect-ratio: 1;
  min-width: 60px;
  max-width: 100px;
  background: #111;
  border: 1px solid #333;
  cursor: pointer;
  transition: all 0.15s ease;
  
  &:hover {
    border-color: #666;
  }
  
  &.active {
    border-color: var(--primary-color);
    
    .probe-indicator {
      display: block;
    }
  }
}

.probe-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
}

.probe-svg {
  width: 100%;
  height: 100%;
}

.probe-indicator {
  display: none;
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 20px;
  background: var(--danger-color);
}

.viewport-overlay {
  position: absolute;
  z-index: 10;
  pointer-events: none;
  
  &.top-left {
    top: 8px;
    left: 8px;
  }
  
  &.bottom-left {
    bottom: 40px;
    left: 8px;
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
  right: 8px;
  display: flex;
  gap: 4px;
  padding: 4px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 6px;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 15;
  
  .probe-strip:hover & {
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
