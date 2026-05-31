import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import Logo from '#/components/Logo'
import { Eye, EyeOff } from 'lucide-react'
import { useRegister } from '#/hooks/use-auth'

export const Route = createFileRoute('/(auth)/register')({
  component: RegisterPage,
})

function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)

  const { mutate: register, isPending, error: registerError } = useRegister()

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      register({ data: value })
    },
  })

  return (
    <div className="auth-shell">
      {/* ───── LEFT PANEL ───── */}
      <div className="auth-left">
        <Logo />

        <div>
          <p className="auth-left-claim">
            Start monitoring
            <br />
            your services.
          </p>
          <div className="flex flex-col gap-3.5">
            {[
              'Configurable endpoint checks',
              'Email alerts on failures',
              'Real-time status updates',
              'Incident history tracking',
            ].map((f) => (
              <div key={f} className="flex items-center gap-2.5">
                <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-[rgba(79,184,178,0.7)]" />
                <span className="font-mono text-[13px] text-[rgba(231,243,236,0.65)]">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="font-mono text-[11px] text-[rgba(231,243,236,0.25)]">
          Create your account to get started
        </p>
      </div>

      {/* ───── RIGHT PANEL ───── */}
      <div className="auth-right">
        <div className="auth-form-wrap rise-in w-full max-w-[360px] px-4 sm:px-0">
          <p className="auth-form-title">Create account</p>
          <p className="auth-form-sub">Get your first monitor running in under a minute.</p>

          {registerError && (
            <div className="error-banner">
              {registerError instanceof Error ? registerError.message : 'Failed to create account.'}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
            className="flex flex-col gap-4"
          >
            {/* EMAIL */}
            <form.Field
              name="email"
              validators={{
                onChange: ({ value }) =>
                  !value
                    ? 'Email is required'
                    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                      ? 'Invalid email format'
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
                    ? 'Password is required'
                    : value.length < 6
                      ? 'Password must be at least 6 characters'
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
                      type={showPassword ? 'text' : 'password'}
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
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
              disabled={isPending}
            >
              {isPending ? 'Creating account…' : 'Create account →'}
            </button>
          </form>

          {/* FOOTER TEXT */}
          <p className="mt-5 text-center font-mono text-[12px] text-[var(--text-2)]">
            Already have an account?{' '}
            <Link to="/login" className="underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
