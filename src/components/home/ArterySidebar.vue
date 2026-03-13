<script setup lang="ts">
import { computed } from 'vue'
import { useArteryStore } from '@/stores/artery'
import { useViewerStore } from '@/stores/viewer'

const arteryStore = useArteryStore()
const viewerStore = useViewerStore()

const arteryTree = computed(() => arteryStore.arteryTree)
const currentArtery = computed(() => arteryStore.currentArtery)
const expandedBranches = computed(() => arteryStore.expandedBranches)

// Progress indicator (mock data for now)
const progressPercent = computed(() => viewerStore.progress || 75)

function toggleBranch(branchId: string) {
  arteryStore.toggleBranch(branchId)
}

function selectArtery(arteryId: string) {
  arteryStore.setCurrentArtery(arteryId)
}

function isBranchExpanded(branchId: string): boolean {
  return expandedBranches.value.includes(branchId)
}
</script>

<template>
  <aside class="artery-sidebar layout-sidebar">
    <!-- Progress indicator -->
    <div class="sidebar-progress">
      <div class="progress-ring">
        <svg viewBox="0 0 100 100">
          <circle class="progress-bg" cx="50" cy="50" r="40" />
          <circle 
            class="progress-value" 
            cx="50" 
            cy="50" 
            r="40"
            :stroke-dasharray="`${progressPercent * 2.51} 251`"
          />
        </svg>
        <div class="progress-text">
          <span class="progress-percent">{{ progressPercent }}%</span>
          <span class="progress-count">298</span>
        </div>
      </div>
      <div class="progress-label">分析成功</div>
      <button class="btn btn-text btn-sm">编辑</button>
    </div>
    
    <!-- Artery tree navigation -->
    <nav class="artery-list pretty-bar">
      <div 
        v-for="branch in arteryTree" 
        :key="branch.id" 
        class="artery-list-group"
      >
        <!-- Branch header -->
        <div 
          class="artery-list-header"
          @click="toggleBranch(branch.id)"
        >
          <span 
            class="icon icon-chevron"
            :class="{ expanded: isBranchExpanded(branch.id) }"
          >&#9654;</span>
          <span class="branch-name">{{ branch.name }}</span>
        </div>
        
        <!-- Branch segments -->
        <Transition name="slide">
          <div v-show="isBranchExpanded(branch.id)" class="artery-list-items">
            <div
              v-for="segment in branch.segments"
              :key="segment.id"
              class="artery-list-item"
              :class="{ active: currentArtery === segment.id }"
              @click="selectArtery(segment.id)"
            >
              {{ segment.name }}
            </div>
          </div>
        </Transition>
      </div>
    </nav>
  </aside>
</template>

<style lang="less" scoped>
.artery-sidebar {
  display: flex;
  flex-direction: column;
  width: 160px;
}

.sidebar-progress {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.progress-ring {
  position: relative;
  width: 80px;
  height: 80px;
  
  svg {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }
  
  circle {
    fill: none;
    stroke-width: 8;
    stroke-linecap: round;
  }
  
  .progress-bg {
    stroke: var(--border-color);
  }
  
  .progress-value {
    stroke: var(--success-color);
    transition: stroke-dasharray 0.5s ease;
  }
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  
  .progress-percent {
    display: block;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
  }
  
  .progress-count {
    display: block;
    font-size: 11px;
    color: var(--text-secondary);
  }
}

.progress-label {
  font-size: 12px;
  color: var(--success-color);
  font-weight: 500;
}

.artery-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.artery-list-header {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  color: var(--primary-color);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition-fast);
  
  &:hover {
    background: var(--bg-tertiary);
  }
  
  .icon {
    font-size: 8px;
    margin-right: 8px;
    transition: transform var(--transition-fast);
    
    &.expanded {
      transform: rotate(90deg);
    }
  }
}

.artery-list-item {
  padding: 10px 12px 10px 32px;
  font-size: 13px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover {
    background: var(--bg-tertiary);
  }
  
  &.active {
    background: var(--primary-color);
    color: #fff;
  }
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
}

.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  max-height: 200px;
}
</style>
