/**
 * useArtery Composable
 * Manages coronary artery data and selection
 */

import { computed, watch } from 'vue'
import { useArteryStore } from '@/stores/artery'
import { useViewerStore } from '@/stores/viewer'
import { api } from '@/api'
import type { DicomImage, ImageType } from '@/types'

export function useArtery() {
  const arteryStore = useArteryStore()
  const viewerStore = useViewerStore()

  // Computed properties
  const currentArtery = computed(() => arteryStore.currentArtery)
  const arteryTree = computed(() => arteryStore.arteryTree)
  const expandedBranches = computed(() => arteryStore.expandedBranches)
  const currentArteryImages = computed(() => arteryStore.currentArteryImages)
  const currentArteryInfo = computed(() => arteryStore.currentArteryInfo)

  // Filter images by type
  function getImagesByType(type: ImageType): DicomImage[] {
    return currentArteryImages.value.filter(img => img.type === type)
  }

  // Get all images of a specific type for all arteries
  function getAllImagesByType(type: ImageType): DicomImage[] {
    const allImages: DicomImage[] = []
    Object.values(arteryStore.arteryImages).forEach(images => {
      images.forEach(img => {
        if (img.type === type) {
          allImages.push(img)
        }
      })
    })
    return allImages
  }

  // Select an artery
  function selectArtery(arteryId: string) {
    arteryStore.setCurrentArtery(arteryId)
  }

  // Toggle branch expansion
  function toggleBranch(branchId: string) {
    arteryStore.toggleBranch(branchId)
  }

  // Load artery images from API
  async function loadArteryImages(studyId: string, arteryId: string) {
    try {
      const images = await api.getArteryImages(studyId, arteryId)
      arteryStore.setArteryImages(arteryId, images)
    } catch (error) {
      console.error(`[useArtery] Failed to load images for ${arteryId}:`, error)
    }
  }

  // Load all artery images
  async function loadAllArteryImages(studyId: string) {
    try {
      const allImages = await api.getAllArteryImages(studyId)
      arteryStore.setAllArteryImages(allImages)
    } catch (error) {
      console.error('[useArtery] Failed to load all artery images:', error)
    }
  }

  // Navigate to next/previous artery
  function navigateArtery(direction: 'next' | 'prev') {
    const allArteries = arteryStore.flatArteryList
    const currentIndex = allArteries.findIndex(a => a.id === currentArtery.value)
    
    if (currentIndex === -1) return

    let newIndex: number
    if (direction === 'next') {
      newIndex = currentIndex < allArteries.length - 1 ? currentIndex + 1 : 0
    } else {
      newIndex = currentIndex > 0 ? currentIndex - 1 : allArteries.length - 1
    }

    selectArtery(allArteries[newIndex].id)
  }

  // Get CPR images for current artery
  const cprImages = computed(() => getImagesByType('CPR'))
  
  // Get SPR images for current artery
  const sprImages = computed(() => getImagesByType('SPR'))
  
  // Get VR images for current artery
  const vrImages = computed(() => getImagesByType('VR'))
  
  // Get MIP images for current artery
  const mipImages = computed(() => getImagesByType('MIP'))
  
  // Get ORI images for current artery
  const oriImages = computed(() => getImagesByType('ORI'))
  
  // Get PROBE images for current artery
  const probeImages = computed(() => getImagesByType('PROBE'))

  return {
    // State
    currentArtery,
    arteryTree,
    expandedBranches,
    currentArteryImages,
    currentArteryInfo,
    // Filtered images
    cprImages,
    sprImages,
    vrImages,
    mipImages,
    oriImages,
    probeImages,
    // Methods
    selectArtery,
    toggleBranch,
    getImagesByType,
    getAllImagesByType,
    loadArteryImages,
    loadAllArteryImages,
    navigateArtery
  }
}
