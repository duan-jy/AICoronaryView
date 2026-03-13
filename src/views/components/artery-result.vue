<style lang="less" scoped src="@/styles/result.less"></style>
<template>
  <div class="result-container">
    <div class="result-head">
      <div class="title">诊断报告</div>
      <div class="result">{{ narrowObj[maxNarrow] || '未见狭窄' }}</div>
    </div>
    <div id="result-content" ref="result-content" class="result-content no-scrollbar">
      <div v-if="isShowOrgin()" class="origin-content result-content-item no-scrollbar" style="background: #111628">
        <div class="artery-item artery-origin">
          <div class="fold-head">
            <div class="fold-icon">
              <el-icon @click="isFoldOrigin = !isFoldOrigin">
                <arrow-up v-show="isFoldOrigin" />
                <arrow-down v-show="!isFoldOrigin" />
              </el-icon>
            </div>
            <div class="fold-title">冠脉起源及优势型</div>
          </div>
          <div v-show="isFoldOrigin" class="orgin-result">
            <div v-if="isShowOrgin('dominant_type')" class="result-item" style="padding: 0 35px">
              <div class="result-pick">
                <div class="pick-title">冠状动脉呈：</div>
                <div class="pick-content select">
                  <el-select v-model="orginResult.dominant_type" size="mini" class="inline-select" placeholder="请选择"
                    popper-class="common-options" @change="setDominant">
                    <el-option :value="1" label="左优势型" />
                    <el-option :value="2" label="右优势型" />
                    <el-option :value="3" label="均势型" />
                  </el-select>
                </div>
              </div>
            </div>
            <div v-if="isShowOrgin('origin_left')" class="result-item" style="padding: 0 35px">
              <div class="result-pick">
                <div class="pick-title">左主干起源于：</div>
                <div class="pick-content select">
                  <el-select v-model="orginResult.origin_left" size="mini" class="inline-select" placeholder="请选择"
                    popper-class="common-options">
                    <el-option :value="1" label="左窦" />
                    <el-option :value="2" label="右窦" />
                  </el-select>
                </div>
              </div>
            </div>
            <div v-if="isShowOrgin('origin_right')" class="result-item" style="padding: 0 35px">
              <div class="result-pick">
                <div class="pick-title">右冠状动脉起源于：</div>
                <div class="pick-content select">
                  <el-select class="inline-select" v-model="orginResult.origin_right" size="mini" placeholder="请选择"
                    popper-class="common-options">
                    <el-option :value="1" label="左窦" />
                    <el-option :value="2" label="右窦" />
                  </el-select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div :style="{ marginTop: isFoldOrigin ? '146px' : '46px' }" id="narrow-content" ref="narrow-content"
        class="narrow-content result-content-item no-scrollbar">
        <template v-for="item in narrowResult" :key="item.id">
          <template v-for="(part, partIndex) in filterList(item)" :key="`part_${partIndex}`">
            <div class="artery-item">
              <div :style="{ background: part.isPartFold ? '#223368' : '#1c2541' }" class="fold-head pad-left-8"
                :id="`artery_${item.id}`" :name="`${part.section}`" @click.stop="activeNarrowPart(item, part)">
                <!-- @change="resultChange" -->
                <div class="fold-title artery">
                  <el-checkbox v-model="part.checked" class="head-check" @click.stop
                    @change="checkedChange(part, $event)">{{ part.location }}</el-checkbox>
                </div>
                <div class="no-narrow" v-show="!part.isPartFold" v-html="makeSummarize(part)"></div>
              </div>
              <div class="artery-contents" style="margin-top: -20px" v-show="part.isPartFold">
                <div :id="`${part.key}`" :class="['result-item', 'active']">
                  <div class="result-pick">
                    <div class="pick-content select">
                      <plaque-select :plaque="part.plaque" @plaqueChange="plaqueChange(part, $event)" />
                    </div>
                  </div>
                  <div class="result-pick">
                    <div class="pick-content select">
                      <el-select v-model="part.plaque_strait" size="mini" :class="[
                        'inline-select',
                        `narrow-level-${part.plaque_strait}`
                      ]" placeholder="狭窄程度" popper-class="common-options" @change="tabChangeNarrow(part, $event)">
                        <el-option v-for="item in narrowOptions" :key="item.value" :value="item.value"
                          :label="item.label" />
                      </el-select>
                    </div>
                  </div>
                  <div class="result-pick float-right" v-show="part.plaque_strait !== -1 && part.plaque_strait !== 4
                    ">
                    <div class="pick-title">狭窄程度：</div>
                    <div class="pick-content input pick-input" style="position: relative">
                      <el-input-number :controls="false" :min="0" :max="100" @change="straitChangeNarrow(part, $event)"
                        v-model="part.straitness" style="width: 68px">
                        <template #suffix> % </template>
                      </el-input-number>
                      <span style="
                          position: absolute;
                          right: 5px;
                          top: 4px;
                          color: #c0c4cc;
                          font-size: 12px;
                        ">%</span>
                    </div>
                  </div>
                  <div class="clear-both"></div>
                  <div class="result-pick">
                    <div class="pick-content select">
                      <vary-select :stent="part.stent" :bridge="part.bridge" @varyChange="varyChange(part, $event)" />
                    </div>
                  </div>
                  <div class="result-pick float-right" v-show="part.bridge">
                    <div class="pick-title">心肌桥厚度：</div>
                    <div class="pick-content input pick-input">
                      <el-input @change="resultChange()" v-model="part.bridge_thickness" style="width: 68px">
                        <template #suffix> mm </template>
                      </el-input>
                    </div>
                  </div>
                  <div class="result-pick float-right" v-show="part.bridge">
                    <div class="pick-title">壁冠状动脉长度：</div>
                    <div class="pick-content input pick-input">
                      <el-input @change="resultChange()" v-model="part.artery_length" style="width: 68px">
                        <template #suffix> mm </template>
                      </el-input>
                    </div>
                  </div>
                  <div class="result-pick float-right" v-show="part.stent">
                    <div class="pick-title">支架长度：</div>
                    <div class="pick-content input pick-input">
                      <el-input @change="resultChange()" v-model="part.stent_length" style="width: 68px">
                        <template #suffix> mm </template>
                      </el-input>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import { getResult, saveResult } from '@/api/index'

import {
  arteryName,
  narrowObj,
  narrowOptions,
  plaqueObj,
  plaqueOptions,
  straitnessTypes,
  percentage,
  originTypes,
  dominantTypes,
  reportMainVessels,
  arteryNameKeys,
  arterySectionName
  // sectionList
} from '@/utils/source'

import { isShowOrgin } from '@/utils/artery'

import arteryBus from '@/utils/arteryBus'

import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import PlaqueSelect from '@/components/plaque-select.vue'
import VarySelect from '@/components/vary-select.vue'

import { isUnkown } from '@/utils/artery'

let timeId = null

function resetData() {
  if (timeId !== null) {
    clearTimeout(timeId)
  }
  timeId = null
}

export default {
  emits: ['changeArtery'],
  components: {
    ArrowDown,
    ArrowUp,
    VarySelect,
    PlaqueSelect
  },
  props: {
    workingPath: {
      type: String,
      default: ''
    },
    resultPath: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isFoldOrigin: true,
      narrowVesselResult: [], // 狭窄血管的结果
      narrowResult: [], // 狭窄的结果
      orginResult: {}, // 起源结果
      narrowActive: '', // 狭窄聚焦
      maxNarrow: -1, // 最大的狭窄
      isArteryEdit: false, // 是否是编辑状态
      vesselChecked: {}, // 选中列表
      listCheck: false
    }
  },
  setup() {
    return {
      narrowObj,
      narrowOptions,
      plaqueObj,
      plaqueOptions,
      straitnessTypes,
      percentage,
      originTypes,
      dominantTypes
    }
  },
  computed: {
    ...mapGetters(['activeArtery', 'arteryList', 'rawArteryList', 'isVertical'])
  },
  watch: {
    orginResult: {
      handler(newVal, oldVal) {
        this.orginChange()
      },
      deep: true
    },
    activeArtery(newVal, oldVal) {
      if (newVal) {
        this.scrollArteryView(newVal)
      }
    }
  },
  created() {
    resetData()

    arteryBus.on('addNarrowLabel', (label) => this.addNarrowLabel(label))

    arteryBus.on('setNarrowActive', (key) => {
      if (this.narrowActive !== key) {
        this.narrowActive = key
        this.scrollView()
      }
    })
    // 查看当前渲染
    arteryBus.on('renderedListChange', (list) => {
      this.renderChange(list)
    })
    // 是否在编辑状态
    arteryBus.on('editArtery', (isEdit) => {
      this.isArteryEdit = isEdit
    })
    // 移除狭窄
    arteryBus.on('removeNarrow', this.removeNarrow)

    window.addEventListener('beforeunload', (e) => {
      console.log('result-beforeunload')
      arteryBus.off('*')
      window.removeEventListener('beforeunload', () => { }) // 移除这个监听
    })
  },
  beforeUnmount() {
    resetData()
  },
  methods: {
    removeNarrow(data) {
      // 聚焦的血管
      const activeArteryIndex = this.narrowVesselResult.findIndex(
        (item) => item.id === data.arteryId
      )
      if (activeArteryIndex < 0) {
        return
      }
      // 定位狭窄
      const activeNarrowIndex = this.narrowVesselResult[
        activeArteryIndex
      ].list.findIndex((item) => item.key === data.key)
      if (activeNarrowIndex < 0) {
        return
      }
      // 取消选中
      this.narrowVesselResult[activeArteryIndex].list[
        activeNarrowIndex
      ].checked = false

      this.resultChange()
    },
    addNarrowLabel(label) {
      const { arteryId, data, artery } = label
      const arteryNarrowIndex = this.narrowResult.findIndex(
        (item) => item.id === arteryId
      )
      if (arteryNarrowIndex > -1) {
        this.narrowResult[arteryNarrowIndex].isShowNarrow = true
        this.narrowResult[arteryNarrowIndex].list.push(data)
      } else {
        const mainIndex = reportMainVessels.indexOf(artery)
        this.narrowResult.push({
          id: arteryId,
          isShowNarrow: true,
          listMax: data.plaque_strait,
          artery,
          isFold: true,
          cnName: data.cnName,
          list: [data],
          sort: mainIndex > -1 ? mainIndex : reportMainVessels.length
        })
      }
      this.resultChange()
    },
    renderChange(list) {
      list = list ? list.split(',') : []
      if (
        list.includes('Ori') &&
        list.includes('SPR') &&
        list.includes('CPR') &&
        list.includes('PROBE')
      ) {
        if (timeId !== null) {
          clearTimeout(timeId)
        }
        timeId = null
        // 是否有此血管的狭窄结果
        const findNarrow = this.narrowResult.find(
          (item) => item.id === this.activeArtery
        )
        // 可置空先暂时不做处理
        if (findNarrow && findNarrow.list && findNarrow.list.length) {
          // 找到狭窄中是否和当前对应的狭窄
          const nowActive = findNarrow.list.find(
            (item) => item.key === this.narrowActive
          )
          if (nowActive) {
            timeId = setTimeout(() => {
              // 当有狭窄聚焦是
              arteryBus.emit('setNarrowActive', this.narrowActive)
            }, 500)
          }
        }
      }
    },
    scrollArteryView(val) {
      const arteryView = document.getElementById(`artery_${val}`)
      if (!arteryView) {
        return
      }
      // console.log(this.listCheck)
      if (this.listCheck) {
        this.listCheck = false
        return
      }
      const section = arteryView.getAttribute('name')
      this.activeNarrowBySection(section)
      // console.log(this.listCheck)
      this.$nextTick(() => {
        if (this.isVertical) {
          const top =
            arteryView.offsetTop - this.$refs['narrow-content'].offsetTop
          this.$refs['narrow-content'].scrollTop = top
        } else {
          const top =
            arteryView.offsetTop -
            this.$refs['result-content'].offsetTop -
            (this.isFoldOrigin ? 146 : 46)
          this.$refs['result-content'].scrollTop = top
        }
      })

      // arteryView = null
    },
    scrollView() {
      this.$nextTick(() => {
        if (!this.narrowActive) {
          return
        }
        let activeElement = document.getElementById(this.narrowActive)
        if (!activeElement) {
          return
        }
        if (this.isVertical) {
          const top =
            activeElement.offsetTop - this.$refs['narrow-content'].offsetTop
          this.$refs['narrow-content'].scrollTop = top
        } else {
          const top =
            activeElement.offsetTop - this.$refs['result-content'].offsetTop
          this.$refs['result-content'].scrollTop = top
        }
        activeElement = null
      })
    },
    orginChange() {
      arteryBus.emit('setOriginResult', this.orginResult)
    },
    // 结果变化
    resultChange() {
      arteryBus.emit('setNarrowResult', this.narrowResult)
      arteryBus.emit('setNarrowVesselResult', this.narrowVesselResult)
      this.getMaxNarrow()
    },
    checkedChange(part, value) {
      const location = part.location
      if (value) {
        if (this.vesselChecked[location]) {
          delete this.vesselChecked[location]
        }
      } else {
        this.vesselChecked[location] = value
      }
      sessionStorage.vesselChecked = JSON.stringify(this.vesselChecked)
      this.resultChange()
    },
    // tab 切换狭窄程度
    tabChangeNarrow(part, val) {
      part.plaque_strait = val
      part.straitness = straitnessTypes[val] || 0
      // 更新
      this.resultChange()
    },
    // 输入切换狭窄程度
    straitChangeNarrow(part, val) {
      // part.straitness = val
      const plaqueStrait = Math.floor(part.straitness / 25)
      part.plaque_strait = val === 0 ? -1 : plaqueStrait
      // 更新
      // console.log(part)
      this.resultChange()
    },
    // 输入改变狭窄程度
    inputChangeNarrow(part) {
      if (part.strait_factor > 100) {
        part.strait_factor = 100
      }
      if (part.strait_factor < 1) {
        part.strait_factor = 1
      }
      part.strait_factor = parseInt(part.strait_factor)

      part.strait_percent = part.strait_factor / 100

      part.plaque_strait = Math.floor(part.strait_percent / 0.25)

      // 更新
      this.resultChange()
    },
    // 获取最大狭窄程度
    getMaxNarrow() {
      let max = -1
      this.narrowResult.forEach((item) => {
        const list = item.list
          .filter((listItem) => listItem.checked && listItem.isInArtery)
          .map((listItem) => listItem.plaque_strait)
        const listMax = Math.max(...list)
        item.listMax = listMax
        max = Math.max(listMax, max)
      })
      this.maxNarrow = max
    },
    activeNarrow(key, artery) {
      if (this.isArteryEdit) {
        return
      }
      const rawArtery = this.rawArteryList.find((item) => item.id === artery)
      if (!rawArtery) {
        return
      }

      this.narrowActive = key
      this.$store.dispatch('artery/setActive', rawArtery)
      arteryBus.emit('setNarrowActive', key)
    },
    activeNarrowPart(item, part) {
      for (const narrow of this.narrowResult) {
        const listArray = narrow.list
        for (const listItem of listArray) {
          if (part.section === listItem.section) {
            listItem.isPartFold = !listItem.isPartFold
            continue
          }
          listItem.isPartFold = false
        }
      }
      const arteryId = item.id
      if (this.isArteryEdit) return
      const rawArtery = this.rawArteryList.find((item) => item.id === arteryId)
      if (!rawArtery) {
        this.$store.dispatch('artery/setActive', '')
        arteryBus.emit('setNarrowActive', '')
        return
      }
      this.listCheck = true
      this.narrowActive = part.key
      this.$store.dispatch('artery/setActive', rawArtery)
      arteryBus.emit('setNarrowActive', part.key)
    },
    activeNarrowBySection(section) {
      for (const narrow of this.narrowResult) {
        const listArray = narrow.list
        for (const listItem of listArray) {
          if (section === listItem.section) {
            listItem.isPartFold = true
            continue
          }
          listItem.isPartFold = false
        }
      }
    },
    // 切换血管
    changeArtery(artery) {
      this.$emit('changeArtery', artery)
    },
    // 设置中心
    setDominant(key) {
      if ('dominant_type' in this.orginResult) {
        this.orginResult['dominant_type'] = Number(key)
      }
    },
    // 是否显示优势
    isShowOrgin(key = '') {
      return isShowOrgin(this.orginResult, key)
    },
    // 过滤列表
    filterList(item) {
      return item.list.filter((listItem) => listItem.isInArtery)
    },
    // 获取ai结果
    async getAiResult() {
      if (!this.resultPath) {
        return
      }
      const result = await getResult(`${this.workingPath}/${this.resultPath}`)
      if (!result) {
        return
      }
      this.transNarrowResult(result)
      this.transResult(result)
    },
    // 保存resultPath
    async saveResult() {
      if (!this.resultPath) return
      try {
        const report = {}
        for (const item of this.narrowResult) {
          if (report[item.artery] === undefined) {
            report[item.artery] = {}
          }
          const arteryReport = report[item.artery]
          const listArray = item.list
          for (const list of listArray) {
            if (arteryReport[list.location] === undefined) {
              arteryReport[list.location] = {}
            }
            arteryReport[list.location] = {
              vessel_id: list.vessel_id,
              plaque: list.plaque,
              straitness: list.straitness,
              bridge: list.bridge,
              stent: list.stent,
              checked: list.checked,
              bridge_thickness: list.bridge_thickness,
              artery_length: list.artery_length,
              stent_length: list.stent_length
            }
          }
        }
        const saveData = await saveResult(
          `${this.workingPath}/${this.resultPath}`,
          {
            origin: this.orginResult,
            narrow: this.narrowResultBak,
            report: report
          }
        )
        this.$message.success('保存成功')
        // this.transNarrowResult(JSON.parse(saveData.data))
        // this.transResult(JSON.parse(saveData.data))
      } catch (error) {
        console.log(error)
        this.$message.error('保存失败')
      }
    },
    // 转换结果
    transNarrowResult(aiResult) {
      const narrowResult = []
      let narrowObj = aiResult.narrow
      let max = -1 // 最大狭窄
      for (const key in narrowObj) {
        if (Object.hasOwnProperty.call(narrowObj, key)) {
          const rawArtery = this.rawArteryList.find(
            (item) => item.id === key && !isUnkown(item.name)
          )
          if (!rawArtery) {
            continue
          }
          const name = rawArtery.name
          const rawArteryName = arteryName[name]
          const list = []
          let listMax = -1
          let isShowNarrow = false
          if (narrowObj[key] && narrowObj[key].length) {
            const len = narrowObj[key].length
            for (let i = 0; i < len; i++) {
              const item = narrowObj[key][i]
              const location = item.location || name
              max = Math.max(item.plaque_strait || -1, max)
              // 是否在血管内
              const isInArtery =
                location.toUpperCase().indexOf(name.toUpperCase()) > -1
              // 是否展示该血管的狭窄
              if (isInArtery && !isShowNarrow) {
                isShowNarrow = true
              }
              const pushItem = {
                ...item,
                location,
                isInArtery,
                checked: true,
                section: item.location ? `${name}_${item.location}` : key,
                arteryId: rawArtery.id,
                key: `narrow-${name}-${i}`,
                cnName: arteryName[location] || name,
                sectionName: arterySectionName[location] || '',
                arteryName: rawArteryName,
                sort: arteryNameKeys.indexOf(location)
              }
              if (isInArtery) {
                listMax = Math.max(item.plaque_strait || -1, listMax)
              }
              list.push(pushItem)
            }
            list.sort((a, b) => a.sort - b.sort)
          }

          const mainIndex = reportMainVessels.indexOf(name)
          narrowResult.push({
            list,
            listMax,
            isShowNarrow,
            id: rawArtery.id,
            artery: name,
            isFold: true,
            cnName: rawArteryName,
            sort: mainIndex > -1 ? mainIndex : reportMainVessels.length
          })
        }
      }
      // 回收
      narrowObj = null

      this.narrowVesselResult = narrowResult.sort((a, b) => a.sort - b.sort)
      // this.orginResult = aiResult.origin || {}
      // this.maxNarrow = max
      this.resultChange()
    },

    // 转换结果
    transResult(aiResult) {
      const narrowResult = []
      const reportResult = this.resolveAiResult(aiResult.report)
      let maxNarrow = -1
      for (const vesselId in reportResult) {
        const rawArtery = this.findRawArtery(vesselId)
        if (!rawArtery) continue
        const name = rawArtery.name
        const rawArteryName = arteryName[name]
        const list = []
        let listMax = -1
        let isShowNarrow = false
        let isPartFoldOnly = false
        let partIndex = 0
        for (const item of reportResult[vesselId]) {
          const location = item.location || name
          maxNarrow = Math.max(item.plaque_strait || -1, maxNarrow)
          const isInArtery = true
          // 是否展示该血管的狭窄
          if (isInArtery && !isShowNarrow) {
            isShowNarrow = true
          }
          if (!isPartFoldOnly) {
            if (this.activeArtery === item.vessel_id) {
              isPartFoldOnly = true
            }
          }
          const pushItem = {
            location,
            isInArtery,
            checked: true,
            isPartFold:
              isPartFoldOnly && partIndex++ === 0 ? isPartFoldOnly : false,
            section: item.location ? `${name}_${item.location}` : vesselId,
            arteryId: rawArtery.id,
            key: `narrow-${name}-${item.id}`,
            cnName: arteryName[location] || name,
            sectionName: arterySectionName[location] || '',
            arteryName: rawArteryName,
            sort: arteryNameKeys.indexOf(location),
            ...item
          }
          if (isInArtery) {
            listMax = Math.max(item.plaque_strait || -1, listMax)
          }
          list.push(pushItem)
        }
        list.sort((a, b) => a.sort - b.sort)
        const mainIndex = reportMainVessels.indexOf(name)
        narrowResult.push({
          list,
          listMax,
          isShowNarrow,
          id: rawArtery.id,
          artery: name,
          isFold: true,
          cnName: rawArteryName,
          sort: mainIndex > -1 ? mainIndex : reportMainVessels.length
        })
      }
      // 回收
      this.narrowResult = narrowResult.sort((a, b) => a.sort - b.sort)
      this.orginResult = aiResult.origin || {}
      this.narrowResultBak = aiResult.narrow || {}
      this.maxNarrow = maxNarrow
      this.resultChange()
    },
    resolveAiResult(aiResultReport) {
      const reportResult = {}
      let idIndex = 0
      for (const key in aiResultReport) {
        const placeObject = aiResultReport[key] // 第一层
        for (const place in placeObject) {
          const placeItem = placeObject[place] // 第二层
          let vesselId = placeItem.vessel_id
          if (place === 'LM') {
            vesselId = `${vesselId}_LM`
          }
          if (reportResult[vesselId] === undefined) {
            reportResult[vesselId] = []
          }
          const plaqueStrait = Math.floor(placeItem.straitness / 25)
          reportResult[vesselId].push({
            ...placeItem,
            vessel_id: vesselId,
            id: idIndex++,
            location: place,
            plaque_strait: placeItem.straitness === 0 ? -1 : plaqueStrait
          })
        }
      }
      return reportResult
    },
    findRawArtery(key) {
      if (key.indexOf('LM') !== -1) {
        return { name: 'LM' }
      }
      return this.rawArteryList.find((item) => {
        return item.id === key && !isUnkown(item.name)
      })
    },
    plaqueChange(part, value) {
      part.plaque = value
      this.resultChange()
    },
    varyChange(part, value) {
      for (const key in value) {
        part[key] = value[key]
      }
      this.resultChange()
    },
    // 创建头部显示
    makeSummarize(part) {
      const color = [
        '#B2BACD',
        '#fff8bf',
        '#ffe18a',
        '#ffd255',
        '#ff915f',
        '#d65b5b'
      ]
      let summarize = ''
      const narrowName = narrowObj[part.plaque_strait]
      const plaqueTypes = []
      for (const key in part.plaque) {
        if (part.plaque[key]) {
          plaqueTypes.push(key)
        }
      }
      if (plaqueTypes.length === 0) {
        if (part.bridge) {
          summarize = '可见心肌桥'
        }
        if (part.stent) {
          summarize = '可见支架'
        }
      }
      if (summarize) {
        return `<span style="color:#f4721b">${summarize}</span>`
      }
      return `<span style="color:${color[part.plaque_strait + 1]}">${narrowName || ''
        }</span>`
    }
  }
}
</script>
