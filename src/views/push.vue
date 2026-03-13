<style lang="less" scoped src="@/styles/head.less"></style>
<style lang="less" scoped src="@/styles/push.less"></style>
<template>
  <div class="push-container">
    <div class="push-images-content">
      <div class="home-head">
        <img class="logo" :src="require('@/assets/logo.png')" />
        <div class="tools-list"></div>
        <div class="series-msg">
          <div class="patient" :title="patientId">
            <span>{{ patientId }}</span>
            <el-icon
              class="copy"
              title="复制"
              :size="16"
              color="#0ac8f8"
              :data-clipboard-text="patientId"
              @click.stop="copy"
            >
              <document-copy />
            </el-icon>
          </div>
          <div class="series-desc" :title="patientMsg.seriesDesc || ''">
            {{ patientMsg.seriesDesc || '' }}
          </div>
        </div>
      </div>
      <div
        class="all-push-images pretty-bar"
        @drop.stop="dropOver"
        @dragover.prevent.stop
      >
        <div
          v-for="(item, index) in pushImages"
          :key="item.key"
          class="push-dcm-render"
          @dblclick.stop.prevent="scaleImgs(index)"
          @mousedown.prevent="mouseChangeWwWc($event, item)"
        >
          <div class="msg">
            <span v-if="item.msg">{{ item.msg }}</span>
            <span v-else>
              {{ item.artery }}
              <span v-if="item.angle">{{ item.angle }}&deg;</span>
            </span>
          </div>
          <div :id="item.key" class="dcm-render">
            <canvas class="cornerstone-canvas"></canvas>
          </div>
          <el-icon
            class="del-item"
            size="16"
            color="#fff"
            @click="removePushDcm(index)"
          >
            <Delete />
          </el-icon>
          <PrintMsg
            :scaleNum="0.6"
            :printFilmMsg="{
              ...printFilmMsg,
              btLeft: [
                `ww:${parseInt(item.windowWidth)} wc:${parseInt(
                  item.windowCenter
                )}`
              ]
            }"
          />
        </div>
      </div>
    </div>
    <div class="push-setting">
      <div class="setting-head setting-title-item">
        <div class="title">选择图像</div>
      </div>
      <SelectImages
        :all-images="allImages"
        :selectImages="pushImages"
        :artery-list="arteryList"
        :is-push="true"
        @pushPrint="pushPrint"
        @dragImg="dragImg"
        @viewScaleImage="viewScaleImage"
      ></SelectImages>
      <div class="setting-head setting-title-item">
        <div class="title">推送服务列表</div>
      </div>
      <div class="server-list">
        <div class="check" />
        <div class="index">序号</div>
        <div class="name">名称</div>
        <div class="aet">AET</div>
      </div>
      <div class="server-table no-scrollbar">
        <div
          v-for="(item, index) in serverList"
          :key="item.id"
          class="server-list list"
        >
          <div class="check">
            <el-checkbox v-model="item.isCheck" class="head-check push-check" />
          </div>
          <div class="index">{{ index + 1 }}</div>
          <div class="name">{{ item.serverName }}</div>
          <div class="aet">{{ item.serverAet }}</div>
        </div>
      </div>
      <div class="push-foot">
        <div class="close-btn btns" @click="closePush">关闭</div>
        <div class="push-btn btns" @click="pushDcms">推 送</div>
      </div>
    </div>
  </div>

  <ScaleDcm
    ref="scale-dcm"
    :msg="printFilmMsg"
    :is-push="true"
    :selectImages="pushImages"
    @pushPrint="pushPrint"
    @changeWwWc="changeWwWc"
  ></ScaleDcm>
</template>

<script>
import dayjs from 'dayjs'
import { DocumentCopy, Delete } from '@element-plus/icons-vue'
import SelectImages from '@/components/select-images.vue'
import ScaleDcm from '@/components/scale-dcm.vue'
import PrintMsg from '@/components/print-msg.vue'

import { dcmload, getPushServerList, pushDcmsToServer, getAllData } from '@/api'

// import AuthImg from './auth-image.vue'
import { getPrintImgs } from '@/utils/artery'
import { headVerifyKey } from '@/utils/index'
import storage from '@/utils/storage'

import {
  initEnabledDefault,
  loadImage,
  dcmtags,
  clearCache,
  isEnabledElement
} from '@/utils/cornerstone'
import { getArteryList } from '@/utils/artery'
import copyClipoboard from '@/utils/clipboard'
import { isEmpty } from '@/utils/validate'
import { getParamsObject } from '@/store/params'
export default {
  components: {
    // PushImages,
    SelectImages,
    DocumentCopy,
    ScaleDcm,
    Delete,
    PrintMsg
  },
  data() {
    return {
      patientId: '',
      seriesId: '',
      workingPath: '',
      studyInstanceId: '',
      arteryList: [],
      patientMsg: {},
      allImages: [], // 所有图像
      pushImages: [], // 推送的图像
      serverList: [],
      dragItem: null,
      printFilmMsg: {},
      storageKey: '' // 存储的key
    }
  },
  async created() {
    window.name = 'CoronaryArtery-push'
  },
  async mounted() {
    // scaleDcmEl = document.getElementById('scaledcm-canvas')

    const ParamsObject = getParamsObject()
    console.log(ParamsObject)
    this.patientId = ParamsObject.patientId
      ? ParamsObject.patientId
      : process.env.NODE_ENV === 'development'
        ? '357707'
        : ''
    this.seriesId = ParamsObject.seriesId
      ? ParamsObject.seriesId
      : process.env.NODE_ENV === 'development'
        ? '1.2.840.113619.6.80.114374081799669.165531.1618642982661.1'
        : ''
    this.imageCount = ParamsObject.imageCount || 1
    this.hospitalId = ParamsObject.hospitalId || ''
    this.hospitalName = ParamsObject.hospitalName || ''
    if (this.patientId && this.seriesId) {
      this.storageKey = headVerifyKey(`${this.patientId}_${this.seriesId}_push`)
      // 加载数据
      this.loadData()
    }

    document.oncontextmenu = function() {
      return false
    }
    // // 监听
    window.addEventListener(
      'storage',
      this.pushListener,
      window.location.origin
    )
    window.addEventListener('beforeunload', () => {
      clearCache()
      // 清除缓存
      window.removeEventListener(
        'storage',
        this.pushListener,
        window.location.origin
      )
    })
  },
  computed: {},
  watch: {
    $route: {
      handler() {
        window.location.reload()
      },
      deep: true
    }
  },
  methods: {
    pushListener(evt) {
      if (!this.storageKey) {
        return
      }
      // console.log('evt >>>', evt)
      if (evt.key === this.storageKey && evt.newValue) {
        this.eachPush(JSON.parse(evt.newValue) || [])
      }
    },
    eachPush(val = []) {
      for (const pushItem of val) {
        const pushIndex = this.pushImages.findIndex(
          (item) => pushItem.key === item.key
        )

        if (pushIndex > -1) {
          if (
            pushItem.windowWidth &&
            pushItem.windowCenter &&
            (pushItem.windowWidth !== this.pushImages[pushIndex].windowWidth ||
              pushItem.windowCenter !== this.pushImages[pushIndex].windowCenter)
          ) {
            // 是否存在窗值调节的情况
            this.pushImages[pushIndex] = {
              ...this.pushImages[pushIndex],
              windowWidth: pushItem.windowWidth,
              windowCenter: pushItem.windowCenter
            }
          }
        } else {
          if (!pushItem.isOnlySend) {
            this.pushImages.push(pushItem)
          } else {
            pushItem.isOnlySend = false
          }
          const dcms = this.allImages.map((imgItem) => imgItem.dcm)
          if (dcms.indexOf(pushItem.dcm) === -1) {
            this.allImages.push(pushItem)
          }
        }
      }
      this.showALLPushImages(false)
    },
    dragImg(item) {
      this.dragItem = item
    },
    // 拖拽进入
    dropOver() {
      if (!this.dragItem) {
        return
      }
      const keyIndex = this.pushImages.findIndex(
        (item) => item.key === this.dragItem.key
      )
      if (keyIndex > -1) {
        return
      }
      this.pushImages.push(this.dragItem)
      this.showALLPushImages()
      this.dragItem = null
    },
    async loadData() {
      try {
        const { data } = await getPushServerList(this.patientId || '000001')
        const list = data || []
        this.serverList = list
          .filter((item) => item.serverName !== 'printer')
          .map((item) => ({
            ...item,
            isCheck: false
          }))
        const res = await getAllData(
          this.patientId,
          this.seriesId,
          this.imageCount,
          this.hospitalId,
          this.hospitalName
        )
        if (JSON.stringify(res) !== '{}') {
          this.transResData(res)
        }
      } catch (error) {
        console.log(error)
        this.$message.error('加载数据失败')
      }
    },
    async transResData(data) {
      // 图像信息
      let series_date = ''
      if (data.series_date) {
        series_date = dayjs(data.series_date).format('YYYY-MM-DD')
      }
      const patientMsg = {
        series_date,
        patient_name: data.patient_name || '',
        patient_sex: data.patient_sex
          ? data.patient_sex.toUpperCase().indexOf('M') > -1
            ? '男'
            : '女'
          : '',
        patient_age: data.patient_age
          ? Number(data.patient_age.substring(0, data.patient_age.length - 1))
          : '',
        hospital_name: data.hospital_name || '',
        modality: data.modality || '',
        study_id: data.study_id || '',
        seriesDesc: data.SeriesDescription || ''
      }
      this.patientMsg = patientMsg
      this.studyInstanceId = patientMsg.study_id
      // 工作路径
      const workingPath = data['working_path'] || ''
      if (!workingPath) {
        return
      }
      this.workingPath = workingPath
      // 设置血管
      const arteryList = await getArteryList(
        workingPath,
        data.vessel_names || []
      )
      this.arteryList = arteryList.filter(
        (item) => item.name.toUpperCase().indexOf('UNKNOW') < 0
      )
      if (!this.arteryList.length) {
        return
      }
      const partDcms = {}
      const partList = [
        'CPR',
        'SPR',
        'VR',
        'VR_with_heart',
        'MIP',
        'MIP_Inv',
        'MIP_with_heart',
        'Synthesis',
        'MAKEUP'
      ]

      for (const part of partList) {
        if (part in data) {
          partDcms[part] = data[part]
        }
      }

      this.allImages = getPrintImgs(
        this.arteryList,
        partDcms,
        this.workingPath,
        'T'
      )
      this.eachPush(storage.getString(this.storageKey, []))
      // 加载原始图像来获取信息
      this.loadOriDcm(
        data['Ori'] && data['Ori'].DCMS ? data['Ori'].DCMS[0] : ''
      )
    },
    async loadOriDcm(path) {
      if (!path) {
        return
      }
      const oriImage = await loadImage(dcmload(`${this.workingPath}/${path}`))
      // 四角信息
      const printFilmMsg = {}
      for (const key in dcmtags) {
        if (Object.hasOwnProperty.call(dcmtags, key)) {
          const tags = dcmtags[key]
          const msgs = []
          for (const item of tags) {
            const tag = 'x' + item.tag.replace(',', '')
            const data = oriImage.data.string(tag)
            msgs.push(data)
          }
          printFilmMsg[key] = msgs
        }
      }
      this.printFilmMsg = printFilmMsg
    },
    removePushDcm(index) {
      this.pushImages.splice(index, 1)
      storage.saveString(this.storageKey, this.pushImages)
    },
    // 是否存储到store
    showALLPushImages(isSaveStore = true) {
      if (isSaveStore) {
        storage.saveString(this.storageKey, this.pushImages)
      }
      this.$nextTick(async() => {
        for (const item of this.pushImages) {
          let element = document.getElementById(item.key)
          await initEnabledDefault(element, false)
          let image = await loadImage(dcmload(item.dcm))
          let viewport = cornerstone.getDefaultViewportForImage(element, image)
          if (item.isSpr) {
            viewport.rotation = 90
          }
          const windowWidth = !isEmpty(item.windowWidth)
            ? item.windowWidth
            : item.artery
              ? 800
              : viewport.voi.windowWidth
          const windowCenter = !isEmpty(item.windowCenter)
            ? item.windowCenter
            : item.artery
              ? 300
              : viewport.voi.windowCenter
          // 设置windowWidth windowCenter
          viewport.voi.windowWidth = windowWidth
          viewport.voi.windowCenter = windowCenter
          // 给当期的item增加上
          item.windowWidth = windowWidth
          item.windowCenter = windowCenter
          cornerstone.displayImage(element, image, viewport)
          cornerstone.resize(element, true)
          element = null
          image = null
          viewport = null
        }
      })
    },
    // 修改窗位窗宽
    changeWwWc({ key, windowWidth, windowCenter }) {
      const nowItem = this.pushImages.find((pushItem) => pushItem.key === key)
      if (!nowItem) {
        return
      }
      let element = document.getElementById(key)
      if (!element || !isEnabledElement(element)) {
        return
      }
      nowItem.windowWidth = windowWidth
      nowItem.windowCenter = windowCenter
      const viewport = cornerstone.getViewport(element)
      viewport.voi.windowWidth = windowWidth
      viewport.voi.windowCenter = windowCenter
      cornerstone.setViewport(element, viewport)
      // 存
      storage.saveString(this.storageKey, this.pushImages)
      // 置空
      element = null
    },
    mouseChangeWwWc(evt, item) {
      if (evt.which === 3) {
        const key = item.key
        let lastX = evt.pageX
        let lastY = evt.pageY
        let element = document.getElementById(key)
        if (!element || !isEnabledElement(element)) {
          return
        }
        document.onmousemove = (e) => {
          const deltaX = e.pageX - lastX
          const deltaY = e.pageY - lastY
          lastX = e.pageX
          lastY = e.pageY
          const viewport = cornerstone.getViewport(element)
          if (!viewport) {
            return
          }
          const windowWidth =
            viewport.voi.windowWidth + (deltaX / viewport.scale) * 5
          const windowCenter =
            viewport.voi.windowCenter + (deltaY / viewport.scale) * 5
          // 设置当前值
          item.windowWidth = windowWidth
          item.windowCenter = windowCenter
          // 设置当前viewport
          viewport.voi.windowWidth = windowWidth
          viewport.voi.windowCenter = windowCenter
          cornerstone.setViewport(element, viewport)
          // 存
          storage.saveString(this.storageKey, this.pushImages)
        }
        document.onmouseup = (e) => {
          document.onmousemove = null
          document.onmouseup = null
          element = null
        }
      }
    },
    async pushDcms() {
      const serverIds = []
      this.serverList.forEach((item) => {
        if (item.isCheck) {
          serverIds.push(item.id)
        }
      })
      if (!serverIds.length) {
        this.$message.warning('请选择推送的服务器')
        return
      }
      if (!this.pushImages.length) {
        this.$message.warning('请选择推送的图像')
        return
      }
      if (!this.studyInstanceId) {
        this.$message.warning('等待图像加载')
        return
      }
      console.log(this.pushImages)
      // {....,"dcms":[{"dcm":"dcmPath","text":"textValue","saveTo":"saveToValue"}]}
      pushDcmsToServer({
        dcms: this.pushImages,
        serverIds,
        patient_id: this.patientId,
        series_id: this.seriesId,
        studyInstanceId: this.studyInstanceId
      })
        .then(async(res) => {
          this.$message.success(res.message || '任务执行成功')
          // 清除推送的原始图像
          this.oriPushImages = []
          // 清除缓存
          storage.remove(this.storageKey)
          // await updateSeries(this.patientId, this.seriesId, { is_push: 1 })
        })
        .catch((err) => {
          console.log(err)
          this.$message.error('任务创建失败')
        })
    },
    pushPrint(item) {
      if (!item) {
        return
      }
      const hasPush =
        this.pushImages.findIndex((pushItem) => pushItem.key === item.key) > -1
      if (hasPush) {
        return
      }
      this.pushImages.push(item)
      this.showALLPushImages()
    },
    closePush() {
      window.close()
    },
    copy(evt) {
      if (!this.patientId) {
        return
      }
      copyClipoboard(evt)
    },
    scaleImgs(index) {
      this.$refs['scale-dcm'].toShowScale(this.pushImages, index, false)
    },
    // 放大图像查看
    viewScaleImage(index, images) {
      this.$refs['scale-dcm'].toShowScale(images, index, true)
    }
  }
}
</script>
