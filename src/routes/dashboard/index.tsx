import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  getMonitors,
  getDashboardStats,
  createMonitor,
  deleteMonitor,
} from "#/lib/queries";
import { logout, isAuthenticated } from "#/lib/auth";
import type { Monitor } from "#/lib/types";
import Logo from "#/components/Logo";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [interval, setInterval] = useState(60);
  const [liveStatuses, setLiveStatuses] = useState<Record<number, string>>({});

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate({ to: "/login" });
    }
  }, []);

  // SSE connection for live updates
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;
    let source: EventSource;

    const connect = () => {
      source = new EventSource(`${apiUrl}/sse`);

      source.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.monitor_id) {
          setLiveStatuses((prev) => ({
            ...prev,
            [data.monitor_id]: data.status,
          }));
          queryClient.invalidateQueries({ queryKey: ["monitors"] });
        }
      };

      source.onerror = () => {
        source.close();
        // Reconnect after 3 seconds
        setTimeout(connect, 3000);
      };
    };

    connect();

    return () => source?.close();
  }, []);

  const { data: monitors, isLoading: monitorsLoading } = useQuery({
    queryKey: ["monitors"],
    queryFn: getMonitors,
  });

  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: getDashboardStats,
    refetchInterval: 30000,
  });

  const createMutation = useMutation({
    mutationFn: () => createMonitor({ name, url, interval_secs: interval }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monitors"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      setShowForm(false);
      setName("");
      setUrl("");
      setInterval(60);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteMonitor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monitors"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });

  const getStatus = (monitor: Monitor) => {
    return liveStatuses[monitor.id] || "unknown";
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "var(--sidebar-w) 1fr",
        minHeight: "100dvh",
      }}
    >
      {/* Sidebar */}
      <aside className="app-sidebar">
        <div className="app-sidebar-header">
          <Logo />
        </div>
        <div className="sidebar-body">
          <span className="sidebar-section-label">Navigation</span>
          <div className="sidebar-link active">Overview</div>
          <div className="sidebar-link" style={{ opacity: 0.5 }}>
            Incidents
          </div>
          <div className="sidebar-link" style={{ opacity: 0.5 }}>
            Settings
          </div>

          <span className="sidebar-section-label" style={{ marginTop: "20px" }}>
            Monitors
          </span>
          {monitors?.map((m) => {
            const s = getStatus(m);
            return (
              <div
                key={m.id}
                className="sidebar-link"
                style={{ fontSize: "12px" }}
              >
                <div
                  className={`sidebar-monitor-dot ${s === "up" ? "dot-up" : s === "down" ? "dot-down" : "dot-pend"}`}
                />
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {m.name}
                </span>
              </div>
            );
          })}

          <div
            style={{
              marginTop: "auto",
              paddingTop: "24px",
              borderTop: "1px solid var(--line)",
            }}
          >
            <button
              className="sidebar-link"
              style={{ width: "100%", color: "var(--text-3)" }}
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="app-main">
        {/* Page header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "28px",
          }}
        >
          <div>
            <h1 className="page-title">Overview</h1>
            <p className="page-sub">All monitors · live via SSE</p>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancel" : "+ Add monitor"}
          </button>
        </div>

        {/* Add monitor form */}
        {showForm && (
          <div
            className="card fade-in"
            style={{ padding: "24px", marginBottom: "24px" }}
          >
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--text-3)",
                marginBottom: "16px",
              }}
            >
              New monitor
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 2fr auto",
                gap: "12px",
                alignItems: "flex-end",
              }}
            >
              <div>
                <label className="field-label">Name</label>
                <input
                  className="field"
                  value={name}
                  placeholder="Main API"
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="field-label">URL</label>
                <input
                  className="field"
                  value={url}
                  placeholder="https://api.example.com/health"
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <div>
                <label className="field-label">Interval (s)</label>
                <input
                  className="field"
                  type="number"
                  value={interval}
                  placeholder="60"
                  style={{ width: "90px" }}
                  onChange={(e) => setInterval(Number(e.target.value))}
                />
              </div>
            </div>
            <button
              className="btn btn-primary btn-sm"
              style={{ marginTop: "16px" }}
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending || !name || !url}
            >
              {createMutation.isPending ? "Creating…" : "Create monitor"}
            </button>
          </div>
        )}

        {/* Stats row */}
        {stats && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "12px",
              marginBottom: "28px",
            }}
          >
            {[
              { label: "Total monitors", value: stats.total_monitors },
              { label: "Active now", value: stats.active_monitors },
              {
                label: "Uptime 24h",
                value: `${stats.uptime_percentage?.toFixed(1)}%`,
                accent: true,
              },
              {
                label: "Avg latency",
                value: `${stats.avg_latency_ms?.toFixed(0)}ms`,
              },
            ].map((s) => (
              <div key={s.label} className="stat-tile">
                <div className="stat-tile-label">{s.label}</div>
                <div
                  className="stat-tile-value"
                  style={s.accent ? { color: "var(--lagoon-deep)" } : {}}
                >
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Monitor list */}
        {monitorsLoading ? (
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "13px",
              color: "var(--text-3)",
            }}
          >
            Loading monitors…
          </p>
        ) : monitors?.length === 0 ? (
          <div
            className="card"
            style={{ padding: "56px", textAlign: "center" }}
          >
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "13px",
                color: "var(--text-3)",
                marginBottom: "16px",
              }}
            >
              No monitors yet.
            </p>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowForm(true)}
            >
              Add your first monitor
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {monitors?.map((monitor) => {
              const status = getStatus(monitor);
              return (
                <div
                  key={monitor.id}
                  className={`monitor-row ${status === "down" ? "is-down" : ""}`}
                >
                  <span
                    className={`badge ${status === "up" ? "badge-up" : status === "down" ? "badge-down" : "badge-pend"}`}
                  >
                    {status === "up"
                      ? "UP"
                      : status === "down"
                        ? "DOWN"
                        : "PENDING"}
                  </span>

                  <div style={{ flex: "0 0 180px" }}>
                    <p
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--text-1)",
                        margin: 0,
                      }}
                    >
                      {monitor.name}
                    </p>
                    <p
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "11px",
                        color: "var(--text-3)",
                        margin: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {monitor.url}
                    </p>
                  </div>

                  {/* Heartbeat visualization */}
                  <div className="heartbeat" style={{ flex: 1 }}>
                    {Array.from({ length: 30 }).map((_, i) => (
                      <div
                        key={i}
                        className={`hb-seg ${status === "down" && i > 22 ? "down" : status !== "pending" ? "up" : ""}`}
                        style={{
                          height: `${8 + Math.sin(i * 0.8) * 4 + Math.random() * 3}px`,
                        }}
                      />
                    ))}
                  </div>

                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "12px",
                      color: "var(--text-2)",
                      flexShrink: 0,
                    }}
                  >
                    every {monitor.interval_secs}s
                  </span>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => deleteMutation.mutate(monitor.id)}
                    disabled={deleteMutation.isPending}
                  >
                    Delete
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
