import z from 'zod'

export const getMetricsHistorySchema = z.object({
  days: z.number().positive(),
})
