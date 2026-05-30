import { useEffect, useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'

interface StatusUpdate {
  monitor_id: number
  status: string
  latency_ms?: number
  checked_at?: string
}

interface UseMonitorStatusReturn {
  statuses: Record<number, string>
  isConnected: boolean
  error: Error | null
}

/**
 * Custom hook for managing real-time monitor status via SSE
 * Handles connection, reconnection, and status updates
 */
export function useMonitorStatus(): UseMonitorStatusReturn {
  const queryClient = useQueryClient()
  const [statuses, setStatuses] = useState<Record<number, string>>({})
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const connect = useCallback(() => {
    const apiUrl = import.meta.env.VITE_API_URL
    if (!apiUrl) {
      setError(new Error('API URL not configured'))
      return
    }

    let source: EventSource
    let reconnectTimeout: NodeJS.Timeout

    try {
      source = new EventSource(`${apiUrl}/sse`)

      source.onopen = () => {
        setIsConnected(true)
        setError(null)
      }

      source.onmessage = (event) => {
        try {
          const data: StatusUpdate = JSON.parse(event.data)

          if (data.monitor_id && data.status) {
            // Update local state
            setStatuses((prev) => ({
              ...prev,
              [data.monitor_id]: data.status,
            }))

            // Invalidate queries to refetch fresh data
            queryClient.invalidateQueries({ queryKey: ['monitors'] })
            queryClient.invalidateQueries({ queryKey: ['stats'] })
          }
        } catch (err) {
          console.error('Failed to parse SSE message:', err)
        }
      }

      source.onerror = () => {
        setIsConnected(false)
        source.close()

        // Exponential backoff reconnection (3 seconds)
        reconnectTimeout = setTimeout(() => {
          connect()
        }, 3000)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('SSE connection failed'))
      setIsConnected(false)
    }

    // Cleanup function
    return () => {
      if (source) {
        source.close()
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
      }
    }
  }, [queryClient])

  useEffect(() => {
    const cleanup = connect()
    return cleanup
  }, [connect])

  return { statuses, isConnected, error }
}
