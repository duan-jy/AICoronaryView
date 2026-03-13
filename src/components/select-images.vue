<style lang="less" scoped>
.images-container {
  width: 100%;
  flex: 1;
  overflow: hidden;
}
.select-list {
  li {
    line-height: 40px;
    color: #fff;
    text-align: center;
    font-size: 12px;
    cursor: pointer;
    &:hover,
    &.active {
      background-color: #3b7cff;
    }
  }
}
.types-content {
  width: 100%;
  height: 41px;
  border-top: 1px solid #050d14;
  display: flex;
  flex-direction: row;
  padding: 0 10px;
  background-color: #1c2541;
  .title {
    line-height: 40px;
    color: #fff;
    font-size: 12px;
  }
  .type-list {
    flex: 1;
    height: 40px;
    li {
      float: left;
      width: 45.5px;
    }
  }
}

.all-images {
  width: 100%;
  height: calc(100% - 41px);
  overflow: hidden;
  .images-list {
    width: 320px;
    height: 100%;
    float: left;
  }
  .artery-list {
    width: 80px;
    height: 100%;
    float: left;
    overflow-x: hidden;
    overflow-y: auto;
    background-color: #1c2541;
    li {
      width: 100%;
    }
  }
}

.images-list {
  overflow-x: hidden;
  overflow-y: auto;
  .image {
    float: left;
    border: 1px solid transparent;
    position: relative;
    cursor: pointer;
    &:hover {
      border-color: #0ac8f8;
    }
    &.nospr-img {
      width: 106.5px;
    }
    &.spr-img {
      width: 100%;
    }
    img {
      width: 100%;
      height: 100%;
    }
    .img-msg {
      width: 100%;
      height: 20px;
      font-size: 12px;
      position: absolute;
      top: 0;
      left: 0;
      line-height: 20px;
      color: #fff;
      text-align: center;
    }
    .push-print {
      position: absolute;
      right: 2px;
      bottom: 2px;
      width: 20px;
      height: 20px;
      background-color: #f4721b;
      text-align: center;
      line-height: 20px;
      border-radius: 4px;
      cursor: pointer;
      &.hasSelect {
        background-color: #3b7cff;
      }
      .artery-icon {
        color: #fff;
        font-size: 12px;
      }
    }
  }
}
</style>

<template>
  <div class="images-container">
    <div class="types-content">
      <div class="title">类型：</div>
      <ul class="type-list select-list">
        <li
          v-for="item in typeList"
          :key="item.key"
          :class="{ active: activeType === item.key }"
          @click="activeType = item.key"
        >
          {{ item.type }}
        </li>
      </ul>
    </div>
    <div class="all-images">
      <ul class="images-list no-scrollbar">
        <li
          v-for="(item, index) in images"
          :class="['image', item.isSpr ? 'spr-img' : 'nospr-img']"
          :key="`${item.key}`"
        >
          <img
            :src="imgload(item.img)"
            :draggable="toolsName === 'dargImg'"
            @dragstart.stop="emits('dragImg', item)"
            @dblclick.stop="emits('viewScaleImage', index, images)"
          />
          <div class="img-msg">
            {{ item.artery }}
            <span v-if="item.angle">{{ item.angle }}&deg;</span>
          </div>

          <div
            :class="['push-print', hasSelect(item) ? 'hasSelect' : '']"
            @click.stop="emits('pushPrint', item)"
          >
            <i
              :class="['artery-icon', isPush ? 'icon-huaban' : 'icon-dayin']"
            />
          </div>
        </li>
      </ul>
      <ul class="artery-list select-list no-scrollbar">
        <li
          :class="{ active: activeArtery === 'ALL' }"
          @click="activeArtery = 'ALL'"
        >
          全部
        </li>
        <li
          v-for="item in arteryList"
          :key="item.id"
          :class="{ active: activeArtery === item.id }"
          @click="activeArtery = item.id"
        >
          {{ item.name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, computed } from 'vue'
import { imgload } from '@/api/index'

const props = defineProps({
  toolsName: {
    type: String,
    default: 'dargImg'
  },
  allImages: {
    type: Array,
    default: () => []
  },
  arteryList: {
    type: Array,
    default: () => []
  },
  typeList: {
    type: Array,
    default: () => [
      {
        key: 'ALL',
        type: '全部'
      },
      {
        key: 'CPR',
        type: 'CPR'
      },
      {
        key: 'SPR',
        type: 'SPR'
      },
      {
        key: 'VR',
        type: 'VR'
      },
      {
        key: 'MIP',
        type: 'MIP'
      },
      {
        key: 'Synthesis',
        type: '组合'
      }
    ]
  },
  isPush: {
    type: Boolean,
    default: false
  },
  selectImages: {
    type: Array,
    default: () => []
  }
})

const emits = defineEmits([
  'viewScaleImage',
  'checkImage',
  'pushPrint',
  'dragImg'
])

const activeType = ref('ALL')

const activeArtery = ref('ALL')

const images = computed(() => {
  let images = props.allImages
  if (activeType.value !== 'ALL') {
    images = images.filter((item) => item.part.indexOf(activeType.value) > -1)
  }
  if (activeArtery.value !== 'ALL') {
    images = images.filter((item) => item.arteryId === activeArtery.value)
  }
  return images
})

const hasSelect = (item) => {
  if (!props.selectImages.length) {
    return false
  }
  if (item) {
    return (
      props.selectImages.findIndex(
        (select) =>
          select && (select.key === item.key || select.dcm === item.dcm)
      ) > -1
    )
  } else {
    return false
  }
}
</script>
