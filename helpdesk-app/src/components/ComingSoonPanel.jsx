export default function ComingSoonPanel({ icon: Icon, title, description }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary/10">
        <Icon className="h-6 w-6 text-brand-primary" />
      </span>
      <h2 className="text-lg font-semibold text-ink-900">{title}</h2>
      <p className="max-w-sm text-sm text-slate-500">{description}</p>
      <span className="badge-pending mt-1">Coming soon</span>
    </div>
  )
}
