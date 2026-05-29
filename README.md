# Pulseway - Uptime Monitoring Platform

Real-time uptime monitoring with instant alerts and incident tracking. Built with Go backend and React frontend.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

## 📋 Features

### ✅ Core Features
- **Real-time Monitoring**: 30-second interval checks via Go workers
- **Live Dashboard**: Server-Sent Events (SSE) for instant status updates
- **Uptime Tracking**: 30-day uptime visualization with percentage metrics
- **Latency Monitoring**: Track response times with 7-day trend charts
- **Alert System**: Email notifications on downtime and recovery

### 🆕 Latest Features (v2.0)
- **Monitor Detail Pages**: Polymarket-inspired UI with comprehensive metrics
- **Incident Management**: Full incident tracking with resolution times
- **Alert Recipients**: Manage email notifications per monitor
- **Incident History**: Complete timeline with durations and status

## 📁 Project Structure

```
pulseway-fe/
├── src/
│   ├── routes/
│   │   ├── index.tsx                    # Landing page
│   │   ├── (auth)/
│   │   │   ├── login.tsx                # Login page
│   │   │   └── register.tsx             # Registration
│   │   └── dashboard/
│   │       ├── index.tsx                # Main dashboard
│   │       ├── monitor.$id.tsx          # Monitor details (NEW)
│   │       └── incidents.tsx            # Incidents page (NEW)
│   ├── components/
│   │   ├── dashboard/                   # Dashboard components
│   │   └── ui/                          # Reusable UI components
│   ├── lib/
│   │   ├── api.ts                       # Axios instance
│   │   ├── queries.ts                   # React Query functions
│   │   ├── types.ts                     # TypeScript types
│   │   └── api-types.ts                 # API response types
│   └── hooks/
│       └── useMonitorStatus.ts          # SSE hook for live updates
├── BACKEND_INTEGRATION.md               # Backend integration guide
├── INCIDENTS_AND_ALERTS_GUIDE.md        # New features guide (NEW)
├── BACKEND_CHECKLIST.md                 # Backend implementation (NEW)
└── FEATURE_SUMMARY.md                   # User-facing features (NEW)
```

## 🎨 Tech Stack

**Frontend:**
- React 19 + TypeScript
- TanStack Router (file-based routing)
- TanStack Query (data fetching)
- Tailwind CSS v4 (styling)
- Axios (HTTP client)
- Lucide React (icons)
- date-fns (date formatting)

**Backend (Required):**
- Go + Chi Router
- PostgreSQL
- Redis (optional)
- RabbitMQ (optional)

## 📊 Key Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page with features |
| `/login` | User authentication |
| `/register` | New user registration |
| `/dashboard` | Main monitoring dashboard |
| `/dashboard/monitor/:id` | Individual monitor details (NEW) |
| `/dashboard/incidents` | Incidents overview (NEW) |

## 🔌 API Integration

### Required Backend Endpoints

**Authentication:**
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`

**Monitors:**
- `GET /api/v1/monitors`
- `POST /api/v1/monitors`
- `PUT /api/v1/monitors/:id`
- `DELETE /api/v1/monitors/:id`
- `GET /api/v1/monitors/:id/details` ⭐ NEW
- `GET /api/v1/monitors/:id/check-history`
- `GET /api/v1/monitors/:id/incidents` ⭐ NEW
- `GET /api/v1/monitors/:id/alerts` ⭐ NEW

**Dashboard:**
- `GET /api/v1/dashboard/stats`
- `GET /api/v1/dashboard/metrics-history`
- `GET /api/v1/sse` (Server-Sent Events)

**Incidents:** ⭐ NEW
- `GET /api/v1/incidents`

**Alerts:** ⭐ NEW
- `GET /api/v1/alerts`
- `POST /api/v1/alerts`
- `DELETE /api/v1/alerts/:id`

See `BACKEND_CHECKLIST.md` for detailed implementation guide.

## 🛠️ Development

### Environment Setup

Create `.env` file:
```env
VITE_API_URL=http://localhost:8080/api/v1
```

### Available Scripts

```bash
npm run dev      # Start dev server (port 3000)
npm run build    # Build for production
npm run preview  # Preview production build
npm run test     # Run tests
```

### Code Style

- Use TypeScript for all new code
- Follow existing component patterns
- Use TailwindCSS for styling
- Prefer React Query for data fetching
- Use Lucide React for icons

## 📚 Documentation

- **BACKEND_INTEGRATION.md** - Complete backend integration guide
- **INCIDENTS_AND_ALERTS_GUIDE.md** - Detailed guide for incidents and alerts features
- **BACKEND_CHECKLIST.md** - Step-by-step backend implementation
- **FEATURE_SUMMARY.md** - User-facing feature overview

## 🧪 Testing

```bash
npm run test
```

Tests use Vitest and React Testing Library.

## 🎯 Roadmap

### Phase 1 (Completed ✅)
- [x] User authentication
- [x] Monitor CRUD operations
- [x] Real-time SSE updates
- [x] Uptime visualization
- [x] Metrics history

### Phase 2 (Completed ✅)
- [x] Monitor detail pages
- [x] Incident tracking
- [x] Alert management
- [x] Incident history

### Phase 3 (Planned)
- [ ] Custom alert rules
- [ ] Slack/Discord integrations
- [ ] Public status pages
- [ ] SLA tracking
- [ ] Incident comments

## 🐛 Troubleshooting

**Dashboard not loading:**
- Verify backend is running on port 8080
- Check CORS configuration
- Verify authentication token

**SSE not connecting:**
- Check `/api/v1/sse` endpoint
- Verify CORS headers include SSE support
- Check browser console for errors

**Monitors showing stale data:**
- Check refetch intervals (30s for stats, 60s for metrics)
- Verify backend is updating check results
- Force refresh the page

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- [TanStack Router Docs](https://tanstack.com/router)
- [TanStack Query Docs](https://tanstack.com/query)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [Lucide Icons](https://lucide.dev)

---

**Built with ❤️ using React, TypeScript, and TanStack**
