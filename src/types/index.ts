// ============================================
// Artery Types - 冠脉血管类型定义
// ============================================

export interface ArterySegment {
  id: string
  name: string
  label: string
  parentId?: string
  children?: ArterySegment[]
}

export interface ArteryBranch {
  id: string
  name: string
  label: string
  group: 'LAD' | 'LCX' | 'RCA' | 'LM' | 'RI'
  segments: ArterySegment[]
}

export interface ArteryTree {
  LM: ArteryBranch
  LAD: ArteryBranch
  LCX: ArteryBranch
  RCA: ArteryBranch
  RI?: ArteryBranch
}

// ============================================
// Stenosis & Plaque Types - 狭窄与斑块类型
// ============================================

export type StenosisLevel = 
  | '未见狭窄'
  | '轻度狭窄'
  | '中度狭窄'
  | '重度狭窄'
  | '闭塞'

export type PlaqueType = 
  | '无斑块'
  | '非钙化斑块'
  | '混合斑块'
  | '钙化斑块'

export interface StenosisInfo {
  arteryId: string
  arteryName: string
  level: StenosisLevel
  percentage?: number
  plaqueType: PlaqueType
  position?: string
  postSurgery?: string
}

export interface DiagnosticReport {
  coronaryOrigin: {
    dominance: '右优势型' | '左优势型' | '均衡型'
    leftOrigin: '左窦' | '右窦' | '无冠窦'
    rightOrigin: '右窦' | '左窦' | '无冠窦'
  }
  stenosis: StenosisInfo[]
  summary?: string
  conclusion?: string
}

// ============================================
// Image & DICOM Types - 图像与DICOM类型
// ============================================

export type ImageType = 'CPR' | 'SPR' | 'VR' | 'MIP' | 'ORI' | 'PROBE' | '3D'

export interface DicomImage {
  id: string
  imageId: string
  arteryId: string
  arteryName: string
  type: ImageType
  angle?: number
  url: string
  thumbnail?: string
  selected?: boolean
  metadata?: DicomMetadata
}

export interface DicomMetadata {
  patientId?: string
  patientName?: string
  studyDate?: string
  studyDescription?: string
  seriesDescription?: string
  institution?: string
  windowWidth?: number
  windowCenter?: number
  rows?: number
  columns?: number
  pixelSpacing?: [number, number]
  sliceThickness?: number
}

export interface DicomSeries {
  seriesId: string
  seriesDescription: string
  modality: string
  images: DicomImage[]
  imageCount: number
}

export interface DicomStudy {
  studyId: string
  studyInstanceUid: string
  patientId: string
  patientName: string
  studyDate: string
  studyDescription?: string
  institution?: string
  series: DicomSeries[]
  progress?: number
}

// ============================================
// Viewport Types - 视口类型
// ============================================

export type ViewportType = 
  | 'ORI'      // 原始横断面
  | 'CPR'      // 曲面重建
  | 'SPR'      // 拉直重建  
  | 'PROBE'    // 探针截面
  | '3D'       // 3D模型
  | 'VR'       // 容积渲染
  | 'MIP'      // 最大密度投影
  | 'MIP_INV'  // 反转MIP

export interface ViewportConfig {
  id: string
  type: ViewportType
  arteryId?: string
  title?: string
  active?: boolean
  windowWidth?: number
  windowCenter?: number
  zoom?: number
  pan?: { x: number; y: number }
  rotation?: number
}

export interface LayoutConfig {
  id: string
  name: string
  rows: number
  cols: number
  viewports: ViewportConfig[]
  thumbnail?: string
}

// ============================================
// Tool Types - 工具类型
// ============================================

export type ToolName = 
  | 'Pan'
  | 'Zoom'
  | 'WindowLevel'
  | 'Length'
  | 'Angle'
  | 'Rectangle'
  | 'Ellipse'
  | 'Arrow'
  | 'Text'
  | 'Eraser'
  | 'Reset'
  | 'Flip'
  | 'Rotate'
  | 'Invert'
  | 'Crosshair'
  | 'Magnify'

export interface ToolState {
  activeTool: ToolName
  annotations: Annotation[]
}

export interface Annotation {
  id: string
  toolName: ToolName
  viewportId: string
  data: any
  visible: boolean
  locked: boolean
}

// ============================================
// Print Types - 打印类型
// ============================================

export interface PrintLayout {
  id: string
  name: string
  rows: number
  cols: number
  special?: boolean
  thumbnail?: string
}

export interface PrintImage {
  id: string
  imageId: string
  position: number
  arteryName?: string
  angle?: string
  type?: ImageType
}

export interface PrintConfig {
  layout: PrintLayout
  images: PrintImage[]
  printer?: string
  paperSize: string
  copies: number
  scope: 'all' | 'current'
}

// ============================================
// Push Types - 推送类型
// ============================================

export interface PushService {
  id: number
  name: string
  aet: string
  type: 'Printer' | 'C-MOVE' | 'PACS'
  enabled: boolean
}

export interface PushConfig {
  services: PushService[]
  selectedServices: number[]
}

// ============================================
// API Types - API类型
// ============================================

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface PatientInfo {
  patientId: string
  patientName: string
  patientSex?: string
  patientAge?: string
  patientBirthDate?: string
  institution?: string
  accessionNumber?: string
}

export interface StudyInfo extends PatientInfo {
  studyInstanceUid: string
  studyDate: string
  studyTime?: string
  studyDescription?: string
  referringPhysician?: string
  progress?: number
}

// ============================================
// Store State Types - 状态类型
// ============================================

export interface AppState {
  loading: boolean
  loadingText: string
  theme: 'dark' | 'light'
  locale: string
}

export interface ArteryState {
  currentArtery: string | null
  arteryTree: ArteryBranch[]
  expandedBranches: string[]
  arteryImages: Record<string, DicomImage[]>
}

export interface ViewerState {
  study: DicomStudy | null
  activeViewport: string | null
  viewports: ViewportConfig[]
  layout: LayoutConfig
  tools: ToolState
}

export interface DiagnosisState {
  report: DiagnosticReport | null
  editing: boolean
  modified: boolean
}
