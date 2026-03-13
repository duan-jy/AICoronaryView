<style lang="less" scoped>
.swiper-table.print-table {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.print-table {
  border-collapse: collapse;
  border: 0.5px solid #666666;
  tr {
    border: 0.5px solid #666666;
  }
  td {
    border: 0.5px solid #666666;
    // outline: 1px solid transparent;
    cursor: pointer;
    position: relative;
    color: #fff;
    // display: flex;
    // align-items: center;
    // justify-content: center;
    &:hover,
    &:active {
      outline-color: #0ac8f8;
    }

    .artery {
      width: 100%;
      height: 14px;
      text-align: center;
      position: absolute;
      left: 0;
      top: -2px;
      z-index: 2;
      color: #fff;
      // line-height: 40px;
      font-weight: bold;
      font-size: 12px;
      transform: scale(0.7);
      text-stroke: 1px #000;
      -webkit-text-stroke: 0.5px #000;
      -webkit-text-fill-color: #fff;
    }
    img {
      width: 100%;
      height: 100%;
    }
  }
  .selected {
    border: 0.5px solid #f8d50a;
  }
}
</style>
<template>
  <table
    :class="['print-table', isDcmRender ? 'swiper-table' : '']"
    :id="elId"
    :style="{
      width: `${table.width || 0}px`,
      height: `${table.height || 0}px`
    }"
  >
    <tr v-for="rowItem in table.rows" :key="rowItem.uuid">
      <td
        :class="colItem.isSelected ? 'selected' : ''"
        v-for="colItem in rowItem.row"
        :key="colItem.uuid"
        :rowspan="colItem.rowspan"
        :colspan="colItem.colspan"
        :index="colItem.index"
        :style="{
          width: colItem.width + 'px',
          height: colItem.height + 'px'
        }"
        align="center"
        valian="middle"
        @drop.stop="printDropOver(colItem)"
        @click.stop="printItemHandler(colItem)"
        @dblclick.stop="scaleImgs(colItem)"
        @contextmenu.stop.prevent="removePrintCell($event, colItem)"
        @dragover.prevent.stop
      >
        <!-- @dragover.prevent.stop -->
        <div
          class="img"
          v-if="printImages[colItem.index]"
          :id="
            isDcmRender
              ? `print-dcm-${colItem.index}`
              : `print-img-${colItem.index}`
          "
          :style="{
            width: colItem.width + 'px',
            height: colItem.height + 'px'
          }"
        >
          <canvas v-if="isDcmRender" class="cornerstone-canvas"></canvas>
          <img
            v-if="renderImages && renderImages[colItem.index] && !isDcmRender"
            :src="renderImages[colItem.index]"
          />
        </div>

        <div class="artery">
          {{
            printImages[colItem.index] ? printImages[colItem.index].artery : ''
          }}
        </div>
        <PrintMsg
          v-if="
            showMsg &&
            printImages[colItem.index] &&
            (!isDragHideMsg || !colItem.isSelected)
          "
          :printFilmMsg="printFilmMsg"
        />
      </td>
    </tr>
  </table>
</template>

<script setup>
import { defineProps, defineEmits, toRefs, ref, watch } from 'vue'
import { wwwcSynchronizer, panZoomSynchronizer } from '@/utils/cornerstone'
import PrintMsg from '@/components/print-msg.vue'

const props = defineProps({
  printImages: {
    type: Array,
    default: () => []
  },
  renderImages: {
    type: Object,
    default: () => ({})
  },
  table: {
    type: Object,
    default: () => ({})
  },
  elId: {
    type: String,
    default: ''
  },
  toolsName: {
    type: String,
    default: ''
  },
  isDcmRender: {
    type: Boolean,
    default: true
  },
  showMsg: {
    type: Boolean,
    default: true
  },
  isCtrlKeydown: {
    type: Boolean,
    default: false
  },
  isShiftKeydown: {
    type: Boolean,
    default: false
  },
  printFilmMsg: {
    type: Object,
    default: () => ({})
  }
})
cornerstoneTools.addTool(cornerstoneTools.WwwcTool)
cornerstoneTools.addTool(cornerstoneTools.ZoomTool)
cornerstoneTools.addTool(cornerstoneTools.PanTool)
const { table, isCtrlKeydown, isShiftKeydown, toolsName } = toRefs(props)
watch(toolsName, (toolName) => {
  if (toolName === 'Wwwc') {
    cornerstoneTools.setToolDisabled('Pan')
    cornerstoneTools.setToolDisabled('Zoom')
    cornerstoneTools.setToolActive('Wwwc', {
      mouseButtonMask: 1,
      synchronizationContext: wwwcSynchronizer
    })
  } else if (toolName === 'Zoom') {
    cornerstoneTools.setToolDisabled('Pan')
    cornerstoneTools.setToolDisabled('Wwwc')
    cornerstoneTools.setToolActive(toolName, {
      mouseButtonMask: 1,
      synchronizationContext: panZoomSynchronizer
    })
  } else if (toolName === 'Pan') {
    cornerstoneTools.setToolDisabled('Zoom')
    cornerstoneTools.setToolDisabled('Wwwc')
    cornerstoneTools.setToolActive(toolName, {
      mouseButtonMask: 1,
      synchronizationContext: panZoomSynchronizer
    })
  } else {
    cornerstoneTools.setToolDisabled('Pan')
    cornerstoneTools.setToolDisabled('Wwwc')
    cornerstoneTools.setToolDisabled('Wwwc')
  }
})
const emits = defineEmits([
  'printDropOver',
  'printItemHandler',
  'scaleImgs',
  'removePrintCell',
  'wwwcSyncElement'
])

const selectedItem = ref(undefined)
const isDragHideMsg = ref(false)
const canChangeSelect = ref(true)
const selectedElements = ref([])
const printDropOver = (colItem) => {
  if (props.isDcmRender) {
    emits('printDropOver', colItem)
  }
}

const printItemHandler = (colItem) => {
  if (props.isDcmRender) {
    emits('printItemHandler', colItem)
  }
  selectItemOfClick(colItem)
}
const selectItemOfClick = (colItem) => {
  if (!canChangeSelect.value) return
  selectedElements.value = []
  // 单次点击或者按住ctrl点击
  for (const rowItem of table.value.rows) {
    for (const item of rowItem.row) {
      if (isShiftKeydown.value) {
        // 未选中一个的情况下需要选中一个作为开始项
        if (!selectedItem.value) {
          if (item.uuid === colItem.uuid) {
            item.isSelected = true
            selectedItem.value = item
            const element = document.getElementById('print-dcm-' + item.index)
            selectedElements.value.push(element)
          }
          continue
        }
        const indexArray = [selectedItem.value.index, colItem.index]
        const minIndex = Math.min(...indexArray)
        const maxIndex = Math.max(...indexArray)
        if (minIndex <= item.index && maxIndex >= item.index) {
          item.isSelected = true
          const element = document.getElementById('print-dcm-' + item.index)
          selectedElements.value.push(element)
          continue
        }
      }
      if (!isCtrlKeydown.value) {
        item.isSelected = false
      }
      if (item.uuid === colItem.uuid) {
        item.isSelected = !item.isSelected
        if (item.isSelected) {
          // 记录下当前正好被点击选中的
          selectedItem.value = item
        }
      }
      if (item.isSelected) {
        const element = document.getElementById('print-dcm-' + item.index)
        selectedElements.value.push(element)
      }
    }
  }
  wwwcSyncHandle()
}

const wwwcSyncHandle = async() => {
  // 后期需做优化进行之前之后对比 减少sync操作量
  const sourceElements = wwwcSynchronizer.getSourceElements()
  const targetElements = wwwcSynchronizer.getTargetElements()
  const beforeSyncElements = targetElements.concat(sourceElements)
  wwwcSynchronizer.destroy()
  panZoomSynchronizer.destroy()
  for (const element of beforeSyncElements) {
    element.removeEventListener(cornerstoneTools.EVENTS.MOUSE_UP, () => {})
    element.removeEventListener(cornerstoneTools.EVENTS.MOUSE_DRAG, () => {})
  }

  for (const element of selectedElements.value) {
    panZoomSynchronizer.add(element)
    wwwcSynchronizer.add(element)
    element.addEventListener(cornerstoneTools.EVENTS.MOUSE_DRAG, (event) => {
      const isContain = selectedElements.value.find(
        (item) => item.id === event.target.id
      )
      if (!isContain) {
        canChangeSelect.value = true
        return
      }
      canChangeSelect.value = false
      if (!isDragHideMsg.value) {
        isDragHideMsg.value =
          toolsName.value === 'Pan' ||
          toolsName.value === 'Zoom' ||
          toolsName.value === 'Wwwc'
      }
    })
    element.addEventListener(cornerstoneTools.EVENTS.MOUSE_UP, (event) => {
      const timer = setTimeout(() => {
        isDragHideMsg.value = false
        canChangeSelect.value = true
        clearTimeout(timer)
      }, 200)
    })
  }
}

const scaleImgs = (colItem) => {
  if (props.isDcmRender) {
    emits('scaleImgs', colItem)
  }
}

const removePrintCell = (evt, colItem) => {
  if (props.isDcmRender) {
    let delElementsIndex = []
    if (colItem.isSelected) {
      delElementsIndex = selectedElements.value.map((item) => {
        const indexArrayIds = item.id.split('-')
        return indexArrayIds[indexArrayIds.length - 1]
      })
    } else {
      delElementsIndex = false
    }
    emits('removePrintCell', evt, colItem, delElementsIndex)
  }
}
</script>
