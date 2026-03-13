<script setup lang="ts">
import { ref, computed } from 'vue'
import { useArteryStore } from '@/stores/artery'
import type { ImageType } from '@/types'

interface Props {
  selectedImages: string[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  select: [images: string[]]
  toggle: [imageId: string]
}>()

const arteryStore = useArteryStore()

// Filter tabs
const imageTypes: { key: ImageType | 'all' | 'combined'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'cpr', label: 'CPR' },
  { key: 'spr', label: 'SPR' },
  { key: 'vr', label: 'VR' },
  { key: 'mip', label: 'MIP' },
  { key: 'combined', label: '组合' }
]

const activeType = ref<ImageType | 'all' | 'combined'>('all')

// Vessel filter
const vesselFilters = [
  '全部', 'LAD', 'D1', 'D2', 'LCX', 'OM2', 'RI', 'RCA', 'R-PDA', 'AM1', 'AM2', 'RCB'
]
const activeVessel = ref('全部')

// Mock image data - in real app would come from store
const mockImages = computed(() => {
  const images = []
  const vessels = ['LAD', 'D1', 'D2', 'LCX', 'RCA']
  const angles = ['0°', '9°', '18°', '27°', '36°', '45°']
  
  for (const vessel of vessels) {
    for (const angle of angles) {
      images.push({
        id: `${vessel}_${angle}_${Math.random().toString(36).substr(2, 9)}`,
        vessel,
        angle,
        type: 'cpr' as ImageType,
        thumbnail: ''
      })
    }
  }
  return images
})

const filteredImages = computed(() => {
  let images = mockImages.value
  
  if (activeVessel.value !== '全部') {
    images = images.filter(img => img.vessel === activeVessel.value)
  }
  
  if (activeType.value !== 'all' && activeType.value !== 'combined') {
    images = images.filter(img => img.type === activeType.value)
  }
  
  return images
})

const isSelected = (imageId: string) => props.selectedImages.includes(imageId)

const toggleImage = (imageId: string) => {
  emit('toggle', imageId)
}

const selectAll = () => {
  emit('select', filteredImages.value.map(img => img.id))
}

const clearAll = () => {
  emit('select', [])
}
</script>

<template>
  <div class="image-selector">
    <!-- Type Tabs -->
    <div class="selector-header">
      <span class="header-label">类型:</span>
      <div class="type-tabs">
        <button
          v-for="type in imageTypes"
          :key="type.key"
          class="type-tab"
          :class="{ active: activeType === type.key }"
          @click="activeType = type.key"
        >
          {{ type.label }}
        </button>
      </div>
    </div>

    <!-- Vessel Filter -->
    <div class="vessel-filter">
      <div class="vessel-list">
        <button
          v-for="vessel in vesselFilters"
          :key="vessel"
          class="vessel-btn"
          :class="{ active: activeVessel === vessel }"
          @click="activeVessel = vessel"
        >
          {{ vessel }}
        </button>
      </div>
    </div>

    <!-- Image Grid -->
    <div class="image-grid">
      <div
        v-for="image in filteredImages"
        :key="image.id"
        class="image-item"
        :class="{ selected: isSelected(image.id) }"
        @click="toggleImage(image.id)"
      >
        <div class="image-thumbnail">
          <div class="thumbnail-placeholder" />
          <div class="image-label">{{ image.vessel }} {{ image.angle }}</div>
          <div v-if="isSelected(image.id)" class="check-mark">
            <i class="iconfont icon-check" />
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="selector-actions">
      <button class="action-btn" @click="selectAll">
        <span>历史排版</span>
      </button>
      <button class="action-btn primary" @click="selectAll">
        <span>智能排版</span>
      </button>
    </div>
  </div>
</template>

<style lang="less" scoped>
.image-selector {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.selector-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  
  .header-label {
    color: var(--text-secondary);
    font-size: 13px;
    white-space: nowrap;
  }
}

.type-tabs {
  display: flex;
  gap: 4px;
  
  .type-tab {
    padding: 4px 12px;
    background: transparent;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    color: var(--text-secondary);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      border-color: var(--primary-color);
      color: var(--primary-color);
    }
    
    &.active {
      background: var(--primary-color);
      border-color: var(--primary-color);
      color: white;
    }
  }
}

.vessel-filter {
  padding: 8px 16px;
  border-bottom: 1px solid var(--border-color);
  
  .vessel-list {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
  
  .vessel-btn {
    padding: 2px 8px;
    background: transparent;
    border: none;
    border-radius: 2px;
    color: var(--text-secondary);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      color: var(--primary-color);
    }
    
    &.active {
      background: var(--primary-color);
      color: white;
    }
  }
}

.image-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 12px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 3px;
  }
}

.image-item {
  cursor: pointer;
  
  &.selected .image-thumbnail {
    border-color: var(--primary-color);
  }
}

.image-thumbnail {
  position: relative;
  aspect-ratio: 1;
  border: 2px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  transition: border-color 0.2s;
  
  &:hover {
    border-color: var(--primary-color);
  }
}

.thumbnail-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
}

.image-label {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 4px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 10px;
  text-align: center;
}

.check-mark {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--success-color);
  border-radius: 2px;
  
  .iconfont {
    font-size: 12px;
    color: white;
  }
}

.selector-actions {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--border-color);
  
  .action-btn {
    flex: 1;
    height: 32px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    color: var(--text-primary);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      border-color: var(--primary-color);
    }
    
    &.primary {
      background: var(--primary-color);
      border-color: var(--primary-color);
      color: white;
      
      &:hover {
        background: var(--primary-hover);
      }
    }
  }
}
</style>
