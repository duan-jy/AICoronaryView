<style lang="less" src="@/styles/home.less"></style>

<template>
  <HomeHead :patientId="patientId" :seriesDesc="patientMsg.seriesDesc || ''" @saveResult="saveResult"
    @viewReport="viewReport" @jumpNext="jumpNext" />
  <div :class="['home-container', isVertical ? 'vertical' : 'horizontal']">
    <!-- <SideBar ref="artery-list" :workingPath="workingPath" @editArtery="editArtery" /> -->
    <ArteryList ref="artery-list" :workingPath="workingPath" @editArtery="editArtery" />
    <div class="home-content">
      <div :class="['home-dcms', scaleView ? `scale-${scaleView}` : '']">
        <div class="dcms-top">
          <div class="view-content view-left">
            <DcmOri ref="dcm-ori" v-model:asyncWwWc="asyncWwWc" :workingPath="workingPath"
              :partDcms="partDcms['Ori'] || {}" :linePath="centerline['Ori'] || {}" :patientMsg="patientMsg"
              :maskPath="oriMaskPath" @setRenderedList="setRenderedList" @markCombine="markCombine"></DcmOri>
            <div class="view-leftcontent swiper-three">
              <swiper class="view-three swiper-no-swiping" :updateOnWindowResize="true" :autoUpdate="true"
                @swiper="setSwiper" @resize="swiperResize">
                <swiper-slide class="swiper-no-swiping">
                  <Dcm3d ref="dcm-3d" :workingPath="workingPath" :threeData="threeData" :patientMsg="patientMsg"
                    @setRenderedList="setRenderedList"></Dcm3d>
                </swiper-slide>
                <swiper-slide class="swiper-no-swiping">
                  <DcmVr ref="dcm-vr" :workingPath="workingPath" :partDcms="partDcms['VR'] || {}"
                    :partHeartDcms="partDcms['VR_with_heart'] || {}" :patientMsg="patientMsg"
                    @markCombine="markCombine" />
                </swiper-slide>
                <swiper-slide class="swiper-no-swiping">
                  <DcmMip ref="dcm-mip" :workingPath="workingPath" :partDcms="partDcms['MIP'] || {}"
                    :partHeartDcms="partDcms['MIP_with_heart'] || {}" :patientMsg="patientMsg"
                    @markCombine="markCombine">
                  </DcmMip>
                </swiper-slide>
                <swiper-slide class="swiper-no-swiping">
                  <DcmMipInv ref="dcm-mip-inv" :workingPath="workingPath" :partDcms="partDcms['MIP_Inv'] || {}"
                    :partHeartDcms="partDcms['MIP_with_heart'] || {}" :patientMsg="patientMsg"
                    @markCombine="markCombine">
                  </DcmMipInv>
                </swiper-slide>
              </swiper>
              <DcmTabs :tab-list="mvTabList" @activeTab="tabChange" :disable="isArteryEdit" />
            </div>
          </div>
          <div class="view-content view-right">
            <DcmCpr ref="dcm-cpr" v-model:asyncWwWc="asyncWwWc" :workingPath="workingPath"
              :partDcms="partDcms['CPR'] || {}" :linePath="centerline['CPR'] || {}" :patientMsg="patientMsg"
              @setRenderedList="setRenderedList" @markCombine="markCombine"></DcmCpr>
          </div>
        </div>
        <DcmProbe ref="dcm-probe" v-model:asyncWwWc="asyncWwWc" :workingPath="workingPath"
          :partDcms="partDcms['probe'] || {}" :patientMsg="patientMsg" @setRenderedList="setRenderedList"
          @markCombine="markCombine"></DcmProbe>
        <DcmSpr ref="dcm-spr" v-model:asyncWwWc="asyncWwWc" :workingPath="workingPath" :partDcms="partDcms['SPR'] || {}"
          :linePath="centerline['SPR'] || {}" :patientMsg="patientMsg" @setRenderedList="setRenderedList"
          @markCombine="markCombine"></DcmSpr>

        <!-- <ArteryPush
          ref="artery-push"
          :patientId="patientId"
          :seriesId="seriesId"
          :studyInstanceId="patientMsg['study_id'] || ''"
          :workingPath="workingPath"
          :partDcms="partDcms"
        /> -->
      </div>
      <ArteryResult ref="artery-result" :workingPath="workingPath" :resultPath="resultPath" :arteryList="arteryList" />
    </div>
  </div>
  <ArteryReport ref="artery-report" :patientMsg="patientMsg" :patient-id="patientId" />

  <PrintMakeUp :composeList="composeList" :workingPath="workingPath" @deleteMakeData="deleteMakeData" />
</template>

<script>
import { Swiper, SwiperSlide } from "swiper/vue/swiper-vue";
import { mapGetters } from "vuex";
import { ElMessage } from "element-plus";

import HomeHead from "./components/home-head.vue";
import SideBar from "./components/side-bar.vue";
import ArteryList from "./components/artery-list.vue";

import DcmOri from "./components/dcm-ori.vue";
import DcmCpr from "./components/dcm-cpr.vue";
import DcmSpr from "./components/dcm-spr.vue";
import DcmProbe from "./components/dcm-probe.vue";
import Dcm3d from "./components/dcm-3d.vue";
import DcmVr from "./components/dcm-vr.vue";
import DcmMipInv from "./components/dcm-mip-inv.vue";
import DcmMip from "./components/dcm-mip.vue";

import ArteryResult from "./components/artery-result.vue";
// import ArteryPush from './components/artery-push.vue'
import ArteryReport from "./components/artery-report.vue";

import DcmTabs from "@/components/dcm-tabs.vue";
import PrintMakeUp from "@/components/print-makeup.vue";

import {
  // funClickLog,
  getAllData,
  makeupPrinting,
  makeupLabel,
  // deleteMakeUp,
  makeupSynthesis,
} from "../api/index";

import storage from "@/utils/storage";
import { headVerifyKey, getCanvasBase64 } from "@/utils/index";
import { isEmpty } from "@/utils/validate";
import { clearCache } from "@/utils/cornerstone";
import arteryBus from "@/utils/arteryBus";
import { createDcmSort } from "@/utils/artery";
import { v4 as uuidv4 } from "uuid";
import {
  getParamsObject,
  encryptMessage,
  qrCodeParamsReplace,
} from "@/store/params";

let threeSwiper = null;

// const labelTools = [
//   {
//     name: 'Length',
//     toolName: 'LengthTool'
//   },
//   {
//     name: 'Angle',
//     toolName: 'AngleTool'
//   },
//   {
//     name: 'RectangleRoi',
//     toolName: 'RectangleRoiTool'
//   },
//   {
//     name: 'FreehandRoi',
//     toolName: 'FreehandRoiTool'
//   }
// ]

export default {
  components: {
    ArteryResult,
    ArteryReport,
    // ArteryPush,
    ArteryList,
    SideBar,
    HomeHead,
    DcmProbe,
    DcmSpr,
    DcmCpr,
    DcmOri,
    Dcm3d,
    DcmVr,
    DcmMip,
    DcmMipInv,
    Swiper,
    SwiperSlide,
    DcmTabs,
    PrintMakeUp,
  },
  data() {
    return {
      patientId: "", // 患者检查号
      seriesId: "", // 序列号
      imageCount: "", // 序列图像数
      hospitalId: "", // 医院ID
      hospitalName: "", // 医院名
      patientMsg: {}, // 患者信息
      partDcms: {}, // 图像信息
      centerline: {}, // 中心线
      threeData: {}, // three3D的数据
      workingPath: "", // 路径
      resultPath: "", // 结果路径
      asyncWwWc: "800_300",
      renderedList: "", // 渲染列表
      isArteryEdit: false, //
      storagePrintKey: "",
      storagePushKey: "",
      oriMaskPath: "", // 掩膜路径
      markStyle: {
        width: 0,
        height: 0,
      },
      composeList: [], // 组合标记的数组
    };
  },
  computed: {
    ...mapGetters([
      "scaleView",
      "isVertical",
      "activeArtery",
      "rawArteryList",
      "activeSprDcmName",
      "activeSprAnglesDeg",
      "activeProbeIndex",
    ]),
    arteryName() {
      const artery = this.rawArteryList.find(
        (item) => item.id === this.activeArtery
      );
      return artery && artery.name ? artery.name : "";
    },
  },
  setup(props, content) {
    return {
      mvTabList: [
        {
          src: require("@/assets/tab-3d.png"),
          key: "dcm-3d",
        },
        {
          src: require("@/assets/tab-vr.png"),
          key: "dcm-vr",
        },
        {
          src: require("@/assets/tab-mip.png"),
          key: "dcm-mip",
        },
        {
          src: require("@/assets/tab-mip-inv.png"),
          key: "dcm-mip-inv",
        },
      ],
    };
  },
  watch: {
    $route: {
      handler() {
        window.location.reload();
      },
      deep: true,
    },
  },
  async mounted() {
    const ParamsObject = getParamsObject();
    window.name = "CoronaryArtery";
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
      // funClickLog(this.patientId)
      this.storagePrintKey = headVerifyKey(
        `${this.patientId}_${this.seriesId}_print`
      );
      this.storagePushKey = headVerifyKey(
        `${this.patientId}_${this.seriesId}_push`
      );
      // 加载数据
      this.loadData();
    }
    document.oncontextmenu = function () {
      return false;
    };
    window.addEventListener(
      "storage",
      this.storageListener,
      window.location.origin
    );

    arteryBus.on("pushDcmToPD", async (pushItem) => {
      this.pushDcmToPd(pushItem);
    });
    arteryBus.on("storageMakeUp", async (pushItem) => {
      this.storageMakeUp(pushItem);
    });

    arteryBus.on("makeupPrint", async () => {
      this.makeupPrint({
        series_id: this.seriesId,
        patient_id: this.patientId,
        working_path: this.workingPath,
        vessel_id: this.activeArtery,
        spr_dcm_name: this.activeSprDcmName,
        spr_deg: this.activeSprAnglesDeg,
        index: this.activeProbeIndex,
        image_name: `${uuidv4()}.dcm`,
      });
    });

    // window.addEventListener('beforeunload', () => {
    //   storage.remove(this.storagePrintKey)
    //   storage.remove(this.storagePushKey)
    // })
    window.addEventListener("beforeunload", () => {
      storage.remove(this.storagePrintKey);
      storage.remove(this.storagePushKey);
      threeSwiper = null;
      arteryBus.off("*");
      // 清除所有的事件
      arteryBus.all.clear();
      window.removeEventListener(
        "storage",
        this.storageListener,
        window.location.origin
      );
      clearCache();
      window.removeEventListener("beforeunload", () => { }); // 移除这个监听
    });
  },
  unmounted() {
    // 解绑所有
    arteryBus.off("*");
    // 清除所有的事件
    arteryBus.all.clear();

    // this.$store.dispatch('artery/resetState')
    clearCache();

    window.removeEventListener(
      "storage",
      this.storageListener,
      window.location.origin
    );
  },
  methods: {
    tabChange(index) {
      // 如果编辑状态，不切换
      if (this.isArteryEdit) {
        return;
      }
      if (threeSwiper) {
        threeSwiper.slideTo(index);
      }
    },
    editArtery(isEdit) {
      this.isArteryEdit = isEdit;
      if (isEdit) {
        threeSwiper.slideTo(0);
      }
      this.$store.dispatch("dcm/setScaleView", isEdit ? "artery-3d" : "");
    },
    swiperResize() {
      this.$nextTick(() => {
        this.$refs["dcm-mip"].cornerstoneResize();
        this.$refs["dcm-vr"].cornerstoneResize();
        this.$refs["dcm-mip-inv"].cornerstoneResize();
      });
    },
    changeArtery(name) {
      // 先清除缓存
      // clearCache()
      // clearTimeId()
      // arteryBus.off('*')
      // cornerstone.drawInvalidated()
      // timeId = setTimeout(() => {
      //   this.activeArtery = name
      // }, 0)
    },
    setSwiper(swiper) {
      threeSwiper = swiper;
    },
    async loadData() {
      try {
        const resData = await getAllData(
          this.patientId,
          this.seriesId,
          this.imageCount,
          this.hospitalId,
          this.hospitalName
        );
        console.log("resData", resData);
        if (JSON.stringify(resData) !== "{}") {
          this.transResData(resData);
        }
      } catch (error) {
        this.$message.error("加载数据失败");
      }
    },
    // 转换数据
    async transResData(data) {
      try {
        // 图像信息
        const patientMsg = {
          series_date: data.series_date || "",
          patient_name: data.patient_name || "",
          patient_sex: data.patient_sex
            ? data.patient_sex.toUpperCase() === "M"
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
        this.composeList = data["MAKEUP"] || [];
        // 添加图像文件
        const partList = [
          "Ori",
          "CPR",
          "SPR",
          "VR",
          "VR_with_heart",
          "MIP",
          "MIP_Inv",
          "MIP_with_heart",
          "probe",
          "Synthesis",
        ];
        const partDcms = {
          Synthesis: {},
        };
        for (const part of partList) {
          if (part in data) {
            partDcms[part] = data[part] || {};
          }
        }
        // 图像
        this.partDcms = partDcms;
        // 中心线
        this.centerline = data["Centerline"] || {};
        // 3d数据
        this.threeData = data["3DVR"] || {};
        // 工作路径
        this.workingPath = data["working_path"] || "";
        // resultPath
        this.resultPath = data.diagnose_result_path || "";
        // ori mask path
        this.oriMaskPath =
          data.Mask && data.Mask.artery ? data.Mask && data.Mask.artery : "";

        if (!this.workingPath) {
          return;
        }
        await this.$store.dispatch("artery/initState", {
          workingPath: this.workingPath,
          vesselNames: data.vessel_names || [],
        });
        this.$store.dispatch(
          "dcm/setPushImages",
          storage.getString(this.storagePushKey, [])
        );
        this.$store.dispatch(
          "dcm/setPrintImages",
          storage.getString(this.storagePrintKey, [])
        );
        this.$nextTick(() => {
          // 获取结果
          this.$refs["artery-result"].getAiResult();
        });
      } catch (e) {
        console.log(e);
      }
    },
    // 设置渲染列表
    setRenderedList(part, type) {
      const list = this.renderedList ? this.renderedList.split(",") : [];
      const index = list.findIndex((item) => item === part);
      if (type === "add") {
        if (index < 0) {
          list.push(part);
        } else {
          return;
        }
      } else {
        if (index >= 0) {
          list.splice(index, 1);
        } else {
          return;
        }
      }
      this.renderedList = list.join(",");
      arteryBus.emit("renderedListChange", this.renderedList);
    },
    saveResult() {
      // 保存结果
      if (this.$refs["artery-result"]) {
        this.$refs["artery-result"].saveResult();
      }
    },
    viewReport() {
      if (this.$refs["artery-report"]) {
        this.$refs["artery-report"].toShowReport(true);
      }
    },
    jumpNext(location) {
      if (!location) {
        return;
      }
      if (!this.patientId || !this.seriesId) {
        return;
      }
      const allParams = {
        patientId: this.patientId,
        seriesId: this.seriesId,
        imageCount: this.imageCount,
        hospitalId: this.hospitalId,
        hospitalName: this.hospitalName,
      };
      // 通过新标签打开

      const paramsReplaceString = {};
      for (const key in allParams) {
        try {
          const encryptParam = encryptMessage(allParams[key] || "");
          paramsReplaceString[qrCodeParamsReplace[key] || key] =
            encodeURIComponent(encryptParam);
        } catch (e) {
          console.log(e);
        }
      }
      const newRoute = this.$router.resolve({
        path: `/${location}`,
        query: {
          ...paramsReplaceString,
        },
      });
      window.open(newRoute.href, `CoronaryArtery-${location}`);
    },
    storageListener(evt) {
      // const storeTypes = {
      //   D: 'dcm/setPrintImages',
      // }
      if (this.storagePushKey && evt.key === this.storagePushKey) {
        const images = evt.newValue ? JSON.parse(evt.newValue) : [];
        this.$store.dispatch("dcm/setPushImages", images);
      }
    },
    // 推送打印
    async pushDcmToPd(pushItem) {
      // console.log(
      //   'evt >>>',
      //   evt,
      //   'index >>>',
      //   index,
      //   'part >>>',
      //   part,
      //   'isArtery >>>',
      //   isArtery
      // )
      const { part, type, isShowMsg } = pushItem;
      if (
        !this.patientId ||
        !this.seriesId ||
        !(part in this.partDcms) ||
        !this.activeArtery
      ) {
        return;
      }
      let message = "";
      if (type === "D") {
        // D 键
        await this.storageDcmPD(pushItem);
        message = "添加打印成功";
      } else if (type === "T") {
        // T 键
        await this.storageDcmPD(pushItem);
        message = "添加推送成功";
      } else if (type === "P") {
        // P 键
        await this.storageDcmPD({
          ...pushItem,
          type: "D",
        });
        await this.storageDcmPD({
          ...pushItem,
          type: "T",
        });
        message = "添加推送及打印成功";
      }
      if (isShowMsg) {
        ElMessage.success(message);
      }
    },
    // 打印
    storageDcmPD(pushItem) {
      return new Promise((resolve, reject) => {
        try {
          // const { part, type } = pushItem
          const { type } = pushItem;
          const types = {
            D: "storagePrintKey",
            T: "storagePushKey",
          };
          const key = types[type];
          if (!key || !(key in this)) {
            resolve();
            return;
          }
          const storageKey = this[key];
          let storageImgs = storage.getString(storageKey, []);
          storageImgs = this.getPushItem(pushItem, storageImgs);
          const storeTypes = {
            D: "dcm/setPrintImages",
            T: "dcm/setPushImages",
          };
          this.$store.dispatch(storeTypes[type], storageImgs);
          storage.saveString(storageKey, storageImgs);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    },
    storageMakeUp(pushItem) {
      return new Promise((resolve, reject) => {
        try {
          const storagePrintKey = this.storagePrintKey;
          const storagePushKey = this.storagePushKey;
          const storagePrintImgs = storage.getString(storagePrintKey, []);
          const storagePushImgs = storage.getString(storagePushKey, []);
          const storagePrintImgsNew = this.getPushItem(pushItem, [
            ...storagePrintImgs,
          ]);
          const storagePushImgsNew = this.getPushItem(pushItem, [
            ...storagePushImgs,
          ]);
          storage.saveString(storagePrintKey, storagePrintImgsNew);
          storage.saveString(storagePushKey, storagePushImgsNew);
          const timer = setTimeout(() => {
            storage.saveString(storagePrintKey, storagePrintImgs);
            storage.saveString(storagePushKey, storagePushImgs);
            clearTimeout(timer);
          }, 1000);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    },
    // 获取打印的image
    getPushItem(pushItem, images) {
      const {
        part,
        index,
        isArtery,
        windowWidth,
        windowCenter,
        imagePath,
        angleDeg,
        isOnlySend,
      } = pushItem;
      const partnow = isArtery
        ? this.partDcms[part]
          ? this.partDcms[part][this.activeArtery]
          : []
        : this.partDcms[part];
      // 未找到图像
      const dcm = imagePath || partnow.DCMS[index];
      if (!dcm) {
        return images;
      }
      const angles = partnow ? partnow.angles : [];

      const partKey = part.toUpperCase();
      const key = isArtery
        ? `${this.arteryName}_${partKey}-${index}`
        : `${partKey}-${index}`;
      // 是否存储中含有 只添加不删除，删除操作去页面操作
      const findIndex = images.findIndex((item) => item.key === key);
      if (findIndex > -1) {
        // 修改了窗值得话
        images[findIndex] = {
          ...images[findIndex],
          windowWidth,
          windowCenter,
        };
        return images;
      }
      // 获取排序
      const sort = createDcmSort(part, this.arteryName, index);
      images.push({
        dcm: `${this.workingPath}/${dcm}`,
        img: `${this.workingPath}/${dcm.substring(
          0,
          dcm.lastIndexOf(".")
        )}.jpg`,
        angle:
          angleDeg ||
          (angles && angles.length && !isEmpty(angles[index])
            ? angles[index] + ""
            : ""),
        isSpr: part === "SPR" || part === "Synthesis",
        isCheck: true,
        part,
        artery: isArtery ? this.arteryName : "",
        arteryId: isArtery ? this.activeArtery : "",
        key,
        index,
        sort,
        windowWidth,
        windowCenter,
        isOnlySend,
      });
      return images;
    },
    async makeupPrint(data) {
      try {
        const pushItem = {
          index: this.composeList.length,
          type: "D",
          vessel_id: this.activeArtery,
          part: "Synthesis",
          isArtery: true,
          isShowMsg: true,
          windowWidth: 800,
          windowCenter: 300,
          imagePath: `Synthesis/${data.image_name}`,
          angleDeg: data.spr_deg,
          isPush: false,
          isPrint: false,
        };
        await makeupPrinting({
          ...data,
          step: 2.5,
          record: pushItem,
        });
        this.composeList.push(pushItem);
        const jsonPath = `/data/result/CoronaryArtery/${this.hospitalName ? this.hospitalName + "/" : ""
          }${this.patientId}_${this.seriesId}.json`;
        try {
          makeupSynthesis({
            key: "MAKEUP",
            jsonPath: jsonPath,
            data: this.composeList,
          });
        } catch (e) {
          console.log(e);
        }
        arteryBus.emit("makeup-Drawer", "combination");
        this.storageMakeUp({ ...pushItem, isOnlySend: true });
        // ElMessage.success('推送至打印成功')
      } catch (e) {
        ElMessage.error("组合图像出错");
      }
    },
    async markCombine(elementId, { part, isArtery, spr_deg }) {
      const element = document.getElementById(elementId);
      const viewport = cornerstone.getViewport(element);
      const base64Img = getCanvasBase64(element);
      const imageName = `${uuidv4()}.dcm`;
      const pushItem = {
        index: this.composeList.length,
        part,
        type: "D",
        isArtery,
        vessel_id: this.activeArtery,
        isShowMsg: true,
        windowWidth: viewport.voi.windowWidth,
        windowCenter: viewport.voi.windowCenter,
        imagePath: `Synthesis/${imageName}`,
        angleDeg: spr_deg || 0,
        isPush: false,
        isPrint: false,
      };
      await makeupLabel({
        series_id: this.seriesId,
        patient_id: this.patientId,
        working_path: this.workingPath,
        vessel_id: this.activeArtery,
        image: base64Img.substring(base64Img.indexOf(",") + 1),
        scale: 1.0,
        image_name: imageName,
        record: pushItem,
      });
      this.composeList.push(pushItem);
      const jsonPath = `/data/result/CoronaryArtery/${this.hospitalName ? this.hospitalName + "/" : ""
        }${this.patientId}_${this.seriesId}.json`;
      makeupSynthesis({
        key: "MAKEUP",
        jsonPath: jsonPath,
        data: this.composeList,
      });
      arteryBus.emit("makeup-Drawer", "note");
      this.storageMakeUp({ ...pushItem, part: "Synthesis", isOnlySend: true });
      // ElMessage.success('推送至打印成功')
    },
    async deleteMakeData(activeItem) {
      // const params = {
      //   patient_id: this.patientId,
      //   series_id: this.seriesId,
      //   imagePath: activeItem.imagePath,
      //   vessel_id: activeItem.vessel_id
      // }
      const index = this.composeList.findIndex(
        (item) => item.imagePath === activeItem.imagePath
      );
      if (index !== -1) {
        this.composeList.splice(index, 1);
      }
      const jsonPath = `/data/result/CoronaryArtery/${this.hospitalName ? this.hospitalName + "/" : ""
        }${this.patientId}_${this.seriesId}.json`;
      makeupSynthesis({
        key: "MAKEUP",
        jsonPath: jsonPath,
        data: this.composeList,
      });
      // await deleteMakeUp(params)
    },
  },
};
</script>
