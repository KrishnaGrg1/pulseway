import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createMonitor,
  deleteMonitor,
  getAlertByMonitorId,
  getIncidentsByMonitorId,
  getMonitors,
  listAllIncidents,
  updateMonitor,
} from '#/lib/services/monitor.services'

export function useCreateMonitor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createMonitor,
    onSuccess: (data) => {
      toast.success(data?.message)
      queryClient.invalidateQueries({ queryKey: ['monitors'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })
}

export function useupdateMonitor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateMonitor,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['monitors'] })
      toast.success(data?.message)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })
}

export function useDeleteMonitor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteMonitor,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['monitors'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      toast.success(data?.message)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })
}

export function useGetMonitor() {
  return useQuery({
    queryKey: ['monitors'],
    queryFn: getMonitors,
  })
}
export function useGetIncidentsByMonitorId(monitorId: number) {
  return useQuery({
    queryKey: ['incidents'],
    queryFn: () => getIncidentsByMonitorId({ data: { id: monitorId } }),
    refetchInterval: 30000,
  })
}

export function useGetAlertByMonitorId(monitorId: number) {
  return useQuery({
    queryKey: ['alerts', monitorId],
    queryFn: () =>
      getAlertByMonitorId({
        data: { id: monitorId },
      } as any),
  })
}

export function useListAllIncidents() {
  return useQuery({
    queryKey: ['incidents'],
    queryFn: () => listAllIncidents(),
    refetchInterval: 30000,
  })
}
