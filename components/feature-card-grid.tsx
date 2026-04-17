type FeatureCard = {
  label: string
  value: string
  detail: string
}

type FeatureCardGridProps = {
  cards: readonly FeatureCard[]
  className?: string
}

export default function FeatureCardGrid({
  cards,
  className = '',
}: FeatureCardGridProps) {
  return (
    <div className={`grid gap-4 ${className}`.trim()}>
      {cards.map((card) => (
        <article
          key={card.label}
          className="rounded-2xl border border-white/10 bg-white/5 p-4"
        >
          <p className="text-xs tracking-[0.3em] text-slate-400 uppercase">
            {card.label}
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            {card.value}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">{card.detail}</p>
        </article>
      ))}
    </div>
  )
}
