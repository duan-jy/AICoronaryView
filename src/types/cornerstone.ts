// ============================================
// Cornerstone3D Type Extensions
// Pure TypeScript types - no runtime imports
// ============================================

export type RGB = [number, number, number]
export type Point3 = [number, number, number]

export interface CS3DViewport {
  id: string
  element: HTMLDivElement
  type: 'stack' | 'volume'
  defaultOptions?: CS3DViewportOptions
}

export interface CS3DViewportOptions {
  background?: RGB
  orientation?: string
  displayArea?: {
    storeAsInitialCamera?: boolean
  }
}

export interface CS3DRenderingEngine {
  id: string
  viewports: Map<string, CS3DViewport>
}

export interface CS3DImageLoadConfig {
  imageId: string
  options?: {
    useWebWorkers?: boolean
    decodeConfig?: {
      convertFloatPixelDataToInt?: boolean
      use16BitDataType?: boolean
    }
  }
}

export interface CS3DToolGroupConfig {
  id: string
  viewportIds: string[]
  tools: CS3DToolConfig[]
}

export interface CS3DToolConfig {
  name: string
  mode: 'Active' | 'Passive' | 'Enabled' | 'Disabled'
  bindings?: CS3DToolBinding[]
}

export interface CS3DToolBinding {
  mouseButton: number
  modifierKey?: string
}

export interface CS3DWindowLevel {
  windowWidth: number
  windowCenter: number
}

export interface CS3DAnnotation {
  annotationUID: string
  metadata: {
    toolName: string
    viewportId: string
    FrameOfReferenceUID?: string
  }
  data: {
    handles: {
      points: Point3[]
      activeHandleIndex?: number
      textBox?: {
        hasMoved: boolean
        worldPosition: Point3
        worldBoundingBox: {
          topLeft: Point3
          topRight: Point3
          bottomLeft: Point3
          bottomRight: Point3
        }
      }
    }
    cachedStats?: Record<string, unknown>
    label?: string
  }
  isLocked?: boolean
  isVisible?: boolean
}

export interface CS3DVolumeConfig {
  volumeId: string
  imageIds: string[]
  options?: {
    progressiveLoading?: boolean
  }
}

export interface CS3DStackViewportInput {
  viewportId: string
  type: 'stack'
  element: HTMLDivElement
  defaultOptions?: CS3DViewportOptions
}

export interface CS3DVolumeViewportInput {
  viewportId: string
  type: 'volume'
  element: HTMLDivElement
  defaultOptions?: CS3DViewportOptions
}

export type CS3DViewportInput = CS3DStackViewportInput | CS3DVolumeViewportInput
