interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: Array<{ value: number; status: "up" | "down" }>;
}

export function MetricCard({ label, value, trend }: MetricCardProps) {
  if (!trend) {
    return (
      <div className="rounded-md border border-[#2a2d3a] bg-[#1a1d27] p-4">
        <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-2 font-mono text-2xl font-medium text-slate-200">
          {value}
        </p>
      </div>
    );
  }

  const maxValue = Math.max(...trend.map((t) => t.value));

  return (
    <div className="rounded-md border border-[#2a2d3a] bg-[#1a1d27] p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 font-mono text-2xl font-medium text-slate-200">
        {value}
      </p>
      <div className="mt-3 flex h-6 items-end gap-0.5">
        {trend.map((point, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm"
            style={{
              height: `${(point.value / maxValue) * 100}%`,
              backgroundColor: point.status === "up" ? "#22c55e" : "#ef4444",
              opacity: 0.7,
            }}
          />
        ))}
      </div>
    </div>
  );
}
