import { createServerFn } from '@tanstack/react-start'
import { api } from '../api'
import type {
  AlertsResponse,
  CheckHistoryResponse,
  createMonitorInput,
  createMonitorResponse,
  deleteMonitorInput,
  deleteMonitorResponse,
  getMonitorResponse,
  IncidentsResponse,
  MonitorDetailsResponse,
  updateMonitorInput,
  updateMonitorResponse,
} from '../api-types'
import {
  createMonitorSchema,
  deleteMonitorById,
  getAlertByMonitorIdSchema,
  getCheckHistoryByMonitorIdSchema,
  getIncidentsByMonitorIdSchema,
  getMonitorDetailsByMonitorIdSchema,
  updateMonitorSchema,
} from '../schema/monitor.schema'
import { getCookie } from '@tanstack/react-start/server'

export const getMonitors = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const token = getCookie('token')

    if (!token) {
      throw new Error('Unauthorized - no token found')
    }
    const res = await api<null, getMonitorResponse>('/monitors', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return res.data.data
  } catch (e: unknown) {
    const err = e as Error
    throw new Error(err.message || 'failed to get monitors details')
  }
})

export const createMonitor = createServerFn({ method: 'POST' })
  .inputValidator((data) => createMonitorSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const token = getCookie('token')

      if (!token) {
        throw new Error('Unauthorized - no token found')
      }
      const res = await api<createMonitorInput, createMonitorResponse>('/monitors', {
        data: data,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return res.data
    } catch (error: unknown) {
      const err = error as Error
      throw new Error(err.message || 'Failed to create monitor')
    }
  })

export const deleteMonitor = createServerFn({ method: 'POST' })
  .inputValidator((data) => deleteMonitorById.parse(data))
  .handler(async ({ data }) => {
    try {
      const token = getCookie('token')

      if (!token) {
        throw new Error('Unauthorized - no token found')
      }
      const res = await api<deleteMonitorInput, deleteMonitorResponse>(`/monitors/${data.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return res.data
    } catch (error: unknown) {
      const err = error as Error
      throw new Error(err.message || 'Failed to delete monitor')
    }
  })

export const updateMonitor = createServerFn({ method: 'POST' })
  .inputValidator((data) => updateMonitorSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const token = getCookie('token')

      if (!token) {
        throw new Error('Unauthorized - no token found')
      }

      const { id, ...payload } = data as any
      const res = await api<updateMonitorInput, updateMonitorResponse>(`/monitors/${id}`, {
        data: payload,
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return res.data
    } catch (error: unknown) {
      const err = error as Error
      throw new Error(err.message || 'Failed to update monitor')
    }
  })

export const getIncidentsByMonitorId = createServerFn({ method: 'GET' })
  .inputValidator((data) => getIncidentsByMonitorIdSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const token = getCookie('token')

      if (!token) {
        throw new Error('Unauthorized - no token found')
      }
      const res = await api<null, IncidentsResponse>(`/monitors/${data.id}/incidents`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return res.data.data.incidents
    } catch (e: unknown) {
      const err = e as Error
      throw new Error(err.message || 'failed to fetch incidents')
    }
  })

export const getAlertByMonitorId = createServerFn({ method: 'GET' })
  .inputValidator((data) => getAlertByMonitorIdSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const token = getCookie('token')

      if (!token) {
        throw new Error('Unauthorized - no token found')
      }
      const res = await api<null, AlertsResponse>(`/monitors/${data.id}/alerts`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return res.data.data.alerts
    } catch (e: unknown) {
      const err = e as Error
      throw new Error(err.message || 'Failed to fetch alerts')
    }
  })

export const getCheckHistoryByMonitorId = createServerFn({ method: 'GET' })
  .inputValidator((data) => getCheckHistoryByMonitorIdSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const token = getCookie('token')

      if (!token) {
        throw new Error('Unauthorized - no token found')
      }
      const res = await api<null, CheckHistoryResponse>(`/monitors/${data.id}/check-history`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { limit: data.limit },
      })
      return res.data.data.checks
    } catch (e: unknown) {
      const err = e as Error
      throw new Error(err.message || 'Failed to fetch check history')
    }
  })

export const listAllIncidents = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const token = getCookie('token')

    if (!token) {
      throw new Error('Unauthorized - no token found')
    }
    const res = await api<null, IncidentsResponse>(`/incidents`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return res.data.data.incidents
  } catch (e: unknown) {
    const err = e as Error
    throw new Error(err.message || 'failed to fetch incidents')
  }
})

export const getMonitorDetailsByMonitorId = createServerFn({ method: 'GET' })
  .inputValidator((data) => getMonitorDetailsByMonitorIdSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const token = getCookie('token')

      if (!token) {
        throw new Error('Unauthorized - no token found')
      }
      const res = await api<null, MonitorDetailsResponse>(`/monitors/${data.id}/details`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return res.data.data
    } catch (e: unknown) {
      const err = e as Error
      throw new Error(err.message || 'Failed to fetch monitor details')
    }
  })
