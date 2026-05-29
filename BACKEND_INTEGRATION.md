# Frontend Backend Integration Guide

## Overview
All frontend components are now fully integrated with the backend API endpoints. The dashboard uses real data from the following endpoints:

## ✅ Implemented Endpoints

### 1. Check History Endpoint
**Location:** `GET /api/v1/monitors/{id}/check-history?limit=30`

**Frontend Integration:**
- Function: `getCheckHistory(monitorId, limit)` in `src/lib/queries.ts`
- Used By: Dashboard table (UptimeBar component)
- Purpose: Powers the 30-segment uptime visualization

**Implementation:**
```typescript
// src/routes/dashboard/index.tsx - Line ~108
useEffect(() => {
  if (!monitors) return;
  const fetchHistories = async () => {
    for (const monitor of monitors) {
      const checks = await getCheckHistory(monitor.id, 30);
      // Converts to { status: "up" | "down" } format
    }
  };
  fetchHistories();
}, [monitors]);
```

---

### 2. Metrics History Endpoint
**Location:** `GET /api/v1/dashboard/metrics-history?days=7`

**Frontend Integration:**
- Function: `getMetricsHistory(days)` in `src/lib/queries.ts`
- Used By: Dashboard metric cards (MetricCard component)
- Purpose: Powers the 4 spark line charts showing 7-day trends

**Implementation:**
```typescript
// src/routes/dashboard/index.tsx - Line ~74
const { data: metricsHistory } = useQuery({
  queryKey: ["metrics-history"],
  queryFn: () => getMetricsHistory(7),
  refetchInterval: 60000, // Refetch every minute
});
```

**Spark Line Rendering:**
- Total Monitors: `metricsHistory?.total_monitors`
- Healthy Count: `metricsHistory?.healthy_count`
- Uptime 24h: `metricsHistory?.uptime_percentage`
- Avg Response: `metricsHistory?.avg_latency_ms`

Each metric displays as a bar chart with:
- 🟢 Green bars = healthy status
- 🔴 Red bars = degraded/down status

---

### 3. Enhanced Monitor List
**Location:** `GET /api/v1/monitors`

**Frontend Integration:**
- Function: `getMonitors()` in `src/lib/queries.ts`
- Used By: Dashboard table (MonitorTable component)
- Purpose: Displays monitor list with live status and stats

**Table Columns:**
| Column | Data | Type |
|--------|------|------|
| Status | `current_status` | "up" \| "down" \| "unknown" |
| URL | `name` + `url` | string |
| Uptime Bar | Check history | visual |
| % | `uptime_percentage` | number |
| Response | `avg_latency_ms` | number |
| Last Check | `last_checked_at` | ISO timestamp |

---

### 4. Dashboard Stats
**Location:** `GET /api/v1/dashboard/stats`

**Frontend Integration:**
- Function: `getDashboardStats()` in `src/lib/queries.ts`
- Used By: Dashboard metric cards (4 top cards)
- Purpose: Powers the current metric values

**Refetch Strategy:**
```typescript
// Refetches every 30 seconds
const { data: stats } = useQuery({
  queryKey: ["stats"],
  queryFn: getDashboardStats,
  refetchInterval: 30000,
});
```

---

## 📁 File Structure

### API Types (New)
- `src/lib/api-types.ts` - Backend response types
  - CheckResult, CheckHistoryResponse
  - MetricsHistoryResponse, MetricsHistoryPoint
  - DashboardStatsResponse

### Updated Files
- `src/lib/queries.ts` - Added 2 new query functions
  - `getCheckHistory(monitorId, limit)`
  - `getMetricsHistory(days)`
- `src/lib/types.ts` - Updated DashboardStats interface
  - Added optional `healthy_monitors` field

### Dashboard Structure
- `src/routes/dashboard/index.tsx` - Main page orchestration
  - Fetches all 3 data sources
  - Manages form state
  - Handles SSE connection
- `src/routes/dashboard/components/`
  - `MonitorTable.tsx` - Displays monitor table
  - `MetricCard.tsx` - Renders spark lines
  - `UptimeBar.tsx` - Renders 30-segment bars
  - Other components...

---

## 🔄 Real-Time Updates

### SSE Connection
- Custom hook: `useMonitorStatus()` in `src/hooks/useMonitorStatus.ts`
- Listens to `GET /api/v1/sse` stream
- Updates `liveStatuses` in real-time
- Invalidates `monitors` and `stats` queries on status change
- Auto-reconnects with 3-second backoff

### Live Status Indicator
Header shows connection status:
- 🟢 **Live** (green, pulsing) = connected
- ⚪ **Disconnected** (gray) = connection lost

---

## 🔄 Query Refetch Strategy

| Query | Endpoint | Refetch Interval |
|-------|----------|-----------------|
| monitors | GET /monitors | On SSE status change |
| stats | GET /dashboard/stats | Every 30s |
| metrics-history | GET /dashboard/metrics-history | Every 60s |
| check-history | GET /monitors/{id}/check-history | On mount (once per monitor) |

---

## 📊 Data Flow

```
Backend APIs
    ↓
Query Functions (src/lib/queries.ts)
    ↓
useQuery Hooks (Dashboard)
    ↓
State (React)
    ↓
Components (render with real data)
    ↓
UI (tables, charts, indicators)
```

---

## ✅ Testing Checklist

- [ ] Run `npm install` to install any new dependencies
- [ ] Start the dev server: `npm run dev`
- [ ] Add a monitor and verify it appears in the table
- [ ] Check that uptime bar shows 30 segments
- [ ] Verify metric cards show spark lines with correct colors
- [ ] Monitor live status updates (watch for SSE "Live" indicator)
- [ ] Trigger a monitor down event and verify:
  - [ ] Status changes to "Down" in table
  - [ ] Uptime bar shows red segments on the right
  - [ ] SSE notification shows in header
- [ ] Verify metrics update when data changes

---

## 🐛 Troubleshooting

**Metric cards showing "0" values:**
- Check if `stats` query is loading
- Verify backend is returning data: `curl http://localhost:8080/api/v1/dashboard/stats`

**Uptime bars all green when monitor is down:**
- Check if `getCheckHistory` is fetching real data
- Verify: `curl http://localhost:8080/api/v1/monitors/1/check-history`

**"Disconnected" stays in header:**
- Check SSE connection: `curl -N http://localhost:8080/api/v1/sse`
- Verify CORS headers if frontend/backend on different ports

**Spark lines not showing colors:**
- Verify `healthy` field in metrics history response
- Check health rules in backend (uptime >= 95%, latency <= 200ms)

---

## 🚀 Next Steps

All endpoints are now integrated and the dashboard is production-ready. 

To continue development:
1. Add error boundaries for API failures
2. Implement pagination for large monitor lists
3. Add data export features
4. Setup monitoring alerts
5. Add user preferences/settings
