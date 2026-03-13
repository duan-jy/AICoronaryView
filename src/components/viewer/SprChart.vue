<script setup lang="ts">
import { ref, computed, onMounted, inject } from 'vue'
import { useArteryStore } from '@/stores/artery'
import type { ViewportType } from '@/types'

interface Props {
  viewportId: string
  viewportType: ViewportType
  arteryId: string
  isActive?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'toggle-fullscreen'): void
}>()

const arteryStore = useArteryStore()
const canvasRef = ref<HTMLCanvasElement | null>(null)

// Artery segment labels for the chart
const segmentLabels = computed(() => {
  switch (props.arteryId) {
    case 'LAD':
    case 'D1':
    case 'D2':
      return ['LM', 'pLAD', '轻度狭窄', 'mLAD', 'dLAD']
    case 'LCX':
    case 'OM2':
      return ['LM', 'pLCX', 'dLCX']
    case 'RCA':
    case 'R-PDA':
    case 'AM1':
    case 'AM2':
    case 'RCB':
      return ['pRCA', 'mRCA', 'dRCA']
    default:
      return ['LM', 'pLAD', 'mLAD', 'dLAD']
  }
})

// Get stenosis positions (simplified mock data)
const stenosisPositions = computed(() => {
  const stenosis = arteryStore.getStenosisInfo(props.arteryId)
  if (stenosis && stenosis.level !== '未见狭窄') {
    return [{ x: 0.3, label: stenosis.level }]
  }
  return []
})

function drawChart() {
  const canvas = canvasRef.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  const width = canvas.width
  const height = canvas.height
  
  // Clear
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, width, height)
  
  // Draw artery line (simplified straightened view)
  const lineY = height * 0.5
  const startX = 50
  const endX = width - 50
  
  // Draw vessel walls
  ctx.strokeStyle = '#666'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(startX, lineY - 20)
  ctx.lineTo(endX, lineY - 20)
  ctx.stroke()
  
  ctx.beginPath()
  ctx.moveTo(startX, lineY + 20)
  ctx.lineTo(endX, lineY + 20)
  ctx.stroke()
  
  // Draw centerline
  ctx.strokeStyle = '#888'
  ctx.setLineDash([5, 5])
  ctx.beginPath()
  ctx.moveTo(startX, lineY)
  ctx.lineTo(endX, lineY)
  ctx.stroke()
  ctx.setLineDash([])
  
  // Draw segment labels
  const segmentWidth = (endX - startX) / segmentLabels.value.length
  ctx.fillStyle = '#aaa'
  ctx.font = '11px sans-serif'
  ctx.textAlign = 'center'
  
  segmentLabels.value.forEach((label, index) => {
    const x = startX + segmentWidth * (index + 0.5)
    ctx.fillText(label, x, height - 10)
    
    // Draw segment divider
    if (index < segmentLabels.value.length - 1) {
      ctx.strokeStyle = '#444'
      ctx.beginPath()
      ctx.moveTo(startX + segmentWidth * (index + 1), lineY - 25)
      ctx.lineTo(startX + segmentWidth * (index + 1), lineY + 25)
      ctx.stroke()
    }
  })
  
  // Draw stenosis markers
  stenosisPositions.value.forEach(pos => {
    const x = startX + (endX - startX) * pos.x
    
    // Draw marker
    ctx.fillStyle = '#f56c6c'
    ctx.beginPath()
    ctx.moveTo(x, lineY - 5)
    ctx.lineTo(x + 5, lineY - 15)
    ctx.lineTo(x - 5, lineY - 15)
    ctx.closePath()
    ctx.fill()
    
    // Draw label
    ctx.fillStyle = '#f56c6c'
    ctx.font = '10px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(pos.label, x, lineY - 20)
  })
}

function handleFullscreen() {
  emit('toggle-fullscreen')
}

onMounted(() => {
  // Set canvas size
  if (canvasRef.value) {
    const container = canvasRef.value.parentElement
    if (container) {
      canvasRef.value.width = container.clientWidth
      canvasRef.value.height = container.clientHeight
    }
  }
  drawChart()
})
</script>

<template>
  <div class="spr-chart viewport" :class="{ active: isActive }">
    <!-- Info overlay -->
    <div class="viewport-overlay top-left">
      <div class="viewport-info">
        <div>SPR</div>
        <div>IM: 1</div>
      </div>
    </div>
    
    <!-- Canvas for the straightened view -->
    <div class="chart-container">
      <canvas ref="canvasRef" class="chart-canvas"></canvas>
    </div>
    
    <!-- Bottom info -->
    <div class="viewport-overlay bottom-left">
      <div class="viewport-info">
        <div>WW:800 WC:300</div>
      </div>
    </div>
    
    <!-- Bottom toolbar -->
    <div class="viewport-tools">
      <button class="tool-btn" title="全屏" @click="handleFullscreen">
        <span class="icon">&#x26F6;</span>
      </button>
    </div>
  </div>
</template>

<style lang="less" scoped>
.spr-chart {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
}

.chart-container {
  width: 100%;
  height: 100%;
  padding: 8px;
}

.chart-canvas {
  width: 100%;
  height: 100%;
}

.viewport-overlay {
  position: absolute;
  z-index: 10;
  pointer-events: none;
  
  &.top-left {
    top: 8px;
    left: 8px;
  }
  
  &.bottom-left {
    bottom: 40px;
    left: 8px;
  }
}

.viewport-info {
  font-size: 11px;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  line-height: 1.4;
}

.viewport-tools {
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  padding: 4px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 6px;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 15;
  
  .spr-chart:hover & {
    opacity: 1;
  }
}

.tool-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  transition: background 0.15s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  
  .icon {
    font-size: 14px;
  }
}
</style>
