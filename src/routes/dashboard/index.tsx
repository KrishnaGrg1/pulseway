import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Plus, Radio, Menu, X } from "lucide-react";
import {
  getMonitors,
  getDashboardStats,
  createMonitor,
  deleteMonitor,
  updateMonitor,
  getCheckHistory,
  getMetricsHistory,
} from "#/lib/queries";
import { isAuthenticated } from "#/lib/auth";
import type { Monitor } from "#/lib/types";
import { useMonitorStatus } from "#/hooks";
import {
  MetricCard,
  MonitorForm,
  DashboardSidebar,
  MonitorTable,
} from "#/components/dashboard";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [uptimeHistories, setUptimeHistories] = useState<
    Record<number, Array<{ status: "up" | "down" }>>
  >({});

  // Use custom hook for real-time status updates
  const { statuses: liveStatuses, isConnected } = useMonitorStatus();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate({ to: "/login" });
    }
  }, [navigate]);

  const { data: monitors, isLoading } = useQuery({
    queryKey: ["monitors"],
    queryFn: getMonitors,
  });

  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: getDashboardStats,
    refetchInterval: 30000,
  });

  // Fetch real metrics history (7-day trends)
  const { data: metricsHistory } = useQuery({
    queryKey: ["metrics-history"],
    queryFn: () => getMetricsHistory(7),
    refetchInterval: 60000, // Refetch every minute
  });

  const createMutation = useMutation({
    mutationFn: (value: { name: string; url: string; interval_secs: number }) =>
      createMonitor(value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monitors"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      ...value
    }: {
      id: number;
      name: string;
      url: string;
      interval_secs: number;
    }) => updateMonitor(id, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monitors"] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteMonitor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monitors"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });

  // Merge backend status with SSE live updates
  const getStatus = (monitor: Monitor) => {
    // Prefer SSE live status if available and connected
    if (isConnected && liveStatuses[monitor.id]) {
      return liveStatuses[monitor.id];
    }
    // Fallback to backend's current_status
    return monitor.current_status ?? "unknown";
  };

  const healthyCount =
    monitors?.filter((m) => getStatus(m) === "up").length ?? 0;

  // Fetch uptime history for each monitor (30-segment uptime bar)
  useEffect(() => {
    if (!monitors) return;

    const fetchHistories = async () => {
      const histories: typeof uptimeHistories = {};

      for (const monitor of monitors) {
        try {
          const checks = await getCheckHistory(monitor.id, 30);
          histories[monitor.id] = checks.map((check) => ({
            status: check.status,
          }));
        } catch (error) {
          console.error(
            `Failed to fetch history for monitor ${monitor.id}:`,
            error,
          );
          // Fallback to empty array - component should handle gracefully
          histories[monitor.id] = [];
        }
      }

      setUptimeHistories(histories);
    };

    fetchHistories();

    // Refetch histories every 2 minutes to keep uptime bars fresh
    const interval = setInterval(fetchHistories, 120000);
    return () => clearInterval(interval);
  }, [monitors]);

  const getUptimeHistory = (monitor: Monitor) => {
    const history = uptimeHistories[monitor.id];

    // If we have real history data, use it
    if (history && history.length > 0) {
      return history;
    }

    // Fallback: create a placeholder based on current status
    const currentStatus = getStatus(monitor);
    return Array(30).fill({
      status: currentStatus === "up" ? ("up" as const) : ("down" as const),
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0f1117] lg:flex-row">
      {/* MOBILE SIDEBAR - Slide-in overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Sidebar */}
          <div className="absolute left-0 top-0 h-full w-64 animate-in slide-in-from-left">
            <DashboardSidebar />
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <div className="hidden lg:block">
        <DashboardSidebar />
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1">
        {/* HEADER */}
        <header className="flex h-14 items-center justify-between gap-3 border-b border-[#2a2d3a] px-4 md:px-6">
          <div className="flex items-center gap-2 md:gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded p-1 text-slate-400 hover:bg-[#1a1d27] hover:text-slate-200 lg:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <h1 className="text-base font-medium text-slate-200 md:text-lg">Dashboard</h1>

            {/* SSE Connection Status */}
            <div
              className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs ${
                isConnected
                  ? "bg-[#22c55e]/10 text-[#22c55e]"
                  : "bg-slate-700/10 text-slate-400"
              }`}
            >
              <Radio
                className={`h-3 w-3 ${isConnected ? "animate-pulse" : ""}`}
              />
              <span className="hidden sm:inline">{isConnected ? "Live" : "Disconnected"}</span>
            </div>
          </div>

          <button
            onClick={() => {
              setEditingId(null);
              setShowForm(!showForm);
            }}
            className="flex items-center gap-1.5 rounded-md bg-[#3b82f6] px-3 py-2 text-sm font-medium text-white hover:bg-[#2563eb] md:gap-2 md:px-4"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add monitor</span>
            <span className="sm:hidden">Add</span>
          </button>
        </header>

        {/* CONTENT */}
        <div className="p-4 md:p-6">
          {/* METRICS */}
          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 md:gap-4">
            <MetricCard
              label="Total monitors"
              value={stats?.total_monitors ?? 0}
              trend={metricsHistory?.total_monitors
                .slice()
                .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                .map((p) => ({
                  value: p.value,
                  status: p.healthy ? ("up" as const) : ("down" as const),
                }))}
            />
            <MetricCard
              label="Healthy"
              value={stats?.healthy_monitors ?? 0}
              trend={metricsHistory?.healthy_count
                .slice()
                .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                .map((p) => ({
                  value: p.value,
                  status: p.healthy ? ("up" as const) : ("down" as const),
                }))}
            />
            <MetricCard
              label="Uptime 24h"
              value={
                stats?.uptime_percentage
                  ? `${stats.uptime_percentage.toFixed(1)}%`
                  : "0%"
              }
              trend={metricsHistory?.uptime_percentage
                .slice()
                .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                .map((p) => ({
                  value: p.value,
                  status: p.healthy ? ("up" as const) : ("down" as const),
                }))}
            />
            <MetricCard
              label="Avg response"
              value={
                stats?.avg_latency_ms
                  ? `${stats.avg_latency_ms.toFixed(0)}ms`
                  : "0ms"
              }
              trend={metricsHistory?.avg_latency_ms
                .slice()
                .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                .map((p) => ({
                  value: p.value,
                  status: p.healthy ? ("up" as const) : ("down" as const),
                }))}
            />
          </div>

          {/* ADD FORM */}
          {showForm && (
            <div className="mb-6">
              <MonitorForm
                onSubmit={(value) => createMutation.mutate(value)}
                isPending={createMutation.isPending}
                submitLabel="Create monitor"
                onCancel={() => setShowForm(false)}
              />
            </div>
          )}

          {/* MONITORS TABLE */}
          <MonitorTable
            monitors={monitors}
            isLoading={isLoading}
            editingId={editingId}
            setEditingId={setEditingId}
            setShowForm={setShowForm}
            getStatus={getStatus}
            getUptimeHistory={getUptimeHistory}
            updateMutation={updateMutation}
            deleteMutation={deleteMutation}
          />
        </div>
      </main>
    </div>
  );
}
