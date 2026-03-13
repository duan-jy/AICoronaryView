<template>
  <div class="print-setting">
    <div class="setting-head setting-title-item">
      <div class="title">选择图像</div>
      <div
        class="simple-btn cancle onepress"
        style="margin-right: 5px"
        @click="loadHistory"
      >
        历史排版
      </div>
      <div class="simple-btn" @click="layoutSmartWarn">智能排版</div>
    </div>
    <slot></slot>
    <!-- 布局 -->
    <div class="setting-content">
      <div class="layout-seeting">
        <el-tabs v-model="activeName" class="print-tabs">
          <el-tab-pane label="常规布局" name="common" class="pane-text">
            <ul class="layout-list common-layout">
              <li
                v-for="item in commonLayout"
                :key="item"
                @click="emits('changeLayout', item, useActive)"
              >
                <div class="layout-img">
                  <img :src="require(`@/assets/layout/${item}.png`)" />
                </div>
                <div class="layout-tip">{{ item.replace("_", "*") }}</div>
              </li>
            </ul>
          </el-tab-pane>
          <el-tab-pane label="特殊布局" name="special" class="pane-table">
            <ul class="layout-list special-layout">
              <li
                v-for="item in specialLayout"
                :key="item"
                @click="emits('changeLayout', item, useActive)"
              >
                <div class="layout-img">
                  <img :src="require(`@/assets/layout/${item}.png`)" />
                </div>
                <div class="layout-tip">{{ item }}</div>
              </li>
            </ul>
          </el-tab-pane>
        </el-tabs>
        <div class="layout-customize">
          <div class="customize-container">
            <div class="customize-content" v-show="isShowCustomize">
              <div class="customize-title">
                <span>自定义布局</span>
                <el-icon
                  color="#fff"
                  :size="12"
                  @click="isShowCustomize = false"
                >
                  <close />
                </el-icon>
              </div>
              <ul class="customize-list">
                <li
                  v-for="item in customizeArr"
                  :key="`customize_${item.type}`"
                  :class="[
                    item.row <= customizeRow && item.col <= customizeCol
                      ? 'active'
                      : '',
                  ]"
                  @click="customizeChange(item)"
                ></li>
              </ul>
              <div class="customize-input">
                <span>行：</span>
                <input v-model="customizeRow" type="number" min="1" max="10" />
                <span style="margin-left: 10px"> 列：</span>
                <input v-model="customizeCol" type="number" min="1" max="10" />
              </div>
              <div class="customize-btns">
                <div class="simple-btn cancle" @click="isShowCustomize = false">
                  取 消
                </div>
                <div class="simple-btn" @click="customizeLayout">确 定</div>
              </div>
            </div>
          </div>
        </div>
        <div class="btns">
          <div
            class="simple-btn cancle onepress"
            @click="emits('layoutOnePress')"
          >
            一键排版
          </div>
          <div class="simple-btn customize" @click="isShowCustomize = true">
            自定义
          </div>
        </div>
      </div>
    </div>
    <!-- 打印 -->
    <div class="setting-content print-machine">
      <div class="setting-item print-useActive">
        <el-checkbox
          v-model="useActive"
          class="head-check"
          size="small"
          label="应用到选中胶片"
          @click.stop
        />
      </div>
      <!--选择推送-->
      <div class="setting-item">
        <span class="layout-title">推送服务：</span>
        <div class="pick-content-print select">
          <el-select
            v-model="pushServer"
            size="mini"
            class="content-item"
            placeholder="请选择"
            popper-class="common-options"
            @change="storageServerInfo('pushServer', $event)"
          >
            <el-option
              v-for="(item, index) in pushServerList"
              :key="`pushServer_${index}`"
              :value="index"
              :label="item.serverAet"
            />
            <!-- :label="item.serverName" /> -->
          </el-select>
        </div>
        <span class="layout-title" style="padding-right: 5px; width: 40px">
          推送</span
        >
        <el-switch
          v-model="isSyncPush"
          active-color="#3b7cff"
          inactive-color="#223368"
          size="small"
          @change="storageServerInfo('isSyncPush', $event)"
        />
        <span
          class="layout-title"
          style="padding: 0 10px; width: 50px; text-align: center"
        >
          打印</span
        >
        <el-switch
          v-model="isPrintFilm"
          active-color="#3b7cff"
          inactive-color="#223368"
          size="small"
          @change="storageServerInfo('isPrintFilm', $event)"
        />
      </div>
      <div class="setting-item">
        <span class="layout-title">打印机：</span>
        <div class="pick-content-print select">
          <el-select
            v-model="printMachine"
            size="mini"
            class="content-item"
            placeholder="请选择"
            popper-class="common-options"
            @change="storageServerInfo('printMachine', $event)"
          >
            <el-option
              v-for="(item, index) in printerList"
              :key="`printMachine_${index}`"
              :value="index"
              :label="item.serverAet"
            />
          </el-select>
        </div>
        <span class="layout-title">尺 寸：</span>
        <div class="pick-content-print select">
          <el-select
            v-model="printSize"
            size="mini"
            class="content-item"
            placeholder="请选择"
            popper-class="common-options"
            @change="resizeTables"
          >
            <el-option
              v-for="item in printSizeList"
              :key="item.value"
              :value="item.value"
              :label="item.value"
            />
          </el-select>
        </div>
      </div>
      <div class="setting-item print-range">
        <span class="layout-title">打印范围：</span>
        <div class="range-radio">
          <el-radio v-model="printRange" :label="1" size="small">
            全部
          </el-radio>
          <el-radio v-model="printRange" :label="2" size="small">
            当前页
          </el-radio>
          <el-radio
            v-show="false"
            v-model="printRange"
            :label="3"
            size="small"
            class="range-start-end"
          >
          </el-radio>
        </div>
        <div
          v-show="false"
          :class="['range-input', printRange === 3 ? 'active' : '']"
        >
          <span class="range-item">从</span>
          <el-input
            v-model="printStart"
            class="range-item"
            :disabled="printRange !== 3"
            type="number"
            :min="1"
          />
          <span class="range-item" style="margin-left: 5px">到</span>
          <el-input
            v-model="printEnd"
            class="range-item"
            :disabled="printRange !== 3"
            type="number"
            :min="1"
          />
        </div>
      </div>
      <div class="setting-item print-btn">
        <div class="simple-btn cancle" @click="closePage">关 闭</div>
        <el-button
          class="simple-btn printsimple-btn"
          :disabled="loading ? loading : !btnText"
          :loading="loading"
          @click="print"
        >
          <span v-html="btnText"></span>
        </el-button>
      </div>
    </div>
  </div>
</template>
<script setup>
import {
  defineProps,
  defineEmits,
  ref,
  reactive,
  computed,
  onMounted,
  onBeforeMount,
} from "vue";
import { useRouter } from "vue-router";
const $router = useRouter();
import { ElMessageBox, ElMessage } from "element-plus";

import { getPrinterList, getPushServerList, getJsonData } from "@/api/index";

import { commonLayout, specialLayout, printSizeList } from "@/utils/source";

const props = defineProps({
  printLoading: {
    type: Boolean,
    default: false,
  },
  pushLoading: {
    type: Boolean,
    default: false,
  },
  currentPrint: {
    type: Number,
    default: 1,
  },
  tablesLen: {
    type: Number,
    default: 0,
  },
  workingPath: {
    type: String,
    default: "",
  },
});

const emits = defineEmits([
  "smartLayout",
  "resizeTables",
  "changeLayout",
  "layoutOnePress",
  "printAndPush",
  "historyLayout",
]);

const customizeArr = reactive([]);
// 10 * 10 的自定义
for (let i = 1; i <= 10; i++) {
  for (let j = 1; j <= 10; j++) {
    customizeArr.push({
      row: i,
      col: j,
      type: `${i}_${j}`,
    });
  }
}

const activeName = ref("common");

const printSize = ref("14INX17IN"); // 打印尺寸
const printerList = ref([]);
const printMachine = ref(0);
const printRange = ref(1);
const printStart = ref("");
const printEnd = ref("");
const isPrintFilm = ref(true);

const pushServerList = ref([]);
const pushServer = ref(0);
const isSyncPush = ref(true);

const useActive = ref(true);

const isShowCustomize = ref(false);
const customizeRow = ref(0);
const customizeCol = ref(0);

const pushServerStorage = window.localStorage.getItem("pushServer");
const printMachineStorage = window.localStorage.getItem("printMachine");

const isSyncPushStorage = window.localStorage.getItem("isSyncPush");
const isPrintFilmStorage = window.localStorage.getItem("isPrintFilm");

if (isSyncPushStorage) {
  isSyncPush.value = isSyncPushStorage === "true" ? true : false;
}
if (isPrintFilmStorage) {
  isPrintFilm.value = isPrintFilmStorage === "true" ? true : false;
}
if (pushServerStorage) {
  pushServer.value = Number(pushServerStorage);
}
if (printMachineStorage) {
  printMachine.value = Number(printMachineStorage);
}

const btnText = computed(() => {
  const textArr = [];
  if (isPrintFilm.value) {
    textArr.push("打&nbsp;印");
  }
  if (isSyncPush.value) {
    textArr.push("推&nbsp;送");
  }
  return textArr.join("&nbsp;|&nbsp;");
});

const loading = computed(() => {
  return props.printLoading || props.pushLoading;
});

const layoutSmartWarn = () => {
  if (props.tablesLen) {
    ElMessageBox.confirm(
      "智能排版后，当前的排版和胶片会被删除，是否继续",
      "提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    ).then(() => {
      emits("smartLayout");
    });
  } else {
    emits("smartLayout");
  }
};

// 加载历史排版
const loadHistory = async () => {
  if (!props.workingPath) {
    return;
  }
  const historyRes = await getJsonData(
    `${props.workingPath}/print_layout_history.json`
  );
  if (!(historyRes && historyRes.data)) {
    ElMessage.warning("无历史排版信息");
    return;
  }
  const { printImages, tableTypes } = historyRes.data;
  if (props.tablesLen) {
    ElMessageBox.confirm(
      "加载历史排版后，当前的排版和胶片会被删除，是否继续",
      "提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    ).then(() => {
      emits("historyLayout", printImages, tableTypes);
    });
  } else {
    emits("historyLayout", printImages, tableTypes);
  }
};

const loadServerList = async () => {
  try {
    const printerRes = await getPrinterList(
      $router.currentRoute.value.query.hospitalId || "000001"
    );
    console.log(printerRes);
    if (printerRes && printerRes.data) {
      // printerList.value = printerRes.data.filter(
      //   (item) => item.serverName === 'printer'
      // )
      // pushServerList.value = printerRes.data.filter(
      //   (item) => item.serverName !== 'printer'
      // )
      printerList.value = [...printerRes.data];
      pushServerList.value = [...printerRes.data];
    } else {
      printerList.value = [];
      pushServerList.value = [];
    }
    // const pushRes = await getPushServerList()
  } catch (error) {
    console.log(error);
    printerList.value = [];
    pushServerList.value = [];
  }
};

const customizeLayout = () => {
  const rows = parseInt(customizeRow.value);
  const cols = parseInt(customizeCol.value);

  if (rows <= 0 || cols <= 0) {
    customizeRow.value = 0;
    customizeRow.value = 0;
    isShowCustomize.value = false;
    return;
  }
  emits("changeLayout", `${rows}_${cols}`, useActive.value);
  isShowCustomize.value = false;
};

const customizeChange = (item) => {
  customizeRow.value = item.row;
  customizeCol.value = item.col;
};

const closePage = () => {
  window.close();
};

const startEndArr = (start, end, min, max) => {
  if (start < min || end > max || start > end) {
    return [];
  }
  if (start === end) {
    return [start];
  }
  const len = end - start + 1;
  return Array.from({ length: len }, (v, i) => i + start);
};

const print = () => {
  if (!props.tablesLen) {
    return;
  }
  let printIndexs = [];
  if (isPrintFilm.value) {
    if (printRange.value === 1) {
      printIndexs = startEndArr(1, props.tablesLen, 1, props.tablesLen);
    } else if (printRange.value === 3) {
      let start = Number(printStart.value);
      let end = Number(printEnd.value);
      if (start > end) {
        ElMessage.warning("请输入正确的打印范围");
        return;
      }
      start = start < 1 ? 1 : start;
      end = end > props.tablesLen ? props.tablesLen : end;
      printIndexs = startEndArr(start, end, 1, props.tablesLen);
    } else {
      printIndexs = [props.currentPrint];
    }
  }
  emits("printAndPush", {
    isPrint: isPrintFilm.value,
    isPush: isSyncPush.value,
    pusher: pushServerList.value[pushServer.value] || "", // 推送的服务器
    printer: printerList.value[printMachine.value] || "", // 打印的服务器
    printSize: printSize.value,
    printRange: printRange.value,
    printIndexs,
  });
};

loadServerList();

const resizeTables = () => {
  const item = printSizeList.find((item) => item.value === printSize.value);
  if (!item) {
    return;
  }
  const printFilm = document.getElementById("print-film");
  if (!printFilm) {
    return;
  }
  const { ratioW, ratioH } = item;
  const flimHeight = printFilm.clientHeight;
  const flimWidth = printFilm.clientWidth;
  let cardinal = 51.2;
  // 基数
  if (flimHeight > flimWidth) {
    cardinal = Math.floor(
      ((flimWidth * 0.9) / Math.ceil(51.2 * ratioW)) * 51.2
    );
  } else {
    cardinal = Math.floor(
      ((flimHeight * 0.9) / Math.ceil(51.2 * ratioH)) * 51.2
    );
  }
  const width = Math.ceil(cardinal * ratioW);
  const height = Math.ceil(cardinal * ratioH);
  emits("resizeTables", {
    width,
    height,
  });
};

const storageServerInfo = (storagekey, storageValue) => {
  window.localStorage.setItem(storagekey, String(storageValue));
  console.log(storagekey);
  console.log(storageValue);
};

onMounted(() => {
  resizeTables();
  window.addEventListener("resize", resizeTables);
});

onBeforeMount(() => {
  window.addEventListener("resize", resizeTables);
});
</script>
