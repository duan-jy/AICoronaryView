/**
 * Cornerstone3D Viewport Utilities
 * 视口创建和管理工具
 */

import {
  RenderingEngine,
  Enums,
  type Types
} from '@cornerstonejs/core'
import { getRenderingEngine } from './init'

export interface ViewportOptions {
  viewportId: string
  element: HTMLDivElement
  type?: 'stack' | 'volume'
  background?: Types.RGB
}

export interface StackViewportConfig {
  viewportId: string
  imageIds: string[]
  initialImageIndex?: number
}

/**
 * Create a stack viewport
 */
export function createStackViewport(
  options: ViewportOptions
): Types.IStackViewport | null {
  const { viewportId, element, background = [0, 0, 0] } = options
  const renderingEngine = getRenderingEngine()

  // Check if viewport already exists
  const existingViewport = renderingEngine.getViewport(viewportId)
  if (existingViewport) {
    return existingViewport as Types.IStackViewport
  }

  // Enable the element for cornerstone
  const viewportInput: Types.PublicViewportInput = {
    viewportId,
    type: Enums.ViewportType.STACK,
    element,
    defaultOptions: {
      background
    }
  }

  renderingEngine.enableElement(viewportInput)
  
  return renderingEngine.getViewport(viewportId) as Types.IStackViewport
}

/**
 * Create a volume viewport
 */
export function createVolumeViewport(
  options: ViewportOptions
): Types.IVolumeViewport | null {
  const { viewportId, element, background = [0, 0, 0] } = options
  const renderingEngine = getRenderingEngine()

  const viewportInput: Types.PublicViewportInput = {
    viewportId,
    type: Enums.ViewportType.ORTHOGRAPHIC,
    element,
    defaultOptions: {
      background
    }
  }

  renderingEngine.enableElement(viewportInput)
  
  return renderingEngine.getViewport(viewportId) as Types.IVolumeViewport
}

/**
 * Load images into a stack viewport
 */
export async function loadStackImages(
  config: StackViewportConfig
): Promise<void> {
  const { viewportId, imageIds, initialImageIndex = 0 } = config
  const renderingEngine = getRenderingEngine()
  const viewport = renderingEngine.getViewport(viewportId) as Types.IStackViewport

  if (!viewport) {
    console.error(`[Viewport] Viewport ${viewportId} not found`)
    return
  }

  await viewport.setStack(imageIds, initialImageIndex)
  viewport.render()
}

/**
 * Get viewport by ID
 */
export function getViewport(viewportId: string): Types.IViewport | undefined {
  const renderingEngine = getRenderingEngine()
  return renderingEngine.getViewport(viewportId)
}

/**
 * Remove a viewport
 */
export function removeViewport(viewportId: string): void {
  const renderingEngine = getRenderingEngine()
  renderingEngine.disableElement(viewportId)
}

/**
 * Render a viewport
 */
export function renderViewport(viewportId: string): void {
  const renderingEngine = getRenderingEngine()
  const viewport = renderingEngine.getViewport(viewportId)
  if (viewport) {
    viewport.render()
  }
}

/**
 * Render all viewports
 */
export function renderAllViewports(): void {
  const renderingEngine = getRenderingEngine()
  renderingEngine.render()
}

/**
 * Reset viewport camera
 */
export function resetViewport(viewportId: string): void {
  const viewport = getViewport(viewportId)
  if (viewport) {
    viewport.resetCamera()
    viewport.render()
  }
}

/**
 * Set viewport window level
 */
export function setViewportWindowLevel(
  viewportId: string,
  windowWidth: number,
  windowCenter: number
): void {
  const viewport = getViewport(viewportId) as Types.IStackViewport
  if (viewport && viewport.setProperties) {
    viewport.setProperties({
      voiRange: {
        lower: windowCenter - windowWidth / 2,
        upper: windowCenter + windowWidth / 2
      }
    })
    viewport.render()
  }
}

/**
 * Flip viewport horizontally
 */
export function flipViewportH(viewportId: string): void {
  const viewport = getViewport(viewportId) as Types.IStackViewport
  if (viewport) {
    const { flipHorizontal } = viewport.getCamera()
    viewport.setCamera({ flipHorizontal: !flipHorizontal })
    viewport.render()
  }
}

/**
 * Flip viewport vertically
 */
export function flipViewportV(viewportId: string): void {
  const viewport = getViewport(viewportId) as Types.IStackViewport
  if (viewport) {
    const { flipVertical } = viewport.getCamera()
    viewport.setCamera({ flipVertical: !flipVertical })
    viewport.render()
  }
}

/**
 * Rotate viewport
 */
export function rotateViewport(viewportId: string, degrees: number): void {
  const viewport = getViewport(viewportId) as Types.IStackViewport
  if (viewport && viewport.getProperties) {
    const properties = viewport.getProperties()
    const currentRotation = properties.rotation || 0
    viewport.setProperties({ rotation: currentRotation + degrees })
    viewport.render()
  }
}

/**
 * Invert viewport colors
 */
export function invertViewport(viewportId: string): void {
  const viewport = getViewport(viewportId) as Types.IStackViewport
  if (viewport && viewport.getProperties) {
    const properties = viewport.getProperties()
    viewport.setProperties({ invert: !properties.invert })
    viewport.render()
  }
}

/**
 * Get viewport canvas as data URL
 */
export function getViewportImage(viewportId: string): string | null {
  const viewport = getViewport(viewportId)
  if (!viewport) return null

  const canvas = viewport.getCanvas()
  return canvas.toDataURL('image/png')
}

/**
 * Resize viewport
 */
export function resizeViewport(viewportId: string): void {
  const renderingEngine = getRenderingEngine()
  renderingEngine.resize(true, true)
}
