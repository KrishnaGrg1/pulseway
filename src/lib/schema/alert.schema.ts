import z from 'zod'

export const createAlertSchema = z.object({
  monitor_id: z.number().positive(),
  email: z.string().email(),
})

export const deleteAlertSchema = z.object({
  id: z.number().positive(),
})
