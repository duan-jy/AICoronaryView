import axios from 'axios'
import { ElMessage } from 'element-plus'
import { baseURL } from './index'

const service = axios.create({
  baseURL: baseURL(),
  timeout: 200000,
  responseType: 'json'
})

// 请求拦截
service.interceptors.request.use(
  (config) => {
    // 针对有些config写的是大写
    config.method = config.method.toLowerCase()
    if (config.url.indexOf('/dcm/api/print') !== -1) {
      // config.baseURL = `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':' : ''
      //   }${window.location.port}`
      config.baseURL = `http://172.20.20.162:12888`
    }
    return config
  },
  (err) => {
    return Promise.reject(err)
  }
)
// 响应拦截
service.interceptors.response.use(
  (response) => {
    let res = response.data
    if (typeof response.data === 'string') {
      res = {
        message: response.data
      }
    }
    res.message = res.message || res.msg
    if (response.status !== 200) {
      const message = res.message
        ? res.message.indexOf('timeout') > -1
          ? '请求超时，请稍后'
          : res.message
        : '网络异常'
      ElMessage({
        message,
        type: 'error',
        duration: 5 * 1000
      })
      return Promise.reject(new Error(message || 'Error'))
    } else {
      return res
    }
  },
  (error) => {
    let message = error.message
    message =
      message.indexOf('timeout') > -1
        ? '请求超时，请稍后'
        : '网络异常请稍后重试'
    ElMessage({
      message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error.message)
  }
)
export default service
