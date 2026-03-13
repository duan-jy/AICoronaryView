import request from "@/utils/request";
import {
  getRequestHeaders,
  caesarCipher,
  getCompleteUrl,
  encryptByPublicKey,
} from "./encryption";
import { baseURL, headVerifyKey, getPrintUrl, getRisUrl } from "@/utils/index";

import { ElMessage } from "element-plus";

import store from "@/store"; // 引入 vuex 实例

let hospitalIdData = "";
let publicAppId = "";
let publicAppSecret = "";
let publicBucketName = "";
/**
 * 根据患者信息获取序列信息
 * @param {*} patientId
 * @returns
 */
async function getDataByPatientId(patientId, seriesId, hospitalId) {
  const dicomMetaData = [];
  const response = await request({
    url: "studySeries/getSeriesInfAndTaskByPatientId",
    method: "GET",
    params: {
      patientId: patientId,
      hospitalId: hospitalId || hospitalIdData,
      productNames: "CoronaryArtery",
    },
  });
  for (const item of response?.data || []) {
    const successLogs = item.taskLogs.filter((logItem) => {
      return logItem.taskStatus === "3";
    });
    if (
      !!successLogs.length &&
      item.productNames.indexOf("CoronaryArtery") !== -1
    ) {
      const imageId = await fileLoad(
        "",
        "dcm",
        `${baseURL()}/studySeries/downloadDicomFile?hospitalId=${hospitalId || hospitalIdData
        }&filePath=${item.seriesUid}_${item.instances[0].instanceUid}`
      );
      dicomMetaData.push({
        ...item,
        imageIds: item.instances,
        sideImageId: imageId,
        active: item.seriesUid === seriesId,
        sideImageLoading: true,
      });
    }
    if (item.seriesUid !== seriesId) continue;
    for (const log of item.taskLogs) {
      if (log.taskStatus !== "3") continue;
      if (!publicBucketName) {
        publicBucketName = log.bucketName;
      }
    }
  }
  return dicomMetaData;
}

export function getImageWadouri(seriesUid, instance, hospitalId) {
  return `wadouri:`;
}
/**
 * 获取配置信息
 * @param {*} hospitalId
 * @returns
 */
export async function getApiConfig(hospitalId = hospitalIdData) {
  const res = await request({
    url: "apiConfig/getApiConfigByHospitalId",
    method: "GET",
    moduleName: "获取配置信息",
    dataNode: "界面初始化配置信息",
    params: {
      hospitalId: hospitalId,
    },
  });
  const hour = new Date().getHours() + 1;
  publicAppId = caesarCipher(res?.data?.appId, -hour);
  publicAppSecret = caesarCipher(res?.data?.appSecret, -hour);
  hospitalIdData = res?.data?.hospitalId || hospitalIdData;
  return res;
}

/**
 * 数据埋点：功能点击日志相关接口
 * @param data
 * @returns
 */
// export function funClickLog(patientId) {
//   return request({
//     url: "/funClickLog",
//     method: "post",
//     data: {
//       functionName: "浏览冠脉产品",
//       functionCode: "browseCoronary",
//       deptName: "未获取",
//       deptId: "未获取",
//       hospitalId: "10353001",
//       userId: "未获取",
//       userName: "未获取",
//       patientId,
//       productName: "CoronaryArtery",
//     },
//   });
// }

/** 获取所有数据
 *
 * @param {*} patientId
 * @param {*} seriesId
 * @returns
 */
export async function getAllData(
  patientId,
  seriesId,
  imageCount,
  hospitalId,
  hospitalName
) {
  hospitalIdData = hospitalId;
  await getApiConfig();
  const dicomMetaData = await getDataByPatientId(patientId, seriesId);
  store.dispatch("app/setDicomMetaData", dicomMetaData);
  const data = {
    patientId,
    seriesUid: seriesId,
    imageCount,
    productName: "CoronaryArtery",
    hospitalId,
    hospitalName,
  };
  return request({
    url: "/coronary/data",
    method: "post",
    data: data,
    headers: {
      ...getRequestHeaders(data, publicAppId, publicAppSecret),
    },
  });
}

function fileLoad(path, type, url = "") {
  let head = "";
  if (type === "dcm") {
    head = "wadouri:";
  }
  const preRequestUrl =
    url ||
    `${baseURL()}/diagnose/downloadModel?${publicBucketName ? `bucketName=${publicBucketName}&` : ""
    }filePath=${path}&hospitalId=${hospitalIdData}`;
  const finalRequestUrl = getCompleteUrl(
    preRequestUrl,
    publicAppId,
    publicAppSecret
  );
  return `${head}${finalRequestUrl}`;
}

export function dcmload(dcmpath, isOri) {
  if (isOri) {
    return fileLoad(dcmpath.replace(".dcm", ".jpg"));
  }
  return fileLoad(dcmpath, "dcm");
  // if (isOri) {
  //   return fileLoad(dcmpath, 'dcm')
  // }
  // return fileLoad(dcmpath.replace('.dcm', '.jpg'))
}

export function niiload(niipath) {
  return fileLoad(niipath, "nii");
}

export function stlload(stlpath) {
  return fileLoad(stlpath, "stl");
}

export function imgload(imgpath) {
  return fileLoad(imgpath, "jpg");
}

export function addLabel(data) {
  return request({
    url: "/coronary/addlabel",
    method: "POST",
    data,
    headers: {
      "Content-Type": "application/json",
      ...getRequestHeaders(data, publicAppId, publicAppSecret),
    },
  });
}

export function getLabelList(params) {
  return request({
    url: "/coronary/labelList",
    method: "get",
    params,
  });
}

export function getJsonData(jsonpath) {
  try {
    const preRequestUrl = `${baseURL()}/diagnose/downloadModel?${publicBucketName ? `bucketName=${publicBucketName}&` : ""
      }filePath=${jsonpath}&hospitalId=${hospitalIdData}`;
    const finalRequestUrl = getCompleteUrl(
      preRequestUrl,
      publicAppId,
      publicAppSecret
    );
    return request({ url: finalRequestUrl, method: "get" });
  } catch (e) {
    console.log(e);
  }
  // return request({
  //   url: '/diagnose/downloadModel',
  //   method: 'get',
  //   params: {
  //     filePath: `${jsonpath}`,
  //     hospitalId: hospitalIdData
  //   }
  // })
}

// 获取推送服务器列表
export function getPushServerList(hospitalId) {
  return request({
    url: "/server/push",
    method: "get",
    params: {
      hospitalId: hospitalId,
    },
  });
}

// 推送图像到服务器
export function pushDcmsToServer(data) {
  return request({
    url: "/coronary/push",
    method: "post",
    data,
    headers: {
      "Content-Type": "application/json",
      ...getRequestHeaders(data, publicAppId, publicAppSecret),
    },
  });
}

// 获取患者列表
export function getPatientList(data) {
  return request({
    url: "/patient/list",
    method: "post",
    data,
    headers: {
      "Content-Type": "application/json",
      ...getRequestHeaders(data, publicAppId, publicAppSecret),
    },
  });
}

export function getResult(jsonpath) {
  // return request({
  //   url: '/coronary/result/get',
  //   method: 'post',
  //   data: {
  //     workingPath: `${jsonpath}`
  //   }
  // })
  try {
    const preRequestUrl = `${baseURL()}/diagnose/downloadModel?${publicBucketName ? `bucketName=${publicBucketName}&` : ""
      }filePath=${jsonpath}&hospitalId=${hospitalIdData}`;
    const finalRequestUrl = getCompleteUrl(
      preRequestUrl,
      publicAppId,
      publicAppSecret
    );
    return request({ url: finalRequestUrl, method: "get" });
  } catch (e) {
    console.log(e);
  }
  // return request({
  //   url: '/diagnose/downloadModel',
  //   method: 'get',
  //   params: {
  //     filePath: `${jsonpath}`,
  //     hospitalId: hospitalIdData
  //   }
  // })
}

// export function saveResult(jsonpath, data) {
//   return request({
//     url: '/coronary/result/save',
//     method: 'post',
//     data: {
//       workingPath: jsonpath,
//       data
//     },
//     headers: {
//       'Content-Type': 'application/json',
//       ...getRequestHeaders(
//         {
//           workingPath: jsonpath,
//           data
//         },
//         publicAppId,
//         publicAppSecret
//       )
//     }
//   })
// }


export function printUpload(data) {
  return request({
    url: '/dcm/api/print/upload',
    // url: 'http://10.68.9.69:8108/dcm/api/print/upload',
    method: 'post',
    data
  })
}
/** 打印胶片
 *
 * @param {*} data
 * @returns
 */
export function printFilm(data) {
  return request({
    url: '/dcm/api/print/print',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      // ...getRequestHeaders(data, publicAppId, publicAppSecret)
    },
    data
  })
  // const url = getPrintUrl()
  // if (url) {

  // } else {
  //   ElMessage.error('未找到打印服务')
  //   return Promise.reject(new Error('未找到打印服务'))
  // }
}
export function saveResult(jsonpath, data) {
  const postData = {
    hospitalId: encryptByPublicKey(hospitalIdData),
    workingPath: encryptByPublicKey(jsonpath),
    data: encryptByPublicKey(JSON.stringify(data)),
  };
  return request({
    url: "/coronary/result/save",
    method: "POST",
    data: { ...postData },
    headers: { ...getRequestHeaders(postData) },
  });
}
/** 打印胶片
 *
 * @param {*} data
 * @returns
 */
// export function printFilm(data) {
//   const url = getPrintUrl();
//   if (url) {
//     return request({
//       url,
//       method: "post",
//       headers: {
//         "Content-Type": "text/plain",
//       },
//       data,
//     });
//   } else {
//     ElMessage.error("未找到打印服务");
//     return Promise.reject(new Error("未找到打印服务"));
//   }
// }

// 血管重命名
export function renameVessel(data) {
  return request({
    url: "/coronary/renameVessel",
    method: "post",
    data,
    headers: {
      "Content-Type": "application/json",
      ...getRequestHeaders(data, publicAppId, publicAppSecret),
    },
  });
}
// 组合图像
export function makeupPrinting(data) {
  return request({
    url: "/coronary/makeupPrinting",
    method: "post",
    data,
    headers: {
      "Content-Type": "application/json",
      ...getRequestHeaders(data, publicAppId, publicAppSecret),
    },
  });
}

// 标记图像
export function makeupLabel(data) {
  return request({
    url: "/coronary/makeupLabel",
    method: "post",
    data,
    headers: {
      "Content-Type": "application/json",
      ...getRequestHeaders(data, publicAppId, publicAppSecret),
    },
  });
}
// 标记图像
export function deleteMakeUp(data) {
  return request({
    url: "/coronary/deleteMakeUp",
    method: "post",
    data,
    headers: {
      "Content-Type": "application/json",
      ...getRequestHeaders(data, publicAppId, publicAppSecret),
    },
  });
}
export function makeupSynthesis(data) {
  return request({
    url: "/coronary/makeupSynthesis",
    method: "post",
    data,
    headers: {
      "Content-Type": "text/plain",
      ...getRequestHeaders(data, publicAppId, publicAppSecret),
    },
  });
}

// 获取打印机列表
export function getPrinterList(hospitalId) {
  return request({
    // url: '/coronary/getPrintServer',
    url: "/server/push",
    method: "get",
    params: {
      hospitalId: hospitalId,
    },
  });
}

// 获取config
export function getAppConfig() {
  // return request({
  //   url: '/webconfig',
  //   method: 'get'
  // })
  return {};
}

// 更新患者序列信息
export function updateSeries(patientId, seriesId, data) {
  return request({
    url: "/patient/series/update",
    method: "post",
    data: {
      patient_id: patientId,
      series_id: seriesId,
      ...data,
    },
    headers: {
      "Content-Type": "text/plain",
      ...getRequestHeaders(
        {
          patient_id: patientId,
          series_id: seriesId,
          ...data,
        },
        publicAppId,
        publicAppSecret
      ),
    },
  });
}

// 通过patiend_id 获取pacs中的患者信息
export function getPatientByRis(patient_id) {
  const url = getRisUrl();
  if (!url) {
    return Promise.resolve([]);
  }
  return request({
    url: `${url}/getStudyListForMIV`,
    params: {
      patient_id,
    },
  });
}

// 保存布局
export function saveLayout(working_path, data) {
  return request({
    url: "/layout/save",
    method: "post",
    data: {
      working_path,
      data,
    },
    headers: {
      "Content-Type": "text/plain",
      ...getRequestHeaders(
        {
          working_path,
          data,
        },
        publicAppId,
        publicAppSecret
      ),
    },
  });
}
