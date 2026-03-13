/**
 * useDiagnosis Composable
 * Manages diagnostic report and stenosis data
 */

import { computed, ref } from 'vue'
import { useArteryStore } from '@/stores/artery'
import { api } from '@/api'
import type { DiagnosticReport, StenosisInfo, StenosisLevel, PlaqueType } from '@/types'

// Stenosis level options
export const STENOSIS_LEVELS: StenosisLevel[] = [
  '未见狭窄',
  '轻度狭窄',
  '中度狭窄',
  '重度狭窄',
  '闭塞'
]

// Plaque type options
export const PLAQUE_TYPES: PlaqueType[] = [
  '无斑块',
  '非钙化斑块',
  '混合斑块',
  '钙化斑块'
]

// Coronary dominance options
export const DOMINANCE_OPTIONS = [
  '右优势型',
  '左优势型',
  '均衡型'
] as const

// Origin options
export const ORIGIN_OPTIONS = [
  '左窦',
  '右窦',
  '无冠窦'
] as const

// Post surgery options
export const POST_SURGERY_OPTIONS = [
  '无',
  '支架植入术后',
  '搭桥术后',
  '介入治疗后'
]

export function useDiagnosis() {
  const arteryStore = useArteryStore()
  const isEditing = ref(false)
  const isSaving = ref(false)

  // Report data
  const report = computed(() => arteryStore.report)
  const stenosisList = computed(() => arteryStore.stenosisList)

  // Coronary origin getters/setters
  const dominance = computed({
    get: () => report.value.coronaryOrigin.dominance,
    set: (value) => {
      arteryStore.updateReport({
        coronaryOrigin: {
          ...report.value.coronaryOrigin,
          dominance: value
        }
      })
    }
  })

  const leftOrigin = computed({
    get: () => report.value.coronaryOrigin.leftOrigin,
    set: (value) => {
      arteryStore.updateReport({
        coronaryOrigin: {
          ...report.value.coronaryOrigin,
          leftOrigin: value
        }
      })
    }
  })

  const rightOrigin = computed({
    get: () => report.value.coronaryOrigin.rightOrigin,
    set: (value) => {
      arteryStore.updateReport({
        coronaryOrigin: {
          ...report.value.coronaryOrigin,
          rightOrigin: value
        }
      })
    }
  })

  // Get stenosis for specific artery
  function getStenosis(arteryId: string): StenosisInfo | undefined {
    return arteryStore.getStenosisInfo(arteryId)
  }

  // Update stenosis for an artery
  function updateStenosis(arteryId: string, data: Partial<StenosisInfo>) {
    arteryStore.setStenosis(arteryId, data)
  }

  // Set stenosis level
  function setStenosisLevel(arteryId: string, level: StenosisLevel) {
    updateStenosis(arteryId, { level })
  }

  // Set plaque type
  function setPlaqueType(arteryId: string, plaqueType: PlaqueType) {
    updateStenosis(arteryId, { plaqueType })
  }

  // Set stenosis percentage
  function setStenosisPercentage(arteryId: string, percentage: number) {
    updateStenosis(arteryId, { percentage })
  }

  // Set post surgery status
  function setPostSurgery(arteryId: string, postSurgery: string) {
    updateStenosis(arteryId, { postSurgery })
  }

  // Load report from API
  async function loadReport(studyId: string) {
    try {
      const reportData = await api.getReport(studyId)
      arteryStore.updateReport(reportData)
      
      // Initialize stenosis list from report
      if (reportData.stenosis) {
        reportData.stenosis.forEach((s: StenosisInfo) => {
          arteryStore.setStenosis(s.arteryId, s)
        })
      } else {
        arteryStore.initStenosisList()
      }
    } catch (error) {
      console.error('[useDiagnosis] Failed to load report:', error)
      // Initialize with default values
      arteryStore.initStenosisList()
    }
  }

  // Save report to API
  async function saveReport(studyId: string) {
    isSaving.value = true
    try {
      const fullReport: DiagnosticReport = {
        ...report.value,
        stenosis: stenosisList.value
      }
      await api.saveReport(studyId, fullReport)
    } catch (error) {
      console.error('[useDiagnosis] Failed to save report:', error)
      throw error
    } finally {
      isSaving.value = false
    }
  }

  // Generate report summary
  const reportSummary = computed(() => {
    const abnormal = stenosisList.value.filter(s => s.level !== '未见狭窄')
    if (abnormal.length === 0) {
      return '冠状动脉CTA未见明显狭窄。'
    }

    const summaryParts = abnormal.map(s => {
      let text = `${s.arteryName}${s.level}`
      if (s.plaqueType && s.plaqueType !== '无斑块') {
        text += `(${s.plaqueType})`
      }
      if (s.percentage) {
        text += `约${s.percentage}%`
      }
      return text
    })

    return summaryParts.join('；') + '。'
  })

  // Toggle edit mode
  function toggleEdit() {
    isEditing.value = !isEditing.value
  }

  return {
    // State
    report,
    stenosisList,
    isEditing,
    isSaving,
    reportSummary,
    // Coronary origin
    dominance,
    leftOrigin,
    rightOrigin,
    // Options
    STENOSIS_LEVELS,
    PLAQUE_TYPES,
    DOMINANCE_OPTIONS,
    ORIGIN_OPTIONS,
    POST_SURGERY_OPTIONS,
    // Methods
    getStenosis,
    updateStenosis,
    setStenosisLevel,
    setPlaqueType,
    setStenosisPercentage,
    setPostSurgery,
    loadReport,
    saveReport,
    toggleEdit
  }
}
