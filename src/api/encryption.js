/*
 * 加密相关的函数
 * duan-jy
 */

import CryptoJS from 'crypto-js'
import { KJUR, hextob64 } from 'jsrsasign'
// import { publicAppId, publicAppSecret } from '../utils/generalParams'

/**
 * 根据当前Id获取后续的数据
 * @param url
 * @param appId
 * @param appSecret
 * @returns
 */
export function getCompleteUrl(url, appId = 'API-340000', appSecret = '') {
  if (appId === '' || appSecret === '') return url
  const expirationTime = Math.floor(Date.now() / 100)
  const keyName = getKeyNameSuffix(url, `${appId}/${generateRandomString(8)}`)
  const urlNoSign = `${url}${
    url.includes('?') ? '&' : '?'
  }X-Date=${expirationTime}&X-SignedHeaders=host&X-Expires=600&X-Credential=${encodeURIComponent(
    keyName
  )}`
  const signature = CryptoJS.HmacSHA256(
    urlNoSign,
    CryptoJS.enc.Utf8.parse(appSecret)
  )
  const sign = CryptoJS.enc.Base64.stringify(signature)
  const signUrl = `${urlNoSign}&X-Signature=${encodeURIComponent(sign)}`
  return signUrl
}

// 测试
// console.log(getCompleteUrl('https://surgicalplan.msunhis.com/admin/api/diagnose/downloadModel?filePath=/data/AI_Working/ChestSurgicalPlan/longkoushirenminyiyuan/C20241205138_1.3.12.2.1107.5.1.4.74269.30000024120408072405000027200/artery_mask/centerline/origin_point.json&hospitalId=10284001', 'API-340000', 'MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCzyFq2I7ZrM1KK+sQh23o1ZDjtrT6YxotMWGjXaqx+Pp7LVM7eM+sQDBbGUxnZCjEQzceqsAefdNnKEpStY6FPrmLUEcBY+YRv16hF61m6bp65Zh5TJiA7yifct8+bRvXbxasKyKRzJWlX6iVaYpK5E4J6MscUEhG8wvIRhmJwdeSJicXAPT3pKptAXcc1iP/KqLE26RlMaKkNRnSEaBSP5iV0vae8E/gJGLHhVkdyFwjmTtrx234DBtNBBrnRzgWjzH/uqIlCFONHTqnIjeXvDo9oyiT+Zhm+TUmi1YBSJOvKf0uMOnZAliIOCb/p2RLs4QMli5FlhPdjaITBdXXPAgMBAAECggEAD8SM1cVLeWerbIs/Pdu/gkStGR9k/ZMJ4mMtcszYaxjrGXJxoE7VmRDOXVkqS7BXcR3AAZ1MIqgyqV5SBUqj+iNiNJWH+39XpiC4EZKclu7SMF8fkSbA+scP3vPztK7KrADp4vMja5vs4Z9XsYkys1Vdz+gTMMeMhoDJW7ZTFoGcUjZ+p9Om6Tw+z+ln2Vi5+0LANEUGmxQVavci1ZPbXItutmAwx66gVubcil+PFQfQAORLkOadxbjkexzNc8fkEnTG3veF93++rYis1vh73h3MK0LhCX7DxysQEVHdYsHzN6NWh57MmdD+YDb4jb8eQicRU+AbBclYTzLVHlPnoQKBgQDq51DqLDsl6Bucn1JP8cmjbap3uPYszegXmZLAhq6zfc9VdNCP28+lmxGi5sMA4W/BkuM4plbMJX5ytujoh/UzULo3402KV5832+tlAMe5nyq7eHP9cw4fX3R3bCah95ZeXn/OEJA7tde5hrH+wDcc2gRl+YizVa/TLAII5kP+IQKBgQDD7b+6p5rEs2iThqe89bfPczUKAA1QTJbFQaJnkDN8vxst29Y9A1cckrxaYCqgbgsOO36j5OLAV8uqPIA2Y/ZNqnvly8g7jajkz+YWPZXCMiBy/81tZPg6GTScxM6OnuzwQJIsTjVLD3ef2VXOIHoWDH8CYfMfkroNu0+l/tKV7wKBgGcuUiF6akS9Tpuec/Z/u1VZD37lNOT7UQ5Eu+xrfIOFKLRdylrWb8BLfBS1DkTtwTwi/EHe9tNXSNK0u1uglLkEpbd01ZOF538Oz7ge/pvvaULNpw1WI4buU+c9Dz8n1NoA4lyuc9x2hJqOqtK+tbaroTD1yfEUG1ZDx2UHWChhAoGAUYj6Feoz3RGwPlx2J4u2D42pD91PrRACWlpjBGgdFRfObroioMdoFAr4eT+13YeN8EFQBVJ2Doc6yUBeNsRItq9w2gOA80+Tbo0Z+j1suiD0IgdT7Ods6XidzXOVZgK7JYwpiGiPgwoPxSTDsYEQbWaL4Gj0rTn5VUeS8MhnyF8CgYAKUl9Qvv8m6weBdJF1V4BJj8LeiZlZY+09u5TtFB5LRlCIzLj5pRDiCNkoaQsF4gw/30tDhxERRLTg/iK4sALPiWiTdja3uJTWPF/lDpnCBOSPpal3Ye4nX6Tbf3H7tFF//wQ7/IP4ec2ktwc/9jP8YLEx6EPJyUn1/ByewFpK1Q=='))

/**
 * 拼接url
 * @param url
 * @param keyName
 * @returns
 */
function getKeyNameSuffix(url, keyName) {
  try {
    const urlObj = new URL(url)
    if (String(urlObj.port) !== '') {
      return `${keyName}/${urlObj.port}`
    }
    return keyName
  } catch (error) {
    return null // 如果URL无效，返回null
  }
}

/**
 * 生成随机数
 * @param length
 * @returns
 */
export function generateRandomString(length) {
  const str = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    const number = Math.floor(Math.random() * str.length)
    result += str.charAt(number)
  }
  return result
}

/**
 * 凯撒加解密函数
 * @param str
 * @param k
 * @returns
 */
export function caesarCipher(str, k = 10) {
  if (!str) return ''
  let cipher = ''
  for (let i = 0; i < str.length; i++) {
    let c = str.charAt(i)
    if (c >= 'a' && c <= 'z') {
      c = String.fromCharCode(
        ((((c.charCodeAt(0) - 'a'.charCodeAt(0) + k) % 26) + 26) % 26) +
          'a'.charCodeAt(0)
      )
    } else if (c >= 'A' && c <= 'Z') {
      c = String.fromCharCode(
        ((((c.charCodeAt(0) - 'A'.charCodeAt(0) + k) % 26) + 26) % 26) +
          'A'.charCodeAt(0)
      )
    } else if (c >= '0' && c <= '9') {
      c = String.fromCharCode(
        ((((c.charCodeAt(0) - '0'.charCodeAt(0) + k) % 10) + 10) % 10) +
          '0'.charCodeAt(0)
      )
    }
    cipher += c
  }
  return cipher
}

/**
 * 加密函数
 * @param source
 * @returns
 */
export function encryptByPublicKey(source) {
  if (!source) return null

  const strKey = 'Passw0rd' // 密钥
  const iv = CryptoJS.enc.Utf8.parse(strKey) // 初始化向量
  const key = CryptoJS.enc.Utf8.parse(strKey) // 密钥

  // 加密
  const encrypted = CryptoJS.DES.encrypt(source, key, {
    mode: CryptoJS.mode.CBC, // CBC 模式
    padding: CryptoJS.pad.Pkcs7, // PKCS5 等效为 Pkcs7
    iv: iv
  })
  // 转为大写十六进制
  return encrypted.ciphertext.toString(CryptoJS.enc.Hex).toUpperCase()
}

/**
 * 使用 SHA256WithRSA 签名生成签名字符串
 * @param preStr 待签名的字符串
 * @param appSecret Base64 编码的私钥
 * @returns Base64 编码的签名字符串
 */
export function getSecretSign(appSecret, preStr) {
  try {
    // 将 Base64 私钥解码为 PEM 格式
    const privateKeyPem = `-----BEGIN PRIVATE KEY-----\n${appSecret}\n-----END PRIVATE KEY-----`
    // 创建签名器
    const sig = new KJUR.crypto.Signature({ alg: 'SHA256withRSA' })
    sig.init(privateKeyPem) // 初始化私钥
    sig.updateString(preStr) // 输入待签名的字符串
    // 生成签名，并转换为 Base64 格式
    const hexSign = sig.sign() // 签名结果是十六进制
    const base64Sign = hextob64(hexSign) // 转换为 Base64
    return base64Sign
  } catch (e) {
    console.log(e)
    return ''
  }
}

/**
 * 使用 MD5 加密字符串
 * @param {string} text - 待加密的字符串
 * @returns {string} - MD5 哈希值
 */
export function md5Encrypt(text) {
  return CryptoJS.MD5(text).toString()
}

// 路径加密秘钥
const routerSecret = 'gadasgasdasgwqewr'

/**
 * AES加密
 * @param message
 * @returns
 */
export function encryptMessage(message) {
  const encrypted = CryptoJS.AES.encrypt(message, routerSecret).toString()
  return encrypted
}

/**
 * AES解密
 * @param message
 * @returns
 */
export function decryptMessage(message) {
  const decrypted = CryptoJS.AES.decrypt(message, routerSecret)
  const decryptedText = decrypted.toString(CryptoJS.enc.Utf8)
  return decryptedText
}
/**
 * 根据数据来获取请求体
 * @param data
 * @returns
 */
export const getRequestHeaders = (data, publicAppId, publicAppSecret) => {
  const randomData = generateRandomString(10)
  const timestamp = Date.now()
  return {
    appId: publicAppId, // 随机数
    nonce: randomData, // 随机数
    timestamp, // 时间戳
    sign: getSecretSign(publicAppSecret, md5Encrypt(JSON.stringify(data)))
  }
}
