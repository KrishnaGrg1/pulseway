// API Response Types from Backend

export interface CheckResult {
  status: "up" | "down";
  latency_ms: number;
  checked_at: string;
}

export interface CheckHistoryResponse {
  message: string;
  data: {
    checks: CheckResult[];
  };
}

export interface MetricsHistoryPoint {
  timestamp: string;
  value: number;
  healthy: boolean;
}

export interface MetricsHistoryResponse {
  message: string;
  data: {
    total_monitors: MetricsHistoryPoint[];
    healthy_count: MetricsHistoryPoint[];
    uptime_percentage: MetricsHistoryPoint[];
    avg_latency_ms: MetricsHistoryPoint[];
  };
}

export interface EnhancedMonitor {
  id: number;
  user_id: number;
  name: string;
  url: string;
  interval_secs: number;
  is_active: boolean;
  created_at: string;
  current_status: "up" | "down" | "unknown";
  uptime_percentage: number;
  avg_latency_ms: number;
  last_checked_at: string;
  last_check_status: string;
}

export interface EnhancedMonitorsResponse {
  message: string;
  data: EnhancedMonitor[];
}

export interface DashboardStatsResponse {
  message: string;
  data: {
    total_monitors: number;
    healthy_monitors: number;
    uptime_percentage: number;
    avg_latency_ms: number;
  };
}
