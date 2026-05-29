interface StatusIndicatorProps {
  status: string;
}

export function StatusIndicator({ status }: StatusIndicatorProps) {
  const config = {
    up: { label: "Up", color: "#22c55e", ariaLabel: "Status: Up and running" },
    down: {
      label: "Down",
      color: "#ef4444",
      ariaLabel: "Status: Down - service unavailable",
    },
    unknown: {
      label: "Pending",
      color: "#6b7280",
      ariaLabel: "Status: Pending first check",
    },
  };

  const current = config[status as keyof typeof config] ?? config.unknown;

  return (
    <div
      className="flex items-center gap-2 whitespace-nowrap"
      aria-label={current.ariaLabel}
    >
      <div
        className={`h-2 w-2 shrink-0 rounded-full ${status === "down" ? "animate-pulse" : ""}`}
        style={{ backgroundColor: current.color }}
      />
      <span className="text-sm text-slate-200">{current.label}</span>
    </div>
  );
}
