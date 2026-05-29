import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
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
} from "lucide-react";
import {
  getMonitorDetails,
  getAlerts,
  createAlert,
  deleteAlert,
  getCheckHistory,
} from "#/lib/queries";
import { useMonitorStatus } from "#/hooks";
import { formatDistanceToNow } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

export const Route = createFileRoute("/dashboard/monitor/$id")({
  component: MonitorDetailPage,
});

function MonitorDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const monitorId = parseInt(id);

  const [showAlertForm, setShowAlertForm] = useState(false);
  const [newAlertEmail, setNewAlertEmail] = useState("");
  const [timeRange, setTimeRange] = useState<"1h" | "24h" | "7d">("24h");

  const { statuses: liveStatuses, isConnected } = useMonitorStatus();

  const { data, isLoading } = useQuery({
    queryKey: ["monitor-details", monitorId],
    queryFn: () => getMonitorDetails(monitorId),
    refetchInterval: 30000,
  });

  const { data: checkHistory } = useQuery({
    queryKey: ["check-history", monitorId, timeRange],
    queryFn: () => {
      const limit = timeRange === "1h" ? 120 : timeRange === "24h" ? 2880 : 20160;
      return getCheckHistory(monitorId, limit);
    },
    refetchInterval: 30000,
  });

  const { data: alerts } = useQuery({
    queryKey: ["alerts", monitorId],
    queryFn: () => getAlerts(monitorId),
  });

  const createAlertMutation = useMutation({
    mutationFn: (email: string) =>
      createAlert({ monitor_id: monitorId, email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts", monitorId] });
      setShowAlertForm(false);
      setNewAlertEmail("");
    },
  });

  const deleteAlertMutation = useMutation({
    mutationFn: (alertId: number) => deleteAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts", monitorId] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f1117]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f1117]">
        <p className="text-slate-400">Monitor not found</p>
      </div>
    );
  }

  const { monitor, incidents, recent_checks } = data;
  const currentStatus =
    isConnected && liveStatuses[monitorId]
      ? liveStatuses[monitorId]
      : monitor.current_status ?? "unknown";

  const activeIncident = incidents.find((i: { resolved_at: string | null }) => !i.resolved_at);
  const uptimeChange = monitor.uptime_percentage >= 99 ? "up" : "down";
  const latencyChange = monitor.avg_latency_ms <= 200 ? "up" : "down";

  // Transform check history for chart (oldest to newest, left to right)
  const chartData =
    checkHistory
      ?.slice()
      .sort((a: { checked_at: string }, b: { checked_at: string }) =>
        new Date(a.checked_at).getTime() - new Date(b.checked_at).getTime()
      )
      .map((check: { checked_at: string; latency_ms: number; status: string }) => ({
        time: new Date(check.checked_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        latency: check.latency_ms,
        status: check.status === "up" ? 1 : 0,
        timestamp: new Date(check.checked_at).getTime(), // Keep for reference
      })) || [];

  return (
    <div className="min-h-screen bg-[#0f1117]">
      {/* Header */}
      <header className="border-b border-[#2a2d3a] bg-[#0f1117]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate({ to: "/dashboard" })}
              className="rounded-lg p-2 text-slate-400 hover:bg-[#1a1d27] hover:text-slate-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-slate-200">
                  {monitor.name}
                </h1>
                <div
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${
                    currentStatus === "up"
                      ? "bg-[#22c55e]/10 text-[#22c55e]"
                      : currentStatus === "down"
                        ? "bg-[#ef4444]/10 text-[#ef4444]"
                        : "bg-slate-700/10 text-slate-400"
                  }`}
                >
                  <Radio
                    className={`h-3 w-3 ${isConnected ? "animate-pulse" : ""}`}
                  />
                  {currentStatus === "up"
                    ? "Online"
                    : currentStatus === "down"
                      ? "Down"
                      : "Unknown"}
                </div>
              </div>
              <p className="mt-1 font-mono text-sm text-slate-400">
                {monitor.url}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Chart - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Incident Banner */}
            {activeIncident && (
              <div className="rounded-lg border border-[#ef4444]/20 bg-[#ef4444]/5 p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-[#ef4444] p-1">
                    <Activity className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#ef4444]">
                      Service Disruption
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                      Started{" "}
                      {formatDistanceToNow(new Date(activeIncident.started_at), {
                        addSuffix: true,
                      })}
                      {activeIncident.notified && " · Alerts sent"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Price Card Style Metrics */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-[#2a2d3a] bg-[#1a1d27] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Uptime</span>
                  <div
                    className={`flex items-center gap-1 text-xs ${
                      uptimeChange === "up"
                        ? "text-[#22c55e]"
                        : "text-[#ef4444]"
                    }`}
                  >
                    {uptimeChange === "up" ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {uptimeChange === "up" ? "Healthy" : "Degraded"}
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-100">
                    {monitor.uptime_percentage?.toFixed(2) ?? 0}%
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">Last 24 hours</p>
              </div>

              <div className="rounded-lg border border-[#2a2d3a] bg-[#1a1d27] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Avg Response</span>
                  <div
                    className={`flex items-center gap-1 text-xs ${
                      latencyChange === "up"
                        ? "text-[#22c55e]"
                        : "text-[#ef4444]"
                    }`}
                  >
                    {latencyChange === "up" ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {latencyChange === "up" ? "Fast" : "Slow"}
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-100">
                    {monitor.avg_latency_ms?.toFixed(0) ?? 0}
                  </span>
                  <span className="text-lg text-slate-400">ms</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">Last 24 hours</p>
              </div>
            </div>

            {/* Stock Chart Style */}
            <div className="rounded-lg border border-[#2a2d3a] bg-[#1a1d27] p-5">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-200">
                    Response Time
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Real-time latency chart (older ← → newer)
                  </p>
                </div>
                <div className="flex gap-2">
                  {(["1h", "24h", "7d"] as const).map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                        timeRange === range
                          ? "bg-blue-600 text-white"
                          : "text-slate-400 hover:bg-[#2a2d3a] hover:text-slate-200"
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-64">
                {chartData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient
                            id="colorLatency"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#3b82f6"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="#3b82f6"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#2a2d3a"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="time"
                          stroke="#64748b"
                          tick={{ fill: "#64748b", fontSize: 11 }}
                          tickLine={false}
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          stroke="#64748b"
                          tick={{ fill: "#64748b", fontSize: 11 }}
                          tickLine={false}
                          axisLine={false}
                          label={{
                            value: "Latency (ms)",
                            angle: -90,
                            position: "insideLeft",
                            fill: "#64748b",
                            fontSize: 11,
                          }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1a1d27",
                            border: "1px solid #2a2d3a",
                            borderRadius: "8px",
                            color: "#e2e8f0",
                          }}
                          labelStyle={{ color: "#94a3b8" }}
                          formatter={(value) => [`${value}ms`, "Latency"]}
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
                    <div className="mt-2 flex justify-between px-2 text-xs text-slate-500">
                      <span>← Older</span>
                      <span className="flex items-center gap-1">
                        <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                        Latest
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-sm text-slate-500">
                      No data available for this time range
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Incident Timeline */}
            <div className="rounded-lg border border-[#2a2d3a] bg-[#1a1d27] p-5">
              <h2 className="mb-4 text-base font-semibold text-slate-200">
                Incident History
              </h2>
              <div className="space-y-3">
                {incidents.length > 0 ? (
                  incidents
                    .filter((i: { resolved_at: string | null }) => i.resolved_at)
                    .slice(0, 5)
                    .map((incident: { id: number; started_at: string; resolved_at: string | null; duration_seconds?: number; notified: boolean }) => (
                      <div
                        key={incident.id}
                        className="flex items-center gap-3 rounded-lg border border-[#2a2d3a] bg-[#0f1117] p-3"
                      >
                        <div className="rounded-full bg-slate-700/30 p-2">
                          <Clock className="h-4 w-4 text-slate-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-slate-300">
                              Service recovered
                            </p>
                            {incident.notified && (
                              <span className="rounded bg-blue-500/10 px-2 py-0.5 text-xs text-blue-400">
                                Notified
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-slate-500">
                            Downtime:{" "}
                            {incident.duration_seconds
                              ? `${Math.floor(incident.duration_seconds / 60)}m ${incident.duration_seconds % 60}s`
                              : "Unknown"}{" "}
                            ·{" "}
                            {formatDistanceToNow(
                              new Date(incident.started_at),
                              { addSuffix: true },
                            )}
                          </p>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-center text-sm text-slate-500">
                    No incidents recorded
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Alert Recipients */}
            <div className="rounded-lg border border-[#2a2d3a] bg-[#1a1d27] p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-200">
                  Alerts
                </h2>
                <button
                  onClick={() => setShowAlertForm(!showAlertForm)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-[#0f1117] hover:text-slate-200"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {showAlertForm && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (newAlertEmail) {
                      createAlertMutation.mutate(newAlertEmail);
                    }
                  }}
                  className="mb-4 space-y-3"
                >
                  <input
                    type="email"
                    value={newAlertEmail}
                    onChange={(e) => setNewAlertEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full rounded-lg border border-[#2a2d3a] bg-[#0f1117] px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                    required
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={createAlertMutation.isPending}
                      className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
                    >
                      {createAlertMutation.isPending ? "Adding..." : "Add"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAlertForm(false);
                        setNewAlertEmail("");
                      }}
                      className="rounded-lg border border-[#2a2d3a] px-3 py-2 text-sm font-medium text-slate-400 hover:bg-[#0f1117]"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {alerts && alerts.length > 0 ? (
                  alerts.map((alert: { id: number; email: string }) => (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between rounded-lg border border-[#2a2d3a] bg-[#0f1117] p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <p className="text-sm text-slate-300">{alert.email}</p>
                      </div>
                      <button
                        onClick={() => deleteAlertMutation.mutate(alert.id)}
                        className="rounded p-1 text-slate-500 hover:bg-[#2a2d3a] hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed border-[#2a2d3a] p-6 text-center">
                    <Mail className="mx-auto h-8 w-8 text-slate-600" />
                    <p className="mt-2 text-sm text-slate-500">
                      No recipients
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      Add emails to get alerts
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="rounded-lg border border-[#2a2d3a] bg-[#1a1d27] p-5">
              <h2 className="mb-4 text-base font-semibold text-slate-200">
                Monitor Info
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Check Interval</span>
                  <span className="font-medium text-slate-200">
                    {monitor.interval_secs}s
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Incidents</span>
                  <span className="font-medium text-slate-200">
                    {incidents.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Last Check</span>
                  <span className="font-mono text-xs text-slate-200">
                    {monitor.last_checked_at
                      ? formatDistanceToNow(new Date(monitor.last_checked_at), {
                          addSuffix: true,
                        })
                      : "Never"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Created</span>
                  <span className="font-mono text-xs text-slate-200">
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
  );
}
