import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ArteryBranch, DicomImage, StenosisInfo, DiagnosticReport } from '@/types'

// Default artery tree structure
const DEFAULT_ARTERY_TREE: ArteryBranch[] = [
  {
    id: 'left-anterior',
    name: '左前降支',
    label: '左前降支',
    group: 'LAD',
    segments: [
      { id: 'LAD', name: 'LAD', label: 'LAD' },
      { id: 'D1', name: 'D1', label: 'D1' },
      { id: 'D2', name: 'D2', label: 'D2' }
    ]
  },
  {
    id: 'left-circumflex',
    name: '左回旋支',
    label: '左回旋支',
    group: 'LCX',
    segments: [
      { id: 'LCX', name: 'LCX', label: 'LCX' },
      { id: 'OM2', name: 'OM2', label: 'OM2' },
      { id: 'RI', name: 'RI', label: 'RI' }
    ]
  },
  {
    id: 'right-coronary',
    name: '右冠状动脉',
    label: '右冠状动脉',
    group: 'RCA',
    segments: [
      { id: 'RCA', name: 'RCA', label: 'RCA' },
      { id: 'R-PDA', name: 'R-PDA', label: 'R-PDA' },
      { id: 'AM1', name: 'AM1', label: 'AM1' },
      { id: 'AM2', name: 'AM2', label: 'AM2' },
      { id: 'RCB', name: 'RCB', label: 'RCB' }
    ]
  },
  {
    id: 'middle',
    name: '中间支',
    label: '中间支',
    group: 'RI',
    segments: [
      { id: 'RI', name: 'RI', label: 'RI' }
    ]
  }
]

// Default diagnostic report structure
const DEFAULT_REPORT: DiagnosticReport = {
  coronaryOrigin: {
    dominance: '右优势型',
    leftOrigin: '左窦',
    rightOrigin: '右窦'
  },
  stenosis: []
}

// Default stenosis segment labels
const STENOSIS_SEGMENTS = [
  'LM', 'pLAD', 'mLAD', 'dLAD', 'D1', 'D2',
  'pLCX', 'dLCX', 'OM2', 'RI',
  'pRCA', 'mRCA', 'dRCA', 'R-PDA', 'AM1', 'AM2', 'RCB'
]

export const useArteryStore = defineStore('artery', () => {
  // State
  const currentArtery = ref<string | null>('LAD')
  const arteryTree = ref<ArteryBranch[]>(DEFAULT_ARTERY_TREE)
  const expandedBranches = ref<string[]>(['left-anterior', 'left-circumflex', 'right-coronary'])
  const arteryImages = ref<Record<string, DicomImage[]>>({})
  const report = ref<DiagnosticReport>({ ...DEFAULT_REPORT })
  const stenosisList = ref<StenosisInfo[]>([])

  // Getters
  const currentArteryInfo = computed(() => {
    if (!currentArtery.value) return null
    for (const branch of arteryTree.value) {
      const segment = branch.segments.find(s => s.id === currentArtery.value)
      if (segment) {
        return { branch, segment }
      }
    }
    return null
  })

  const currentArteryImages = computed(() => {
    if (!currentArtery.value) return []
    return arteryImages.value[currentArtery.value] || []
  })

  const allArteryIds = computed(() => {
    const ids: string[] = []
    arteryTree.value.forEach(branch => {
      branch.segments.forEach(segment => {
        ids.push(segment.id)
      })
    })
    return ids
  })

  const flatArteryList = computed(() => {
    const list: { id: string; name: string; group: string }[] = []
    arteryTree.value.forEach(branch => {
      branch.segments.forEach(segment => {
        list.push({
          id: segment.id,
          name: segment.name,
          group: branch.group
        })
      })
    })
    return list
  })

  // Actions
  function setCurrentArtery(arteryId: string | null) {
    currentArtery.value = arteryId
  }

  function toggleBranch(branchId: string) {
    const index = expandedBranches.value.indexOf(branchId)
    if (index >= 0) {
      expandedBranches.value.splice(index, 1)
    } else {
      expandedBranches.value.push(branchId)
    }
  }

  function setArteryImages(arteryId: string, images: DicomImage[]) {
    arteryImages.value[arteryId] = images
  }

  function setAllArteryImages(images: Record<string, DicomImage[]>) {
    arteryImages.value = images
  }

  function updateReport(newReport: Partial<DiagnosticReport>) {
    report.value = { ...report.value, ...newReport }
  }

  function setStenosis(arteryId: string, stenosis: Partial<StenosisInfo>) {
    const index = stenosisList.value.findIndex(s => s.arteryId === arteryId)
    if (index >= 0) {
      stenosisList.value[index] = { ...stenosisList.value[index], ...stenosis }
    } else {
      stenosisList.value.push({
        arteryId,
        arteryName: arteryId,
        level: '未见狭窄',
        plaqueType: '无斑块',
        ...stenosis
      } as StenosisInfo)
    }
  }

  function getStenosisInfo(arteryId: string): StenosisInfo | undefined {
    return stenosisList.value.find(s => s.arteryId === arteryId)
  }

  function initStenosisList() {
    stenosisList.value = STENOSIS_SEGMENTS.map(id => ({
      arteryId: id,
      arteryName: id,
      level: '未见狭窄',
      plaqueType: '无斑块'
    }))
  }

  function $reset() {
    currentArtery.value = 'LAD'
    expandedBranches.value = ['left-anterior', 'left-circumflex', 'right-coronary']
    arteryImages.value = {}
    report.value = { ...DEFAULT_REPORT }
    stenosisList.value = []
  }

  return {
    // State
    currentArtery,
    arteryTree,
    expandedBranches,
    arteryImages,
    report,
    stenosisList,
    // Getters
    currentArteryInfo,
    currentArteryImages,
    allArteryIds,
    flatArteryList,
    // Actions
    setCurrentArtery,
    toggleBranch,
    setArteryImages,
    setAllArteryImages,
    updateReport,
    setStenosis,
    getStenosisInfo,
    initStenosisList,
    $reset
  }
})
