import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { register } from "#/lib/queries";
import { setAuth } from "#/lib/auth";
import { Eye, EyeOff } from "lucide-react";
export const Route = createFileRoute("/(auth)/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const mutation = useMutation({
    mutationFn: () => register(email, password),
    onSuccess: (data) => {
      setAuth(data.token);
      navigate({ to: "/dashboard" });
    },
    onError: (error: Error) => setError(error.message),
  });

  return (
    <div className="auth-shell">
      <div className="auth-left">
        <div className="auth-left-logo">Pulseway</div>
        <div>
          <p className="auth-left-claim">
            Start monitoring
            <br />
            in 60 seconds.
          </p>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            {[
              "30-second endpoint checks",
              "Instant failure alerts via email",
              "Live latency tracking via SSE",
              "Full incident history",
            ].map((f) => (
              <div
                key={f}
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <div
                  style={{
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    background: "rgba(79,184,178,0.7)",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: "13px",
                    color: "rgba(231,243,236,0.65)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {f}
                </span>
              </div>
            ))}
          </div>
        </div>
        <p
          style={{
            fontSize: "11px",
            color: "rgba(231,243,236,0.25)",
            fontFamily: "var(--font-mono)",
          }}
        >
          Free to start · no credit card
        </p>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrap rise-in">
          <p className="auth-form-title">Create account</p>
          <p className="auth-form-sub">
            Get your first monitor running in under a minute.
          </p>

          {error && <div className="error-banner">{error}</div>}

          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div>
              <label className="field-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="field"
                value={email}
                placeholder="you@example.com"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="field-label" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="field"
                  value={password}
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") mutation.mutate();
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <button
              className="btn btn-primary"
              style={{
                width: "100%",
                justifyContent: "center",
                padding: "11px",
              }}
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Creating account…" : "Create account →"}
            </button>
          </div>

          <p
            style={{
              fontSize: "12px",
              color: "var(--text-2)",
              textAlign: "center",
              marginTop: "20px",
              fontFamily: "var(--font-mono)",
            }}
          >
            Already have an account? <a href="/login">Login</a>
          </p>
        </div>
      </div>
    </div>
  );
}
