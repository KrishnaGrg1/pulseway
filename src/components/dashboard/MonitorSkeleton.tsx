export function MonitorSkeleton() {
  return (
    <div className="grid grid-cols-[100px_1fr_100px_80px_100px_120px_48px] items-center gap-3 border-b border-[#2a2d3a] px-4 py-3 animate-pulse">
      <div>
        <div className="h-4 w-16 rounded-sm bg-[#1a1d27]" />
      </div>
      <div>
        <div className="h-4 w-48 rounded-sm bg-[#1a1d27]" />
      </div>
      <div>
        <div className="h-6 w-full rounded-sm bg-[#1a1d27]" />
      </div>
      <div className="flex justify-end">
        <div className="h-4 w-12 rounded-sm bg-[#1a1d27]" />
      </div>
      <div className="flex justify-end">
        <div className="h-4 w-12 rounded-sm bg-[#1a1d27]" />
      </div>
      <div className="flex justify-end">
        <div className="h-4 w-20 rounded-sm bg-[#1a1d27]" />
      </div>
      <div className="flex justify-end">
        <div className="h-4 w-4 rounded-sm bg-[#1a1d27]" />
      </div>
    </div>
  );
}
