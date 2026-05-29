interface UptimeBarProps {
  history?: Array<{ status: "up" | "down" }>;
}

export function UptimeBar({ history }: UptimeBarProps) {
  // If no history provided, show all gray (pending)
  const segments =
    history ?? Array.from({ length: 30 }, () => ({ status: "up" as const }));

  return (
    <div className="flex h-6 items-center gap-0.5">
      {segments.slice(0, 30).map((seg, i) => (
        <div
          key={i}
          className="h-full w-[2px] rounded-sm"
          style={{
            backgroundColor: seg.status === "up" ? "#22c55e" : "#ef4444",
            opacity: 0.7,
          }}
        />
      ))}
    </div>
  );
}
