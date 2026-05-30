import z from 'zod'

export const createMonitorSchema = z.object({
  name: z.string().min(2),
  url: z.string().url(),
  interval_secs: z.number().min(15),
})

export const deleteMonitorById = z.object({
  id: z.number(),
})

export const updateMonitorSchema = z.object({
  id: z.number(),
  name: z.string().min(2),
  url: z.string(),
  interval_secs: z.number().min(15),
})

export const getIncidentsByMonitorIdSchema = z.object({
  id: z.number(),
})

export const getAlertByMonitorIdSchema = z.object({
  id: z.number(),
})

export const getCheckHistoryByMonitorIdSchema = z.object({
  id: z.number(),
  limit: z.number().positive(),
})
