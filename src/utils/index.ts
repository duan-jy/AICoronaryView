// Date formatting utilities
export const formatDate = (date: Date | string, format: string = 'YYYY-MM-DD'): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

// Parse DICOM date format (YYYYMMDD)
export const parseDicomDate = (dicomDate: string): Date | null => {
  if (!dicomDate || dicomDate.length !== 8) return null
  
  const year = parseInt(dicomDate.substring(0, 4))
  const month = parseInt(dicomDate.substring(4, 6)) - 1
  const day = parseInt(dicomDate.substring(6, 8))
  
  return new Date(year, month, day)
}

// Number utilities
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max)
}

export const lerp = (a: number, b: number, t: number): number => {
  return a + (b - a) * t
}

export const mapRange = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number => {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
}

// String utilities
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const truncate = (str: string, length: number, suffix: string = '...'): string => {
  if (str.length <= length) return str
  return str.substring(0, length - suffix.length) + suffix
}

// Array utilities
export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

export const unique = <T>(array: T[]): T[] => {
  return [...new Set(array)]
}

export const groupBy = <T, K extends keyof any>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> => {
  return array.reduce((result, item) => {
    const key = keyFn(item)
    if (!result[key]) {
      result[key] = []
    }
    result[key].push(item)
    return result
  }, {} as Record<K, T[]>)
}

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

// Throttle utility
export const throttle = <T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Deep clone utility
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as unknown as T
  }
  
  const cloned = {} as T
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key])
    }
  }
  
  return cloned
}

// UUID generator
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Color utilities
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null
}

export const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

// Window/WL utilities for DICOM
export const calculateVOILUT = (
  pixelValue: number,
  windowWidth: number,
  windowCenter: number
): number => {
  const minValue = windowCenter - windowWidth / 2
  const maxValue = windowCenter + windowWidth / 2
  
  if (pixelValue <= minValue) return 0
  if (pixelValue >= maxValue) return 255
  
  return Math.round(((pixelValue - minValue) / windowWidth) * 255)
}

// Stenosis severity classification
export const getStenosisSeverity = (percentage: number): string => {
  if (percentage === 0) return '未见狭窄'
  if (percentage < 25) return '轻微狭窄'
  if (percentage < 50) return '轻度狭窄'
  if (percentage < 70) return '中度狭窄'
  if (percentage < 90) return '重度狭窄'
  if (percentage < 100) return '次全闭塞'
  return '完全闭塞'
}

export const getStenosisColor = (percentage: number): string => {
  if (percentage === 0) return '#4ade80' // green
  if (percentage < 50) return '#facc15' // yellow
  if (percentage < 70) return '#fb923c' // orange
  return '#ef4444' // red
}

// Artery name mapping
export const arteryNameMap: Record<string, string> = {
  'LM': '左主干',
  'LAD': '左前降支',
  'pLAD': '左前降支近段',
  'mLAD': '左前降支中段',
  'dLAD': '左前降支远段',
  'D1': '第一对角支',
  'D2': '第二对角支',
  'LCX': '左回旋支',
  'pLCX': '左回旋支近段',
  'dLCX': '左回旋支远段',
  'OM1': '第一钝缘支',
  'OM2': '第二钝缘支',
  'RCA': '右冠状动脉',
  'pRCA': '右冠状动脉近段',
  'mRCA': '右冠状动脉中段',
  'dRCA': '右冠状动脉远段',
  'R-PDA': '右后降支',
  'PLB': '后侧支',
  'AM1': '锐缘支1',
  'AM2': '锐缘支2',
  'RCB': '右圆锥支',
  'RI': '中间支'
}

export const getArteryDisplayName = (code: string): string => {
  return arteryNameMap[code] || code
}
