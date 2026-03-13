/**
 * Cornerstone3D Image Loading Utilities
 * DICOM 图像加载工具
 */

import { imageLoader, metaData } from '@cornerstonejs/core'
import { cornerstoneDICOMImageLoader } from '@cornerstonejs/dicom-image-loader'

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
  // If already has scheme, return as is
  if (url.startsWith('wadouri:') || url.startsWith('dicomweb:')) {
    return url
  }
  return `wadouri:${url}`
}

/**
 * Create multiple imageIds from URLs
 */
export function createImageIds(urls: string[]): string[] {
  return urls.map(url => createImageId(url))
}

/**
 * Load a single image
 */
export async function loadImage(imageId: string): Promise<any> {
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
    if (onProgress) {
      onProgress({
        loaded,
        total,
        percent: Math.round((loaded / total) * 100)
      })
    }
    return image
  })

  return Promise.all(promises)
}

/**
 * Prefetch images (load into cache)
 */
export async function prefetchImages(
  imageIds: string[],
  onProgress?: ProgressCallback
): Promise<void> {
  await loadImages(imageIds, onProgress)
}

/**
 * Get image metadata
 */
export function getImageMetadata(imageId: string, type: string): any {
  return metaData.get(type, imageId)
}

/**
 * Get general image information
 */
export function getImageInfo(imageId: string): Record<string, any> | null {
  const imagePlaneModule = metaData.get('imagePlaneModule', imageId)
  const generalSeriesModule = metaData.get('generalSeriesModule', imageId)
  const patientModule = metaData.get('patientModule', imageId)
  const generalStudyModule = metaData.get('generalStudyModule', imageId)

  if (!imagePlaneModule) return null

  return {
    rows: imagePlaneModule.rows,
    columns: imagePlaneModule.columns,
    pixelSpacing: imagePlaneModule.pixelSpacing,
    sliceThickness: imagePlaneModule.sliceThickness,
    sliceLocation: imagePlaneModule.sliceLocation,
    imageOrientationPatient: imagePlaneModule.imageOrientationPatient,
    imagePositionPatient: imagePlaneModule.imagePositionPatient,
    seriesDescription: generalSeriesModule?.seriesDescription,
    modality: generalSeriesModule?.modality,
    patientName: patientModule?.patientName,
    patientId: patientModule?.patientId,
    studyDate: generalStudyModule?.studyDate,
    studyDescription: generalStudyModule?.studyDescription,
    institution: generalStudyModule?.institutionName
  }
}

/**
 * Get window/level presets for CT
 */
export const CT_WINDOW_PRESETS = {
  mediastinum: { windowWidth: 400, windowCenter: 40 },
  lung: { windowWidth: 1500, windowCenter: -600 },
  bone: { windowWidth: 2000, windowCenter: 300 },
  brain: { windowWidth: 80, windowCenter: 40 },
  abdomen: { windowWidth: 400, windowCenter: 50 },
  liver: { windowWidth: 150, windowCenter: 30 },
  coronary: { windowWidth: 800, windowCenter: 300 },
  softTissue: { windowWidth: 400, windowCenter: 40 }
}

/**
 * Calculate optimal window/level from image
 */
export function calculateAutoWindowLevel(imageId: string): { windowWidth: number; windowCenter: number } | null {
  const voiLutModule = metaData.get('voiLutModule', imageId)
  
  if (voiLutModule && voiLutModule.windowWidth && voiLutModule.windowCenter) {
    return {
      windowWidth: Array.isArray(voiLutModule.windowWidth) 
        ? voiLutModule.windowWidth[0] 
        : voiLutModule.windowWidth,
      windowCenter: Array.isArray(voiLutModule.windowCenter)
        ? voiLutModule.windowCenter[0]
        : voiLutModule.windowCenter
    }
  }

  // Default coronary CT window
  return CT_WINDOW_PRESETS.coronary
}

/**
 * Clear the image cache
 */
export function clearImageCache(): void {
  // Clear cornerstone cache
  cornerstoneDICOMImageLoader.wadouri.dataSetCacheManager.purge()
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { count: number; size: number } {
  // This is a simplified version - actual implementation may vary
  return {
    count: 0,
    size: 0
  }
}
