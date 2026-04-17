type BrochureGeneratorFormProps = {
  action: (formData: FormData) => void
  companyName: string
  companyUrl: string
  audience: string
  tone: string
  sections: string
  audienceOptions: readonly string[]
  toneOptions: readonly string[]
  sectionPlaceholder: string
  onCompanyNameChange: (value: string) => void
  onCompanyUrlChange: (value: string) => void
  onAudienceChange: (value: string) => void
  onToneChange: (value: string) => void
  onSectionsChange: (value: string) => void
  isPending: boolean
  onSubmit: () => void
}

export default function BrochureGeneratorForm({
  action,
  companyName,
  companyUrl,
  audience,
  tone,
  sections,
  audienceOptions,
  toneOptions,
  sectionPlaceholder,
  onCompanyNameChange,
  onCompanyUrlChange,
  onAudienceChange,
  onToneChange,
  onSectionsChange,
  isPending,
  onSubmit,
}: BrochureGeneratorFormProps) {
  return (
    <form
      action={action}
      onSubmit={onSubmit}
      className="rounded-4xl border border-white/10 bg-(--surface) p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl lg:p-8"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.32em] text-slate-400 uppercase">
            Generator input
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white">
            Generate a brochure draft from one URL.
          </h2>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
          server action
        </span>
      </div>

      <div className="mt-8 grid gap-5">
        <label className="grid gap-2 text-sm text-slate-200">
          <span className="text-xs tracking-[0.24em] text-slate-400 uppercase">
            Company name
          </span>
          <input
            name="companyName"
            value={companyName}
            onChange={(event) => onCompanyNameChange(event.target.value)}
            className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white transition outline-none focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20"
            placeholder="Northstar Studio"
          />
        </label>

        <label className="grid gap-2 text-sm text-slate-200">
          <span className="text-xs tracking-[0.24em] text-slate-400 uppercase">
            Source URL
          </span>
          <input
            name="companyUrl"
            value={companyUrl}
            onChange={(event) => onCompanyUrlChange(event.target.value)}
            className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white transition outline-none focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20"
            placeholder="https://example.com"
          />
        </label>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-2 text-sm text-slate-200">
            <span className="text-xs tracking-[0.24em] text-slate-400 uppercase">
              Audience
            </span>
            <select
              name="audience"
              value={audience}
              onChange={(event) => onAudienceChange(event.target.value)}
              className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white transition outline-none focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20"
            >
              {audienceOptions.map((option) => (
                <option key={option} value={option}>
                  {option[0].toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm text-slate-200">
            <span className="text-xs tracking-[0.24em] text-slate-400 uppercase">
              Tone
            </span>
            <select
              name="tone"
              value={tone}
              onChange={(event) => onToneChange(event.target.value)}
              className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white transition outline-none focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20"
            >
              {toneOptions.map((option) => (
                <option key={option} value={option}>
                  {option[0].toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="grid gap-2 text-sm text-slate-200">
          <span className="text-xs tracking-[0.24em] text-slate-400 uppercase">
            Sections
          </span>
          <textarea
            name="sections"
            value={sections}
            onChange={(event) => onSectionsChange(event.target.value)}
            rows={6}
            className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white transition outline-none focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20"
            placeholder={sectionPlaceholder}
          />
        </label>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-2xl bg-sky-400 px-5 py-3 font-medium text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
        >
          {isPending ? 'Generating…' : 'Generate brochure'}
        </button>
      </div>
    </form>
  )
}
