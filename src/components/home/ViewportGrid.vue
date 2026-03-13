<script setup lang="ts">
import { computed, watch } from 'vue'
import { useViewerStore } from '@/stores/viewer'
import { useArteryStore } from '@/stores/artery'
import DicomViewport from '@/components/viewer/DicomViewport.vue'
import Viewport3D from '@/components/viewer/Viewport3D.vue'
import ProbeStrip from '@/components/viewer/ProbeStrip.vue'
import SprChart from '@/components/viewer/SprChart.vue'

const viewerStore = useViewerStore()
const arteryStore = useArteryStore()

const currentLayout = computed(() => viewerStore.currentLayout)
const viewports = computed(() => viewerStore.viewports)
const activeViewport = computed(() => viewerStore.activeViewport)
const scaleViewport = computed(() => viewerStore.scaleViewport)
const currentArtery = computed(() => arteryStore.currentArtery)

function setActiveViewport(viewportId: string) {
  viewerStore.setActiveViewport(viewportId)
}

function toggleFullscreen(viewportId: string) {
  viewerStore.toggleFullscreen(viewportId)
}

// Get the appropriate component for each viewport type
function getViewportComponent(type: string) {
  switch (type) {
    case '3D':
    case 'VR':
      return Viewport3D
    case 'PROBE':
      return ProbeStrip
    case 'SPR':
      return SprChart
    default:
      return DicomViewport
  }
}

// Grid style based on layout
const gridStyle = computed(() => {
  const layout = currentLayout.value
  return {
    gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
    gridTemplateRows: `repeat(${layout.rows}, 1fr)`
  }
})

// Watch for artery changes to update viewports
watch(currentArtery, () => {
  // Viewport updates will be handled by individual components
})
</script>

<template>
  <div class="viewport-grid" :style="gridStyle">
    <template v-for="viewport in viewports" :key="viewport.id">
      <!-- Show only fullscreen viewport when in fullscreen mode -->
      <template v-if="!scaleViewport || scaleViewport === viewport.id">
        <div
          class="viewport-cell"
          :class="{
            active: activeViewport === viewport.id,
            fullscreen: scaleViewport === viewport.id
          }"
          @click="setActiveViewport(viewport.id)"
        >
          <component
            :is="getViewportComponent(viewport.type)"
            :viewport-id="viewport.id"
            :viewport-type="viewport.type"
            :artery-id="currentArtery || 'LAD'"
            :is-active="activeViewport === viewport.id"
            @toggle-fullscreen="toggleFullscreen(viewport.id)"
          />
        </div>
      </template>
    </template>
  </div>
</template>

<style lang="less" scoped>
.viewport-grid {
  width: 100%;
  height: 100%;
  display: grid;
  gap: 2px;
  background: var(--bg-primary);
  padding: 2px;
}

.viewport-cell {
  position: relative;
  background: var(--viewport-bg);
  border: 1px solid var(--viewport-border);
  overflow: hidden;
  min-height: 0;
  
  &.active {
    border-color: var(--viewport-active);
  }
  
  &.fullscreen {
    position: fixed;
    top: var(--header-height);
    left: var(--sidebar-width);
    right: var(--panel-width);
    bottom: 0;
    z-index: 100;
    border: none;
  }
}
</style>
