<script setup lang="ts">
import { ref } from 'vue'

interface LayoutConfig {
  rows: number
  cols: number
  type: string
}

interface Props {
  currentLayout: LayoutConfig
}

const props = defineProps<Props>()
const emit = defineEmits<{
  change: [layout: LayoutConfig]
}>()

const activeTab = ref<'regular' | 'special'>('regular')

// Regular grid layouts
const regularLayouts = [
  { rows: 3, cols: 3, label: '3*3', icon: '3_3' },
  { rows: 3, cols: 4, label: '3*4', icon: '3_4' },
  { rows: 3, cols: 5, label: '3*5', icon: '3_5' },
  { rows: 4, cols: 4, label: '4*4', icon: '4_4' },
  { rows: 4, cols: 5, label: '4*5', icon: '4_5' },
  { rows: 4, cols: 6, label: '4*6', icon: '4_6' },
  { rows: 4, cols: 7, label: '4*7', icon: '4_7' },
  { rows: 4, cols: 8, label: '4*8', icon: '4_8' },
  { rows: 4, cols: 9, label: '4*9', icon: '4_9' },
  { rows: 6, cols: 6, label: '6*6', icon: '6_6' },
  { rows: 7, cols: 6, label: '7*6', icon: '7_6' }
]

// Special layouts
const specialLayouts = [
  { id: 'L1', rows: 4, cols: 4, label: 'L1' },
  { id: 'L2', rows: 4, cols: 4, label: 'L2' },
  { id: 'L3', rows: 4, cols: 4, label: 'L3' },
  { id: 'L4', rows: 4, cols: 4, label: 'L4' },
  { id: 'L5', rows: 4, cols: 4, label: 'L5' },
  { id: 'L6', rows: 4, cols: 4, label: 'L6' },
  { id: 'L7', rows: 4, cols: 4, label: 'L7' }
]

const selectLayout = (layout: { rows: number; cols: number }) => {
  emit('change', {
    rows: layout.rows,
    cols: layout.cols,
    type: 'grid'
  })
}

const isActive = (layout: { rows: number; cols: number }) => {
  return props.currentLayout.rows === layout.rows && 
         props.currentLayout.cols === layout.cols
}
</script>

<template>
  <div class="layout-selector">
    <!-- Tabs -->
    <div class="layout-tabs">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'regular' }"
        @click="activeTab = 'regular'"
      >
        常规布局
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'special' }"
        @click="activeTab = 'special'"
      >
        特殊布局
      </button>
      <div class="tab-actions">
        <button class="action-btn">一键排版</button>
        <button class="action-btn primary">自定义</button>
      </div>
    </div>

    <!-- Layout Grid -->
    <div class="layout-grid">
      <template v-if="activeTab === 'regular'">
        <button
          v-for="layout in regularLayouts"
          :key="layout.label"
          class="layout-item"
          :class="{ active: isActive(layout) }"
          @click="selectLayout(layout)"
        >
          <div class="layout-icon">
            <div 
              class="icon-grid"
              :style="{
                gridTemplateColumns: `repeat(${Math.min(layout.cols, 4)}, 1fr)`,
                gridTemplateRows: `repeat(${Math.min(layout.rows, 4)}, 1fr)`
              }"
            >
              <div 
                v-for="i in Math.min(layout.rows * layout.cols, 16)" 
                :key="i" 
                class="grid-cell"
              />
            </div>
          </div>
          <span class="layout-label">{{ layout.label }}</span>
        </button>
      </template>

      <template v-else>
        <button
          v-for="layout in specialLayouts"
          :key="layout.id"
          class="layout-item special"
          @click="selectLayout(layout)"
        >
          <div class="layout-icon">
            <img :src="`/src/assets/layout/${layout.id}.png`" :alt="layout.label" />
          </div>
        </button>
      </template>
    </div>

    <!-- Apply to film -->
    <div class="apply-film">
      <label class="checkbox-label">
        <input type="checkbox" />
        <span>应用到选中胶片</span>
      </label>
    </div>
  </div>
</template>

<style lang="less" scoped>
.layout-selector {
  border-top: 1px solid var(--border-color);
  padding: 12px 16px;
}

.layout-tabs {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  
  .tab-btn {
    background: transparent;
    border: none;
    color: var(--text-secondary);
    font-size: 13px;
    cursor: pointer;
    padding: 0;
    transition: color 0.2s;
    
    &:hover, &.active {
      color: var(--primary-color);
    }
  }
  
  .tab-actions {
    margin-left: auto;
    display: flex;
    gap: 8px;
    
    .action-btn {
      padding: 4px 12px;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 4px;
      color: var(--text-primary);
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
      
      &:hover {
        border-color: var(--primary-color);
      }
      
      &.primary {
        background: var(--primary-color);
        border-color: var(--primary-color);
        color: white;
      }
    }
  }
}

.layout-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.layout-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 4px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: var(--bg-secondary);
  }
  
  &.active {
    border-color: var(--primary-color);
    background: rgba(var(--primary-rgb), 0.1);
  }
  
  &.special {
    .layout-icon {
      width: 40px;
      height: 40px;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }
  }
}

.layout-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-grid {
  display: grid;
  gap: 1px;
  width: 100%;
  height: 100%;
  
  .grid-cell {
    background: var(--text-secondary);
    border-radius: 1px;
  }
}

.layout-label {
  font-size: 10px;
  color: var(--text-secondary);
}

.apply-film {
  margin-top: 12px;
  
  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--primary-color);
    font-size: 12px;
    cursor: pointer;
    
    input {
      accent-color: var(--primary-color);
    }
  }
}
</style>
