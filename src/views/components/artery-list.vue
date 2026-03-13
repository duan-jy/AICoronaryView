<style lang="less" scoped src="@/styles/artery-list.less"></style>
<template>
  <div class="artery-list">
    <div class="edit artery-item" @click="editArtery" v-if="!isEdit">
      <span>编辑</span> <el-icon><edit /></el-icon>
    </div>
    <div class="commit artery-item" v-if="isEdit">
      <el-icon title="取消" @click.stop="cancelEdit"><close /></el-icon>
      <el-icon title="确认" @click.stop="commitArtery"><check /></el-icon>
    </div>
    <div class="vessel-list no-scrollbar">
      <ul class="list" v-for="(val, key) in renderList" :key="key">
        <li class="artery-item tree-name" v-show="isShowTree(val.list)">
          <el-icon @click="val.isFold = !val.isFold">
            <arrow-up v-show="!val.isFold" />
            <arrow-down v-show="val.isFold" />
          </el-icon>
          <span style="padding-left: 5px">{{ val.name }}</span>
        </li>
        <template v-for="(item, index) in val.list" :key="item.id">
          <li
            v-show="isShow(val.isFold, item.name)"
            :class="[
              'artery-item normal',
              activeArtery === item.id ? 'active' : ''
            ]"
            @click="changeArtery(key, item, index)"
          >
            <el-select
              v-if="item.canEdit && isEdit"
              :model-value="item.name"
              class="artery-edit-select"
              size="small"
              popper-class="artery-edit-popper"
              @change="selectChange($event, item)"
              @click="changeArtery(key, item, index)"
            >
              <el-option
                v-for="artery in renameEnbaleList(item)"
                :key="artery"
                :label="artery"
                :value="artery"
              />
            </el-select>
            <span v-else>{{ item.name }}</span>
          </li>
        </template>
      </ul>
    </div>
  </div>
</template>

<script>
import { Edit, Check, Close, ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import { ElLoading, ElMessage } from 'element-plus'

import { ref, computed, toRefs, onBeforeUnmount, watch } from 'vue'

import { useStore } from 'vuex'

import { isUnkown, getTreeByList } from '@/utils/artery'

import arteryBus from '@/utils/arteryBus'

import { renameVessel } from '@/api'

import { reportSortedBranch } from '@/utils/source'

let timeId = null

export default {
  props: {
    workingPath: {
      type: String,
      default: ''
    }
  },
  components: {
    Edit,
    Check,
    Close,
    ArrowUp,
    ArrowDown
  },
  setup(props, { emit }) {
    timeId = null
    const isEdit = ref(false)
    const renderList = ref({})

    const { workingPath } = toRefs(props)

    const store = useStore()

    const activeArtery = computed(() => store.getters.activeArtery)
    const arteryList = computed(() => store.getters.arteryList)
    const rawArteryList = computed(() => store.getters.rawArteryList)

    watch(
      arteryList,
      (newVal, oldVal) => {
        renderList.value = getTreeByList(newVal)
      },
      {
        deep: true
      }
    )

    const editArtery = () => {
      isEdit.value = !isEdit.value
      arteryBus.emit('editArtery', isEdit.value)
      emit('editArtery', isEdit.value)
    }

    const isShow = (isFold, name) => {
      return isFold ? false : isEdit.value ? true : !isUnkown(name)
    }

    const isShowTree = (list) => {
      return isEdit.value
        ? true
        : list.filter((item) => !isUnkown(item.name)).length > 0
    }

    // 修改血管
    const changeArtery = (key, item, index) => {
      // if (isEdit.value && item.canEdit && !item.isEdit) {
      // const nowList = JSON.parse(JSON.stringify(renderList.value))
      // nowList[key].list[index].isEdit = true
      // console.log(nowList)
      // if (editKey in nowList && nowList[editKey].list[editIndex]) {
      //   nowList[editKey].list[editIndex].isEdit = false
      // }
      // renderList.value = nowList
      // // 赋值给当前编辑
      // editKey = key
      // editIndex = index
      // }
      store.dispatch('artery/setActive', item)
    }

    // 选中
    const selectChange = (val, item) => {
      store.dispatch('artery/selectChange', { val, item })
    }

    // 改成固定血管分组
    const renameEnbaleList = (artery) => {
      const { name, tree } = artery
      const branchList = [].concat(reportSortedBranch[tree])

      // if (name === 'LAD') {
      //   branchList.unshift('LCX')
      // }
      // if (name === 'LCX') {
      //   branchList.unshift('LAD')
      // }
      // RI 可以替换成D1和OM1
      if (name === 'RI') {
        branchList.push('D1')
        branchList.push('OM1')
      }
      // D1或者OM1可改成RI
      if (name === 'D1' || name === 'OM1') {
        branchList.push('RI')
      }
      // 如果不是unknown的话
      if (!isUnkown(name)) {
        branchList.push('UNKOWN')
        const nameIndex = branchList.findIndex((item) => item === name)
        branchList.splice(nameIndex, 1)
      }
      return branchList
    }

    // 取消编辑
    const cancelEdit = () => {
      isEdit.value = false
      arteryBus.emit('editArtery', false)
      emit('editArtery', false)
      store.dispatch('artery/cancelEdit')
    }

    // 提交变更
    const commitArtery = () => {
      const diff = []
      for (const raw of rawArteryList.value) {
        const now = arteryList.value.find((now) => raw.id === now.id)
        if (!now) {
          continue
        }
        const isSame = now.name === raw.name
        if (!isSame) {
          diff.push({
            id: raw.id,
            new_cell_name: now.name
          })
        }
      }
      if (!diff.length) {
        ElMessage.warning('血管无修改')
        return
      }
      const loading = ElLoading.service({
        lock: true,
        text: '重新计算中...',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      timeId = setTimeout(() => {
        renameVessel({
          working_path: `${workingPath.value}`,
          data: JSON.stringify({
            change_cells: diff
          })
        })
          .then((res) => {
            loading.close()
            let message = res && res.success ? 'SUCCESS' : 'fail'
            message = message.toUpperCase()
            if (message === 'SUCCESS') {
              ElMessage.success('命名修改成功')
              window.location.reload()
              // refresh()
            } else {
              ElMessage.error('命名错误，请重新修改 ' + message)
              // window.location.reload()
            }
          })
          .catch(() => {
            loading.close()
            cancelEdit()
          })
        clearTimeout(timeId)
        timeId = null
      }, 1000)
    }

    onBeforeUnmount(() => {
      timeId = null
    })

    return {
      isEdit,
      renderList,
      activeArtery,
      isShow,
      isShowTree,
      cancelEdit,
      editArtery,
      changeArtery,
      selectChange,
      commitArtery,
      renameEnbaleList
    }
  }
}
</script>
