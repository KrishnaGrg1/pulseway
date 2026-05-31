import { createAlert, deleteAlert } from '#/lib/services/alert.services'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export function useCreateAlert(monitorId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createAlert,
    onSuccess: (data) => {
      toast.success(data?.message || 'Alert created successfully')
      queryClient.invalidateQueries({ queryKey: ['alerts', monitorId] })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create alert')
    },
  })
}

export function useDeleteAlert(monitorId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteAlert,
    onSuccess: (data) => {
      toast.success(data?.message || 'Alert deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['alerts', monitorId] })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete alert')
    },
  })
}
