import CryptoJS from 'crypto-js'
import { useRouter } from 'vue-router'

function getReplaceParams($router, paramsName) {
  const replaceName = qrCodeParamsReplace[paramsName]
  const replaceValue = $router.currentRoute.value.query[replaceName] || ''
  return decryptMessage(decodeURIComponent(replaceValue))
}

// 路径函数加密
const key = 'gadasgasdasgwqewr'

export function encryptMessage(message) {
  const encrypted = CryptoJS.AES.encrypt(message, key).toString()
  return encrypted
}

export function decryptMessage(message) {
  const decrypted = CryptoJS.AES.decrypt(message, key)
  const decryptedText = decrypted.toString(CryptoJS.enc.Utf8)
  return decryptedText
}
export const qrCodeParamsReplace = {
  hospitalId: 'param1',
  hospitalName: 'param2',
  patientId: 'param3',
  seriesId: 'param4',
  imageCount: 'param5',
  productType: 'param6'
}

export function getParamsObject() {
  const $router = useRouter()
  const metaDataId = String($router?.currentRoute.value.query.metaDataId || '')
  const patientId = String(
    $router?.currentRoute?.value.query.patientId ||
      getReplaceParams($router, 'patientId') ||
      ''
  )
  const seriesId =
    $router.currentRoute.value.query.seriesId ||
    getReplaceParams($router, 'seriesId') ||
    ''
  const hospitalId = String(
    $router.currentRoute.value.query.hospitalId ||
      getReplaceParams($router, 'hospitalId') ||
      ''
  )
  const productName = String(
    $router.currentRoute.value.query.productType ||
      $router.currentRoute.value.query.part ||
      getReplaceParams($router, 'productType') ||
      'CoronaryArtery'
  )
  const imageCount =
    $router.currentRoute.value.query.imageCount ||
    getReplaceParams($router, 'imageCount') ||
    ''
  const hospitalName =
    $router.currentRoute.value.query.hospitalName ||
    getReplaceParams($router, 'hospitalName') ||
    ''
  const reorderSort = String($router.currentRoute.value.query.reorderSort || '')
  const userSysId = String($router.currentRoute.value.query.userSysId || '')
  const userSysName = String($router.currentRoute.value.query.userSysName || '')
  const deptId = String($router.currentRoute.value.query.deptId || '')
  const deptName = String($router.currentRoute.value.query.deptName || '')
  const userName = String($router.currentRoute.value.query.userName || '')
  const patId = String($router.currentRoute.value.query.patId || '')
  const itemId = String($router.currentRoute.value.query.itemId || '')
  const cooperate = String($router.currentRoute.value.query.cooperate || '')
  const demonstrate = String($router.currentRoute.value.query.demonstrate || '')
  return {
    metaDataId,
    patientId,
    seriesId,
    hospitalId,
    productName,
    imageCount,
    hospitalName,
    reorderSort,
    userSysId,
    userSysName,
    deptId,
    deptName,
    userName,
    patId,
    itemId,
    cooperate,
    demonstrate
  }
}
