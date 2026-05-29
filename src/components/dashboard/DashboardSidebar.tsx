import { Activity, AlertCircle, Clock, LogOut } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import Logo from "#/components/Logo";
import { logout } from "#/lib/auth";

export function DashboardSidebar() {
  const location = useLocation();
  const isOverview = location.pathname === "/dashboard";
  const isIncidents = location.pathname === "/dashboard/incidents";

  return (
    <aside className="flex w-full flex-col border-r border-[#2a2d3a] bg-[#0f1117] lg:sticky lg:top-0 lg:h-screen lg:w-[220px]">
      <div className="flex h-14 items-center border-b border-[#2a2d3a] px-4">
        <Logo />
      </div>

      <nav className="flex-1 p-3">
        <Link
          to="/dashboard"
          className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm ${
            isOverview
              ? "border-l-2 border-[#3b82f6] bg-[#1a1d27] text-slate-200"
              : "text-slate-400 hover:bg-[#1a1d27] hover:text-slate-200"
          }`}
        >
          <Activity className="h-4 w-4" />
          Overview
        </Link>
        <Link
          to="/dashboard/incidents"
          className={`mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm ${
            isIncidents
              ? "border-l-2 border-[#3b82f6] bg-[#1a1d27] text-slate-200"
              : "text-slate-400 hover:bg-[#1a1d27] hover:text-slate-200"
          }`}
        >
          <AlertCircle className="h-4 w-4" />
          Incidents
        </Link>
      </nav>

      <div className="border-t border-[#2a2d3a] p-3">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-400 hover:bg-[#1a1d27] hover:text-slate-200"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
