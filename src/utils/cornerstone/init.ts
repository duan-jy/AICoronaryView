/**
 * Cornerstone3D Initialization Module
 * 初始化 Cornerstone3D 核心库、工具库和 DICOM 图像加载器
 */

let isInitialized = false
let initError: string | null = null

// Rendering engine singleton (typed as any to avoid import issues when WebGL unavailable)
let renderingEngine: any = null
const RENDERING_ENGINE_ID = 'coronaryRenderingEngine'

/**
 * Check if WebGL is available
 */
function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(
      canvas.getContext('webgl2') || canvas.getContext('webgl')
    )
  } catch {
    return false
  }
}

/**
 * Initialize Cornerstone3D and related libraries
 */
export async function initCornerstone(): Promise<boolean> {
  if (isInitialized) return true

  if (!hasWebGL()) {
    initError = 'WebGL not available'
    console.warn('[Cornerstone3D] WebGL not available - running in demo mode')
    return false
  }

  try {
    const csCore = await import('@cornerstonejs/core')
    const csTools = await import('@cornerstonejs/tools')

    // Initialize cornerstone core
    await csCore.init()

    // Try to initialize DICOM image loader
    try {
      const csDicom = await import('@cornerstonejs/dicom-image-loader')
      csDicom.init({
        maxWebWorkers: navigator.hardwareConcurrency || 4,
        startWebWorkersOnDemand: true,
        taskConfiguration: {
          decodeTask: {
            initializeCodecsOnStartup: true,
            strict: false
          }
        }
      })
    } catch (e) {
      console.warn('[Cornerstone3D] DICOM image loader init failed:', e)
    }

    // Initialize cornerstone tools
    csTools.init()

    // Register tools
    registerTools(csTools)

    isInitialized = true
    console.log('[Cornerstone3D] Initialization complete')
    return true
  } catch (error: any) {
    initError = error?.message || 'Unknown error'
    console.warn('[Cornerstone3D] Init failed:', initError)
    return false
  }
}

/**
 * Register all required cornerstone tools
 */
function registerTools(csTools: any): void {
  const tools = [
    'PanTool', 'ZoomTool', 'WindowLevelTool', 'StackScrollTool',
    'LengthTool', 'AngleTool', 'RectangleROITool', 'EllipticalROITool',
    'ArrowAnnotateTool', 'ProbeTool', 'MagnifyTool',
    'CrosshairsTool', 'SegmentationDisplayTool'
  ]

  tools.forEach(toolName => {
    try {
      if (csTools[toolName]) {
        csTools.addTool(csTools[toolName])
      }
    } catch (e) {
      console.warn(`[Cornerstone3D] Failed to register ${toolName}:`, e)
    }
  })
}

/**
 * Get or create the rendering engine singleton
 */
export async function getRenderingEngine(): Promise<any> {
  if (!isInitialized) {
    const ok = await initCornerstone()
    if (!ok) return null
  }

  if (!renderingEngine) {
    try {
      const { RenderingEngine } = await import('@cornerstonejs/core')
      renderingEngine = new RenderingEngine(RENDERING_ENGINE_ID)
    } catch {
      return null
    }
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
 * Check if cornerstone is available
 */
export function isCornerstoneReady(): boolean {
  return isInitialized
}

export function getCornerstoneError(): string | null {
  return initError
}

/**
 * Create a tool group for viewports
 */
export async function createToolGroup(
  toolGroupId: string,
  viewportIds: string[]
): Promise<any> {
  if (!isInitialized) return null

  try {
    const csTools = await import('@cornerstonejs/tools')
    const { ToolGroupManager, Enums: ToolEnums } = csTools

    const existingGroup = ToolGroupManager.getToolGroup(toolGroupId)
    if (existingGroup) {
      ToolGroupManager.destroyToolGroup(toolGroupId)
    }

    const toolGroup = ToolGroupManager.createToolGroup(toolGroupId)
    if (!toolGroup) return null

    // Add tools
    const toolNames = [
      'PanTool', 'ZoomTool', 'WindowLevelTool', 'StackScrollTool',
      'LengthTool', 'AngleTool', 'RectangleROITool', 'EllipticalROITool',
      'ArrowAnnotateTool', 'ProbeTool', 'MagnifyTool'
    ]
    toolNames.forEach(name => {
      if (csTools[name]) {
        try { toolGroup.addTool(csTools[name].toolName) } catch {}
      }
    })

    // Set default bindings
    try {
      toolGroup.setToolActive(csTools.WindowLevelTool.toolName, {
        bindings: [{ mouseButton: ToolEnums.MouseBindings.Primary }]
      })
      toolGroup.setToolActive(csTools.PanTool.toolName, {
        bindings: [{ mouseButton: ToolEnums.MouseBindings.Auxiliary }]
      })
      toolGroup.setToolActive(csTools.ZoomTool.toolName, {
        bindings: [{ mouseButton: ToolEnums.MouseBindings.Secondary }]
      })
    } catch {}

    // Add viewports
    viewportIds.forEach(id => {
      toolGroup.addViewport(id, RENDERING_ENGINE_ID)
    })

    return toolGroup
  } catch {
    return null
  }
}

/**
 * Set active tool for a tool group
 */
export async function setActiveTool(toolGroupId: string, toolName: string): Promise<void> {
  if (!isInitialized) return

  try {
    const csTools = await import('@cornerstonejs/tools')
    const toolGroup = csTools.ToolGroupManager.getToolGroup(toolGroupId)
    if (!toolGroup) return

    toolGroup.setToolActive(toolName, {
      bindings: [{ mouseButton: csTools.Enums.MouseBindings.Primary }]
    })
  } catch {}
}
