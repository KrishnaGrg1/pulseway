import { ArrowUpRight, CheckCircle, MoreVertical, Trash2 } from "lucide-react";
import type { Monitor } from "#/lib/types";
import { StatusIndicator } from "./StatusIndicator";
import { UptimeBar } from "./UptimeBar";
import { MonitorSkeleton } from "./MonitorSkeleton";
import { MonitorForm } from "./MonitorForm";

interface MonitorTableProps {
  monitors?: Monitor[];
  isLoading: boolean;
  editingId: number | null;
  setEditingId: (id: number | null) => void;
  setShowForm: (show: boolean) => void;
  getStatus: (monitor: Monitor) => string;
  getUptimeHistory: (monitor: Monitor) => Array<{ status: "up" | "down" }>;
  updateMutation: {
    mutate: (data: {
      id: number;
      name: string;
      url: string;
      interval_secs: number;
    }) => void;
    isPending: boolean;
  };
  deleteMutation: {
    mutate: (id: number) => void;
    isPending: boolean;
  };
}

export function MonitorTable({
  monitors,
  isLoading,
  editingId,
  setEditingId,
  setShowForm,
  getStatus,
  getUptimeHistory,
  updateMutation,
  deleteMutation,
}: MonitorTableProps) {
  return (
    <div className="rounded-md border border-[#2a2d3a] bg-[#1a1d27]">
      <div className="border-b border-[#2a2d3a] px-4 py-3">
        <h2 className="text-base font-medium text-slate-200 md:text-lg">Monitors</h2>
      </div>

      {isLoading ? (
        <div>
          <MonitorSkeleton />
          <MonitorSkeleton />
          <MonitorSkeleton />
          <MonitorSkeleton />
        </div>
      ) : monitors?.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <CheckCircle className="h-8 w-8 text-slate-400" />
          <div>
            <p className="font-medium text-slate-200">No monitors yet</p>
            <p className="mt-1 text-sm text-slate-400">
              Add your first monitor to start tracking uptime
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="mt-2 rounded-md bg-[#3b82f6] px-4 py-2 text-sm font-medium text-white hover:bg-[#2563eb]"
          >
            Add monitor
          </button>
        </div>
      ) : (
        <>
          {/* TABLE HEADER - Desktop only */}
          <div className="hidden grid-cols-[100px_1fr_100px_80px_100px_120px_48px] items-center gap-3 border-b border-[#2a2d3a] px-4 py-2 text-xs uppercase tracking-wide text-slate-400 lg:grid">
            <div>Status</div>
            <div>URL</div>
            <div>Uptime</div>
            <div className="text-right">%</div>
            <div className="text-right">Response</div>
            <div className="text-right">Last check</div>
            <div></div>
          </div>

          {/* TABLE ROWS */}
          {monitors?.map((monitor) => {
            const status = getStatus(monitor);
            return (
              <div key={monitor.id}>
                {/* Desktop view */}
                <div className="hidden grid-cols-[100px_1fr_100px_80px_100px_120px_48px] items-center gap-3 border-b border-[#2a2d3a] px-4 py-3 hover:bg-[#0f1117] lg:grid">
                  <div>
                    <StatusIndicator status={status} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-200">
                      {monitor.name}
                    </p>
                    <a
                      href={monitor.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-400 hover:text-[#3b82f6]"
                    >
                      <span className="truncate">{monitor.url}</span>
                      <ArrowUpRight className="h-3 w-3 shrink-0" />
                    </a>
                  </div>

                  <div>
                    <UptimeBar history={getUptimeHistory(monitor)} />
                  </div>

                  <div className="text-right font-mono text-sm text-slate-200">
                    99.8%
                  </div>

                  <div className="text-right font-mono text-sm text-slate-200">
                    52ms
                  </div>

                  <div className="text-right text-xs text-slate-400">
                    2 min ago
                  </div>

                  <div className="flex justify-end">
                    <button
                      className="rounded p-1 text-slate-400 hover:bg-[#1a1d27] hover:text-slate-200"
                      onClick={() =>
                        setEditingId(editingId === monitor.id ? null : monitor.id)
                      }
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Mobile view */}
                <div className="flex flex-col gap-3 border-b border-[#2a2d3a] p-4 hover:bg-[#0f1117] lg:hidden">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusIndicator status={status} />
                        <p className="truncate text-sm font-medium text-slate-200">
                          {monitor.name}
                        </p>
                      </div>
                      <a
                        href={monitor.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 truncate text-xs text-slate-400 hover:text-[#3b82f6]"
                      >
                        <span className="truncate">{monitor.url}</span>
                        <ArrowUpRight className="h-3 w-3 shrink-0" />
                      </a>
                    </div>
                    <button
                      className="rounded p-1 text-slate-400 hover:bg-[#1a1d27] hover:text-slate-200"
                      onClick={() =>
                        setEditingId(editingId === monitor.id ? null : monitor.id)
                      }
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>

                  <div>
                    <UptimeBar history={getUptimeHistory(monitor)} />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex gap-4">
                      <div>
                        <span className="text-slate-400">Uptime: </span>
                        <span className="font-mono text-slate-200">99.8%</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Response: </span>
                        <span className="font-mono text-slate-200">52ms</span>
                      </div>
                    </div>
                    <div className="text-slate-400">2 min ago</div>
                  </div>
                </div>

                {editingId === monitor.id && (
                  <div className="border-b border-[#2a2d3a] bg-[#0f1117] p-4">
                    <MonitorForm
                      initialValues={{
                        name: monitor.name,
                        url: monitor.url,
                        interval_secs: monitor.interval_secs,
                      }}
                      onSubmit={(value) =>
                        updateMutation.mutate({ id: monitor.id, ...value })
                      }
                      isPending={updateMutation.isPending}
                      submitLabel="Update monitor"
                      onCancel={() => setEditingId(null)}
                    />
                    <button
                      className="mt-3 flex items-center gap-2 text-sm text-[#ef4444] hover:underline"
                      onClick={() => deleteMutation.mutate(monitor.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete monitor
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
