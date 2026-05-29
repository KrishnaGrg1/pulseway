import axios from 'axios'
import type { APIResponse } from './types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Send cookies with requests
})

// Automatically attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Redirect to login if 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }

    const payload = error.response?.data as APIResponse<unknown> | undefined
    const message =
      payload?.error?.details ||
      payload?.message ||
      error.message ||
      'Request failed'

    return Promise.reject(new Error(message))
  }
)

export default api