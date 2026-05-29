import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { login } from "#/lib/queries";
import { setAuth } from "#/lib/auth";
import Logo from "#/components/Logo";
import { Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/(auth)/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const mutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
    onSuccess: (data) => {
      setAuth(data.token);
      navigate({ to: "/dashboard" });
    },
  });

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      mutation.mutate(value);
    },
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

        <p className="text-[11px] font-mono text-[rgba(231,243,236,0.25)]">
          Go · PostgreSQL · Redis · RabbitMQ
        </p>
      </div>

      {/* ───── RIGHT PANEL ───── */}
      <div className="auth-right">
        <div className="auth-form-wrap rise-in w-full max-w-[360px] px-4 sm:px-0">
          <p className="auth-form-title">Welcome back</p>
          <p className="auth-form-sub">Login to your Pulseway account.</p>

          {mutation.error && (
            <div className="error-banner">
              {mutation.error instanceof Error
                ? mutation.error.message
                : "Invalid email or password."}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="flex flex-col gap-4"
          >
            {/* EMAIL */}
            <form.Field
              name="email"
              validators={{
                onChange: ({ value }) =>
                  !value
                    ? "Email is required"
                    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                      ? "Invalid email format"
                      : undefined,
              }}
            >
              {(field) => (
                <div>
                  <label className="field-label" htmlFor={field.name}>
                    Email
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    type="email"
                    className="field"
                    value={field.state.value}
                    placeholder="you@example.com"
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <div className="mt-1 text-xs text-[var(--danger)]">
                      {field.state.meta.errors[0]}
                    </div>
                  )}
                </div>
              )}
            </form.Field>

            {/* PASSWORD */}
            <form.Field
              name="password"
              validators={{
                onChange: ({ value }) =>
                  !value
                    ? "Password is required"
                    : value.length < 6
                      ? "Password must be at least 6 characters"
                      : undefined,
              }}
            >
              {(field) => (
                <div>
                  <label className="field-label" htmlFor={field.name}>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id={field.name}
                      name={field.name}
                      type={showPassword ? "text" : "password"}
                      className="field"
                      value={field.state.value}
                      placeholder="••••••••"
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-[var(--text-3)] transition-colors hover:text-[var(--text-1)]"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {field.state.meta.errors.length > 0 && (
                    <div className="mt-1 text-xs text-[var(--danger)]">
                      {field.state.meta.errors[0]}
                    </div>
                  )}
                </div>
              )}
            </form.Field>

            {/* BUTTON */}
            <button
              type="submit"
              className="btn btn-primary w-full justify-center p-[11px]"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Logging in…" : "Login →"}
            </button>
          </form>

          {/* FOOTER TEXT */}
          <p className="mt-5 text-center text-[12px] font-mono text-[var(--text-2)]">
            No account?{" "}
            <Link to="/register" className="underline">
              Register free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
