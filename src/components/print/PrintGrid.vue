<script setup lang="ts">
import { computed } from 'vue'
import { useArteryStore } from '@/stores/artery'

interface Props {
  images: string[]
  rows: number
  cols: number
  layoutType: 'grid' | 'custom'
}

const props = defineProps<Props>()
const arteryStore = useArteryStore()

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${props.cols}, 1fr)`,
  gridTemplateRows: `repeat(${props.rows}, 1fr)`
}))

const totalSlots = computed(() => props.rows * props.cols)

const slots = computed(() => {
  const result = []
  for (let i = 0; i < totalSlots.value; i++) {
    result.push({
      index: i,
      imageId: props.images[i] || null
    })
  }
  return result
})

const getImageUrl = (imageId: string | null): string => {
  if (!imageId) return ''
  // In real implementation, this would return the actual image URL
  return `wadouri:${imageId}`
}

const getImageInfo = (imageId: string | null) => {
  if (!imageId) return null
  // Parse image info from ID
  return {
    label: imageId.split('_')[0] || '',
    angle: imageId.includes('°') ? imageId : ''
  }
}
</script>

<template>
  <div class="print-grid-container">
    <div class="print-grid" :style="gridStyle">
      <div
        v-for="slot in slots"
        :key="slot.index"
        class="grid-cell"
        :class="{ empty: !slot.imageId }"
      >
        <template v-if="slot.imageId">
          <div class="cell-content">
            <!-- Image placeholder - in real app would use Cornerstone -->
            <div class="image-placeholder">
              <div class="image-overlay">
                <div class="image-info top-left">
                  <span class="info-text">{{ getImageInfo(slot.imageId)?.label }}</span>
                </div>
                <div class="image-info top-right">
                  <span class="info-text">{{ getImageInfo(slot.imageId)?.angle }}</span>
                </div>
                <div class="image-info bottom-left">
                  <span class="info-text">WW:800 WC:300</span>
                </div>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="empty-cell">
            <i class="iconfont icon-image" />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.print-grid-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: #000;
}

.print-grid {
  display: grid;
  gap: 2px;
  width: 100%;
  max-width: 900px;
  aspect-ratio: 1;
  background: #1a1a1a;
}

.grid-cell {
  background: #0a0a0a;
  position: relative;
  overflow: hidden;
  
  &.empty {
    background: #111;
  }
}

.cell-content {
  width: 100%;
  height: 100%;
  position: relative;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
  position: relative;
}

.image-overlay {
  position: absolute;
  inset: 0;
  padding: 8px;
  pointer-events: none;
}

.image-info {
  position: absolute;
  font-size: 11px;
  color: var(--text-secondary);
  
  &.top-left {
    top: 8px;
    left: 8px;
  }
  
  &.top-right {
    top: 8px;
    right: 8px;
  }
  
  &.bottom-left {
    bottom: 8px;
    left: 8px;
  }
  
  &.bottom-right {
    bottom: 8px;
    right: 8px;
  }
}

.empty-cell {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .iconfont {
    font-size: 32px;
    color: var(--text-muted);
    opacity: 0.3;
  }
}
</style>
