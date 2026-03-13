<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useArteryStore } from '@/stores/artery'
import { useAppStore } from '@/stores/app'
import PrintHeader from '@/components/print/PrintHeader.vue'
import PrintGrid from '@/components/print/PrintGrid.vue'
import ImageSelector from '@/components/print/ImageSelector.vue'
import LayoutSelector from '@/components/print/LayoutSelector.vue'
import PrintSettings from '@/components/print/PrintSettings.vue'

const route = useRoute()
const router = useRouter()
const arteryStore = useArteryStore()
const appStore = useAppStore()

// Layout configuration
const layoutConfig = ref({
  rows: 4,
  cols: 4,
  type: 'grid' as 'grid' | 'custom'
})

// Selected images for print
const selectedImages = ref<string[]>([])
const currentPage = ref(1)

// Print settings
const printSettings = ref({
  service: 'Printer' as 'Printer' | 'Push',
  printer: 'Printer',
  size: '14INX17IN',
  scope: 'all' as 'all' | 'current'
})

// Computed
const totalSlots = computed(() => layoutConfig.value.rows * layoutConfig.value.cols)
const totalPages = computed(() => Math.ceil(selectedImages.value.length / totalSlots.value))

const currentPageImages = computed(() => {
  const start = (currentPage.value - 1) * totalSlots.value
  const end = start + totalSlots.value
  return selectedImages.value.slice(start, end)
})

// Methods
const handleLayoutChange = (layout: { rows: number; cols: number; type: string }) => {
  layoutConfig.value = layout as typeof layoutConfig.value
  currentPage.value = 1
}

const handleImageSelect = (images: string[]) => {
  selectedImages.value = images
  currentPage.value = 1
}

const handleImageToggle = (imageId: string) => {
  const index = selectedImages.value.indexOf(imageId)
  if (index === -1) {
    selectedImages.value.push(imageId)
  } else {
    selectedImages.value.splice(index, 1)
  }
}

const handlePageChange = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const handlePrint = async () => {
  appStore.setLoading(true)
  try {
    // Print logic will be implemented
    console.log('Printing with settings:', printSettings.value)
    console.log('Selected images:', selectedImages.value)
  } catch (error) {
    console.error('Print failed:', error)
  } finally {
    appStore.setLoading(false)
  }
}

const handlePush = async () => {
  router.push({
    name: 'push',
    query: { images: selectedImages.value.join(',') }
  })
}

const handleClose = () => {
  router.back()
}

// Initialize
onMounted(() => {
  // Load available images from artery store
  const allImages: string[] = []
  arteryStore.arteryList.forEach(artery => {
    artery.children?.forEach(segment => {
      if (segment.images) {
        segment.images.forEach(img => {
          allImages.push(img.id)
        })
      }
    })
  })
  selectedImages.value = allImages.slice(0, 16) // Default select first 16
})
</script>

<template>
  <div class="print-view">
    <!-- Header -->
    <PrintHeader
      :study-id="arteryStore.studyInfo.studyId"
      @close="handleClose"
    />

    <!-- Main Content -->
    <div class="print-content">
      <!-- Left: Print Grid Preview -->
      <div class="print-preview">
        <PrintGrid
          :images="currentPageImages"
          :rows="layoutConfig.rows"
          :cols="layoutConfig.cols"
          :layout-type="layoutConfig.type"
        />

        <!-- Pagination -->
        <div class="print-pagination">
          <button 
            class="page-btn"
            :disabled="currentPage <= 1"
            @click="handlePageChange(currentPage - 1)"
          >
            <i class="iconfont icon-left" />
          </button>
          
          <div class="page-numbers">
            <button
              v-for="page in totalPages"
              :key="page"
              class="page-num"
              :class="{ active: page === currentPage }"
              @click="handlePageChange(page)"
            >
              {{ page }}
            </button>
          </div>
          
          <button 
            class="page-btn"
            :disabled="currentPage >= totalPages"
            @click="handlePageChange(currentPage + 1)"
          >
            <i class="iconfont icon-right" />
          </button>
        </div>
      </div>

      <!-- Right: Selection Panel -->
      <div class="print-sidebar">
        <!-- Image Selector -->
        <ImageSelector
          :selected-images="selectedImages"
          @select="handleImageSelect"
          @toggle="handleImageToggle"
        />

        <!-- Layout Selector -->
        <LayoutSelector
          :current-layout="layoutConfig"
          @change="handleLayoutChange"
        />

        <!-- Print Settings -->
        <PrintSettings
          v-model="printSettings"
        />

        <!-- Action Buttons -->
        <div class="print-actions">
          <button class="btn btn-secondary" @click="handleClose">
            关闭
          </button>
          <button class="btn btn-primary" @click="handlePrint">
            打印
          </button>
          <button class="btn btn-primary" @click="handlePush">
            推送
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.print-view {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.print-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.print-preview {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: var(--bg-secondary);
}

.print-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  
  .page-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover:not(:disabled) {
      background: var(--primary-color);
      border-color: var(--primary-color);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
  
  .page-numbers {
    display: flex;
    gap: 4px;
  }
  
  .page-num {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      border-color: var(--primary-color);
    }
    
    &.active {
      background: var(--primary-color);
      border-color: var(--primary-color);
      color: white;
    }
  }
}

.print-sidebar {
  width: 360px;
  display: flex;
  flex-direction: column;
  background: var(--bg-tertiary);
  border-left: 1px solid var(--border-color);
}

.print-actions {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid var(--border-color);
  
  .btn {
    flex: 1;
    height: 36px;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    
    &-secondary {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      
      &:hover {
        border-color: var(--primary-color);
      }
    }
    
    &-primary {
      background: var(--primary-color);
      border: none;
      color: white;
      
      &:hover {
        background: var(--primary-hover);
      }
    }
  }
}
</style>
