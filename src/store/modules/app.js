import { getAppConfig } from "@/api";

const state = {
  indexPramas: null,
  appconfig: {},
  dicomMetaData: [],
};

const mutations = {
  SET_INDEXPRAMAS: (state, data) => {
    state.indexPramas = data;
  },
  SET_APPCONFIG: (state, data) => {
    state.appconfig = data;
  },
  SET_DICOMMETADATA: (state, data) => {
    state.dicomMetaData = data;
  },
};

const actions = {
  setDicomMetaData({ commit }, data) {
    console.log("commit", data);
    commit("SET_DICOMMETADATA", data);
  },
  setIndexPramas({ commit }, data) {
    commit("SET_INDEXPRAMAS", data);
  },
  async getAppConfig({ commit }) {
    try {
      const res = await getAppConfig();
      commit("SET_APPCONFIG", res.data || {});
    } catch (error) {
      commit("SET_APPCONFIG", {});
    }
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
