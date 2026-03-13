import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'

// API Response type
export interface ApiResponse<T = any> {
  code: number
  data: T
  message: string
  success: boolean
}

// Create axios instance
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
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
    (error) => {
      return Promise.reject(error)
    }
  )

  // Response interceptor
  instance.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
      const { data } = response
      
      // Check business logic success
      if (data.code === 200 || data.success) {
        return response
      }
      
      // Handle business errors
      console.error('API Error:', data.message)
      return Promise.reject(new Error(data.message || 'Request failed'))
    },
    (error) => {
      // Handle HTTP errors
      if (error.response) {
        const { status, data } = error.response
        
        switch (status) {
          case 401:
            // Unauthorized - redirect to login
            console.error('Unauthorized')
            break
          case 403:
            console.error('Forbidden')
            break
          case 404:
            console.error('Not found')
            break
          case 500:
            console.error('Server error')
            break
          default:
            console.error('Request failed:', data?.message || error.message)
        }
      } else if (error.request) {
        console.error('Network error')
      } else {
        console.error('Request error:', error.message)
      }
      
      return Promise.reject(error)
    }
  )

  return instance
}

const axiosInstance = createAxiosInstance()

// Request methods
export const request = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return axiosInstance.get(url, config).then(res => res.data)
  },
  
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return axiosInstance.post(url, data, config).then(res => res.data)
  },
  
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return axiosInstance.put(url, data, config).then(res => res.data)
  },
  
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return axiosInstance.delete(url, config).then(res => res.data)
  },
  
  // File upload
  upload<T = any>(url: string, file: File, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)
    
    return axiosInstance.post(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers
      }
    }).then(res => res.data)
  },
  
  // Download file
  download(url: string, filename: string, config?: AxiosRequestConfig): Promise<void> {
    return axiosInstance.get(url, {
      ...config,
      responseType: 'blob'
    }).then(response => {
      const blob = new Blob([response.data])
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = filename
      link.click()
      URL.revokeObjectURL(link.href)
    })
  }
}

export default axiosInstance
