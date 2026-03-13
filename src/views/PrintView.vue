<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useArteryStore } from '@/stores/artery'
import { useAppStore } from '@/stores/app'
import SvgIcon from '@/components/common/SvgIcon.vue'
import PrintHeader from '@/components/print/PrintHeader.vue'
import PrintGrid from '@/components/print/PrintGrid.vue'
import ImageSelector from '@/components/print/ImageSelector.vue'
import LayoutSelector from '@/components/print/LayoutSelector.vue'
import PrintSettings from '@/components/print/PrintSettings.vue'

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
const autoFill = ref(true)

// Print settings
const printSettings = ref({
  service: 'Printer' as 'Printer' | 'Push',
  printer: 'Printer',
  size: '14INX17IN',
  scope: 'all' as 'all' | 'current'
})

// Computed
const totalSlots = computed(() => layoutConfig.value.rows * layoutConfig.value.cols)
const totalPages = computed(() => Math.max(1, Math.ceil(selectedImages.value.length / totalSlots.value)))

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
  appStore.setLoading(true, '正在打印...')
  try {
    console.log('Printing:', printSettings.value, selectedImages.value)
  } finally {
    appStore.setLoading(false)
  }
}

const handlePush = () => {
  router.push({ name: 'push', query: { images: selectedImages.value.join(',') } })
}

const handleClose = () => {
  router.back()
}
</script>

<template>
  <div class="print-view">
    <PrintHeader @close="handleClose" />

    <div class="print-content">
      <!-- Left: Grid Preview -->
      <div class="print-preview">
        <PrintGrid
          :images="currentPageImages"
          :rows="layoutConfig.rows"
          :cols="layoutConfig.cols"
          :layout-type="layoutConfig.type"
        />

        <!-- Bottom Bar -->
        <div class="print-bottom-bar">
          <label class="auto-fill-toggle">
            <span>自动向前填充</span>
            <input v-model="autoFill" type="checkbox" />
          </label>

          <!-- Pagination -->
          <div class="print-pagination">
            <button class="page-btn" :disabled="currentPage <= 1" @click="handlePageChange(currentPage - 1)">
              <SvgIcon name="chevron-left" :size="14" />
            </button>
            <button
              v-for="page in totalPages"
              :key="page"
              class="page-num"
              :class="{ active: page === currentPage }"
              @click="handlePageChange(page)"
            >{{ page }}</button>
            <button class="page-btn" :disabled="currentPage >= totalPages" @click="handlePageChange(currentPage + 1)">
              <SvgIcon name="chevron-right" :size="14" />
            </button>
          </div>

          <div class="print-bottom-actions">
            <button class="btn btn-secondary btn-sm" @click="handleClose">关 闭</button>
            <button class="btn btn-accent btn-sm" @click="handlePrint">
              <SvgIcon name="print" :size="14" />
              打印
            </button>
            <button class="btn btn-accent btn-sm" @click="handlePush">
              <SvgIcon name="push" :size="14" />
              推送
            </button>
          </div>
        </div>
      </div>

      <!-- Right: Selection Panel -->
      <div class="print-sidebar pretty-bar">
        <ImageSelector
          :selected-images="selectedImages"
          @select="handleImageSelect"
          @toggle="handleImageToggle"
        />
        <LayoutSelector
          :current-layout="layoutConfig"
          @change="handleLayoutChange"
        />
        <PrintSettings v-model="printSettings" />
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
  background: var(--bg-secondary);
}

.print-bottom-bar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  border-top: 1px solid var(--border-color);
  background: var(--bg-primary);
}

.auto-fill-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-secondary);
  cursor: pointer;
  
  input {
    width: 16px;
    height: 16px;
    accent-color: var(--accent-color);
  }
}

.print-pagination {
  display: flex;
  align-items: center;
  gap: 4px;
}

.page-btn {
  width: 28px;
  height: 28px;
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
    background: var(--accent-color);
    border-color: var(--accent-color);
  }
  
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.page-num {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-primary);
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
  
  &:hover {
    border-color: var(--accent-color);
  }
  
  &.active {
    background: var(--accent-color);
    border-color: var(--accent-color);
    color: white;
  }
}

.print-bottom-actions {
  display: flex;
  gap: 8px;
}

.print-sidebar {
  width: 360px;
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
  border-left: 1px solid var(--border-color);
  overflow-y: auto;
}
</style>
