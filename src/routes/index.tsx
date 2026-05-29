import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import Logo from "#/components/Logo";
import LiveDemo from "#/components/LiveDemo";

export const Route = createFileRoute("/")({ component: HomePage });

const FEATURES = [
  {
    title: "30-second checks",
    desc: "Every endpoint is pinged every 30 seconds using Go workers. Catch outages before your users notice them — not after.",
    large: true,
    icon: "⏱️",
  },
  {
    title: "Instant email alerts",
    desc: "First failure fires an email. Recovery closes the incident automatically — no manual work.",
    icon: "📧",
  },
  {
    title: "Latency trends",
    desc: "Every check records response time. Spot degradation before it turns into an outage.",
    icon: "📊",
  },
  {
    title: "Live via SSE",
    desc: "Results stream to your dashboard in real time. No polling, no page refresh needed.",
    icon: "⚡",
  },
  {
    title: "Incident history",
    desc: "Full log of every incident — started, resolved, duration. Always know what happened.",
    icon: "📜",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Register a monitor",
    desc: "Add any URL. Set interval — 30s, 60s, or 5 minutes.",
  },
  {
    step: "02",
    title: "We check it",
    desc: "Go workers send HTTP requests on schedule and stream results via SSE.",
  },
  {
    step: "03",
    title: "You get alerted",
    desc: "Failures trigger incidents + email alerts automatically.",
  },
];

function LatencyBar() {
  const [bars, setBars] = useState(() =>
    Array.from({ length: 12 }, () => ({
      h: 12 + Math.random() * 20,
      up: true,
    })),
  );

  useEffect(() => {
    const t = setInterval(() => {
      setBars((prev) => {
        const next = [...prev.slice(1)];
        next.push({
          h: 8 + Math.random() * 24,
          up: Math.random() > 0.15,
        });
        return next;
      });
    }, 1800);

    return () => clearInterval(t);
  }, []);

  return (
    <div className="mt-5 rounded-lg border border-[var(--line)] bg-[var(--surface-0)] p-4">
      <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-[var(--text-3)]">
        Latency · last 12 checks
      </p>

      <div className="flex h-10 items-end gap-1">
        {bars.map((b, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm transition-all duration-700 ease-out"
            style={{
              height: `${b.h}px`,
              background: b.up ? "var(--lagoon)" : "var(--danger)",
              opacity: 0.7 + i * 0.02,
            }}
          />
        ))}
      </div>

      <div className="mt-2 flex justify-between text-[9px] font-mono text-[var(--text-3)]">
        <span>−6 min</span>
        <span>now</span>
      </div>
    </div>
  );
}

function HomePage() {
  const navigate = useNavigate();
  const [latency, setLatency] = useState(67);

  useEffect(() => {
    const values = [45, 89, 67, 120, 54, 98, 71, 43];
    let i = 0;

    const t = setInterval(() => {
      i++;
      setLatency(values[i % values.length]);
    }, 2200);

    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)]">
      {/* ───── NAV ───── */}
      <header className="border-b border-[var(--line)]">
        <div className="content-wrap flex items-center justify-between py-3 md:py-4">
          <Logo />

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-4 md:flex lg:gap-6">
            <a href="#features" className="nav-link text-sm">
              Features
            </a>
            <a href="#how-it-works" className="nav-link text-sm">
              How it works
            </a>

            <button
              onClick={() => navigate({ to: "/login" })}
              className="btn btn-secondary btn-sm"
            >
              Login
            </button>

            <button
              onClick={() => navigate({ to: "/register" })}
              className="btn btn-primary btn-sm"
            >
              Get started
            </button>
          </nav>

          {/* Mobile Navigation */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => navigate({ to: "/login" })}
              className="rounded-md border border-[var(--line)] bg-transparent px-3 py-1.5 text-xs font-medium text-[var(--text-1)] hover:bg-[var(--surface-1)]"
            >
              Login
            </button>

            <button
              onClick={() => navigate({ to: "/register" })}
              className="rounded-md bg-[var(--lagoon-deep)] px-3 py-1.5 text-xs font-medium text-white hover:brightness-110"
            >
              Get started
            </button>
          </div>
        </div>
      </header>

      {/* ───── HERO ───── */}
      <section className="content-wrap py-12 md:py-20 lg:py-24">
        <div className="grid items-center gap-8 md:gap-12 lg:grid-cols-2">
          {/* LEFT */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--text-3)] md:text-xs">
              Uptime monitoring
            </p>

            <h1 className="mt-3 text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
              Know when your APIs
              <br />
              go down <span className="text-[var(--lagoon)]">before</span>
              <br />
              your users do
            </h1>

            <p className="mt-4 max-w-lg text-sm text-[var(--text-2)] md:text-base">
              30-second checks, instant alerts, and real-time latency tracking
              built for developers.
            </p>

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:gap-3">
              <button
                className="btn btn-primary justify-center px-6 py-2.5 text-sm md:btn-lg"
                onClick={() => navigate({ to: "/register" })}
              >
                Start free
              </button>

              <button
                className="btn btn-secondary justify-center px-6 py-2.5 text-sm md:btn-lg"
                onClick={() => navigate({ to: "/login" })}
              >
                Login
              </button>
            </div>

            {/* social proof */}
            <div className="mt-6 flex items-center gap-3">
              <div className="flex">
                {["JR", "KL", "MR", "AP"].map((init, i) => (
                  <div
                    key={init}
                    className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--bg)] font-mono text-[9px] font-bold text-white"
                    style={{
                      background: `hsl(${170 + i * 20}, 40%, ${45 + i * 5}%)`,
                      marginLeft: i === 0 ? 0 : "-8px",
                    }}
                  >
                    {init}
                  </div>
                ))}
              </div>

              <p className="text-xs text-[var(--text-2)]">
                <strong className="text-[var(--text-1)]">
                  240+ developers
                </strong>{" "}
                using Pulseway
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-0)] p-4 md:p-5">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-[var(--line)] md:h-2 md:w-2" />
              <div className="h-1.5 w-1.5 rounded-full bg-[var(--line)] md:h-2 md:w-2" />
              <div className="h-1.5 w-1.5 rounded-full bg-[var(--line)] md:h-2 md:w-2" />
              <span className="ml-2 font-mono text-[10px] text-[var(--text-3)] md:text-[11px]">
                dashboard.pulseway
              </span>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 md:mt-4">
              {[
                { label: "Monitors", value: "4" },
                { label: "Uptime", value: "99.8%" },
                { label: "Latency", value: `${latency}ms` },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-lg border border-[var(--line)] p-3"
                >
                  <div className="text-[10px] text-[var(--text-3)]">
                    {s.label}
                  </div>
                  <div className="text-lg font-semibold">{s.value}</div>
                </div>
              ))}
            </div>

            <div className="mt-3">
              <LiveDemo />
              {[
                {
                  name: "Auth service",
                  url: "https://auth.yourapp.com/ping",
                  up: true,
                  lat: "45ms",
                },
                {
                  name: "Payment webhook",
                  url: "https://pay.yourapp.com/health",
                  up: false,
                  lat: "timeout",
                },
              ].map((m) => (
                <div
                  key={m.name}
                  className={`mt-2 flex items-center gap-3 rounded-md border border-[var(--line)] px-3 py-2 ${
                    !m.up ? "opacity-60" : "opacity-45"
                  }`}
                >
                  {/* STATUS BADGE */}
                  <span
                    className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold ${
                      m.up
                        ? "bg-[var(--lagoon)] text-black"
                        : "bg-[var(--danger)] text-white"
                    }`}
                  >
                    {m.up ? "UP" : "DOWN"}
                  </span>

                  {/* NAME + URL */}
                  <div className="flex-1">
                    <p className="m-0 font-mono text-[12px] font-semibold text-[var(--text-1)]">
                      {m.name}
                    </p>
                    <p className="m-0 font-mono text-[10px] text-[var(--text-3)]">
                      {m.url}
                    </p>
                  </div>

                  {/* LATENCY */}
                  <span
                    className={`font-mono text-[11px] ${
                      m.up ? "text-[var(--text-2)]" : "text-[var(--danger)]"
                    }`}
                  >
                    {m.lat}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───── FEATURES ───── */}
      <section id="features" className="content-wrap py-12 md:py-16 lg:py-20">
        <h2 className="mb-6 text-2xl font-bold md:mb-8 md:text-3xl">Everything you need</h2>

        <div className="grid gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3">
          <div className="col-span-1 flex flex-col justify-between rounded-xl border border-[var(--line)] p-4 md:col-span-2 md:p-5">
            <div>
              <div className="text-xl">⏱️</div>
              <h3 className="mt-2 text-lg font-semibold">
                {FEATURES[0].title}
              </h3>
              <p className="text-[var(--text-2)]">{FEATURES[0].desc}</p>
            </div>

            <LatencyBar />
          </div>

          {FEATURES.slice(1).map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-[var(--line)] p-5"
            >
              <div className="text-xl">{f.icon}</div>
              <h3 className="mt-2 font-semibold">{f.title}</h3>
              <p className="text-[var(--text-2)]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───── HOW IT WORKS ───── */}
      <section id="how-it-works" className="content-wrap py-12 md:py-16 lg:py-20">
        <h2 className="mb-6 text-2xl font-bold md:mb-8 md:text-3xl">How it works</h2>

        <div className="grid gap-3 md:grid-cols-3 md:gap-4">
          {HOW_IT_WORKS.map((s) => (
            <div
              key={s.step}
              className="rounded-xl border border-[var(--line)] p-5"
            >
              <div className="font-mono text-sm text-[var(--lagoon)]">
                {s.step}
              </div>
              <h3 className="mt-2 font-semibold">{s.title}</h3>
              <p className="text-[var(--text-2)]">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section className="content-wrap py-12 md:py-16 lg:py-20">
        <div className="rounded-xl bg-gradient-to-br from-[#1c4e56] to-[#0f2a30] p-8 text-center text-white md:rounded-2xl md:p-12 lg:p-16">
          <h2 className="text-2xl font-bold md:text-3xl">Start monitoring in 60 seconds</h2>

          <p className="mt-2 text-sm text-white/60 md:text-base">
            Free to start · No credit card required
          </p>

          <button
            className="btn btn-primary mt-5 justify-center px-6 py-2.5 text-sm md:btn-lg md:mt-6"
            onClick={() => navigate({ to: "/register" })}
          >
            Create account →
          </button>
        </div>
      </section>

      {/* ───── FOOTER ───── */}
      <footer className="border-t border-[var(--line)] py-5 md:py-6">
        <div className="content-wrap flex flex-col items-center justify-between gap-3 md:flex-row md:gap-0">
          <Logo />

          <p className="font-mono text-[10px] text-[var(--text-3)] md:text-xs">
            Go · Chi · PostgreSQL · Redis · RabbitMQ
          </p>
        </div>
      </footer>
    </div>
  );
}
