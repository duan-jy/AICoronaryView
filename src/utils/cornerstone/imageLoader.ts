/**
 * Cornerstone3D Image Loading Utilities
 * DICOM 图像加载工具 - All imports lazy to avoid WebGL crashes
 */

import { isCornerstoneReady } from './init'

export interface ImageLoadProgress {
  loaded: number
  total: number
  percent: number
}

export type ProgressCallback = (progress: ImageLoadProgress) => void

/**
 * Create a wadouri imageId from URL
 */
export function createImageId(url: string): string {
  if (url.startsWith('wadouri:') || url.startsWith('dicomweb:')) {
    return url
  }
  return `wadouri:${url}`
}

export function createImageIds(urls: string[]): string[] {
  return urls.map(url => createImageId(url))
}

/**
 * Load a single image
 */
export async function loadImage(imageId: string): Promise<any> {
  if (!isCornerstoneReady()) return null
  const { imageLoader } = await import('@cornerstonejs/core')
  return imageLoader.loadImage(imageId)
}

/**
 * Load multiple images with progress callback
 */
export async function loadImages(
  imageIds: string[],
  onProgress?: ProgressCallback
): Promise<any[]> {
  const total = imageIds.length
  let loaded = 0

  const promises = imageIds.map(async (imageId) => {
    const image = await loadImage(imageId)
    loaded++
    onProgress?.({ loaded, total, percent: Math.round((loaded / total) * 100) })
    return image
  })

  return Promise.all(promises)
}

export async function prefetchImages(imageIds: string[], onProgress?: ProgressCallback): Promise<void> {
  await loadImages(imageIds, onProgress)
}

export async function getImageMetadata(imageId: string, type: string): Promise<any> {
  if (!isCornerstoneReady()) return null
  const { metaData } = await import('@cornerstonejs/core')
  return metaData.get(type, imageId)
}

export async function getImageInfo(imageId: string): Promise<Record<string, any> | null> {
  if (!isCornerstoneReady()) return null
  const { metaData } = await import('@cornerstonejs/core')

  const imagePlaneModule = metaData.get('imagePlaneModule', imageId)
  if (!imagePlaneModule) return null

  const generalSeriesModule = metaData.get('generalSeriesModule', imageId)
  const patientModule = metaData.get('patientModule', imageId)
  const generalStudyModule = metaData.get('generalStudyModule', imageId)

  return {
    rows: imagePlaneModule.rows,
    columns: imagePlaneModule.columns,
    pixelSpacing: imagePlaneModule.pixelSpacing,
    sliceThickness: imagePlaneModule.sliceThickness,
    seriesDescription: generalSeriesModule?.seriesDescription,
    modality: generalSeriesModule?.modality,
    patientName: patientModule?.patientName,
    patientId: patientModule?.patientId,
    studyDate: generalStudyModule?.studyDate,
    institution: generalStudyModule?.institutionName
  }
}

/**
 * CT Window presets
 */
export const CT_WINDOW_PRESETS = {
  mediastinum: { windowWidth: 400, windowCenter: 40 },
  lung: { windowWidth: 1500, windowCenter: -600 },
  bone: { windowWidth: 2000, windowCenter: 300 },
  brain: { windowWidth: 80, windowCenter: 40 },
  abdomen: { windowWidth: 400, windowCenter: 50 },
  coronary: { windowWidth: 800, windowCenter: 300 },
  softTissue: { windowWidth: 400, windowCenter: 40 }
}

export function calculateAutoWindowLevel(_imageId: string) {
  return CT_WINDOW_PRESETS.coronary
}

export async function clearImageCache(): Promise<void> {
  if (!isCornerstoneReady()) return
  try {
    const csDicom = await import('@cornerstonejs/dicom-image-loader')
    csDicom.cornerstoneDICOMImageLoader?.wadouri?.dataSetCacheManager?.purge()
  } catch {}
}

export function getCacheStats() {
  return { count: 0, size: 0 }
}
