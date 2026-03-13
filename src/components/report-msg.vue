<style lang="less" scoped>
.report-msg {
  width: 100%;
  overflow: hidden;
  padding: 10px 0;
  border-bottom: 1px solid #d1d1d1;
  .item-msg {
    width: 25%;
    height: 30px;
    float: left;
    overflow: hidden;
    line-height: 30px;
    font-size: 14px;
  }
}
</style>
<template>
  <div class="report-msg">
    <div class="item-msg">姓名：{{ reportMsg.patient_name || "" }}</div>
    <div v-if="reportMsg.patient_sex" class="item-msg">
      性别：{{ reportMsg.patient_sex }}
    </div>
    <div v-if="reportMsg.patient_age" class="item-msg">
      年龄：{{ reportMsg.patient_age }}
    </div>
    <div v-if="reportMsg.series_date" class="item-msg">
      检查日期：{{ reportMsg.series_date }}
    </div>
    <div class="item-msg">检查号：{{ patientId }}</div>
  </div>
</template>

<script>
export default {
  props: {
    reportMsg: {
      type: Object,
      default: () => {}
    },
    patientId: {
      type: String,
      default: ''
    }
  }
}
</script>
