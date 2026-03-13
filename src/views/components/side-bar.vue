<style lang="less" scoped>
.side-container {
  box-sizing: border-box;
  width: 150px;
  height: 100%;
  background: #1c2541;
  padding-top: 5px;
  float: left;
  border-right: 2px solid #2e4d90;
  border-top: 1px solid #2e4d90;
}

.side-alone {
  width: 140px;
  margin: 0 auto;
  height: 170px;
  margin-top: 10px;
  background: #000;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  overflow: hidden;
  border: 1px solid #223368;
  user-select: none;
  position: relative;

  &:first-child {
    margin-top: 0;
  }

  &:hover {
    box-sizing: border-box;
    border: 1px solid #4779f4;
  }

  &.active {
    border: 1px solid #4779f4;

    .alone-info {
      background: linear-gradient(64deg, #2f3fd4, #3c79e0);
    }
  }

  .alone-status {
    padding: 2px 5px;
    position: absolute;
    z-index: 1500;
    background: #223368;
    right: 5px;
    top: 5px;
    font-size: 12px;
    color: #f4721b;
  }

  .alone-top {
    width: 95%;
    margin: 0 auto;
    height: 140px;
    pointer-events: none;
  }

  .alone-progress {
    width: 100%;
    height: 3px;

    &.div {
      margin: 0 auto;
    }
  }

  .alone-info {
    height: calc(100% - 140px);
    background: #223368;
    font-size: 12px;
    padding: 0 10px;
    text-align: left;

    // background: linear-gradient(64deg, #2f3fd4, #3c79e0);
    .info-series {
      height: 50%;
      overflow: hidden;
    }

    .info-image {
      height: 100%;
      display: flex;
      flex-direction: row;
      align-items: center;
      color: #ddd;

      .info-item {
        flex: 1;
      }
    }
  }
}

.hidden-side {
  position: absolute;
  left: -1000px;
  top: 0;
}

.text-align-right {
  text-align: right;
}
</style>
<template>
  <div :class="['side-container', sideBarDisplay ? '' : 'hidden-side']">
    <el-scrollbar style="padding-bottom: 10px">
      <div :class="['side-alone', item.active ? 'active' : '']" v-for="item of dicomMetaData" :key="item.seriesUid"
        @click="switchSequence(item)">
        <div class="alone-status">分析成功</div>
        <!-- 显示图像 -->
        <div v-loading="item.sideImageLoading" element-loading-background="rgba(0, 0, 0, 0.6)" class="alone-top"
          :id="`side-alone-${item.seriesUid}`"></div>
        <!-- 显示具体信息 -->
        <div class="alone-info">
          <!-- <div class="info-series">{{ item.protocolName }}</div> -->
          <div class="info-image">
            <div class="info-item">{{ item.seriesDesc }}</div>
            <div class="info-item text-align-right">
              {{ item.imageIds.length }}
            </div>
          </div>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { useStore } from "vuex";
const { cornerstone } = window;
import { watch, nextTick, ref, computed } from "vue";
import { loadImage } from "@/utils/cornerstone";

const sideBarDisplay = ref(true);
const activeSeriesId = ref("");

const store = useStore();
const dicomMetaData = computed(() => store.getters.dicomMetaData);
const switchSequence = (item) => {
  console.log(item);
  updateHashParamAndReload(item.seriesUid, item.imageIds.length, true);
};
/**
 * 显示当前所有序列侧边缩略图
 */
const displaySideImage = async () => {
  // try {
  for (const item of dicomMetaData.value) {
    let element = document.getElementById(`side-alone-${item.seriesUid}`);
    try {
      if (!element) {
        await nextTick();
        element = document.getElementById(`side-alone-${item.seriesUid}`);
      }
      const image = await loadImage(item.sideImageId);
      // 由于此为界面加载后直接进行渲染 不存在二次enable的情况
      cornerstone.enable(element);
      cornerstone.displayImage(element, image);
      item.sideImageLoading = false;
    } catch (e) {
      console.log(e);
      // ElMessage.error("渲染侧边缩略图失败，" + e.error);
      item.sideImageLoading = false;
      //   if (element) element.parentElement.style.display = "none";
    }
  }
};

watch(dicomMetaData, () => {
  //   const proxyArray =
  //     dicomMetaData.value.filter((item: any) => item.proxyProduct) || [];
  //   if (proxyArray.length > 1) {
  //     sideBarDisplay.value = true;
  //   }
  displaySideImage();
});

function updateHashParamAndReload(seriesId, imageCount, isReload) {
  // 获取当前URL
  const url = new URL(window.location.href);
  // 获取哈希部分
  const hash = url.hash;
  // 创建一个新的URL对象来解析哈希部分
  const hashUrl = new URLSearchParams(hash.slice(2));
  if (seriesId) {
    hashUrl.set("seriesId", seriesId);
  }
  if (imageCount) {
    hashUrl.set("imageCount", imageCount);
  }
  console.log("hashUrl", hashUrl);
  console.log("hashUrl", hashUrl.toString());
  // 更新哈希部分
  url.hash = "#/home?" + hashUrl.toString().replace("home%3F", "");
  console.log("url.hash", url.hash);
  if (!isReload) return url.href;
  window.location.replace(url.href);
  window.location.reload();
}
</script>
