// API Response Types from Backend

import type { Monitor, User } from './types'

export interface CheckResult {
  status: 'up' | 'down'
  latency_ms: number
  checked_at: string
}

export interface CheckHistoryResponse {
  success: boolean
  message: string
  data: {
    checks: CheckResult[]
  }
}

export interface MetricsHistoryPoint {
  timestamp: string
  value: number
  healthy: boolean
}

export interface MetricsHistoryResponse {
  message: string
  data: {
    total_monitors: MetricsHistoryPoint[]
    healthy_count: MetricsHistoryPoint[]
    uptime_percentage: MetricsHistoryPoint[]
    avg_latency_ms: MetricsHistoryPoint[]
  }
}

export interface EnhancedMonitor {
  id: number
  user_id: number
  name: string
  url: string
  interval_secs: number
  is_active: boolean
  created_at: string
  current_status: 'up' | 'down' | 'unknown'
  uptime_percentage: number
  avg_latency_ms: number
  last_checked_at: string
  last_check_status: string
}

export interface EnhancedMonitorsResponse {
  message: string
  data: EnhancedMonitor[]
}

export interface DashboardStatsResponse {
  success: boolean
  message: string
  data: {
    total_monitors: number
    healthy_monitors: number
    uptime_percentage: number
    avg_latency_ms: number
  }
}

export interface Incident {
  id: number
  monitor_id: number
  started_at: string
  resolved_at: string | null
  notified: boolean
  duration_seconds?: number
}

export interface IncidentsResponse {
  success: boolean
  message: string
  data: {
    incidents: Incident[]
  }
}

export interface Alert {
  id: number
  monitor_id: number
  email: string
  is_active: boolean
  created_at: string
}
export interface createAlertInput {
  monitor_id: number
  email: string
}
export interface CreateAlertResponse {
  success: boolean
  message: string
  data: {
    alerts: Alert
  }
}
export interface AlertsResponse {
  success: boolean
  message: string
  data: {
    alerts: Alert[]
  }
}

export interface MonitorDetailsResponse {
  success: boolean
  message: string
  data: {
    monitor: EnhancedMonitor
    incidents: Incident[]
    recent_checks: CheckResult[]
  }
}

export interface RegisterResponse {
  success: boolean
  message: string
  data: User
}

export interface UserLoginInput {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  message: string
  data: {
    token: string
    user: User
  }
}

export interface getUserResponse {
  success: boolean
  message: string
  data: User
}

export interface getMonitorResponse {
  success: boolean
  message: string
  data: Monitor[]
}

export interface createMonitorInput {
  name: string
  url: string
  interval_secs: number
}

export interface createMonitorResponse {
  success: boolean
  message: string
  data: Monitor
}

export interface deleteMonitorInput {
  id: number
}
export interface deleteMonitorResponse {
  success: boolean
  message: string
}

export interface updateMonitorInput {
  name: string
  url: string
  interval_secs: number
}

export interface updateMonitorResponse {
  success: boolean
  message: string
  data: Monitor
}
