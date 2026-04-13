import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { login } from "#/lib/queries";
import { setAuth } from "#/lib/auth";
import Logo from "#/components/Logo";
import { Eye, EyeOff } from "lucide-react";
export const Route = createFileRoute("/(auth)/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const mutation = useMutation({
    mutationFn: () => login(email, password),
    onSuccess: (data) => {
      setAuth(data.token);
      navigate({ to: "/dashboard" });
    },
    onError: () => setError("Invalid email or password."),
  });

  return (
    <div className="auth-shell">
      {/* ───── LEFT PANEL ───── */}
      <div className="auth-left">
        <Logo />

        <div>
          <p className="auth-left-claim">
            Know the moment
            <br />
            your API breaks.
          </p>

          <div className="auth-testimonial">
            <p>
              "We caught three outages before any user noticed them. It paid for
              itself in week one."
            </p>
            <cite>— CTO, fintech startup</cite>
          </div>
        </div>

        {/* FIXED INLINE STYLE → TAILWIND */}
        <p className="text-[11px] font-mono text-[rgba(231,243,236,0.25)]">
          Go · PostgreSQL · Redis · RabbitMQ
        </p>
      </div>

      {/* ───── RIGHT PANEL ───── */}
      <div className="auth-right">
        <div className="auth-form-wrap rise-in">
          <p className="auth-form-title">Welcome back</p>
          <p className="auth-form-sub">Login in to your Pulseway account.</p>

          {error && <div className="error-banner">{error}</div>}

          <div className="flex flex-col gap-4">
            {/* EMAIL */}
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

            {/* PASSWORD */}
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

            {/* BUTTON */}
            <button
              className="btn btn-primary w-full justify-center p-[11px]"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Logging in…" : "Login in →"}
            </button>
          </div>

          {/* FOOTER TEXT */}
          <p className="mt-5 text-center text-[12px] font-mono text-[var(--text-2)]">
            No account?{" "}
            <a href="/register" className="underline">
              Register free
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
