<style lang="less" src="@/styles/print.less"></style>
<template>
  <div class="print-container">
    <div class="print-content">
      <PrintHead
        v-model:showMsg="showMsg"
        :patientId="patientId"
        :seriesDesc="patientMsg.seriesDesc || ''"
        :activeToolsName="toolsName"
        @changeTools="changeTools"
        @toolsHandler="toolsHandler"
      />
      <div
        class="print-film"
        id="print-film"
        tabindex="-1"
        @keyup="keyDownEvent(false)"
        @keydown.ctrl.exact="keyDownEvent(true, 'isCtrlKeydown')"
        @keydown.shift.exact="keyDownEvent(true, 'isShiftKeydown')"
      >
        <swiper
          class="swiper-no-swiping"
          :navigation="true"
          :modules="modules"
          :updateOnWindowResize="true"
          :autoUpdate="true"
          :initialSlide="1"
          @swiper="setSwiper"
          @slideChange="slideChange"
        >
          <swiper-slide
            v-for="(item, index) in printTables"
            :key="`slide_${index}`"
          >
            <PrintTable
              :table="item"
              :el-id="`print-table-${index + 1}`"
              :printImages="printImages"
              :showMsg="showMsg"
              :printFilmMsg="printFilmMsg"
              :toolsName="toolsName"
              :isCtrlKeydown="isCtrlKeydown"
              :isShiftKeydown="isShiftKeydown"
              @printDropOver="printDropOver"
              @printItemHandler="printItemHandler"
              @scaleImgs="scaleImgs"
              @removePrintCell="removePrintCell"
            ></PrintTable>
          </swiper-slide>
        </swiper>
      </div>
      <div class="film-footer">
        <div class="setting-item print-other">
          <span class="switch-title" style="margin-left: 5px">
            自动向前填充
          </span>
          <el-switch
            v-model="autoFill"
            active-color="#3b7cff"
            inactive-color="#223368"
            size="small"
            @change="changeFillType"
          />
        </div>
        <div class="setting-item page-box">
          <el-pagination
            v-model:current-page="currentPrint"
            class="print-page"
            small
            background
            layout="prev, pager, next"
            :total="printTables.length"
            :page-size="1"
            :pager-count="5"
            @current-change="pageChange"
          />
        </div>
      </div>
    </div>
    <!-- 设置 -->
    <PrintSet
      :printLoading="printLoading"
      :pushLoading="pushLoading"
      :currentPrint="currentPrint"
      :tablesLen="printTables.length"
      :workingPath="workingPath"
      @smartLayout="smartLayout"
      @resizeTables="resizeTables"
      @layoutOnePress="layoutOnePress"
      @changeLayout="changeLayout"
      @printAndPush="printAndPush"
      @historyLayout="historyLayout"
    >
      <SelectImages
        :all-images="allImages"
        :selectImages="printImages"
        :artery-list="arteryList"
        :is-push="false"
        :tools-name="toolsName"
        @dragImg="dragPrintImg"
        @pushPrint="pushPrint"
        @viewScaleImage="viewScaleImage"
      >
      </SelectImages>
    </PrintSet>
  </div>

  <!--render canvas-->
  <div
    id="render-canvas"
    :style="{
      width: renderCanvasStyle.width + 'px',
      height: renderCanvasStyle.height + 'px',
    }"
  >
    <canvas class="cornerstone-canvas"></canvas>
  </div>
  <!-- print tabel -->
  <div
    :style="{
      width: `${renderTable.width || 0}px`,
      height: `${
        renderTable.height ? renderTable.height + printMsgHeadH : 0
      }px`,
    }"
    id="render-content"
  >
    <div
      class="print-msg"
      :style="{
        height: `${printMsgHeadH}px`,
      }"
    >
      流水号：{{ patientId }}

      <!-- <div class="print-msg-content">
        <div class="print-msg-item">{{ patientMsg.patient_name }}</div>
        <div class="print-msg-item">
          {{ regId ? regId : patientMsg.series_date || "" }}
        </div>
      </div>
      <div class="print-logo">冠状动脉CTA</div>
      <div class="print-msg-content right">
        <div class="print-msg-item" style="height: 100%; font-size: 14px">
          流水号：{{ patientId }}
        </div>
        <div class="print-msg-item">
          {{ patientMsg.patient_name }}
        </div>
        <div class="print-msg-item">
          {{ regId ? patientMsg.series_date : patientMsg.patient_age || "" }}
        </div>
      </div> -->
    </div>
    <PrintTable
      :table="renderTable"
      :el-id="`print-render-table`"
      :printImages="printImages"
      :renderImages="renderImages"
      :showMsg="showMsg"
      :printFilmMsg="printFilmMsg"
      :isDcmRender="false"
    ></PrintTable>
  </div>

  <ScaleDcm
    ref="scale-dcm"
    :msg="printFilmMsg"
    :select-images="printImages"
    @pushPrint="pushPrint"
    @changeWwWc="changeWwWc"
  ></ScaleDcm>

  <vue3-menus
    v-model:open="isShowMenu"
    :menus="menus"
    :event="menuEvent"
    :zIndex="2000"
    hasIcon
  />
</template>

<script>
import { Swiper, SwiperSlide } from "swiper/vue/swiper-vue";
import { Navigation } from "swiper";

import html2canvas from "html2canvas";

import { ElMessage } from "element-plus";

import { convertToBMP, saveAsBMP } from "@/utils/canvas2image";

import random from "lodash/random";

import {
  getAllData,
  // getJsonData,
  // getPatientByRis,
  pushDcmsToServer,
} from "../api/index";

import {
  getPrintImgs,
  getLayoutTable,
  changeLayoutTable,
  getSmartLayoutImgs,
  getArteryList,
} from "@/utils/artery";

import {
  loadImage,
  clearCache,
  dcmtags,
  isEnabledElement,
  // wwwcSynchronizer
} from "@/utils/cornerstone";

import { dcmload, printFilm, printUpload } from "@/api/index";

import { headVerifyKey } from "@/utils/index";
import storage from "@/utils/storage";
import { isEmpty } from "@/utils/validate";

// import { dataURItoBlob } from '@/utils'

import PrintHead from "./components/print-head.vue";
// import PrintMsg from '@/components/print-msg.vue'
import SelectImages from "@/components/select-images.vue";
import ScaleDcm from "@/components/scale-dcm.vue";

import PrintSet from "./components/print-set.vue";
import PrintTable from "./components/print-table.vue";
import { getParamsObject } from "@/store/params";
import { v4 as uuidv4 } from "uuid";

import dayjs from "dayjs";

let layoutSwiper = null;

let partDcms = {};

let oriImage = null; // 原始图像

let renderScaleEl = null;

let renderTimeId = null;

// 胶片打印
export default {
  components: {
    PrintTable,
    PrintHead,
    SelectImages,
    ScaleDcm,
    Swiper,
    SwiperSlide,
    PrintSet,
  },
  data() {
    return {
      patientId: "",
      seriesId: "",
      imageCount: "", // 序列图像数
      hospitalId: "", // 医院ID
      hospitalName: "", // 医院名
      toolsName: "dargImg",
      workingPath: "", // 工作路径
      arteryList: [], // 血管列表
      allImages: [], // 过滤的图像
      autoFill: true, // 自动向前填充
      patientMsg: {}, // 患者信息
      printFilmMsg: {}, // 打印胶片信息
      printTables: [],
      printImages: [], // 打印的图像
      printCellTotal: 0, // 打印方格的总数
      currentPrint: 1, // 打印的页
      printTableConfig: {
        // 打印的表格
        width: 0,
        height: 0,
      },
      dragItem: null, // 拖拽的信息
      tableView: {
        // table的宽高
        width: 422,
        height: 512,
      },
      showMsg: true, // 是否显示信息
      renderTable: {}, // 当前渲染的table
      renderImages: null, // 通过renderCanvas渲染出的图像
      renderCanvasStyle: {
        width: 1000,
        height: 1000,
      },
      printLoading: false,
      pushLoading: false,
      printMsgHeadH: 40, // 打印的信息头的高度
      isShowMenu: false,
      menus: [],
      menuEvent: null,
      regId: "", // pacs 登记号
      storageKey: "", // 存储的key
      isPushOver: false, // 是否已经推送完成
      vesselChecked: {},
      isCtrlKeydown: false,
      isShiftKeydown: false,
    };
  },
  computed: {
    pushImages() {
      return this.printImages.filter((item) => item);
    },
  },
  setup() {
    return {
      modules: [Navigation],
    };
  },
  watch: {
    printRange(newVal, oldVal) {
      this.printStart = newVal === 3 ? 1 : "";
      this.printEnd = newVal === 3 ? 1 : "";
    },
    printImages: {
      handler(newVal, oldVal) {
        if (this.storageKey) {
          storage.saveString(this.storageKey, this.printImages);
        }
      },
      deep: true,
    },
    pushImages: {
      handler(newVal, oldVal) {
        this.isPushOver = false;
      },
      deep: true,
    },
    $route: {
      handler() {
        window.location.reload();
      },
      deep: true,
    },
  },
  created() {
    window.name = "CoronaryArtery-print";
    const vesselChecked = sessionStorage.vesselChecked;
    if (vesselChecked) {
      this.vesselChecked = JSON.parse(vesselChecked);
    }
    layoutSwiper = null;
  },
  async mounted() {
    renderScaleEl = document.getElementById("render-canvas");

    cornerstone.enable(renderScaleEl);

    const ParamsObject = getParamsObject();
    this.patientId = ParamsObject.patientId
      ? ParamsObject.patientId
      : process.env.NODE_ENV === "development"
      ? "357707"
      : "";
    this.seriesId = ParamsObject.seriesId
      ? ParamsObject.seriesId
      : process.env.NODE_ENV === "development"
      ? "1.2.840.113619.6.80.114374081799669.165531.1618642982661.1"
      : "";

    this.imageCount = ParamsObject.imageCount || 1;
    this.hospitalId = ParamsObject.hospitalId || "";
    this.hospitalName = ParamsObject.hospitalName || "";
    if (this.patientId && this.seriesId) {
      this.storageKey = headVerifyKey(
        `${this.patientId}_${this.seriesId}_print`
      );
      // 加载数据
      this.loadData();

      // try {
      //   const patientRes = await getPatientByRis(
      //     process.env.NODE_ENV === 'development' ? 'US00011987' : this.patientId
      //   )
      //   // 获取regid
      //   if (patientRes && patientRes.length) {
      //     const patient = patientRes[0]
      //     this.regId = patient.reg_id
      //   }
      // } catch (error) {
      //   console.log(error)
      //   console.log('error')
      // }
    }
    document.oncontextmenu = function () {
      return false;
    };

    // 监听
    window.addEventListener(
      "storage",
      this.pushListener,
      window.location.origin
    );
    window.addEventListener("beforeunload", () => {
      layoutSwiper = null;
      partDcms = null;
      oriImage = null;
      renderScaleEl = null;
      renderTimeId = null;
      // 清除缓存
      clearCache();
      window.removeEventListener(
        "storage",
        this.pushListener,
        window.location.origin
      );
    });
  },
  unmounted() {
    layoutSwiper = null;
    partDcms = null;
    oriImage = null;
    renderScaleEl = null;
    renderTimeId = null;
    // 清除缓存
    clearCache();
    window.removeEventListener(
      "storage",
      this.pushListener,
      window.location.origin
    );
  },
  methods: {
    keyDownEvent(BooleanValue, keyboard) {
      if (keyboard) {
        this[keyboard] = BooleanValue;
        return;
      }
      this.isCtrlKeydown = BooleanValue;
      this.isShiftKeydown = BooleanValue;
    },
    pushListener(evt) {
      if (!this.storageKey) {
        return;
      }
      if (evt.key === this.storageKey && evt.newValue) {
        this.eachPush(JSON.parse(evt.newValue) || []);
      }
    },
    async eachPush(val = []) {
      for (const pushItem of val) {
        const pushIndex = this.printImages.findIndex(
          (item) => pushItem.key === item.key
        );
        if (pushIndex > -1) {
          if (
            pushItem.windowWidth &&
            pushItem.windowCenter &&
            (pushItem.windowWidth !== this.printImages[pushIndex].windowWidth ||
              pushItem.windowCenter !==
                this.printImages[pushIndex].windowCenter)
          ) {
            // 是否存在窗值调节的情况
            this.printImages[pushIndex] = {
              ...this.printImages[pushIndex],
              windowWidth: pushItem.windowWidth,
              windowCenter: pushItem.windowCenter,
            };
            await this.printLoadDcm(pushIndex);
          }
        } else {
          this.pushPrint(pushItem);
        }
      }
    },
    // 一键排版
    layoutOnePress() {
      if (!this.printImages.length) {
        return;
      }
      const sortImgs = this.printImages
        .filter((item) => item)
        .sort((a, b) => a.sort - b.sort);
      this.printImages = sortImgs;
      this.$nextTick(() => {
        this.loadDcms();
      });
    },
    // 删除打印的单元格
    removePrintCell(evt, cell, delElementsIndex) {
      this.isShowMenu = false;
      this.menuEvent = evt;
      this.menus = [
        {
          label: "删除胶片",
          click: () => {
            if (delElementsIndex) {
              delElementsIndex.map((item) => {
                this.deletePrintImage(item, true);
              });
            } else {
              this.deletePrintImage(cell);
            }
            this.isShowMenu = false;
          },
        },
        {
          label: "取消",
          click: () => {
            this.isShowMenu = false;
          },
        },
      ];

      // 显示右键菜单
      this.$nextTick(() => {
        this.isShowMenu = true;
      });
    },
    // 移除打印的胶片
    deletePrintImage(cell, isAutoIndex) {
      const index = isAutoIndex ? cell : cell.index;
      if (!this.printImages[index]) {
        return;
      }
      if (this.autoFill) {
        // 清除图像
        this.printImages.splice(index, 1);
        // 是否自动向前填充
        const arr = Array.from(
          { length: this.printCellTotal },
          (v, i) => i
        ).filter((i) => i > (index - 1 < 0 ? 0 : index - 1));
        // 先清除element状态 再清除图像
        this.$nextTick(async () => {
          for (const i of arr) {
            // 重新加载图像
            await this.printLoadDcm(i);
          }
        });
      } else {
        // 图像
        this.printImages[index] = "";
        this.$nextTick(async () => {
          await this.printLoadDcm(index);
        });
      }
    },
    // 单元格点击操作
    async printItemHandler(cell) {
      const toolsName = this.toolsName;
      if (toolsName === "delImg") {
        this.deletePrintImage(cell);
        return;
      }
    },

    // 修改填充类型
    changeFillType(val) {
      // false 就不用管
      if (!val) {
        return;
      }
      // 无空值不重新渲染
      const isHasEmpty = this.printImages.findIndex((item) => !item) > -1;
      if (!isHasEmpty) {
        return;
      }
      // 去除掉空值的图像
      this.printImages = this.printImages.filter((item) => item);
      this.loadDcms();
    },
    // 拖拽结束
    async printDropOver(cell) {
      if (this.printLoading || this.pushLoading) {
        ElMessage.warning(`${this.printLoading ? "打印中" : "推送中"},请稍候`);
        return;
      }
      if (!this.dragItem) {
        return;
      }
      const index = cell.index;
      // 图像加载
      let elIndex = index;
      if (this.autoFill && !this.printImages[index]) {
        this.printImages.push(this.dragItem);
        elIndex = this.printImages.length - 1;
      } else {
        this.printImages[index] = this.dragItem;
      }

      this.$nextTick(async () => {
        try {
          await this.printLoadDcm(elIndex);
        } catch (error) {
          ElMessage.warning("DCM图像加载失败");
        }
      });
      this.dragItem = null;
    },
    // 拖拽的图像
    dragPrintImg(item) {
      this.dragItem = item;
    },
    toolsHandler(name) {
      if (this.printLoading || this.pushLoading) {
        ElMessage.warning(`${this.printLoading ? "打印中" : "推送中"},请稍候`);
        return;
      }
      // 添加胶片
      if (name === "addFilm") {
        const len = this.printTables.length;
        const type = len ? this.printTables[len - 1].type : "4_4";
        this.addLayoutTables(type);
        this.$nextTick(() => {
          layoutSwiper.slideTo(len + 1);
        });
        return;
      }
      // 删除胶片
      if (name === "delFilm") {
        if (!this.printTables.length) {
          return;
        }
        const newTables = [];
        const nowIndex = this.currentPrint - 1;
        const cellLen = this.printTables[nowIndex].cellLen;

        const start = this.printTables[nowIndex].start;

        let tableStart = 0;
        // 循环重新生成表格
        this.printTables
          .filter((item, index) => index !== nowIndex)
          .forEach((item) => {
            const { table } = getLayoutTable(
              item.type,
              this.tableView.width,
              this.tableView.height - this.printMsgHeadH,
              tableStart
            );
            tableStart = table.end;
            newTables.push(table);
          });
        // 修改数据
        this.printImages.splice(start, cellLen);
        this.printTables = newTables;
        this.printCellTotal = this.printCellTotal - cellLen;
        // 重新加载数据
        this.$nextTick(() => {
          this.loadDcms();
        });

        return;
      }
    },
    changeTools(name) {
      this.toolsName = name;
    },
    async printAndPush(data) {
      if (data.isPrint && data.printer) {
        console.log(data);
        this.print(data);
      }
      if (data.isPush && data.pusher) {
        try {
          this.pushLoading = true;
          await this.pushDcms(data.pusher);
          // await updateSeries(this.patientId, this.seriesId, { is_push: 1 })
          this.pushLoading = false;
        } catch (error) {
          this.pushLoading = false;
        }
      }
    },
    // 推送图像
    async pushDcms(server) {
      return new Promise(async (resolve, reject) => {
        if (!this.patientMsg.study_id) {
          this.$message.warning("等待图像加载");
          resolve();
          return;
        }
        if (this.isPushOver) {
          ElMessage.success("已推送完成");
          resolve();
          return;
        }
        try {
          console.log(this.pushImages);
          const pushRes = await pushDcmsToServer({
            dcms: this.pushImages,
            serverIds: [server.id],
            patient_id: this.patientId,
            series_id: this.seriesId,
            studyInstanceId: this.patientMsg.study_id,
          });
          this.isPushOver = true;
          if (pushRes.success) {
            ElMessage.success(`推送${pushRes.message}`);
          } else {
            ElMessage.error("推送任务创建失败");
          }
          resolve();
        } catch (error) {
          ElMessage.error("推送任务创建失败");
          reject();
        }
      });
    },
    async print({ printer, printRange, printSize, printIndexs }) {
      if (!oriImage) {
        return;
      }
      const tablesLen = this.printTables.length;
      if (!tablesLen) {
        ElMessage.warning("请添加打印胶片");
        return;
      }
      this.printLoading = true;
      const params = {
        name: "print",
        type: "bmp",
        size: printSize,
        DCM_Modality: oriImage.data.string("x00080060"),
        DCM_PatientID: oriImage.data.string("x00100020"),
        DCM_PatientName: oriImage.data.string("x00100010"),
        DCM_PatientAge: oriImage.data.string("x00101010"),
        DCM_PatientSex: oriImage.data.string("x00100040"),
        DCM_StudyDate: oriImage.data.string("x00080020"),
        DCM_StudyTime: oriImage.data.string("x00080030"),
        DCM_StudyInstanceUID:
          oriImage.data.string("x0020000D") ||
          `1.2.840.113619.2.452.3.604683826.133.1542022535.${random(100, 999)}`,
        DCM_SeriesNumber: oriImage.data.string("x00200011"),
        DCM_AccessionNumber:
          oriImage.data.string("x00080050") || String(random(800, 5000)),
      };
      // 打印之前先清除一次缓存
      for (const i of printIndexs) {
        try {
          const table = this.printTables[i - 1];
          // 当前没有结果
          if (!table) {
            continue;
          }
          // 先渲染表格
          this.renderTable = table;
          const { start, end } = table;
          // 从开始打到结束
          const arr = Array.from({ length: end - start }, (v, i) => i + start);
          const renderImages = {};
          for (const index of arr) {
            try {
              let base64 = await this.createRenderImg(index);
              renderImages[`${index}`] = base64;
              base64 = null;
            } catch (error) {
              console.log(error, "error");
              continue;
            }
          }
          this.renderImages = renderImages;
          // 去打印图像
          await this.printFilmTable(params, printer, printSize);
          // 如果没有下一页
          if (
            printRange === 2 &&
            this.printTables.length &&
            i !== this.printTables.length
          ) {
            layoutSwiper.slideTo(i);
          }
        } catch (error) {
          console.log(error, "error");
          ElMessage.error(error);
          continue;
        }
      }
      this.printLoading = false;
      storage.remove(this.storageKey);
      // await updateSeries(this.patientId, this.seriesId, {
      //   is_print: 1
      // })
      // 存历史排版
      // await saveLayout(
      //   `${this.workingPath}`,
      //   JSON.stringify({
      //     printImages: this.printImages,
      //     tableTypes: this.printTables.map((item) => item.type)
      //   })
      // )
    },
    async createRenderImg(index, width, height) {
      return new Promise((resolve, reject) => {
        // calculateTransform
        try {
          const printItem = this.printImages[index];
          if (!printItem) {
            reject();
            return;
          }
          let element = document.getElementById(`print-dcm-${index}`);
          if (!element) {
            reject();
            return;
          }
          let enableEl = cornerstone.getEnabledElement(element);
          if (!enableEl) {
            reject();
            return;
          }
          // 放大倍数
          const scale = 10;
          this.renderCanvasStyle.width = element.clientWidth * scale;
          this.renderCanvasStyle.height = element.clientHeight * scale;
          this.$nextTick(async () => {
            await this.toShowImage(index, renderScaleEl, enableEl.image);
            if (renderTimeId !== null) {
              clearTimeout(renderTimeId);
            }
            renderTimeId = setTimeout(() => {
              let renderEnbleEl = cornerstone.getEnabledElement(renderScaleEl);
              const base64 = renderEnbleEl.canvas.toDataURL("image/jpeg", 1.0);
              renderEnbleEl = null;
              element = null;
              enableEl = null;
              resolve(base64);
            }, 0);
          });
        } catch (error) {
          reject(error);
        }
      });
    },
    printFilmTable(params, printer, printSize) {
      return new Promise((resolve, reject) => {
        this.$nextTick(() => {
          let element = document.getElementById("render-content");
          if (!element) {
            reject(new Error("element no find"));
            return;
          }
          console.log(element);
          html2canvas(element, {
            width: element.clientWidth,
            height: element.clientHeight,
            useCORS: true,
            allowTaint: true,
            scale: 4,
            backgroundColor: "#000000",
            dpi: 1000,
            crossOrigin: "anonymous",
          })
            .then(async (canvas) => {
              // 关闭抗锯齿
              const ctx = canvas.getContext("2d");
              ctx.mozImageSmoothingEnabled = false;
              ctx.webkitImageSmoothingEnabled = false;
              ctx.msImageSmoothingEnabled = false;
              ctx.imageSmoothingEnabled = false;
              // 测试打印
              // if (process.env.VUE_APP_PRINT_OPEN !== '1') {
              //   saveAsBMP(canvas)
              //   resolve()
              //   return
              // }
              const buffer = convertToBMP(canvas);
              const blob = new Blob([buffer], { type: "image/bmp" });
              const file = new File([blob], `${uuidv4()}`, {
                type: "image/bmp",
              });

              const formData = new FormData();
              formData.append("file", file);

              const res = await printUpload(formData);
              if (!res.success) {
                console.log(res);
                ElMessage.error("胶片上传失败，请稍后重试！");
                resolve();
                return;
              }
              // 参数
              params = {
                ...params,
                remoteHost: printer.serverIp,
                remotePort: printer.serverPort,
                remoteAe: printer.serverAet,
                filePath: res.data,
                colorPrint: false,
                printSize: printSize,
              };

              printFilm(params)
                .then(async (res) => {
                  element = null;
                  if (res.success) {
                    ElMessage.success("打印成功");
                    params = null;
                    resolve();
                  } else {
                    ElMessage.error(res.msg);
                    reject(res);
                  }
                })
                .catch((err) => {
                  element = null;
                  reject(err);
                });
            })
            .catch((err) => {
              element = null;
              console.log("err", err);
              reject(err);
            });
        });
      });
    },
    setSwiper(swiper) {
      layoutSwiper = swiper;
    },
    slideChange(swiper) {
      this.currentPrint = swiper.activeIndex + 1;
    },
    pageChange(index) {
      if (layoutSwiper) {
        layoutSwiper.slideTo(index - 1);
      }
    },
    async loadData() {
      try {
        const res = await getAllData(
          this.patientId,
          this.seriesId,
          this.imageCount,
          this.hospitalId,
          this.hospitalName
        );
        if (JSON.stringify(res) !== "{}") {
          this.transResData(res);
        }
      } catch (error) {
        this.$message.error("加载数据失败");
      }
    },
    async transResData(data) {
      // 图像信息
      let series_date = "";
      if (data.series_date) {
        series_date = dayjs(data.series_date).format("YYYY-MM-DD");
      }
      const patientMsg = {
        series_date,
        patient_name: data.patient_name || "",
        patient_sex: data.patient_sex
          ? data.patient_sex.toUpperCase().indexOf("M") > -1
            ? "男"
            : "女"
          : "",
        patient_age: data.patient_age
          ? Number(data.patient_age.substring(0, data.patient_age.length - 1))
          : "",
        hospital_name: data.hospital_name || "",
        modality: data.modality || "",
        study_id: data.study_id || "",
        seriesDesc: data.SeriesDescription || "",
      };
      this.patientMsg = patientMsg;

      // 工作路径
      const workingPath = data["working_path"] || "";
      if (!workingPath) {
        return;
      }
      // 设置血管
      const arteryList = await getArteryList(
        workingPath,
        data.vessel_names || []
      );
      this.arteryList = arteryList.filter(
        (item) => item.name.toUpperCase().indexOf("UNKNOW") < 0
      );
      if (!this.arteryList.length) {
        return;
      }

      const partList = [
        "CPR",
        "SPR",
        "Synthesis",
        "VR",
        "VR_with_heart",
        "MIP",
        "MIP_Inv",
        "MIP_with_heart",
      ];

      for (const part of partList) {
        if (part in data) {
          partDcms[part] = data[part];
        }
      }

      this.allImages = getPrintImgs(this.arteryList, data, workingPath, "D");
      this.workingPath = workingPath;
      // 查看存储的图像然后显示
      this.printImages = storage.getString(this.storageKey, []);
      const tabelTypes = Array.from(
        { length: Math.ceil(this.printImages.length / 40) },
        (v, i) => "10_4"
      );
      for (const type of tabelTypes) {
        await this.addLayoutTables(type);
      }
      this.loadDcms();
      // 加载原始图像来获取信息
      this.loadOriDcm(
        data["Ori"] && data["Ori"].DCMS ? data["Ori"].DCMS[0] : ""
      );
      // 默认智能排版
      this.smartLayout();
    },
    async loadOriDcm(path) {
      if (!path) {
        return;
      }
      oriImage = await loadImage(dcmload(`${this.workingPath}/${path}`));
      // 四角信息
      const printFilmMsg = {};
      for (const key in dcmtags) {
        if (Object.hasOwnProperty.call(dcmtags, key)) {
          const tags = dcmtags[key];
          const msgs = [];
          for (const item of tags) {
            const tag = "x" + item.tag.replace(",", "");
            const data = oriImage.data.string(tag);
            msgs.push(data);
          }
          printFilmMsg[key] = msgs;
        }
      }
      this.printFilmMsg = printFilmMsg;
    },
    // 智能排版
    async smartLayout() {
      const arteryList = [...this.arteryList].filter((item) => {
        return this.vesselChecked[item.name] === undefined;
      });
      let images = getSmartLayoutImgs(
        // this.arteryList,
        arteryList,
        partDcms,
        this.workingPath
      );
      this.printImages = images;
      // 置空当前打印的table列表
      this.printTables = [];
      this.printCellTotal = 0;

      // 智能type
      const smartTableTypes = ["4_4"];
      // const arterysLen = this.arteryList.length
      const arterysLen = arteryList.length;
      if (arterysLen > 10) {
        const addNums = Math.ceil(arterysLen / 10);
        for (let index = 0; index < addNums; index++) {
          smartTableTypes.push(`10_4`);
        }
      } else {
        smartTableTypes.push(`${arterysLen}_4`);
      }

      for (const type of smartTableTypes) {
        await this.addLayoutTables(type);
      }
      images = null;
      // 加载dcms
      this.loadDcms();
    },
    // 历史排版
    async historyLayout(images, types) {
      this.printImages = images;
      // 置空当前打印的table列表
      this.printTables = [];
      this.printCellTotal = 0;
      for (const type of types) {
        await this.addLayoutTables(type);
      }
      images = null;
      // 加载dcms
      this.loadDcms();
    },
    // 加载
    loadDcms() {
      const arr = Array.from({ length: this.printCellTotal }, (v, i) => i);
      console.log(arr, "arr");
      console.log(this.printImages, "arr");
      // 添加dcm图像
      this.$nextTick(async () => {
        for (const i of arr) {
          try {
            await this.printLoadDcm(i);
          } catch (error) {
            continue;
          }
        }
      });
    },
    // 打印加载图像
    printLoadDcm(index) {
      return new Promise(async (resolve, reject) => {
        try {
          await this.$nextTick();
          let element = document.getElementById(`print-dcm-${index}`);
          if (!element) {
            resolve();
            return;
          }
          const printItem = this.printImages[index];
          if (!printItem) {
            resolve();
            return;
          }
          const imageId = dcmload(printItem.dcm);
          const image = await loadImage(imageId);
          await this.toShowImage(index, element, image);
          element = null;
          resolve();
          return;
        } catch (error) {
          console.log(error);
          reject(error);
          return;
        }
      });
    },
    // 重新设置table的宽高
    resizeTables({ width, height }) {
      this.tableView.width = width;
      this.tableView.height = height;
      if (!this.printTables.length) {
        return;
      }
      let newTables = [];
      let start = 0;
      for (const item of this.printTables) {
        const { table } = getLayoutTable(
          item.type,
          width,
          height - this.printMsgHeadH,
          start
        );
        start = table.end;
        newTables.push(table);
      }
      this.printTables = newTables;
      newTables = null;
      const arr = Array.from({ length: this.printCellTotal }, (v, i) => i);
      // 重新适配图像
      this.$nextTick(async () => {
        for (const i of arr) {
          try {
            let element = document.getElementById(`print-dcm-${i}`);
            if (!element) {
              continue;
            }
            // 查看
            const printItem = this.printImages[i];
            if (!printItem) {
              continue;
            }
            cornerstone.resize(element, true);
            element = null;
          } catch (error) {
            continue;
          }
        }
      });
    },
    // 设置布局的表格
    addLayoutTables(type) {
      return new Promise((resolve, reject) => {
        try {
          let start = 0;
          const len = this.printTables.length;
          if (len) {
            start = this.printTables[len - 1].end;
          }

          const { table, cellLen } = getLayoutTable(
            type,
            this.tableView.width,
            this.tableView.height - this.printMsgHeadH,
            start
          );
          // 添加一个tables
          this.printTables.push(table);
          this.printCellTotal = this.printCellTotal + cellLen;
          resolve();
        } catch (error) {
          reject();
        }
      });
    },
    // 修改布局
    changeLayout(type, useActive) {
      if (this.printLoading || this.pushLoading) {
        ElMessage.warning(`${this.printLoading ? "打印中" : "推送中"},请稍候`);
        return;
      }
      const { tables, total } = changeLayoutTable(
        type,
        this.printTables,
        this.printImages,
        {
          index: this.currentPrint - 1,
          cellTotal: this.printCellTotal,
          isChangeAll: !useActive,
          width: this.tableView.width,
          height: this.tableView.height - this.printMsgHeadH,
        }
      );
      console.log(tables);
      this.printTables = tables;
      this.printCellTotal = total;

      this.loadDcms();
    },
    // 推送打印
    pushPrint(item, tableType = "10_4") {
      if (!item) {
        return;
      }
      if (
        this.printImages.findIndex((printItem) => item.key === printItem.key) >
        -1
      ) {
        return;
      }
      const nowLen = this.printImages.length;
      const tablesLen = this.printTables.length;
      let isAddTable = false;
      if (tablesLen) {
        const lastTable = this.printTables[tablesLen - 1];
        if (nowLen >= lastTable.end) {
          isAddTable = true;
        }
      } else {
        isAddTable = true;
      }
      // 添加打印图像
      // this.printImages.push(item)

      if (!item.isOnlySend) {
        this.printImages.push(item);
      } else {
        item.isOnlySend = false;
      }
      if (item.part === "Synthesis") {
        const dcms = this.allImages.map((imgItem) => imgItem.dcm);
        if (dcms.indexOf(item.dcm) === -1) {
          this.allImages.push(item);
        }
      }
      // 添加胶片
      if (isAddTable) {
        this.addLayoutTables(tableType);
      }
      this.$nextTick(async () => {
        if (isAddTable) {
          layoutSwiper.slideTo(tablesLen);
        }
        await this.printLoadDcm(nowLen);
      });
    },
    hasPush(item) {
      if (!this.printImages.length) {
        return false;
      }
      if (item) {
        return (
          this.printImages.findIndex(
            (print) => print && print.key === item.key
          ) > -1
        );
      } else {
        return false;
      }
    },
    // 放大查看图像
    scaleImgs(cell) {
      // 图像
      const index = cell.index;
      if (!this.printImages[index]) {
        return;
      }
      const nowDcm = this.printImages[index].dcm;
      const images = this.printImages.filter((item) => item);
      const dcmIndex = images.findIndex((item) => item.dcm === nowDcm);
      this.$refs["scale-dcm"].toShowScale(images, dcmIndex, false);
    },
    // 放大图像查看
    viewScaleImage(index, images) {
      this.$refs["scale-dcm"].toShowScale(images, index, true);
    },
    // 修改窗位窗宽
    changeWwWc({ key, windowWidth, windowCenter }) {
      const nowIndex = this.printImages.findIndex(
        (pushItem) => pushItem && pushItem.key && pushItem.key === key
      );

      if (nowIndex < 0) {
        return;
      }
      const nowItem = this.printImages[nowIndex];
      let element = document.getElementById(`print-dcm-${nowIndex}`);
      if (!element || !isEnabledElement(element)) {
        return;
      }
      nowItem.windowWidth = windowWidth;
      nowItem.windowCenter = windowCenter;
      const viewport = cornerstone.getViewport(element);
      viewport.voi.windowWidth = windowWidth;
      viewport.voi.windowCenter = windowCenter;
      cornerstone.setViewport(element, viewport);
      // 存
      storage.saveString(this.storageKey, this.printImages);
      // 置空
      element = null;
    },
    // 显示图像
    toShowImage(index, element, image) {
      return new Promise(async (resolve, reject) => {
        try {
          const printItem = this.printImages[index];
          if (!printItem || !element || !image) {
            resolve();
            return;
          }
          if (!isEnabledElement(element)) {
            cornerstone.enable(element);
          }
          const viewport = cornerstone.getDefaultViewportForImage(
            element,
            image
          );
          // 如果是SPR 旋转
          if (printItem.isSpr) {
            viewport.rotation = 90;
          }
          const windowWidth = !isEmpty(printItem.windowWidth)
            ? printItem.windowWidth
            : printItem.artery
            ? 800
            : viewport.voi.windowWidth;
          const windowCenter = !isEmpty(printItem.windowCenter)
            ? printItem.windowCenter
            : printItem.artery
            ? 300
            : viewport.voi.windowCenter;
          // 设置windowWidth windowCenter
          viewport.voi.windowWidth = windowWidth;
          viewport.voi.windowCenter = windowCenter;
          // 给当期的item增加上
          printItem.windowWidth = windowWidth;
          printItem.windowCenter = windowCenter;
          // cornerstoneTools.addToolForElement(element, StackScrollMouseWheelTool)
          // cornerstoneTools.setToolActive('StackScrollMouseWheel', {
          //   synchronizerContext: seriesSync
          // })
          cornerstone.displayImage(element, image, viewport);
          // 重新设置高度
          cornerstone.resize(element, true);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    },
  },
};
</script>
