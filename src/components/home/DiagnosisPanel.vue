<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDiagnosis, STENOSIS_LEVELS, PLAQUE_TYPES, DOMINANCE_OPTIONS, ORIGIN_OPTIONS } from '@/composables/useDiagnosis'
import { useArteryStore } from '@/stores/artery'
import type { StenosisLevel, PlaqueType } from '@/types'

const arteryStore = useArteryStore()
const { 
  report, 
  stenosisList, 
  dominance, 
  leftOrigin, 
  rightOrigin,
  getStenosis,
  setStenosisLevel,
  setPlaqueType,
  setStenosisPercentage
} = useDiagnosis()

const editingArtery = ref<string | null>(null)

// Stenosis segments grouped for display
const stenosisGroups = computed(() => [
  {
    name: '左主干',
    segments: ['LM']
  },
  {
    name: '前降支',
    segments: ['pLAD', 'mLAD', 'dLAD', 'D1', 'D2']
  },
  {
    name: '回旋支',
    segments: ['pLCX', 'dLCX', 'OM2', 'RI']
  },
  {
    name: '右冠',
    segments: ['pRCA', 'mRCA', 'dRCA', 'R-PDA', 'AM1', 'AM2', 'RCB']
  }
])

function getStenosisDisplay(arteryId: string): string {
  const info = getStenosis(arteryId)
  return info?.level || '未见狭窄'
}

function getStenosisClass(arteryId: string): string {
  const info = getStenosis(arteryId)
  if (!info || info.level === '未见狭窄') return ''
  if (info.level === '轻度狭窄') return 'mild'
  if (info.level === '中度狭窄') return 'moderate'
  if (info.level === '重度狭窄' || info.level === '闭塞') return 'severe'
  return ''
}

function toggleEdit(arteryId: string) {
  editingArtery.value = editingArtery.value === arteryId ? null : arteryId
}

function handleLevelChange(arteryId: string, level: StenosisLevel) {
  setStenosisLevel(arteryId, level)
}

function handlePlaqueChange(arteryId: string, plaque: PlaqueType) {
  setPlaqueType(arteryId, plaque)
}

function handlePercentageChange(arteryId: string, event: Event) {
  const value = parseInt((event.target as HTMLInputElement).value)
  if (!isNaN(value)) {
    setStenosisPercentage(arteryId, value)
  }
}
</script>

<template>
  <aside class="diagnosis-panel layout-panel pretty-bar">
    <!-- Panel Title -->
    <div class="panel-header">
      <h2 class="panel-title">诊断报告</h2>
      <span class="status-badge warning">轻度狭窄</span>
    </div>
    
    <!-- Coronary Origin Section -->
    <section class="panel-section">
      <h3 class="section-title">冠脉起源及优势型</h3>
      
      <div class="form-row">
        <label class="form-label">冠状动脉显:</label>
        <select v-model="dominance" class="select form-select">
          <option v-for="opt in DOMINANCE_OPTIONS" :key="opt" :value="opt">
            {{ opt }}
          </option>
        </select>
      </div>
      
      <div class="form-row">
        <label class="form-label">左冠起源于:</label>
        <select v-model="leftOrigin" class="select form-select">
          <option v-for="opt in ORIGIN_OPTIONS" :key="opt" :value="opt">
            {{ opt }}
          </option>
        </select>
      </div>
      
      <div class="form-row">
        <label class="form-label">右冠状动脉起源于:</label>
        <select v-model="rightOrigin" class="select form-select">
          <option v-for="opt in ORIGIN_OPTIONS" :key="opt" :value="opt">
            {{ opt }}
          </option>
        </select>
      </div>
    </section>
    
    <!-- Stenosis List Section -->
    <section class="panel-section stenosis-section">
      <div 
        v-for="group in stenosisGroups" 
        :key="group.name"
        class="stenosis-group"
      >
        <div 
          v-for="segmentId in group.segments"
          :key="segmentId"
          class="stenosis-item"
          :class="getStenosisClass(segmentId)"
        >
          <div class="stenosis-header" @click="toggleEdit(segmentId)">
            <span class="artery-checkbox">
              <input type="checkbox" checked disabled />
            </span>
            <span class="artery-name">{{ segmentId }}</span>
            <span class="stenosis-value">{{ getStenosisDisplay(segmentId) }}</span>
          </div>
          
          <!-- Edit panel -->
          <Transition name="expand">
            <div v-if="editingArtery === segmentId" class="stenosis-edit">
              <div class="edit-row">
                <label>狭窄程度:</label>
                <select 
                  :value="getStenosis(segmentId)?.level || '未见狭窄'"
                  @change="handleLevelChange(segmentId, ($event.target as HTMLSelectElement).value as StenosisLevel)"
                  class="select"
                >
                  <option v-for="level in STENOSIS_LEVELS" :key="level" :value="level">
                    {{ level }}
                  </option>
                </select>
              </div>
              
              <div class="edit-row">
                <label>斑块类型:</label>
                <select 
                  :value="getStenosis(segmentId)?.plaqueType || '无斑块'"
                  @change="handlePlaqueChange(segmentId, ($event.target as HTMLSelectElement).value as PlaqueType)"
                  class="select"
                >
                  <option v-for="plaque in PLAQUE_TYPES" :key="plaque" :value="plaque">
                    {{ plaque }}
                  </option>
                </select>
              </div>
              
              <div class="edit-row">
                <label>狭窄程度:</label>
                <div class="percentage-input">
                  <input 
                    type="number" 
                    :value="getStenosis(segmentId)?.percentage || 0"
                    @change="handlePercentageChange(segmentId, $event)"
                    min="0" 
                    max="100"
                  />
                  <span>%</span>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </section>
  </aside>
</template>

<style lang="less" scoped>
.diagnosis-panel {
  display: flex;
  flex-direction: column;
  width: 320px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  
  .panel-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--primary-color);
  }
}

.panel-section {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  
  &:last-child {
    border-bottom: none;
  }
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .form-label {
    flex-shrink: 0;
    font-size: 12px;
    color: var(--text-secondary);
    min-width: 110px;
  }
  
  .form-select {
    flex: 1;
    font-size: 12px;
    padding: 4px 8px;
  }
}

.stenosis-section {
  flex: 1;
  overflow-y: auto;
  padding: 8px 12px;
}

.stenosis-group {
  margin-bottom: 8px;
}

.stenosis-item {
  border-radius: var(--radius-sm);
  margin-bottom: 4px;
  overflow: hidden;
  
  &.mild .stenosis-value {
    color: var(--warning-color);
  }
  
  &.moderate .stenosis-value {
    color: #ff9800;
  }
  
  &.severe .stenosis-value {
    color: var(--danger-color);
  }
}

.stenosis-header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  transition: background var(--transition-fast);
  
  &:hover {
    background: var(--bg-tertiary);
  }
}

.artery-checkbox {
  margin-right: 8px;
  
  input {
    width: 14px;
    height: 14px;
    accent-color: var(--primary-color);
  }
}

.artery-name {
  flex: 1;
  font-size: 13px;
  color: var(--text-primary);
}

.stenosis-value {
  font-size: 12px;
  color: var(--text-secondary);
}

.stenosis-edit {
  padding: 12px;
  background: var(--bg-tertiary);
  border-top: 1px solid var(--border-color);
}

.edit-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  label {
    font-size: 11px;
    color: var(--text-secondary);
    min-width: 60px;
  }
  
  .select {
    flex: 1;
    font-size: 11px;
    padding: 4px 6px;
  }
}

.percentage-input {
  display: flex;
  align-items: center;
  gap: 4px;
  
  input {
    width: 60px;
    font-size: 11px;
    padding: 4px 6px;
  }
  
  span {
    font-size: 11px;
    color: var(--text-secondary);
  }
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 200px;
}
</style>
