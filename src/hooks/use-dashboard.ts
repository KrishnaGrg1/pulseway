import { getDashboardStats, getMetricsHistory } from '#/lib/services/dashboard.services'
import { useQuery } from '@tanstack/react-query'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: getDashboardStats,
    refetchInterval: 30000,
  })
}

export function useGetMetricsHistory(days: number = 7) {
  return useQuery({
    queryKey: ['metrics-history', days],
    queryFn: () => getMetricsHistory({ data: { days } }),
    retry: false, // Don't retry on failure (backend issue)
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchInterval: false, // Disable automatic refetching until backend is fixed
    staleTime: Infinity, // Keep any successful data forever
  })
}
