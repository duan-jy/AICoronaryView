<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, inject } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { api } from '@/api'
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

const studyId = inject<{ value: string }>('studyId')
const containerRef = ref<HTMLDivElement | null>(null)
const isLoading = ref(true)
const loadingText = ref('3D模型加载中')

// Three.js objects
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let controls: OrbitControls | null = null
let animationId: number | null = null

// Preset views for the 3D model
const presetViews = [
  { name: 'MIP', icon: 'mip' },
  { name: 'CPR', icon: 'cpr' },
  { name: 'VR', icon: 'vr' },
  { name: '3D', icon: '3d' }
]

function initThree() {
  if (!containerRef.value) return

  const container = containerRef.value
  const width = container.clientWidth
  const height = container.clientHeight

  // Scene
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)

  // Camera
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
  camera.position.set(0, 0, 5)

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(window.devicePixelRatio)
  container.appendChild(renderer.domElement)

  // Controls
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.enableZoom = true
  controls.enablePan = true

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(5, 5, 5)
  scene.add(directionalLight)

  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4)
  directionalLight2.position.set(-5, -5, -5)
  scene.add(directionalLight2)

  // Add placeholder geometry (heart-like shape)
  createPlaceholderModel()

  // Start animation
  animate()
  
  isLoading.value = false
}

function createPlaceholderModel() {
  if (!scene) return

  // Create a simple heart-like mesh as placeholder
  const geometry = new THREE.SphereGeometry(1, 32, 32)
  const material = new THREE.MeshPhongMaterial({
    color: 0xcc6666,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide
  })
  const mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)

  // Add coronary artery lines (simplified)
  const arteryMaterial = new THREE.LineBasicMaterial({ 
    color: 0xff6600,
    linewidth: 2
  })
  
  const points = [
    new THREE.Vector3(0, 1, 0.5),
    new THREE.Vector3(0.3, 0.5, 0.6),
    new THREE.Vector3(0.5, 0, 0.5),
    new THREE.Vector3(0.3, -0.5, 0.4),
    new THREE.Vector3(0, -1, 0.3)
  ]
  
  const arteryGeometry = new THREE.BufferGeometry().setFromPoints(points)
  const arteryLine = new THREE.Line(arteryGeometry, arteryMaterial)
  scene.add(arteryLine)
}

function animate() {
  animationId = requestAnimationFrame(animate)
  
  if (controls) {
    controls.update()
  }
  
  if (renderer && scene && camera) {
    renderer.render(scene, camera)
  }
}

function handleResize() {
  if (!containerRef.value || !camera || !renderer) return
  
  const width = containerRef.value.clientWidth
  const height = containerRef.value.clientHeight
  
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

function resetCamera() {
  if (!camera || !controls) return
  
  camera.position.set(0, 0, 5)
  controls.reset()
}

function handleFullscreen() {
  emit('toggle-fullscreen')
}

function cleanup() {
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
  
  if (renderer && containerRef.value) {
    containerRef.value.removeChild(renderer.domElement)
    renderer.dispose()
    renderer = null
  }
  
  if (controls) {
    controls.dispose()
    controls = null
  }
  
  scene = null
  camera = null
}

// Lifecycle
onMounted(() => {
  initThree()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  cleanup()
})

// Watch for artery changes
watch(() => props.arteryId, () => {
  // Reload 3D model for new artery
  isLoading.value = true
  loadingText.value = '3D模型加载中'
  
  // Simulate loading
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
})
</script>

<template>
  <div class="viewport-3d viewport" :class="{ active: isActive }">
    <!-- Three.js container -->
    <div ref="containerRef" class="three-container"></div>
    
    <!-- Loading overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <span class="loading-text">{{ loadingText }}</span>
    </div>
    
    <!-- Info overlay -->
    <div class="viewport-overlay top-left">
      <div class="viewport-info">
        <div>ARTERY-THREE</div>
      </div>
    </div>
    
    <div class="viewport-overlay top-right">
      <div class="viewport-info" style="text-align: right;">
        <div>neibuceshi</div>
        <div>LiuCuiLan</div>
      </div>
    </div>
    
    <!-- Preset view buttons -->
    <div class="preset-views">
      <button
        v-for="preset in presetViews"
        :key="preset.name"
        class="preset-btn"
        :class="{ active: props.viewportType === preset.name }"
      >
        <img :src="`/src/assets/tab-${preset.icon.toLowerCase()}.png`" :alt="preset.name" />
      </button>
    </div>
    
    <!-- Bottom toolbar -->
    <div class="viewport-tools">
      <button class="tool-btn" title="重置视角" @click="resetCamera">
        <span class="icon">&#x21BA;</span>
      </button>
      <button class="tool-btn" title="全屏" @click="handleFullscreen">
        <span class="icon">&#x26F6;</span>
      </button>
    </div>
  </div>
</template>

<style lang="less" scoped>
.viewport-3d {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
}

.three-container {
  width: 100%;
  height: 100%;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: rgba(0, 0, 0, 0.7);
  z-index: 20;
  
  .loading-text {
    font-size: 12px;
    color: var(--primary-color);
  }
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
}

.viewport-info {
  font-size: 11px;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  line-height: 1.4;
}

.preset-views {
  position: absolute;
  bottom: 8px;
  left: 8px;
  display: flex;
  gap: 4px;
  z-index: 15;
}

.preset-btn {
  width: 36px;
  height: 36px;
  padding: 4px;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.8);
    border-color: var(--primary-color);
  }
  
  &.active {
    border-color: var(--primary-color);
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
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
  
  .viewport-3d:hover & {
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
