import { createServerFn } from '@tanstack/react-start'
import { api } from '../api'
import type { DashboardStatsResponse, MetricsHistoryResponse } from '../api-types'
import { getCookie } from '@tanstack/react-start/server'
import { getMetricsHistorySchema } from '../schema/dashboard.schema'

export const getDashboardStats = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const token = getCookie('token')

    if (!token) {
      throw new Error('Unauthorized - no token found')
    }
    const res = await api<null, DashboardStatsResponse>('/dashboard/stats', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return res.data.data
  } catch (e: unknown) {
    const err = e as Error
    throw new Error(err.message || 'Failed to fetch dashboard stats')
  }
})

export const getMetricsHistory = createServerFn({ method: 'GET' })
  .inputValidator((data) => getMetricsHistorySchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const token = getCookie('token')

      if (!token) {
        throw new Error('Unauthorized - no token found')
      }
      const res = await api<null, MetricsHistoryResponse>('/dashboard/metrics-history', {
        method: 'GET',
        params: { days: data.days || 7 },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return res.data.data
    } catch (e: unknown) {
      const err = e as Error
      throw new Error(err.message || 'Failed to fetch metrics history')
    }
  })
