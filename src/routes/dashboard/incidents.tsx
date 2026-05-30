import { createFileRoute, Link } from '@tanstack/react-router'
import { AlertCircle, CheckCircle2, Clock, ExternalLink } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { Incident } from '#/lib/api-types'
import type { Monitor } from '#/lib/types'
import { useGetMonitor, useListAllIncidents } from '#/hooks/use-monitor'

export const Route = createFileRoute('/dashboard/incidents')({
  component: IncidentsPage,
})

function IncidentsPage() {
  const { data: incidents, isLoading: incidentsLoading } = useListAllIncidents()
  const { data: monitors } = useGetMonitor()
  const getMonitorById = (id: number): Monitor | undefined => {
    return monitors?.find((m) => m.id === id)
  }

  const activeIncidents = incidents?.filter((i) => !i.resolved_at) ?? []
  const resolvedIncidents = incidents?.filter((i) => i.resolved_at) ?? []

  if (incidentsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f1117]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f1117]">
      {/* Header */}
      <header className="border-b border-[#2a2d3a] bg-[#0f1117]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-200">Incidents</h1>
              <p className="mt-1 text-sm text-slate-400">Monitor downtime and incident history</p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="rounded-lg border border-[#2a2d3a] px-4 py-2 text-sm font-medium text-slate-300 hover:bg-[#1a1d27]"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Summary Cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-[#2a2d3a] bg-[#1a1d27] p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#ef4444]/10 p-2">
                <AlertCircle className="h-5 w-5 text-[#ef4444]" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Active Incidents</p>
                <p className="text-2xl font-bold text-slate-200">{activeIncidents.length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-[#2a2d3a] bg-[#1a1d27] p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#22c55e]/10 p-2">
                <CheckCircle2 className="h-5 w-5 text-[#22c55e]" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Resolved (24h)</p>
                <p className="text-2xl font-bold text-slate-200">{resolvedIncidents.length}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[#2a2d3a] bg-[#1a1d27] p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-slate-700/10 p-2">
                <Clock className="h-5 w-5 text-slate-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Avg Resolution</p>
                <p className="text-2xl font-bold text-slate-200">
                  {resolvedIncidents.length > 0
                    ? `${Math.round(
                        resolvedIncidents.reduce((acc, i) => acc + (i.duration_seconds ?? 0), 0) /
                          resolvedIncidents.length /
                          60
                      )}m`
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Incidents */}
        {activeIncidents.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-200">Active Incidents</h2>
            <div className="space-y-3">
              {activeIncidents.map((incident) => (
                <IncidentCard
                  key={incident.id}
                  incident={incident}
                  monitor={getMonitorById(incident.monitor_id)}
                  isActive
                />
              ))}
            </div>
          </div>
        )}

        {/* Resolved Incidents */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-200">Incident History</h2>
          {resolvedIncidents.length > 0 ? (
            <div className="space-y-3">
              {resolvedIncidents.map((incident) => (
                <IncidentCard
                  key={incident.id}
                  incident={incident}
                  monitor={getMonitorById(incident.monitor_id)}
                  isActive={false}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-[#2a2d3a] bg-[#1a1d27] p-12 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-slate-600" />
              <h3 className="mt-4 text-lg font-medium text-slate-300">No incidents</h3>
              <p className="mt-2 text-sm text-slate-500">All your monitors are running smoothly</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface IncidentCardProps {
  incident: Incident
  monitor?: Monitor
  isActive: boolean
}

function IncidentCard({ incident, monitor, isActive }: IncidentCardProps) {
  return (
    <div
      className={`rounded-lg border ${
        isActive ? 'border-[#ef4444]/20 bg-[#ef4444]/5' : 'border-[#2a2d3a] bg-[#1a1d27]'
      } p-4`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            {isActive ? (
              <div className="rounded-full bg-[#ef4444] p-1">
                <AlertCircle className="h-4 w-4 text-white" />
              </div>
            ) : (
              <CheckCircle2 className="h-5 w-5 text-slate-500" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-slate-200">{monitor?.name ?? 'Unknown Monitor'}</h3>
                {isActive && (
                  <span className="rounded-md bg-[#ef4444]/10 px-2 py-0.5 text-xs font-medium text-[#ef4444]">
                    Active
                  </span>
                )}
                {incident.notified && (
                  <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-400">
                    Notified
                  </span>
                )}
              </div>
              <p className="mt-1 font-mono text-sm text-slate-400">{monitor?.url}</p>
            </div>
          </div>

          <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
            <div>
              <p className="text-xs text-slate-500">Started</p>
              <p className="font-mono text-slate-300">
                {new Date(incident.started_at).toLocaleString()}
              </p>
              <p className="text-xs text-slate-500">
                {formatDistanceToNow(new Date(incident.started_at), {
                  addSuffix: true,
                })}
              </p>
            </div>

            {!isActive && incident.resolved_at && (
              <div>
                <p className="text-xs text-slate-500">Resolved</p>
                <p className="font-mono text-slate-300">
                  {new Date(incident.resolved_at).toLocaleString()}
                </p>
                <p className="text-xs text-slate-500">
                  {formatDistanceToNow(new Date(incident.resolved_at), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            )}

            {incident.duration_seconds && (
              <div>
                <p className="text-xs text-slate-500">Duration</p>
                <p className="font-mono text-slate-300">
                  {Math.floor(incident.duration_seconds / 60)}m {incident.duration_seconds % 60}s
                </p>
              </div>
            )}
          </div>
        </div>

        {monitor && (
          <Link
            to="/dashboard/monitor/$id"
            params={{ id: monitor.id.toString() }}
            className="ml-4 rounded-lg p-2 text-slate-400 hover:bg-[#0f1117] hover:text-slate-200"
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  )
}
