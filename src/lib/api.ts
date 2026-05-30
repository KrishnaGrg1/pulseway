import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { getToken } from './auth'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Send cookies with requests
})

axiosInstance.interceptors.response.use(
  (response: any) => response,
  (error) => {
    console.error(error.response?.data?.errors)
    const message = error?.response?.data?.message ?? (error.message || 'Something went wrong')
    return Promise.reject(new Error(message))
  }
)

// Automatically attach token from cookies to every request
axiosInstance.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const api = async <T, V>(url: string, config: AxiosRequestConfig & { data?: T } = {}) => {
  const { headers: _, ...restConfig } = config
  return axiosInstance.request<T, AxiosResponse<V>>({
    url,
    ...restConfig,
    headers: {
      'Content-Type': 'application/json',
      ...(config.headers || {}),
    },
  })
}

export default axiosInstance
