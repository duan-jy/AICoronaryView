const getters = {
  indexPramas: (state) => state.app.indexPramas,
  appconfig: (state) => state.app.appconfig,
  scaleView: (state) => state.dcm.scaleView,
  isVertical: (state) => state.dcm.isVertical,
  pushImages: (state) => state.dcm.pushImages,
  printImages: (state) => state.dcm.printImages,
  activeToolsName: (state) => state.dcm.activeToolsName,
  rawArteryList: (state) => state.artery.rawList,
  arteryList: (state) => state.artery.nowList,
  activeArtery: (state) => state.artery.activeArtery,
  isActvieMark: (state) => state.artery.isActvieMark,
  activeSprDcmName: (state) => state.artery.activeSprDcmName,
  activeSprAnglesDeg: (state) => state.artery.activeSprAnglesDeg,
  activeProbeIndex: (state) => state.artery.activeProbeIndex,
  dicomMetaData: (state) => state.app.dicomMetaData,
};

export default getters;
