<style lang="less" scoped>
.report {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  z-index: 1010;
  overflow: hidden;

  &-container {
    width: 850px;
    height: 100%;
    margin: 0 auto;
    background-color: #fff;
    padding: 0 15px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  &-head {
    position: relative;
    height: 50px;
    padding-top: 10px;

    .title {
      height: 40px;
      line-height: 40px;
      color: #000;
      font-size: 22px;
      font-weight: bold;
      text-align: center;
    }

    .icon {
      font-size: 18px;
      position: absolute;
      top: 10px;
      right: 0px;
      color: #999;
      cursor: pointer;
    }

    .warning {
      position: absolute;
      height: 20px;
      padding: 0 10px;
      color: #a3a3a3;
      bottom: -35px;
      right: 0;
      border: 1px solid #a3a3a3;
      font-size: 14px;
      line-height: 20px;
    }
  }

  .report-content {
    flex: 1;
    // overflow: hidden;
    overflow-x: hidden;
    overflow-y: auto;
    padding: 5px 0;

    .pane-report-content {
      overflow: hidden;
    }
  }

  .report-foot {
    height: 51px;
    padding: 5px 0;
    border-top: 1px solid #d1d1d1;
    text-align: right;
  }

  .desc {
    line-height: 30px;
    font-size: 14px;
    color: #666;
    overflow: hidden;

    b {
      font-weight: normal;
    }

    &:hover {
      .copy {
        visibility: visible;
      }
    }

    span {
      color: #3b7cff;
      font-weight: bold;

      &.no-checked {
        color: #999;
        font-weight: normal;
      }
    }

    .copy {
      visibility: hidden;
      margin-left: 10px;
      cursor: pointer;
    }
  }

  .report-title {
    height: 40px;
    display: flex;
    flex-direction: row;
    align-items: center;

    .title-line {
      width: 4px;
      height: 20px;
      background-color: #3b7cff;
    }

    .title {
      padding: 0 10px;
      height: 40px;
      line-height: 40px;
      font-weight: bold;
    }

    .copy-btn {
      padding: 0 10px;
      height: 20px;
      font-size: 12px;
      background-color: #3b7cff;
      color: #fff;
      border-radius: 4px;
      line-height: 20px;
      cursor: pointer;
    }
  }
}
</style>
<template>
  <div v-if="showReport" class="report">
    <div class="report-container">
      <div class="report-head">
        <div class="title">冠脉CTA智能结构化报告</div>
        <el-icon class="icon" title="关闭" @click="toShowReport(false)">
          <circle-close />
        </el-icon>
        <div class="warning">结果仅供参考</div>
      </div>
      <el-tabs v-model="activeName" class="report-tabs common-tabs">
        <el-tab-pane
          label="文本报告"
          name="text"
          class="pane-text"
        ></el-tab-pane>
        <el-tab-pane
          label="表格报告"
          name="table"
          class="pane-table"
        ></el-tab-pane>
      </el-tabs>
      <ReportMsg :report-msg="patientMsg" :patient-id="patientId" />
      <div class="report-content no-scrollbar">
        <div
          class="text-content pane-report-content"
          v-show="activeName === 'text'"
        >
          <div class="report-title">
            <div class="title-line"></div>
            <div class="title">影像所见</div>
            <div
              class="copy-btn"
              :data-clipboard-text="`${allOriginText}\r\n${allNarrowText}。`"
              @click="copy"
            >
              复制
            </div>
          </div>
          <p class="desc">
            <template v-for="item in orginResult" :key="item.key">
              {{ item.beginText }}
              <b
                ><span>{{ item.text }}</span></b
              >;&nbsp;
              <br v-show="item.key === 'dominant_type'" />
            </template>
          </p>
          <p v-for="item in narrowResult" :key="item.artery" class="desc">
            <b>
              <span> {{ item.copyText }} </span>
            </b>
          </p>
          <div class="report-title">
            <div class="title-line"></div>
            <div class="title">诊断</div>
            <div
              class="copy-btn"
              :data-clipboard-text="allDiagnoseText"
              @click="copy"
            >
              复制
            </div>
          </div>
          <div v-if="diagnoseResult.length > 1" class="desc">
            冠状动脉粥样硬化表现：
          </div>
          <p v-for="item in diagnoseResult" :key="item.artery" class="desc">
            <template v-if="item.diagnoseText">
              <b>
                <span>
                  {{ item.diagnoseText }}
                </span>
              </b>
            </template>
          </p>
        </div>
        <div
          class="table-content pane-report-content"
          v-show="activeName === 'table'"
        >
          <el-table
            :data="tableData"
            style="width: 100%"
            border
            class="report-table"
          >
            <el-table-column prop="cnName" label="冠脉分段" />
            <el-table-column label="斑块类型">
              <el-table-column
                v-for="plaque in plaqueOptions"
                :key="`column_${plaque.value}`"
                width="80"
                :label="plaque.label"
              >
                <template v-slot:header>
                  <span v-html="plaque.label" />
                </template>
                <template #default="{ row }">
                  <!-- {{ row }} -->
                  <el-icon
                    color="#3b7cff"
                    :size="16"
                    v-if="row.plaque[plaque.alias]"
                  >
                    <check />
                  </el-icon>
                </template>
              </el-table-column>
            </el-table-column>
            <el-table-column label="心肌桥" width="80">
              <template #default="{ row }">
                <el-icon color="#3b7cff" :size="16" v-if="row.bridge">
                  <check />
                </el-icon>
              </template>
            </el-table-column>
            <el-table-column label="支架" width="80">
              <template #default="{ row }">
                <el-icon color="#3b7cff" :size="16" v-if="row.stent">
                  <check />
                </el-icon>
              </template>
            </el-table-column>
            <el-table-column label="狭窄程度">
              <el-table-column
                v-for="item in stratinessColumn"
                :key="item.key"
                width="80"
              >
                <template v-slot:header>
                  <span v-html="item.label" />
                </template>
                <template v-slot="{ row }">
                  <el-icon
                    color="#3b7cff"
                    :size="16"
                    v-if="item.type.includes(row.plaque_strait)"
                  >
                    <check />
                  </el-icon>
                </template>
              </el-table-column>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <div class="report-foot">
        <el-button
          v-show="activeName === 'text'"
          class="common-btn report-copy"
          type="primary"
          :data-clipboard-text="`${allOriginText}\r\n${allNarrowText}\r\n${allDiagnoseText}`"
          @click="copy"
          >全部复制</el-button
        >
        <el-button class="common-btn" @click="toShowReport(false)">
          取消
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { CircleClose, DocumentCopy, Check } from "@element-plus/icons-vue";

import copyClipoboard from "@/utils/clipboard";

import ReportMsg from "../../components/report-msg.vue";

import { plaqueOptions, originKeyText } from "@/utils/source";

import { isEmpty } from "@/utils/validate";

import arteryBus from "@/utils/arteryBus";

import { filterItemList } from "@/utils/artery";

export default {
  components: {
    ReportMsg,
    CircleClose,
    // DocumentCopy,
    Check,
  },
  props: {
    patientMsg: {
      type: Object,
      default: () => {},
    },
    patientId: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      showReport: false,
      activeName: "text",
      stratinessColumn: [
        { label: "未见狭窄", type: [-1], key: "narrow-1" },
        { label: "&le;49%", type: [0, 1], key: "narrow01" },
        { label: "50%-69%", type: [2], key: "narrow2" },
        { label: "&ge;70%", type: [3, 4], key: "narrow03" },
      ],
      plaqueOptions,
      tableData: [],
      narrowResult: [],
      diagnoseResult: [],
      allNarrowText: "",
      orginResult: [],
      allOriginText: "",
      allDiagnoseText: "",
    };
  },
  computed: {
    isShowOrgin() {
      return (
        "dominant_type" in this.orginResult &&
        !isEmpty(this.orginResult["dominant_type"])
      );
    },
  },
  created() {
    arteryBus.on("setOriginResult", (result) => {
      // this.orginResult = result
      this.transOriginResult(result);
    });
    arteryBus.on("setNarrowResult", (result) => {
      console.log("result", result);
      this.transNarrowResult(result);
    });
    window.addEventListener("beforeunload", (e) => {
      console.log("report-beforeunload");
      arteryBus.off("*");
      window.removeEventListener("beforeunload", () => {}); // 移除这个监听
    });
  },
  methods: {
    transOriginResult(result) {
      let orginResult = [];

      for (const key in result) {
        if (Object.hasOwnProperty.call(result, key)) {
          const item = result[key];
          if (originKeyText[key]) {
            const orgin = originKeyText[key];
            const copyText = orgin.beginText + orgin.data[item];
            orginResult.push({
              beginText: orgin.beginText,
              text: orgin.data[item],
              copyText,
              key,
              sort: orgin.sort,
            });
          }
        }
      }
      orginResult.sort((a, b) => a.sort - b.sort);
      // 所有的复制
      let allOriginText = orginResult.length
        ? orginResult.map((item) => item.copyText).join("；")
        : "";
      // 起源结果
      this.orginResult = orginResult;
      this.allOriginText = allOriginText;
      orginResult = null;
      allOriginText = null;
    },
    transNarrowResult(result) {
      if (!(result && result.length)) {
        return;
      }
      let narrowResult = [];
      let tableData = [];
      let allNarrowText = "";
      let allDiagnoseText = "";
      for (const item of result) {
        let filterList = item.list.filter((listItem) => listItem.isInArtery);
        // 获取数据
        let { list, copyText, diagnoseText } = filterList.length
          ? filterItemList(filterList)
          : { list: [] };
        narrowResult.push({
          ...item,
          list,
          copyText: `${copyText}${copyText ? "。" : ""}`,
          diagnoseText: `${diagnoseText}${diagnoseText ? "。" : ""}`,
        });
        // 表格数据
        const itemTableData = list.length ? list : [];
        tableData.push(...itemTableData);
        list = null;
        filterList = null;
      }
      // 设置数据
      this.narrowResult = this.resolveNarrowResult([...narrowResult]);
      this.diagnoseResult = this.resolveDiagnoseResult([...narrowResult]);
      this.narrowResult.map((item) => {
        allNarrowText += item.copyText;
      });
      this.diagnoseResult.map((item) => {
        allDiagnoseText += item.diagnoseText;
      });

      this.tableData = tableData;
      this.allNarrowText = allNarrowText;
      this.allDiagnoseText = allDiagnoseText;
      tableData = null;
      narrowResult = null;
      allNarrowText = null;
      allDiagnoseText = null;
    },
    /**
     * 解决D1、D2 OM1、OM2 等 融合问题
     * @param {*} narrowResult
     */
    resolveNarrowResult(narrowResult) {
      const arteryArray = narrowResult.map((item) => item.artery);
      const copyTextArray = narrowResult.map((item) => item.copyText);
      this.doubleToOne(
        "D1",
        "D2",
        "对角支（D1，D2）",
        arteryArray,
        copyTextArray,
        narrowResult
      );
      this.doubleToOne(
        "OM1",
        "OM2",
        "钝缘支（OM1，OM2）",
        arteryArray,
        copyTextArray,
        narrowResult
      );
      this.doubleToOne(
        "AM1",
        "AM2",
        "锐缘支（AM1，AM2）",
        arteryArray,
        copyTextArray,
        narrowResult
      );
      narrowResult = narrowResult.filter((item) => item);
      return narrowResult;
    },
    resolveDiagnoseResult(narrowResult) {
      narrowResult = narrowResult.filter((item) => item.diagnoseText);
      if (narrowResult.length === 0) {
        narrowResult = [
          {
            diagnoseText: "冠状动脉CTA未见明显异常。",
          },
        ];
      }
      return narrowResult;
    },
    doubleToOne(
      name1 = "D1",
      name2 = "D2",
      rename = "对角支（D1，D2）",
      arteryArray,
      copyTextArray,
      narrowResult
    ) {
      const D1Index = arteryArray.indexOf(name1);
      const D2Index = arteryArray.indexOf(name2);
      // 此时是包含D1，D2的
      if (D1Index !== -1 && D2Index !== -1) {
        const textD1Index =
          copyTextArray[D1Index].indexOf("未见斑块及明显狭窄\r\n。");
        const textD2Index =
          copyTextArray[D2Index].indexOf("未见斑块及明显狭窄\r\n。");
        // 均为未见....
        if (textD1Index !== -1 && textD2Index !== -1) {
          narrowResult[D2Index] = undefined;
          narrowResult[D1Index] = {
            ...narrowResult[D1Index],
            copyText: `${rename}未见斑块及明显狭窄\r\n。`,
          };
        }
      }
    },
    toShowReport(isShow) {
      this.showReport = isShow;
    },
    copy(evt) {
      copyClipoboard(evt);
    },
  },
};
</script>
