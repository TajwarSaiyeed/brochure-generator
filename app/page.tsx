import BrochureGeneratorPanel from '@/components/brochure-generator-panel'
import BrochureHero from '@/components/brochure-hero'
import { stackCards } from '@/lib/site-copy'

export default function Home() {
  return (
    <main className="relative isolate overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(14,165,233,0.18),transparent_24%)]" />

      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 lg:px-8">
        <BrochureHero cards={stackCards} />

        <BrochureGeneratorPanel />
      </div>
    </main>
  )
}
