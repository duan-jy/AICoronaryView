/**
 * API Module - HTTP request handlers
 */

import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import type { ApiResponse, DicomStudy, DiagnosticReport, PushService } from '@/types'

// Create axios instance
const instance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
instance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('[API Error]', error.message)
    return Promise.reject(error)
  }
)

/**
 * Generic request function
 */
async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await instance.request<any, ApiResponse<T>>(config)
  return response.data
}

/**
 * API endpoints
 */
export const api = {
  // Config
  async getConfig(): Promise<Record<string, any>> {
    return request({ method: 'GET', url: '/config' })
  },

  // Study/Patient data
  async getStudyInfo(studyId: string): Promise<DicomStudy> {
    return request({ method: 'GET', url: `/study/${studyId}` })
  },

  async getStudyByParams(params: Record<string, string>): Promise<DicomStudy> {
    return request({ method: 'GET', url: '/study', params })
  },

  // Artery images
  async getArteryImages(studyId: string, arteryId: string): Promise<any[]> {
    return request({ method: 'GET', url: `/study/${studyId}/artery/${arteryId}/images` })
  },

  async getAllArteryImages(studyId: string): Promise<Record<string, any[]>> {
    return request({ method: 'GET', url: `/study/${studyId}/artery/images` })
  },

  // Diagnostic report
  async getReport(studyId: string): Promise<DiagnosticReport> {
    return request({ method: 'GET', url: `/study/${studyId}/report` })
  },

  async saveReport(studyId: string, report: DiagnosticReport): Promise<void> {
    return request({ method: 'POST', url: `/study/${studyId}/report`, data: report })
  },

  // 3D model
  async get3DModel(studyId: string, arteryId: string): Promise<string> {
    return request({ method: 'GET', url: `/study/${studyId}/artery/${arteryId}/model3d` })
  },

  // Print
  async getPrintLayouts(): Promise<any[]> {
    return request({ method: 'GET', url: '/print/layouts' })
  },

  async print(config: any): Promise<void> {
    return request({ method: 'POST', url: '/print', data: config })
  },

  // Push services
  async getPushServices(): Promise<PushService[]> {
    return request({ method: 'GET', url: '/push/services' })
  },

  async pushToService(serviceId: number, data: any): Promise<void> {
    return request({ method: 'POST', url: `/push/service/${serviceId}`, data })
  },

  // Image URL helpers
  getImageUrl(studyId: string, imageId: string): string {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
    return `${baseUrl}/study/${studyId}/image/${imageId}`
  },

  getThumbnailUrl(studyId: string, imageId: string): string {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
    return `${baseUrl}/study/${studyId}/image/${imageId}/thumbnail`
  }
}

export default api
