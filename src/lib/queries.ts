import api from './api'
import type { DashboardStats } from './types'
import type {
  CheckHistoryResponse,
  MetricsHistoryResponse,
  DashboardStatsResponse,
  CheckResult,
  Alert,
  MonitorDetailsResponse,
} from './api-types'

const handleServiceError = (error: unknown, fallbackMessage: string): never => {
  const err = error as Error
  throw new Error(err.message || fallbackMessage)
}

// Check History - Powers the 30-segment uptime bar
export const getCheckHistory = async (
  monitorId: number,
  limit: number = 30
): Promise<CheckResult[]> => {
  try {
    const res = await api.get<CheckHistoryResponse>(`/monitors/${monitorId}/check-history`, {
      params: { limit },
    })
    return res.data.data.checks
  } catch (error: unknown) {
    return handleServiceError(error, 'Failed to fetch check history')
  }
}

// Metrics History - Powers the 7-bar spark lines
export const getMetricsHistory = async (
  days: number = 7
): Promise<MetricsHistoryResponse['data']> => {
  try {
    const res = await api.get<MetricsHistoryResponse>('/dashboard/metrics-history', {
      params: { days },
    })
    return res.data.data
  } catch (error: unknown) {
    return handleServiceError(error, 'Failed to fetch metrics history')
  }
}

// Dashboard Stats - Powers the 4 metric card values
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const res = await api.get<DashboardStatsResponse>('/dashboard/stats')
    return res.data.data
  } catch (error: unknown) {
    return handleServiceError(error, 'Failed to fetch dashboard stats')
  }
}

export const createAlert = async (data: { monitor_id: number; email: string }): Promise<Alert> => {
  try {
    const res = await api.post<{ data: Alert }>('/alerts', data)
    return res.data.data
  } catch (error: unknown) {
    return handleServiceError(error, 'Failed to create alert')
  }
}

export const deleteAlert = async (id: number): Promise<void> => {
  try {
    await api.delete(`/alerts/${id}`)
  } catch (error: unknown) {
    return handleServiceError(error, 'Failed to delete alert')
  }
}

// Monitor Details - Single monitor with full context
export const getMonitorDetails = async (id: number): Promise<MonitorDetailsResponse['data']> => {
  try {
    const res = await api.get<MonitorDetailsResponse>(`/monitors/${id}/details`)
    return res.data.data
  } catch (error: unknown) {
    return handleServiceError(error, 'Failed to fetch monitor details')
  }
}
