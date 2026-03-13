/** 验证数组是否大于0
 *
 * @param {*} data
 * @returns {boolean}
 */
export function isArrayGT0(data) {
  return data && data instanceof Array && data.length
}
/** 是否是ip地址
 *
 * @param {*} str
 * @returns {boolean}
 */
export function isIp(str) {
  const ipreg = /^(\d{1}|[1-9]{1}\d{1}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1}|[1-9]{1}\d{1}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1}|[1-9]{1}\d{1}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1}|[1-9]{1}\d{1}|1\d\d|2[0-4]\d|25[0-5])$/
  return ipreg.test(str)
}

/** 是否是空值
 *
 * @param {*} val
 * @returns
 */
export function isEmpty(val) {
  return val === '' || val === null || val === undefined
}

/**
 * @description 校验密码
 * @param value
 * @returns {boolean}
 */
export function isPassWord(value) {
  const reg = /^[A-Za-z0-9]{3,}$/
  return reg.test(value)
}

// 是不是对象
export const isObject = obj => Object.prototype.toString.call(obj) === '[object Object]'

/** 是不是空对象
 *
 * @param {*} obj
 * @returns 空对象 true
 */
export function isEmptyObj(obj) {
  if (!isObject(obj)) {
    return true
  }
  return JSON.stringify(obj) === '{}'
}
