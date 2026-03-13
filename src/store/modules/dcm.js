import storage from '@/utils/storage'

import { PROJECT_KEY } from '@/utils/source'

const state = {
  scaleView: '',
  isVertical: false, //  是否竖屏 true 竖屏 false 横屏
  activeToolsName: 'Pan', // 工具
  pushImages: [], // 推送的图像
  printImages: [] // 打印的图像
}

const mutations = {
  SET_SCALEVIEW: (state, view) => {
    state.scaleView = view
  },
  SET_VERTICAL: (state, isVertical) => {
    state.isVertical = isVertical
  },
  SET_TOOLSNAME: (state, toolsName) => {
    state.activeToolsName = toolsName
  },
  SET_PUSHIMAGES: (state, list) => {
    state.pushImages = list
  },
  SET_PRINTIMAGES: (state, list) => {
    state.printImages = list
  }
}

const actions = {
  setScaleView({ commit }, view) {
    commit('SET_SCALEVIEW', view)
  },
  // 设置横竖屏
  setVertical({ commit }, isVertical) {
    storage.save(`${PROJECT_KEY}_VERTICAL`, isVertical ? '1' : '0')
    commit('SET_VERTICAL', isVertical)
  },
  setActiveTools({ commit }, toolsName) {
    commit('SET_TOOLSNAME', toolsName)
  },
  // 设置state
  initState({ commit }, initList) {
    for (const item of initList) {
      const { type, data } = item
      commit(type, data)
    }
  },
  setPushImages({ commit }, list) {
    commit('SET_PUSHIMAGES', list)
  },
  setPrintImages({ commit }, list) {
    commit('SET_PRINTIMAGES', list)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
