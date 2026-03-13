/**
 * Cornerstone3D Viewport Utilities
 * 视口创建和管理工具 - All imports are lazy to avoid WebGL crashes
 */

import { getRenderingEngine, isCornerstoneReady } from './init'

export interface ViewportOptions {
  viewportId: string
  element: HTMLDivElement
  type?: 'stack' | 'volume'
  background?: [number, number, number]
}

export interface StackViewportConfig {
  viewportId: string
  imageIds: string[]
  initialImageIndex?: number
}

/**
 * Create a stack viewport
 */
export async function createStackViewport(options: ViewportOptions): Promise<any> {
  if (!isCornerstoneReady()) return null
  try {
    const { Enums } = await import('@cornerstonejs/core')
    const { viewportId, element, background = [0, 0, 0] } = options
    const renderingEngine = await getRenderingEngine()
    if (!renderingEngine) return null

    const existingViewport = renderingEngine.getViewport(viewportId)
    if (existingViewport) return existingViewport

    renderingEngine.enableElement({
      viewportId,
      type: Enums.ViewportType.STACK,
      element,
      defaultOptions: { background }
    })

    return renderingEngine.getViewport(viewportId)
  } catch { return null }
}

/**
 * Create a volume viewport
 */
export async function createVolumeViewport(options: ViewportOptions): Promise<any> {
  if (!isCornerstoneReady()) return null
  try {
    const { Enums } = await import('@cornerstonejs/core')
    const { viewportId, element, background = [0, 0, 0] } = options
    const renderingEngine = await getRenderingEngine()
    if (!renderingEngine) return null

    renderingEngine.enableElement({
      viewportId,
      type: Enums.ViewportType.ORTHOGRAPHIC,
      element,
      defaultOptions: { background }
    })

    return renderingEngine.getViewport(viewportId)
  } catch { return null }
}

/**
 * Load images into a stack viewport
 */
export async function loadStackImages(config: StackViewportConfig): Promise<void> {
  if (!isCornerstoneReady()) return
  try {
    const { viewportId, imageIds, initialImageIndex = 0 } = config
    const renderingEngine = await getRenderingEngine()
    if (!renderingEngine) return

    const viewport = renderingEngine.getViewport(viewportId)
    if (!viewport) return

    await viewport.setStack(imageIds, initialImageIndex)
    viewport.render()
  } catch {}
}

/**
 * Get viewport by ID
 */
export async function getViewport(viewportId: string): Promise<any> {
  const renderingEngine = await getRenderingEngine()
  return renderingEngine?.getViewport(viewportId) ?? null
}

export async function removeViewport(viewportId: string): Promise<void> {
  const renderingEngine = await getRenderingEngine()
  renderingEngine?.disableElement(viewportId)
}

export async function renderViewport(viewportId: string): Promise<void> {
  const vp = await getViewport(viewportId)
  vp?.render()
}

export async function renderAllViewports(): Promise<void> {
  const renderingEngine = await getRenderingEngine()
  renderingEngine?.render()
}

export async function resetViewport(viewportId: string): Promise<void> {
  const vp = await getViewport(viewportId)
  if (vp) { vp.resetCamera(); vp.render() }
}

export async function setViewportWindowLevel(
  viewportId: string, windowWidth: number, windowCenter: number
): Promise<void> {
  const vp = await getViewport(viewportId)
  if (vp?.setProperties) {
    vp.setProperties({
      voiRange: { lower: windowCenter - windowWidth / 2, upper: windowCenter + windowWidth / 2 }
    })
    vp.render()
  }
}

export async function flipViewportH(viewportId: string): Promise<void> {
  const vp = await getViewport(viewportId)
  if (vp) {
    const { flipHorizontal } = vp.getCamera()
    vp.setCamera({ flipHorizontal: !flipHorizontal })
    vp.render()
  }
}

export async function flipViewportV(viewportId: string): Promise<void> {
  const vp = await getViewport(viewportId)
  if (vp) {
    const { flipVertical } = vp.getCamera()
    vp.setCamera({ flipVertical: !flipVertical })
    vp.render()
  }
}

export async function rotateViewport(viewportId: string, degrees: number): Promise<void> {
  const vp = await getViewport(viewportId)
  if (vp?.getProperties) {
    const props = vp.getProperties()
    vp.setProperties({ rotation: (props.rotation || 0) + degrees })
    vp.render()
  }
}

export async function invertViewport(viewportId: string): Promise<void> {
  const vp = await getViewport(viewportId)
  if (vp?.getProperties) {
    const props = vp.getProperties()
    vp.setProperties({ invert: !props.invert })
    vp.render()
  }
}

export async function getViewportImage(viewportId: string): Promise<string | null> {
  const vp = await getViewport(viewportId)
  if (!vp) return null
  return vp.getCanvas().toDataURL('image/png')
}

export async function resizeViewport(_viewportId: string): Promise<void> {
  const renderingEngine = await getRenderingEngine()
  renderingEngine?.resize(true, true)
}
