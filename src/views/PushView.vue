<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useArteryStore } from '@/stores/artery'
import { useAppStore } from '@/stores/app'
import PrintHeader from '@/components/print/PrintHeader.vue'
import ImageSelector from '@/components/print/ImageSelector.vue'
import PushServiceList from '@/components/push/PushServiceList.vue'

const route = useRoute()
const router = useRouter()
const arteryStore = useArteryStore()
const appStore = useAppStore()

// Selected images
const selectedImages = ref<string[]>([])

// Push services
interface PushService {
  id: number
  name: string
  aet: string
  selected: boolean
}

const pushServices = ref<PushService[]>([
  { id: 1, name: 'Printer', aet: 'ZYPRINTER', selected: false },
  { id: 2, name: 'C-MOVE', aet: 'DCM4CHEE', selected: false },
  { id: 3, name: 'ZYPACS', aet: 'ZYPACS', selected: false },
  { id: 4, name: 'ZYAI', aet: '000001', selected: false },
  { id: 5, name: 'TEST', aet: '000002', selected: false }
])

// Preview images
const previewImages = computed(() => {
  return selectedImages.value.slice(0, 2).map((id, index) => ({
    id,
    label: `LAD ${index === 0 ? '9°' : '18°'}`,
    info: {
      studyId: arteryStore.studyInfo.studyId,
      patientName: arteryStore.studyInfo.patientName,
      hospital: 'Ganzhou People\'s Hospital',
      ww: 800,
      wc: 300
    }
  }))
})

// Methods
const handleImageSelect = (images: string[]) => {
  selectedImages.value = images
}

const handleImageToggle = (imageId: string) => {
  const index = selectedImages.value.indexOf(imageId)
  if (index === -1) {
    selectedImages.value.push(imageId)
  } else {
    selectedImages.value.splice(index, 1)
  }
}

const handleServiceToggle = (serviceId: number) => {
  const service = pushServices.value.find(s => s.id === serviceId)
  if (service) {
    service.selected = !service.selected
  }
}

const handlePush = async () => {
  const selectedServices = pushServices.value.filter(s => s.selected)
  if (selectedServices.length === 0) {
    alert('请选择推送服务')
    return
  }

  appStore.setLoading(true)
  try {
    // Push logic
    console.log('Pushing to services:', selectedServices)
    console.log('Images:', selectedImages.value)
    
    // Simulate push
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    alert('推送成功')
  } catch (error) {
    console.error('Push failed:', error)
    alert('推送失败')
  } finally {
    appStore.setLoading(false)
  }
}

const handleClose = () => {
  router.back()
}

// Initialize from route params
onMounted(() => {
  const images = route.query.images as string
  if (images) {
    selectedImages.value = images.split(',')
  }
})
</script>

<template>
  <div class="push-view">
    <!-- Header -->
    <PrintHeader
      :study-id="arteryStore.studyInfo.studyId"
      @close="handleClose"
    />

    <!-- Main Content -->
    <div class="push-content">
      <!-- Left: Preview -->
      <div class="push-preview">
        <div class="preview-grid">
          <div
            v-for="(image, index) in previewImages"
            :key="image.id"
            class="preview-item"
          >
            <div class="preview-image">
              <!-- Image placeholder -->
              <div class="image-placeholder" />
              
              <!-- Overlay info -->
              <div class="image-overlay">
                <div class="info-top-left">
                  <div>{{ image.info.studyId }}</div>
                  <div>{{ image.info.patientName }}</div>
                  <div>{{ image.info.hospital }}</div>
                </div>
                <div class="info-top-right">
                  <div>LinCoilan CT</div>
                  <div>{{ image.info.studyId }}</div>
                  <div>{{ image.info.hospital }}</div>
                </div>
                <div class="info-label">{{ image.label }}</div>
                <div class="info-bottom">
                  <span>ww:{{ image.info.ww }} wc:{{ image.info.wc }}</span>
                </div>
              </div>
            </div>
            
            <!-- Toolbar -->
            <div class="preview-toolbar">
              <button class="tool-btn">
                <i class="iconfont icon-delete" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Selection Panel -->
      <div class="push-sidebar">
        <!-- Image Selector -->
        <ImageSelector
          :selected-images="selectedImages"
          @select="handleImageSelect"
          @toggle="handleImageToggle"
        />

        <!-- Push Service List -->
        <PushServiceList
          :services="pushServices"
          @toggle="handleServiceToggle"
        />

        <!-- Action Buttons -->
        <div class="push-actions">
          <button class="btn btn-secondary" @click="handleClose">
            关闭
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
.push-view {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.push-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.push-preview {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: var(--bg-secondary);
}

.preview-grid {
  display: flex;
  gap: 20px;
  height: 100%;
}

.preview-item {
  flex: 1;
  max-width: 50%;
  display: flex;
  flex-direction: column;
}

.preview-image {
  flex: 1;
  position: relative;
  background: #000;
  border: 1px solid var(--border-color);
}

.image-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
}

.image-overlay {
  position: absolute;
  inset: 0;
  padding: 12px;
  pointer-events: none;
  font-size: 11px;
  color: var(--text-secondary);
}

.info-top-left {
  position: absolute;
  top: 12px;
  left: 12px;
  line-height: 1.4;
}

.info-top-right {
  position: absolute;
  top: 12px;
  right: 12px;
  text-align: right;
  line-height: 1.4;
}

.info-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 16px;
  color: var(--primary-color);
}

.info-bottom {
  position: absolute;
  bottom: 12px;
  left: 12px;
}

.preview-toolbar {
  display: flex;
  justify-content: flex-end;
  padding: 8px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-top: none;
  
  .tool-btn {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    transition: color 0.2s;
    
    &:hover {
      color: var(--danger-color);
    }
    
    .iconfont {
      font-size: 16px;
    }
  }
}

.push-sidebar {
  width: 360px;
  display: flex;
  flex-direction: column;
  background: var(--bg-tertiary);
  border-left: 1px solid var(--border-color);
}

.push-actions {
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
