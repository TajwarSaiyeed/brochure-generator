'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { generateBrochureAction } from '@/app/actions/generate-brochure-action'
import {
  brochureAudienceOptions,
  brochureFormDefaults,
  brochureSectionDefaults,
  brochureToneOptions,
} from '@/lib/brochure/form'
import { signOut, useSession } from '@/lib/auth-client'
import {
  initialBrochureGenerationState,
  type BrochureGenerationState,
} from '@/lib/brochure/state'
import { stackCards } from '@/lib/site-copy'
import AccountBanner from './account-banner'
import BrochureGeneratorForm from './brochure-generator-form'
import BrochurePreviewPanel from './brochure-preview-panel'

const statusCopy: Record<BrochureGenerationState['status'], string> = {
  idle: 'Ready to generate',
  generating: 'Generating draft',
  done: 'Draft complete',
  error: 'Generation failed',
}

export default function BrochureGeneratorPanel() {
  const router = useRouter()
  const { data: session } = useSession()
  const [state, formAction, isPending] = useActionState(
    generateBrochureAction,
    initialBrochureGenerationState,
  )
  const [companyName, setCompanyName] = useState(
    brochureFormDefaults.companyName,
  )
  const [companyUrl, setCompanyUrl] = useState(brochureFormDefaults.companyUrl)
  const [audience, setAudience] = useState<
    (typeof brochureAudienceOptions)[number]
  >(brochureFormDefaults.audience)
  const [tone, setTone] = useState<(typeof brochureToneOptions)[number]>(
    brochureFormDefaults.tone,
  )
  const [sections, setSections] = useState(brochureFormDefaults.sections)
  const [displayDraft, setDisplayDraft] = useState('')
  const [isSigningOut, setIsSigningOut] = useState(false)

  useEffect(() => {
    if (!state.draft) {
      setDisplayDraft('')
      return
    }

    let index = 0
    const draft = state.draft
    const step = Math.max(1, Math.ceil(draft.length / 140))

    setDisplayDraft('')

    const timer = window.setInterval(() => {
      index = Math.min(index + step, draft.length)
      setDisplayDraft(draft.slice(0, index))

      if (index >= draft.length) {
        window.clearInterval(timer)
      }
    }, 16)

    return () => window.clearInterval(timer)
  }, [state.draft])

  async function handleSignOut() {
    setIsSigningOut(true)

    try {
      await signOut()
      router.push('/sign-in')
      router.refresh()
    } finally {
      setIsSigningOut(false)
    }
  }

  const previewDraft =
    displayDraft ||
    state.draft ||
    `# ${companyName}\n\nPress "Generate brochure" to create the first draft from the server action.`

  const statusLabel = statusCopy[isPending ? 'generating' : state.status]

  return (
    <section className="mt-10 grid gap-6 lg:grid-cols-[0.95fr,1.05fr]">
      <AccountBanner
        email={session?.user?.email ?? null}
        isSigningOut={isSigningOut}
        onSignOut={() => void handleSignOut()}
      />

      <BrochureGeneratorForm
        action={formAction}
        companyName={companyName}
        companyUrl={companyUrl}
        audience={audience}
        tone={tone}
        sections={sections}
        audienceOptions={brochureAudienceOptions}
        toneOptions={brochureToneOptions}
        sectionPlaceholder={brochureSectionDefaults.join('\n')}
        onCompanyNameChange={setCompanyName}
        onCompanyUrlChange={setCompanyUrl}
        onAudienceChange={(value) =>
          setAudience(value as (typeof brochureAudienceOptions)[number])
        }
        onToneChange={(value) =>
          setTone(value as (typeof brochureToneOptions)[number])
        }
        onSectionsChange={setSections}
        isPending={isPending}
        onSubmit={() => setDisplayDraft('')}
      />

      <BrochurePreviewPanel
        statusLabel={statusLabel}
        lastUpdated={state.lastUpdated}
        draft={previewDraft}
        error={state.error}
      />

      <div className="grid gap-4 md:grid-cols-3 lg:col-span-2">
        {stackCards.map((card) => (
          <article
            key={card.label}
            className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm leading-6 text-slate-300"
          >
            <p className="text-xs tracking-[0.28em] text-slate-400 uppercase">
              {card.label}
            </p>
            <h3 className="mt-3 text-lg font-semibold text-white">
              {card.value}
            </h3>
            <p className="mt-3">{card.detail}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
