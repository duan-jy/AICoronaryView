import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  DicomStudy, 
  ViewportConfig, 
  LayoutConfig, 
  ToolName,
  ViewportType 
} from '@/types'

// Default layout configurations
const DEFAULT_LAYOUTS: LayoutConfig[] = [
  {
    id: 'default',
    name: '默认布局',
    rows: 2,
    cols: 2,
    viewports: [
      { id: 'vp-1', type: 'ORI', title: 'ORI' },
      { id: 'vp-2', type: 'CPR', title: 'CPR' },
      { id: 'vp-3', type: '3D', title: '3D' },
      { id: 'vp-4', type: 'SPR', title: 'SPR' }
    ]
  },
  {
    id: 'full-diagnostic',
    name: '完整诊断',
    rows: 3,
    cols: 3,
    viewports: [
      { id: 'vp-1', type: 'ORI', title: 'ORI' },
      { id: 'vp-2', type: 'CPR', title: 'CPR' },
      { id: 'vp-3', type: 'VR', title: 'VR' },
      { id: 'vp-4', type: '3D', title: '3D' },
      { id: 'vp-5', type: 'PROBE', title: 'PROBE' },
      { id: 'vp-6', type: 'SPR', title: 'SPR' },
      { id: 'vp-7', type: 'MIP', title: 'MIP' },
      { id: 'vp-8', type: 'MIP_INV', title: 'MIP-INV' },
      { id: 'vp-9', type: 'ORI', title: 'ORI-2' }
    ]
  }
]

export const useViewerStore = defineStore('viewer', () => {
  // State
  const study = ref<DicomStudy | null>(null)
  const activeViewport = ref<string | null>('vp-2')
  const viewports = ref<ViewportConfig[]>([])
  const currentLayout = ref<LayoutConfig>(DEFAULT_LAYOUTS[0])
  const activeTool = ref<ToolName>('WindowLevel')
  const scaleViewport = ref<string | null>(null)
  const windowLevel = ref({ width: 800, center: 300 })
  const progress = ref(0)

  // Getters
  const activeViewportConfig = computed(() => {
    return viewports.value.find(v => v.id === activeViewport.value) || null
  })

  const isFullscreen = computed(() => {
    return scaleViewport.value !== null
  })

  const layouts = computed(() => DEFAULT_LAYOUTS)

  // Actions
  function setStudy(newStudy: DicomStudy | null) {
    study.value = newStudy
  }

  function setActiveViewport(viewportId: string | null) {
    activeViewport.value = viewportId
  }

  function setLayout(layout: LayoutConfig) {
    currentLayout.value = layout
    viewports.value = layout.viewports.map(v => ({ ...v }))
    activeViewport.value = viewports.value[0]?.id || null
  }

  function setActiveTool(tool: ToolName) {
    activeTool.value = tool
  }

  function setScaleViewport(viewportId: string | null) {
    scaleViewport.value = viewportId
  }

  function toggleFullscreen(viewportId: string) {
    if (scaleViewport.value === viewportId) {
      scaleViewport.value = null
    } else {
      scaleViewport.value = viewportId
    }
  }

  function setWindowLevel(width: number, center: number) {
    windowLevel.value = { width, center }
  }

  function setProgress(value: number) {
    progress.value = value
  }

  function updateViewportType(viewportId: string, type: ViewportType) {
    const viewport = viewports.value.find(v => v.id === viewportId)
    if (viewport) {
      viewport.type = type
      viewport.title = type
    }
  }

  function updateViewportArtery(viewportId: string, arteryId: string) {
    const viewport = viewports.value.find(v => v.id === viewportId)
    if (viewport) {
      viewport.arteryId = arteryId
    }
  }

  function $reset() {
    study.value = null
    activeViewport.value = 'vp-2'
    viewports.value = []
    currentLayout.value = DEFAULT_LAYOUTS[0]
    activeTool.value = 'WindowLevel'
    scaleViewport.value = null
    windowLevel.value = { width: 800, center: 300 }
    progress.value = 0
  }

  // Initialize with default layout
  setLayout(DEFAULT_LAYOUTS[0])

  return {
    // State
    study,
    activeViewport,
    viewports,
    currentLayout,
    activeTool,
    scaleViewport,
    windowLevel,
    progress,
    // Getters
    activeViewportConfig,
    isFullscreen,
    layouts,
    // Actions
    setStudy,
    setActiveViewport,
    setLayout,
    setActiveTool,
    setScaleViewport,
    toggleFullscreen,
    setWindowLevel,
    setProgress,
    updateViewportType,
    updateViewportArtery,
    $reset
  }
})
