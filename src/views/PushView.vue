<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import SvgIcon from '@/components/common/SvgIcon.vue'
import PrintHeader from '@/components/print/PrintHeader.vue'
import ImageSelector from '@/components/print/ImageSelector.vue'
import PushServiceList from '@/components/push/PushServiceList.vue'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const selectedImages = ref<string[]>([])

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

const previewImages = computed(() => {
  return selectedImages.value.slice(0, 2).map((id, index) => ({
    id,
    label: `LAD ${index === 0 ? '9' : '18'}`,
    ww: 800,
    wc: 300
  }))
})

const handleImageSelect = (images: string[]) => { selectedImages.value = images }
const handleImageToggle = (imageId: string) => {
  const i = selectedImages.value.indexOf(imageId)
  if (i === -1) selectedImages.value.push(imageId)
  else selectedImages.value.splice(i, 1)
}
const handleServiceToggle = (serviceId: number) => {
  const s = pushServices.value.find(s => s.id === serviceId)
  if (s) s.selected = !s.selected
}

const handlePush = async () => {
  const selected = pushServices.value.filter(s => s.selected)
  if (!selected.length) return
  appStore.setLoading(true, '正在推送...')
  try {
    await new Promise(r => setTimeout(r, 1000))
  } finally {
    appStore.setLoading(false)
  }
}

const handleClose = () => { router.back() }

onMounted(() => {
  const images = route.query.images as string
  if (images) selectedImages.value = images.split(',')
})
</script>

<template>
  <div class="push-view">
    <PrintHeader @close="handleClose" />
    <div class="push-content">
      <!-- Left: Preview -->
      <div class="push-preview">
        <div class="preview-grid">
          <div v-for="image in previewImages" :key="image.id" class="preview-item">
            <div class="preview-image">
              <div class="image-placeholder" />
              <div class="image-overlay">
                <div class="info-top-left">
                  <div>CT20220707228</div>
                  <div>60020000</div>
                  <div>Ganzhou People's Hospital</div>
                </div>
                <div class="info-label">{{ image.label }}</div>
                <div class="info-bottom">ww:{{ image.ww }} wc:{{ image.wc }}</div>
              </div>
            </div>
            <div class="preview-toolbar">
              <button class="toolbar-btn" title="删除">
                <SvgIcon name="close" :size="14" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right -->
      <div class="push-sidebar pretty-bar">
        <ImageSelector :selected-images="selectedImages" @select="handleImageSelect" @toggle="handleImageToggle" />
        <PushServiceList :services="pushServices" @toggle="handleServiceToggle" />
        <div class="push-actions">
          <button class="btn btn-secondary" @click="handleClose">关闭</button>
          <button class="btn btn-accent" @click="handlePush">
            <SvgIcon name="send" :size="14" />
            推 送
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
  background: linear-gradient(135deg, #121a28 0%, #080e18 100%);
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
  line-height: 1.5;
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
  padding: 6px 8px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-top: none;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  transition: color 0.2s;
  
  &:hover { color: var(--danger-color); }
}

.push-sidebar {
  width: 360px;
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
  border-left: 1px solid var(--border-color);
  overflow-y: auto;
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
  }
}
</style>
