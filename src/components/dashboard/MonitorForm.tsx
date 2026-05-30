import { useForm } from '@tanstack/react-form'
import { FieldError } from '#/components/ui/field'
import { Label } from '#/components/ui/label'

interface MonitorFormProps {
  initialValues?: { name: string; url: string; interval_secs: number }
  onSubmit: (value: { name: string; url: string; interval_secs: number }) => void
  isPending: boolean
  submitLabel: string
  onCancel?: () => void
}

export function MonitorForm({
  initialValues,
  onSubmit,
  isPending,
  submitLabel,
  onCancel,
}: MonitorFormProps) {
  const form = useForm({
    defaultValues: {
      name: initialValues?.name ?? '',
      url: initialValues?.url ?? '',
      interval_secs: initialValues?.interval_secs ?? 60,
    },
    onSubmit: async ({ value }) => onSubmit(value),
  })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        form.handleSubmit()
      }}
      className="rounded-md border border-[#2a2d3a] bg-[#1a1d27] p-4"
    >
      <h3 className="mb-4 text-lg font-medium text-slate-200">
        {submitLabel === 'Create monitor' ? 'Add monitor' : 'Edit monitor'}
      </h3>

      <div className="grid gap-4 md:grid-cols-[1fr_1.5fr_120px]">
        <form.Field
          name="name"
          validators={{
            onChange: ({ value }) =>
              !value ? 'Name is required' : value.length < 3 ? 'Min 3 characters' : undefined,
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs text-slate-400">
                Name
              </Label>
              <input
                id="name"
                className="w-full rounded-md border border-[#2a2d3a] bg-[#0f1117] px-3 py-2 text-sm text-slate-200 outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6] focus:ring-offset-2 focus:ring-offset-[#0f1117]"
                placeholder="Primary API"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
              <FieldError className="text-xs text-[#ef4444]" errors={field.state.meta.errors} />
            </div>
          )}
        </form.Field>

        <form.Field
          name="url"
          validators={{
            onChange: ({ value }) =>
              !value
                ? 'URL is required'
                : !/^https?:\/\/.+/.test(value)
                  ? 'Must be valid HTTP/HTTPS URL'
                  : undefined,
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor="url" className="text-xs text-slate-400">
                URL
              </Label>
              <input
                id="url"
                className="w-full rounded-md border border-[#2a2d3a] bg-[#0f1117] px-3 py-2 text-sm text-slate-200 outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6] focus:ring-offset-2 focus:ring-offset-[#0f1117]"
                placeholder="https://api.example.com/health"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
              <FieldError className="text-xs text-[#ef4444]" errors={field.state.meta.errors} />
            </div>
          )}
        </form.Field>

        <form.Field
          name="interval_secs"
          validators={{
            onChange: ({ value }) =>
              !value || value < 30 ? 'Min 30s' : value > 3600 ? 'Max 3600s' : undefined,
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor="interval" className="text-xs text-slate-400">
                Interval (s)
              </Label>
              <input
                id="interval"
                type="number"
                min="30"
                max="3600"
                className="w-full rounded-md border border-[#2a2d3a] bg-[#0f1117] px-3 py-2 text-sm text-slate-200 outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6] focus:ring-offset-2 focus:ring-offset-[#0f1117]"
                placeholder="60"
                value={field.state.value}
                onChange={(e) => field.handleChange(Number(e.target.value))}
                onBlur={field.handleBlur}
              />
              <FieldError className="text-xs text-[#ef4444]" errors={field.state.meta.errors} />
            </div>
          )}
        </form.Field>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-[#3b82f6] px-4 py-2 text-sm font-medium text-white hover:bg-[#2563eb] disabled:opacity-50"
        >
          {isPending ? 'Saving...' : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-[#2a2d3a] bg-transparent px-4 py-2 text-sm font-medium text-slate-200 hover:bg-[#1a1d27]"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
