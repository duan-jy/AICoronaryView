import { isUnkown, getArteryList } from '@/utils/artery'

import cloneDeep from 'lodash/cloneDeep'

import { reportVesselsTrees, reportMainVessels } from '@/utils/source'

import { clearCache } from '@/utils/cornerstone'

const state = {
  rawList: [], // 原始的血管列表
  nowList: [], // 现在的血管列表
  activeArtery: '', // 聚焦血管
  isActvieMark: false, // 聚焦血管
  activeSprDcmName: '', // 当前SPR DCM的名称
  activeSprAnglesDeg: '', // 当前SPR 角度
  activeProbeIndex: '0' // 当前Probe 选中的index值
}

const mutations = {
  SET_NOWLIST(state, list) {
    state.nowList = list
  },
  SET_RAWLIST(state, list) {
    state.rawList = list
  },
  SET_ACTIVE(state, id) {
    state.activeArtery = id
  },
  SET_BYINDEX(state, { index, data }) {
    state.nowList[index] = data
  },
  SET_SPRDCMNAME(state, name) {
    state.activeSprDcmName = name
  },
  SET_ISACTIVEMARK(state, mark) {
    state.isActvieMark = mark
  },
  SET_RPOBEINDEX(state, index) {
    state.activeProbeIndex = String(index)
  },
  SET_SPRANGLESDEG(state, deg) {
    state.activeSprAnglesDeg = String(deg)
  }
}

const actions = {
  setActive({ commit }, item) {
    clearCache()
    commit('SET_ACTIVE', item.id)
  },
  // 取消编辑
  cancelEdit({ commit, state }) {
    commit('SET_NOWLIST', [].concat(state.rawList))
  },
  selectChange({ commit, state }, { val, item }) {
    const { nowList } = state

    let list = cloneDeep(nowList)
    const { name } = item
    const reg = /^UNKNOW(N?)(\d+)$/

    const unkownList = list
      .filter((item) => isUnkown(item.name))
      .map((item) => {
        return item.name.toUpperCase().match(reg)[2]
      })

    // 获取当前的unknown最大值，好为后边命名
    let unkownMax = Math.max(...unkownList)
    const nameIndex = list.findIndex((item) => item.name === name)
    if (val === 'UNKOWN') {
      unkownMax++
      val = `unknown${unkownMax}`
    } else {
      const valIndex = list.findIndex((item) => item.name === val)
      if (valIndex > -1) {
        unkownMax++
        const newName = `unknown${unkownMax}`
        list[valIndex].name = newName
        // RI 修改成其他分支需要切换分支,但是其他分支的同名的不需要切换分支
        if (val !== 'RI') {
          list[valIndex].tree = reportVesselsTrees[val]
        }
        list[valIndex].sort = reportMainVessels.length
      }
      list[nameIndex].tree = reportVesselsTrees[val]
    }
    list[nameIndex].name = val
    // 排序
    const mainIndex = reportMainVessels.indexOf(val)
    list[nameIndex].sort = mainIndex > -1 ? mainIndex : reportMainVessels.length
    // }
    commit('SET_NOWLIST', list)
    list = null
  },
  setArterysByIndex({ commit }, { index, data }) {
    commit('SET_BYINDEX', { index, data })
  },
  setActvieMark({ commit }, name) {
    commit('SET_ISACTIVEMARK', name)
  },
  setSprDcmName({ commit }, name) {
    commit('SET_SPRDCMNAME', name)
  },
  setSprAnglesDeg({ commit }, deg) {
    commit('SET_SPRANGLESDEG', deg)
  },
  setProbeIndex({ commit }, index) {
    commit('SET_RPOBEINDEX', index)
  },
  async initState({ commit, dispatch }, { workingPath, vesselNames }) {
    return new Promise(async(resolve, reject) => {
      try {
        const arteryList = await getArteryList(workingPath, vesselNames)
        commit('SET_RAWLIST', arteryList)
        commit('SET_NOWLIST', cloneDeep(arteryList))
        // 设置选中的血管
        dispatch('setActive', arteryList[0])
        resolve()
      } catch (error) {
        reject()
      }
    })
  },
  resetState({ commit }) {
    commit('SET_RAWLIST', [])
    commit('SET_NOWLIST', [])
    commit('SET_ACTIVE', '')
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
