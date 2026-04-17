import FeatureCardGrid from './feature-card-grid'

type FeatureCard = {
  label: string
  value: string
  detail: string
}

type BrochureHeroProps = {
  cards: readonly FeatureCard[]
}

export default function BrochureHero({ cards }: BrochureHeroProps) {
  return (
    <header className="grid gap-8 lg:grid-cols-[1.15fr,0.85fr] lg:items-end">
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium tracking-[0.24em] text-sky-100/80 uppercase backdrop-blur">
          OpenRouter free models · MinIO · PostgreSQL · Docker
        </div>
        <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
          Brochure Forge is moving from scaffold to server-action generation.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          The app is now split into smaller modules. Brochure generation runs
          through a Server Action and server functions, with scraped page
          context, OpenRouter, MinIO storage, and PostgreSQL persistence still
          in the stack.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-200">
          <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2">
            Server actions
          </span>
          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2">
            MinIO-backed exports
          </span>
          <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2">
            Free model only
          </span>
        </div>
      </div>

      <FeatureCardGrid
        cards={cards}
        className="rounded-4xl border border-white/10 bg-(--surface) p-5 shadow-2xl shadow-sky-950/30 backdrop-blur-xl"
      />
    </header>
  )
}
