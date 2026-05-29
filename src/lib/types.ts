export interface APIResponse<T> {
  success: boolean
  message: string
  data?: T
  error?: {
    code: string
    details: string
  }
}

export interface User {
  id: number
  email: string
}

export interface Monitor {
  id: number
  user_id: number
  name: string
  url: string
  interval_secs: number
  is_active: boolean
  created_at: string
  // Enhanced fields from backend
  current_status?: "up" | "down" | "unknown"
  uptime_percentage?: number
  avg_latency_ms?: number
  last_checked_at?: string
  last_check_status?: string
}

export interface CheckResult {
  id: number
  monitor_id: number
  status: 'up' | 'down'
  latency_ms: number
  status_code: number | null
  checked_at: string
}

export interface DashboardStats {
  total_monitors: number
  healthy_monitors?: number
  active_monitors?: number
  uptime_percentage: number
  avg_latency_ms: number
}

export interface AuthResponse {
  token: string
  user: User
}