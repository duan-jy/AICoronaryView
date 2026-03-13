/**
 * useViewport Composable
 * Manages Cornerstone3D viewport lifecycle and interactions
 */

import { ref, onMounted, onBeforeUnmount, watch, type Ref } from 'vue'
import {
  isCornerstoneReady,
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
  const cornerstoneAvailable = ref(false)

  let resizeObserver: ResizeObserver | null = null

  // Initialize viewport
  async function initViewport() {
    if (!elementRef.value) return

    // Check if cornerstone is available (needs WebGL)
    if (!isCornerstoneReady()) {
      console.warn('[useViewport] Cornerstone not ready - viewport will be placeholder only')
      isReady.value = true
      return
    }

    cornerstoneAvailable.value = true

    const viewport = await createStackViewport({
      viewportId,
      element: elementRef.value,
      background: [0, 0, 0]
    })

    if (viewport) {
      isReady.value = true

      if (toolGroupId) {
        await createToolGroup(toolGroupId, [viewportId])
      }

      if (autoResize && elementRef.value) {
        resizeObserver = new ResizeObserver(() => {
          resizeViewport(viewportId)
        })
        resizeObserver.observe(elementRef.value)
      }
    }
  }

  // Load images into viewport
  async function loadViewportImages(urls: string[], initialIndex = 0) {
    if (!isReady.value || !cornerstoneAvailable.value) return

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
  function reset() { resetViewport(viewportId) }
  function setWL(width: number, center: number) {
    windowWidth.value = width
    windowCenter.value = center
    setViewportWindowLevel(viewportId, width, center)
  }
  function flipH() { flipViewportH(viewportId) }
  function flipV() { flipViewportV(viewportId) }
  function rotate(degrees: number) { rotateViewport(viewportId, degrees) }
  function invert() { invertViewport(viewportId) }
  function getImage() { return getViewportImage(viewportId) }
  function resize() { resizeViewport(viewportId) }

  // Cleanup
  function cleanup() {
    if (resizeObserver) {
      resizeObserver.disconnect()
      resizeObserver = null
    }
    if (cornerstoneAvailable.value) {
      removeViewport(viewportId)
    }
    isReady.value = false
  }

  // Watch for window level changes from store
  watch(
    () => viewerStore.windowLevel,
    (newLevel) => {
      if (isReady.value && cornerstoneAvailable.value) {
        setViewportWindowLevel(viewportId, newLevel.width, newLevel.center)
        windowWidth.value = newLevel.width
        windowCenter.value = newLevel.center
      }
    }
  )

  onMounted(() => { initViewport() })
  onBeforeUnmount(() => { cleanup() })

  return {
    isReady,
    isLoading,
    cornerstoneAvailable,
    currentImageIndex,
    totalImages,
    windowWidth,
    windowCenter,
    loadImages: loadViewportImages,
    reset,
    setWindowLevel: setWL,
    flipH,
    flipV,
    rotate,
    invert,
    getImage,
    resize,
    cleanup
  }
}
