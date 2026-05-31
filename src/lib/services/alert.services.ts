import { createServerFn } from '@tanstack/react-start'
import { createAlertSchema } from '../schema/alert.schema'
import { getCookie } from '@tanstack/react-start/server'
import type { createAlertInput, CreateAlertResponse } from '../api-types'
import { api } from '../api'
import z from 'zod'

export const createAlert = createServerFn({ method: 'POST' })
  .inputValidator((data) => createAlertSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const token = getCookie('token')

      if (!token) {
        throw new Error('Unauthorized - no token found')
      }
      const res = await api<createAlertInput, CreateAlertResponse>('/alerts', {
        data: data,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return res.data
    } catch (error: unknown) {
      const err = error as Error
      throw new Error(err.message || 'Failed to create alert')
    }
  })

export const deleteAlert = createServerFn({ method: 'POST' })
  .inputValidator((data) => z.object({ id: z.number() }).parse(data))
  .handler(async ({ data }) => {
    try {
      const token = getCookie('token')

      if (!token) {
        throw new Error('Unauthorized')
      }

      const res = await api<{ id: number }, { success: boolean; message: string }>(
        `/alerts/${data.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      return res.data
    } catch (error: unknown) {
      const err = error as Error
      throw new Error(err.message || 'Failed to delete alert')
    }
  })
