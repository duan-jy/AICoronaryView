/**
 * useViewport Composable
 * Manages Cornerstone3D viewport lifecycle and interactions
 */

import { ref, onMounted, onBeforeUnmount, watch, type Ref } from 'vue'
import {
  createStackViewport,
  loadStackImages,
  removeViewport,
  resetViewport,
  setViewportWindowLevel,
  flipViewportH,
  flipViewportV,
  rotateViewport,
  invertViewport,
  getViewportImage,
  resizeViewport,
  createImageIds,
  createToolGroup
} from '@/utils/cornerstone'
import { useViewerStore } from '@/stores/viewer'

export interface UseViewportOptions {
  viewportId: string
  toolGroupId?: string
  autoResize?: boolean
}

export function useViewport(
  elementRef: Ref<HTMLDivElement | null>,
  options: UseViewportOptions
) {
  const { viewportId, toolGroupId, autoResize = true } = options
  
  const viewerStore = useViewerStore()
  const isReady = ref(false)
  const isLoading = ref(false)
  const currentImageIndex = ref(0)
  const totalImages = ref(0)
  const windowWidth = ref(800)
  const windowCenter = ref(300)

  let resizeObserver: ResizeObserver | null = null

  // Initialize viewport
  async function initViewport() {
    if (!elementRef.value) return

    const viewport = createStackViewport({
      viewportId,
      element: elementRef.value,
      background: [0, 0, 0]
    })

    if (viewport) {
      isReady.value = true

      // Create tool group if specified
      if (toolGroupId) {
        createToolGroup(toolGroupId, [viewportId])
      }

      // Setup resize observer
      if (autoResize) {
        resizeObserver = new ResizeObserver(() => {
          resizeViewport(viewportId)
        })
        resizeObserver.observe(elementRef.value)
      }
    }
  }

  // Load images into viewport
  async function loadImages(urls: string[], initialIndex = 0) {
    if (!isReady.value) return

    isLoading.value = true
    try {
      const imageIds = createImageIds(urls)
      totalImages.value = imageIds.length
      currentImageIndex.value = initialIndex

      await loadStackImages({
        viewportId,
        imageIds,
        initialImageIndex: initialIndex
      })
    } catch (error) {
      console.error('[useViewport] Failed to load images:', error)
    } finally {
      isLoading.value = false
    }
  }

  // Viewport actions
  function reset() {
    resetViewport(viewportId)
  }

  function setWindowLevel(width: number, center: number) {
    windowWidth.value = width
    windowCenter.value = center
    setViewportWindowLevel(viewportId, width, center)
  }

  function flipH() {
    flipViewportH(viewportId)
  }

  function flipV() {
    flipViewportV(viewportId)
  }

  function rotate(degrees: number) {
    rotateViewport(viewportId, degrees)
  }

  function invert() {
    invertViewport(viewportId)
  }

  function getImage(): string | null {
    return getViewportImage(viewportId)
  }

  function resize() {
    resizeViewport(viewportId)
  }

  // Cleanup
  function cleanup() {
    if (resizeObserver) {
      resizeObserver.disconnect()
      resizeObserver = null
    }
    removeViewport(viewportId)
    isReady.value = false
  }

  // Watch for window level changes from store
  watch(
    () => viewerStore.windowLevel,
    (newLevel) => {
      if (isReady.value) {
        setViewportWindowLevel(viewportId, newLevel.width, newLevel.center)
        windowWidth.value = newLevel.width
        windowCenter.value = newLevel.center
      }
    }
  )

  // Lifecycle
  onMounted(() => {
    initViewport()
  })

  onBeforeUnmount(() => {
    cleanup()
  })

  return {
    isReady,
    isLoading,
    currentImageIndex,
    totalImages,
    windowWidth,
    windowCenter,
    loadImages,
    reset,
    setWindowLevel,
    flipH,
    flipV,
    rotate,
    invert,
    getImage,
    resize,
    cleanup
  }
}
