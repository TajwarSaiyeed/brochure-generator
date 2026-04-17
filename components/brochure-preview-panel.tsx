type BrochurePreviewPanelProps = {
  statusLabel: string
  lastUpdated: string
  draft: string
  error: string
}

export default function BrochurePreviewPanel({
  statusLabel,
  lastUpdated,
  draft,
  error,
}: BrochurePreviewPanelProps) {
  return (
    <article className="rounded-4xl border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.82),rgba(8,15,28,0.92))] p-6 shadow-2xl shadow-indigo-950/30 backdrop-blur-xl lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.32em] text-slate-400 uppercase">
            Live preview
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white">
            Draft appears without an API route.
          </h2>
        </div>

        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
          {statusLabel}
        </div>
      </div>

      <div className="mt-4 text-sm text-slate-400">{lastUpdated}</div>

      <div className="mt-8 rounded-[28px] border border-white/10 bg-slate-950/70 p-5">
        <pre className="min-h-105 text-sm leading-7 wrap-break-word whitespace-pre-wrap text-slate-200">
          {draft}
        </pre>
      </div>

      {error ? (
        <p className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm leading-6 text-rose-100">
          {error}
        </p>
      ) : null}
    </article>
  )
}
