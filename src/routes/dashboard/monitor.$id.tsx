import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Radio,
  Mail,
  Plus,
  Trash2,
  Clock,
  Activity,
} from 'lucide-react'
import { useMonitorStatus } from '#/hooks'
import { formatDistanceToNow } from 'date-fns'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import {
  useCheckHistoryByMonitorId,
  useGetAlertByMonitorId,
  useGetMonitorDetailsByMonitorId,
} from '#/hooks/use-monitor'
import { useCreateAlert, useDeleteAlert } from '#/hooks/use-alert'

export const Route = createFileRoute('/dashboard/monitor/$id')({
  component: MonitorDetailPage,
})

function MonitorDetailPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const monitorId = parseInt(id)

  const [showAlertForm, setShowAlertForm] = useState(false)
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h')

  const { statuses: liveStatuses, isConnected } = useMonitorStatus()

  const { data, isLoading } = useGetMonitorDetailsByMonitorId(monitorId)

  const { data: checkHistory, isLoading: isLoadingHistory } = useCheckHistoryByMonitorId(
    monitorId,
    timeRange
  )

  const { data: alerts } = useGetAlertByMonitorId(monitorId)

  const { mutate: createAlert, isPending: isCreatingAlert } = useCreateAlert(monitorId)

  const { mutate: deleteAlert, isPending: isDeletingAlert } = useDeleteAlert(monitorId)

  const alertForm = useForm({
    defaultValues: {
      email: '',
    },
    onSubmit: async ({ value }) => {
      createAlert(
        { data: { email: value.email, monitor_id: monitorId } },
        {
          onSuccess: () => {
            setShowAlertForm(false)
            alertForm.reset()
          },
        }
      )
    },
  })

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f1117]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f1117]">
        <p className="text-slate-400">Monitor not found</p>
      </div>
    )
  }

  const { monitor, incidents, recent_checks } = data
  const currentStatus =
    isConnected && liveStatuses[monitorId]
      ? liveStatuses[monitorId]
      : (monitor.current_status ?? 'unknown')

  const activeIncident = incidents.find((i: { resolved_at: string | null }) => !i.resolved_at)
  const uptimeChange = monitor.uptime_percentage >= 99 ? 'up' : 'down'
  const latencyChange = monitor.avg_latency_ms <= 200 ? 'up' : 'down'

  // Transform check history for chart (oldest to newest, left to right)
  const chartData = checkHistory
    ? checkHistory
        .slice()
        .sort(
          (a: { checked_at: string }, b: { checked_at: string }) =>
            new Date(a.checked_at).getTime() - new Date(b.checked_at).getTime()
        )
        .map((check: { checked_at: string; latency_ms: number; status: string }) => ({
          time: new Date(check.checked_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          latency: check.latency_ms,
          status: check.status === 'up' ? 1 : 0,
          timestamp: new Date(check.checked_at).getTime(), // Keep for reference
        }))
    : []

  return (
    <div className="min-h-screen bg-[#0f1117]">
      {/* Header */}
      <header className="border-b border-[#2a2d3a] bg-[#0f1117]">
        <div className="mx-auto max-w-7xl px-3 py-3 sm:px-4 sm:py-4 lg:px-8">
          <div className="flex items-start gap-2 sm:items-center sm:gap-4">
            <button
              onClick={() => navigate({ to: '/dashboard' })}
              className="mt-1 rounded-lg p-1.5 text-slate-400 hover:bg-[#1a1d27] hover:text-slate-200 sm:mt-0 sm:p-2"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <h1 className="truncate text-base font-semibold text-slate-200 sm:text-lg lg:text-xl">
                  {monitor.name}
                </h1>
                <div
                  className={`flex w-fit items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium sm:px-2.5 sm:py-1 ${
                    currentStatus === 'up'
                      ? 'bg-[#22c55e]/10 text-[#22c55e]'
                      : currentStatus === 'down'
                        ? 'bg-[#ef4444]/10 text-[#ef4444]'
                        : 'bg-slate-700/10 text-slate-400'
                  }`}
                >
                  <Radio className={`h-3 w-3 ${isConnected ? 'animate-pulse' : ''}`} />
                  <span className="text-[10px] sm:text-xs">
                    {currentStatus === 'up'
                      ? 'Online'
                      : currentStatus === 'down'
                        ? 'Down'
                        : 'Unknown'}
                  </span>
                </div>
              </div>
              <p className="mt-1 truncate font-mono text-xs text-slate-400 sm:text-sm">
                {monitor.url}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6 lg:px-8">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          {/* Main Chart - 2 columns */}
          <div className="space-y-4 sm:space-y-6 lg:col-span-2">
            {/* Active Incident Banner */}
            {activeIncident && (
              <div className="rounded-lg border border-[#ef4444]/20 bg-[#ef4444]/5 p-3 sm:p-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="rounded-full bg-[#ef4444] p-1">
                    <Activity className="h-3 w-3 text-white sm:h-4 sm:w-4" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-[#ef4444] sm:text-base">
                      Service Disruption
                    </h3>
                    <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                      Started{' '}
                      {formatDistanceToNow(new Date(activeIncident.started_at), {
                        addSuffix: true,
                      })}
                      {activeIncident.notified && ' · Alerts sent'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Price Card Style Metrics */}
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
              <div className="rounded-lg border border-[#2a2d3a] bg-[#1a1d27] p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 sm:text-sm">Uptime</span>
                  <div
                    className={`flex items-center gap-1 text-[10px] sm:text-xs ${
                      uptimeChange === 'up' ? 'text-[#22c55e]' : 'text-[#ef4444]'
                    }`}
                  >
                    {uptimeChange === 'up' ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {uptimeChange === 'up' ? 'Healthy' : 'Degraded'}
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-100 sm:text-3xl">
                    {monitor.uptime_percentage?.toFixed(2) ?? 0}%
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">Last 24 hours</p>
              </div>

              <div className="rounded-lg border border-[#2a2d3a] bg-[#1a1d27] p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 sm:text-sm">Avg Response</span>
                  <div
                    className={`flex items-center gap-1 text-[10px] sm:text-xs ${
                      latencyChange === 'up' ? 'text-[#22c55e]' : 'text-[#ef4444]'
                    }`}
                  >
                    {latencyChange === 'up' ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {latencyChange === 'up' ? 'Fast' : 'Slow'}
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-100 sm:text-3xl">
                    {monitor.avg_latency_ms?.toFixed(0) ?? 0}
                  </span>
                  <span className="text-base text-slate-400 sm:text-lg">ms</span>
                </div>
                <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">Last 24 hours</p>
              </div>
            </div>

            {/* Stock Chart Style */}
            <div className="rounded-lg border border-[#2a2d3a] bg-[#1a1d27] p-3 sm:p-4 lg:p-5">
              <div className="mb-3 flex flex-col gap-3 sm:mb-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-200 sm:text-base">
                    Response Time
                  </h2>
                  <p className="mt-0.5 text-[10px] text-slate-500 sm:text-xs">
                    Real-time latency chart (older ← → newer)
                  </p>
                </div>
                <div className="flex gap-1.5 sm:gap-2">
                  {(['1h', '24h', '7d'] as const).map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`rounded px-2.5 py-1 text-[10px] font-medium transition-colors sm:px-3 sm:text-xs ${
                        timeRange === range
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-400 hover:bg-[#2a2d3a] hover:text-slate-200'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-48 w-full sm:h-56 md:h-64">
                {isLoadingHistory ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500 sm:h-8 sm:w-8" />
                  </div>
                ) : chartData && chartData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height="100%" minHeight={192}>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" vertical={false} />
                        <XAxis
                          dataKey="time"
                          stroke="#64748b"
                          tick={{ fill: '#64748b', fontSize: 9 }}
                          tickLine={false}
                          interval="preserveStartEnd"
                          height={30}
                        />
                        <YAxis
                          stroke="#64748b"
                          tick={{ fill: '#64748b', fontSize: 9 }}
                          tickLine={false}
                          axisLine={false}
                          width={40}
                          label={{
                            value: 'ms',
                            angle: -90,
                            position: 'insideLeft',
                            fill: '#64748b',
                            fontSize: 9,
                          }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1a1d27',
                            border: '1px solid #2a2d3a',
                            borderRadius: '8px',
                            color: '#e2e8f0',
                          }}
                          labelStyle={{ color: '#94a3b8' }}
                          formatter={(value) => [`${value}ms`, 'Latency']}
                        />
                        <Area
                          type="monotone"
                          dataKey="latency"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorLatency)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                    <div className="mt-2 flex justify-between px-1 text-[10px] text-slate-500 sm:px-2 sm:text-xs">
                      <span>← Older</span>
                      <span className="flex items-center gap-1">
                        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500 sm:h-2 sm:w-2" />
                        Latest
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center px-4">
                    <p className="text-center text-xs text-slate-500 sm:text-sm">
                      No data available for this time range
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Incident Timeline */}
            <div className="rounded-lg border border-[#2a2d3a] bg-[#1a1d27] p-3 sm:p-4 lg:p-5">
              <h2 className="mb-3 text-sm font-semibold text-slate-200 sm:mb-4 sm:text-base">
                Incident History
              </h2>
              <div className="space-y-2 sm:space-y-3">
                {incidents.length > 0 ? (
                  incidents
                    .filter((i: { resolved_at: string | null }) => i.resolved_at)
                    .slice(0, 5)
                    .map(
                      (incident: {
                        id: number
                        started_at: string
                        resolved_at: string | null
                        duration_seconds?: number
                        notified: boolean
                      }) => (
                        <div
                          key={incident.id}
                          className="flex items-center gap-2 rounded-lg border border-[#2a2d3a] bg-[#0f1117] p-2.5 sm:gap-3 sm:p-3"
                        >
                          <div className="rounded-full bg-slate-700/30 p-1.5 sm:p-2">
                            <Clock className="h-3 w-3 text-slate-400 sm:h-4 sm:w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <p className="text-xs font-medium text-slate-300 sm:text-sm">
                                Service recovered
                              </p>
                              {incident.notified && (
                                <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] text-blue-400 sm:px-2 sm:text-xs">
                                  Notified
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 text-[10px] text-slate-500 sm:text-xs">
                              Downtime:{' '}
                              {incident.duration_seconds
                                ? `${Math.floor(incident.duration_seconds / 60)}m ${incident.duration_seconds % 60}s`
                                : 'Unknown'}{' '}
                              ·{' '}
                              {formatDistanceToNow(new Date(incident.started_at), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                        </div>
                      )
                    )
                ) : (
                  <p className="text-center text-xs text-slate-500 sm:text-sm">No incidents recorded</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Alert Recipients */}
            <div className="rounded-lg border border-[#2a2d3a] bg-[#1a1d27] p-3 sm:p-4 lg:p-5">
              <div className="mb-3 flex items-center justify-between sm:mb-4">
                <h2 className="text-sm font-semibold text-slate-200 sm:text-base">Alerts</h2>
                <button
                  onClick={() => setShowAlertForm(!showAlertForm)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-[#0f1117] hover:text-slate-200 sm:p-2"
                >
                  <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              </div>

              {showAlertForm && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    alertForm.handleSubmit()
                  }}
                  className="mb-3 space-y-2 sm:mb-4 sm:space-y-3"
                >
                  <alertForm.Field
                    name="email"
                    validators={{
                      onChange: ({ value }) =>
                        !value
                          ? 'Email is required'
                          : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                            ? 'Invalid email format'
                            : undefined,
                    }}
                  >
                    {(field) => (
                      <div>
                        <input
                          id={field.name}
                          name={field.name}
                          type="email"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          placeholder="email@example.com"
                          className="w-full rounded-lg border border-[#2a2d3a] bg-[#0f1117] px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none sm:px-3 sm:py-2 sm:text-sm"
                        />
                        {field.state.meta.errors.length > 0 && (
                          <div className="mt-1 text-[10px] text-[#ef4444] sm:text-xs">
                            {field.state.meta.errors[0]}
                          </div>
                        )}
                      </div>
                    )}
                  </alertForm.Field>
                  <div className="flex gap-1.5 sm:gap-2">
                    <button
                      type="submit"
                      disabled={isCreatingAlert}
                      className="flex-1 rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-50 sm:px-3 sm:py-2 sm:text-sm"
                    >
                      {isCreatingAlert ? 'Adding...' : 'Add'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAlertForm(false)
                        alertForm.reset()
                      }}
                      className="rounded-lg border border-[#2a2d3a] px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:bg-[#0f1117] sm:px-3 sm:py-2 sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {alerts && alerts.length > 0 ? (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between rounded-lg border border-[#2a2d3a] bg-[#0f1117] p-2 sm:p-2.5 lg:p-3"
                    >
                      <div className="flex min-w-0 items-center gap-2 sm:gap-2.5 lg:gap-3">
                        <Mail className="h-3 w-3 shrink-0 text-slate-400 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                        <p className="truncate text-xs text-slate-300 sm:text-sm">{alert.email}</p>
                      </div>
                      <button
                        onClick={() => deleteAlert({ data: { id: alert.id } })}
                        disabled={isDeletingAlert}
                        className="shrink-0 rounded p-1 text-slate-500 hover:bg-[#2a2d3a] hover:text-red-400 disabled:opacity-50"
                      >
                        <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed border-[#2a2d3a] p-4 text-center sm:p-5 lg:p-6">
                    <Mail className="mx-auto h-6 w-6 text-slate-600 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
                    <p className="mt-2 text-xs text-slate-500 sm:text-sm">No recipients</p>
                    <p className="mt-1 text-[10px] text-slate-600 sm:text-xs">Add emails to get alerts</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="rounded-lg border border-[#2a2d3a] bg-[#1a1d27] p-3 sm:p-4 lg:p-5">
              <h2 className="mb-3 text-sm font-semibold text-slate-200 sm:mb-4 sm:text-base">
                Monitor Info
              </h2>
              <div className="space-y-2.5 text-xs sm:space-y-3 sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Check Interval</span>
                  <span className="font-medium text-slate-200">{monitor.interval_secs}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Incidents</span>
                  <span className="font-medium text-slate-200">{incidents.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Last Check</span>
                  <span className="font-mono text-[10px] text-slate-200 sm:text-xs">
                    {monitor.last_checked_at
                      ? formatDistanceToNow(new Date(monitor.last_checked_at), {
                          addSuffix: true,
                        })
                      : 'Never'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Created</span>
                  <span className="font-mono text-[10px] text-slate-200 sm:text-xs">
                    {formatDistanceToNow(new Date(monitor.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
