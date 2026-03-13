/**
 * Cornerstone3D Initialization Module
 * 初始化 Cornerstone3D 核心库、工具库和 DICOM 图像加载器
 */

import {
  init as csInit,
  RenderingEngine,
  Enums,
  volumeLoader,
  imageLoader,
  metaData,
  type Types
} from '@cornerstonejs/core'
import * as cornerstoneTools from '@cornerstonejs/tools'
import {
  cornerstoneDICOMImageLoader,
  init as dicomImageLoaderInit
} from '@cornerstonejs/dicom-image-loader'
import dicomParser from 'dicom-parser'

const { ToolGroupManager, Enums: ToolEnums } = cornerstoneTools

// Rendering engine singleton
let renderingEngine: RenderingEngine | null = null
const RENDERING_ENGINE_ID = 'coronaryRenderingEngine'

/**
 * Initialize Cornerstone3D and related libraries
 */
export async function initCornerstone(): Promise<void> {
  // Initialize cornerstone core
  await csInit()

  // Initialize DICOM image loader
  dicomImageLoaderInit({
    maxWebWorkers: navigator.hardwareConcurrency || 4,
    startWebWorkersOnDemand: true,
    taskConfiguration: {
      decodeTask: {
        initializeCodecsOnStartup: true,
        strict: false
      }
    }
  })

  // Configure cornerstone DICOM image loader
  cornerstoneDICOMImageLoader.external.cornerstone = {
    imageLoader,
    metaData
  }
  cornerstoneDICOMImageLoader.external.dicomParser = dicomParser

  // Initialize cornerstone tools
  cornerstoneTools.init()

  // Register tools
  registerTools()

  console.log('[Cornerstone3D] Initialization complete')
}

/**
 * Register all required cornerstone tools
 */
function registerTools(): void {
  const {
    PanTool,
    ZoomTool,
    WindowLevelTool,
    StackScrollTool,
    LengthTool,
    AngleTool,
    RectangleROITool,
    EllipticalROITool,
    ArrowAnnotateTool,
    ProbeTool,
    MagnifyTool,
    CrosshairsTool,
    SegmentationDisplayTool
  } = cornerstoneTools

  // Add tools to cornerstone
  cornerstoneTools.addTool(PanTool)
  cornerstoneTools.addTool(ZoomTool)
  cornerstoneTools.addTool(WindowLevelTool)
  cornerstoneTools.addTool(StackScrollTool)
  cornerstoneTools.addTool(LengthTool)
  cornerstoneTools.addTool(AngleTool)
  cornerstoneTools.addTool(RectangleROITool)
  cornerstoneTools.addTool(EllipticalROITool)
  cornerstoneTools.addTool(ArrowAnnotateTool)
  cornerstoneTools.addTool(ProbeTool)
  cornerstoneTools.addTool(MagnifyTool)
  cornerstoneTools.addTool(CrosshairsTool)
  cornerstoneTools.addTool(SegmentationDisplayTool)
}

/**
 * Get or create the rendering engine singleton
 */
export function getRenderingEngine(): RenderingEngine {
  if (!renderingEngine) {
    renderingEngine = new RenderingEngine(RENDERING_ENGINE_ID)
  }
  return renderingEngine
}

/**
 * Destroy the rendering engine
 */
export function destroyRenderingEngine(): void {
  if (renderingEngine) {
    renderingEngine.destroy()
    renderingEngine = null
  }
}

/**
 * Create a tool group for viewports
 */
export function createToolGroup(
  toolGroupId: string,
  viewportIds: string[]
): cornerstoneTools.Types.IToolGroup | undefined {
  // Remove existing tool group if present
  const existingGroup = ToolGroupManager.getToolGroup(toolGroupId)
  if (existingGroup) {
    ToolGroupManager.destroyToolGroup(toolGroupId)
  }

  const toolGroup = ToolGroupManager.createToolGroup(toolGroupId)
  if (!toolGroup) return undefined

  // Add tools to the group
  toolGroup.addTool(cornerstoneTools.PanTool.toolName)
  toolGroup.addTool(cornerstoneTools.ZoomTool.toolName)
  toolGroup.addTool(cornerstoneTools.WindowLevelTool.toolName)
  toolGroup.addTool(cornerstoneTools.StackScrollTool.toolName)
  toolGroup.addTool(cornerstoneTools.LengthTool.toolName)
  toolGroup.addTool(cornerstoneTools.AngleTool.toolName)
  toolGroup.addTool(cornerstoneTools.RectangleROITool.toolName)
  toolGroup.addTool(cornerstoneTools.EllipticalROITool.toolName)
  toolGroup.addTool(cornerstoneTools.ArrowAnnotateTool.toolName)
  toolGroup.addTool(cornerstoneTools.ProbeTool.toolName)
  toolGroup.addTool(cornerstoneTools.MagnifyTool.toolName)

  // Set default tool bindings
  toolGroup.setToolActive(cornerstoneTools.WindowLevelTool.toolName, {
    bindings: [{ mouseButton: ToolEnums.MouseBindings.Primary }]
  })
  toolGroup.setToolActive(cornerstoneTools.PanTool.toolName, {
    bindings: [{ mouseButton: ToolEnums.MouseBindings.Auxiliary }]
  })
  toolGroup.setToolActive(cornerstoneTools.ZoomTool.toolName, {
    bindings: [{ mouseButton: ToolEnums.MouseBindings.Secondary }]
  })
  toolGroup.setToolActive(cornerstoneTools.StackScrollTool.toolName, {
    bindings: [{ mouseButton: ToolEnums.MouseBindings.Wheel }]
  })

  // Add viewports to the tool group
  viewportIds.forEach(id => {
    toolGroup.addViewport(id, RENDERING_ENGINE_ID)
  })

  return toolGroup
}

/**
 * Set active tool for a tool group
 */
export function setActiveTool(toolGroupId: string, toolName: string): void {
  const toolGroup = ToolGroupManager.getToolGroup(toolGroupId)
  if (!toolGroup) return

  // Deactivate all annotation tools first
  const annotationTools = [
    cornerstoneTools.LengthTool.toolName,
    cornerstoneTools.AngleTool.toolName,
    cornerstoneTools.RectangleROITool.toolName,
    cornerstoneTools.EllipticalROITool.toolName,
    cornerstoneTools.ArrowAnnotateTool.toolName,
    cornerstoneTools.ProbeTool.toolName
  ]

  annotationTools.forEach(tool => {
    toolGroup.setToolPassive(tool)
  })

  // Activate the selected tool
  toolGroup.setToolActive(toolName, {
    bindings: [{ mouseButton: ToolEnums.MouseBindings.Primary }]
  })
}

export { Enums, volumeLoader, imageLoader, metaData }
export type { Types }
