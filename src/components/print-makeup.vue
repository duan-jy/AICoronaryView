<style lang="less" scoped>
.image-container {
  background: #30394d;
  border-radius: 5px;
  width: 240px;
  //   height: 220px;
  margin: 0 auto;
  margin-top: 5px;
  margin-bottom: 5px;
  //   position: relative;
  .image-title {
    color: #fff;
    .artery-icon {
      font-size: 20px;
      float: right;
      margin-right: 10px;
      &:hover {
        color: red;
        cursor: pointer;
      }
    }
  }
  .image-content {
    width: 220px;
    padding: 5px;
    margin: 5px;
    margin-bottom: 0;
    img {
      margin-top: 5px;
      width: 220px;
    }
  }
  .image-operate {
    width: 100%;
    position: relative;
    height: 30px;
    text-align: right;
    .image-icon {
      display: inline-block;
      width: 30px;
      height: 30px;
      border-radius: 3px;
      text-align: center;
      line-height: 30px;
      font-size: 16px;
      color: #fff;
      background-color: #073c6b;
      margin-left: 5px;
      // overflow: hidden;
      cursor: pointer;
      position: relative;
      .el-icon {
        position: absolute;
        left: -4px;
        top: -5px;
        color: #00ff0e;
        z-index: 1000;
      }
    }
    .icon-huaban {
      background-color: #e9370e;
      &.hasPush {
        background-color: #3b7cff;
      }
    }
    .active {
      background: #3b7cff;
    }
  }
}
</style>
<template>
  <el-drawer
    v-model="makeupDrawer"
    title="I am the title"
    direction="rtl"
    :with-header="false"
    :size="300"
  >
    <div class="">
      <el-collapse accordion v-model="activeCollapse">
        <el-collapse-item title="智能组合图" name="combination">
          <div
            v-for="(item, index) of CombinationList"
            :key="item.index"
            class="image-container"
            :style="{
              boxShadow: `var(--el-box-shadow)`
            }"
          >
            <div class="image-title">
              <span>{{ index + 1 }}.{{ item.part.toUpperCase() }}</span>
              <span
                @click="deleteMakeUp(item)"
                class="artery-icon icon-shanchutuxiang2"
              ></span>
            </div>
            <div class="image-content">
              <img :src="getImgSrc(item.imagePath)" alt="注释图" />
            </div>
            <div class="image-operate">
              <span
                :class="[
                  'image-icon',
                  'artery-icon',
                  'icon-huaban',
                  item.isPush ? 'active' : ''
                ]"
                @click="pushDcm('T', item)"
              >
                <!-- <el-icon v-show="item.isPush"><Flag /></el-icon> -->
              </span>
              <span
                :class="[
                  'image-icon',
                  'artery-icon',
                  'icon-dayin',
                  item.isPrint ? 'active' : ''
                ]"
                @click="pushDcm('D', item)"
              >
                <!-- <el-icon v-show="item.isPrint"><Flag /></el-icon> -->
              </span>
            </div>
          </div>
        </el-collapse-item>
        <el-collapse-item title="智能注释图" name="note">
          <div
            v-for="(item, index) of NoteList"
            :key="item.index"
            class="image-container"
            :style="{
              boxShadow: `var(--el-box-shadow)`
            }"
          >
            <div class="image-title">
              <span>{{ index + 1 }}.{{ item.part }}</span>
              <span
                @click="deleteMakeUp(item)"
                class="artery-icon icon-shanchutuxiang2"
              ></span>
            </div>
            <div class="image-content">
              <img :src="getImgSrc(item.imagePath)" alt="注释图" />
            </div>
            <div class="image-operate">
              <span
                :class="[
                  'image-icon',
                  'artery-icon',
                  'icon-huaban',
                  item.isPush ? 'active' : ''
                ]"
                @click="pushDcm('T', item)"
              >
                <!-- <el-icon v-show="item.isPush"><Flag /></el-icon> -->
              </span>
              <span
                :class="[
                  'image-icon',
                  'artery-icon',
                  'icon-dayin',
                  item.isPrint ? 'active' : ''
                ]"
                @click="pushDcm('D', item)"
              >
                <!-- <el-icon v-show="item.isPrint"><Flag /></el-icon> -->
              </span>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </el-drawer>
</template>

<script setup>
import { Flag } from '@element-plus/icons-vue'
import { computed, ref, toRefs } from 'vue'
import arteryBus from '@/utils/arteryBus'
import { imgload } from '@/api/index'
const makeupDrawer = ref(false)
const activeCollapse = ref('combination')
const props = defineProps({
  composeList: {
    type: Array,
    default: []
  },
  workingPath: {
    type: String,
    default: ''
  }
})
const { composeList, workingPath } = toRefs(props)
const emits = defineEmits(['deleteMakeData'])

const CombinationList = computed(() => {
  return composeList.value.filter((item) => item.part === 'Synthesis')
})
const NoteList = computed(() => {
  return composeList.value.filter((item) => item.part !== 'Synthesis')
})

const getImgSrc = (imagePath) => {
  return imgload(`${workingPath.value}/${imagePath.replace('dcm', 'jpg')}`)
}
const deleteMakeUp = (item) => {
  return emits('deleteMakeData', item)
}
const pushDcm = async(type, item) => {
  if (type === 'D') {
    item.isPrint = true
  }
  if (type === 'T') {
    item.isPush = true
  }
  arteryBus.emit('pushDcmToPD', { ...item, type, part: 'Synthesis' })
  return
}

arteryBus.on('makeup-Drawer', (value) => {
  if (value) {
    activeCollapse.value = value
  }
  makeupDrawer.value = !makeupDrawer.value
})
</script>
