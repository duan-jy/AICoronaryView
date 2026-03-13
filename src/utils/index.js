import { PBKDF2, enc } from 'crypto-js'

import { name } from '../setting'

import store from '@/store'

// 获取baseURL
export function baseURL() {
  return process.env.NODE_ENV === 'development'
    ? process.env.VUE_APP_BASE_URL
    : `${window.location.protocol}//${window.location.hostname}${
      window.location.port ? ':' : ''
    }${window.location.port}/admin/api`
}

// 获取打印的地址
export function getPrintUrl() {
  let url = ''
  if (process.env.NODE_ENV === 'development') {
    url = `${process.env.VUE_APP_PRINT_URL}/PrintFile`
  } else {
    url = `${window.location.protocol}//${
      window.location.hostname
    }:${60051}/PrintFile`
  }
  return url
}

// 获取ris的地址
export function getRisUrl() {
  let url = ''
  const config = store.getters.appconfig
  if ('PACS_RIS_SERVER' in config) {
    url = config.PACS_RIS_SERVER
  }
  return url
}

export function headVerifyKey(str) {
  return PBKDF2('众阳健康-' + name, str, {
    keySize: 128 / 32,
    iterations: 100
  }).toString(enc.Hex)
}

/** databurl 转换成bolb 二进制文件流
 *
 * @param {*} dataURI
 * @returns
 */
export function dataURItoBlob(dataURI) {
  // base64 解码
  const byteString = window.atob(dataURI.split(',')[1])
  // 截出类型
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
  const ab = new ArrayBuffer(byteString.length)
  const ia = new Uint8Array(ab)
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }
  return new Blob([ab], { type: mimeString })
}

/** 创建新链接
 *
 * @param {string} href
 * @param {string} target
 */
export function openNewHref(href, target) {
  const a = document.createElement('a')
  a.setAttribute('href', href)
  a.setAttribute('target', target)
  a.setAttribute('id', 'newHrefLink')
  // 防止反复添加
  if (document.getElementById('newHrefLink')) {
    document.body.removeChild(document.getElementById('newHrefLink'))
  }
  document.body.appendChild(a)
  a.click()
}

/** 将一维数组按照固定步长，转成二维数组
 *
 * @param {Array} array
 * @param {number} step
 * @returns
 */
export function groupArr(array, step = 1) {
  let index = 0
  const newArray = []
  while (index < array.length) {
    newArray.push(array.slice(index, (index += step)))
  }
  return newArray
}

export function imageDataHRevert(source, newData) {
  for (let i = 0, h = source.height; i < h; i++) {
    for (let j = 0, w = source.width; j < w; j++) {
      newData.data[i * w * 4 + j * 4 + 0] =
        source.data[i * w * 4 + (w - j) * 4 + 0]
      newData.data[i * w * 4 + j * 4 + 1] =
        source.data[i * w * 4 + (w - j) * 4 + 1]
      newData.data[i * w * 4 + j * 4 + 2] =
        source.data[i * w * 4 + (w - j) * 4 + 2]
      newData.data[i * w * 4 + j * 4 + 3] =
        source.data[i * w * 4 + (w - j) * 4 + 3]
    }
  }
  return newData
}

export function str2pixelData(str) {
  const buf = new ArrayBuffer(str.length * 2) // 2 bytes for each char
  const bufView = new Int16Array(buf)
  let index = 0

  for (let i = 0, strLen = str.length; i < strLen; i += 2) {
    const lower = str.charCodeAt(i)
    const upper = str.charCodeAt(i + 1)

    bufView[index] = lower + (upper << 8)
    index++
  }
  return bufView
}

export function getPixelDataByBase64(base64PixelData) {
  const pixelDataAsString = window.atob(base64PixelData)
  const pixelData = str2pixelData(pixelDataAsString)

  return pixelData
}

export function getCanvasBase64(element) {
  const canvas = element.querySelector('canvas')
  const base64 = canvas.toDataURL('image/png', 1.0)
  return base64
}
