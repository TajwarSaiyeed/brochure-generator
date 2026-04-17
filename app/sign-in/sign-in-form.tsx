'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, signUp } from '@/lib/auth-client'

type SignInFormProps = {
  callbackUrl: string
}

type AuthAction = 'signIn' | 'signUp'

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return fallback
}

export default function SignInForm({ callbackUrl }: SignInFormProps) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loadingAction, setLoadingAction] = useState<AuthAction | null>(null)

  async function handleAction(action: AuthAction) {
    setError('')
    setLoadingAction(action)

    try {
      const response =
        action === 'signIn'
          ? await signIn.email({
              email,
              password,
            })
          : await signUp.email({
              name: name.trim() || email.split('@')[0] || 'Brochure user',
              email,
              password,
            })

      if (response.error) {
        setError(response.error.message || 'Authentication failed.')
        return
      }

      router.replace(callbackUrl)
      router.refresh()
    } catch (actionError) {
      setError(
        getErrorMessage(actionError, 'Unable to complete authentication.'),
      )
    } finally {
      setLoadingAction(null)
    }
  }

  return (
    <div className="rounded-4xl border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.84),rgba(8,15,28,0.94))] p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl sm:p-8">
      <div>
        <p className="text-xs tracking-[0.32em] text-slate-400 uppercase">
          Account access
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
          Sign in or create a workspace account.
        </h2>
        <p className="mt-4 max-w-lg text-sm leading-6 text-slate-300">
          Use email and password. New accounts get the same session pipeline as
          existing users.
        </p>
      </div>

      <form
        className="mt-8 grid gap-5"
        onSubmit={(event) => {
          event.preventDefault()
          void handleAction('signIn')
        }}
      >
        {error ? (
          <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm leading-6 text-rose-100">
            {error}
          </div>
        ) : null}

        <label className="grid gap-2 text-sm text-slate-200">
          <span className="text-xs tracking-[0.24em] text-slate-400 uppercase">
            Display name
          </span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Northstar Studio"
            className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white transition outline-none placeholder:text-slate-500 focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20"
          />
        </label>

        <label className="grid gap-2 text-sm text-slate-200">
          <span className="text-xs tracking-[0.24em] text-slate-400 uppercase">
            Email address
          </span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
            className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white transition outline-none placeholder:text-slate-500 focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20"
          />
        </label>

        <label className="grid gap-2 text-sm text-slate-200">
          <span className="text-xs tracking-[0.24em] text-slate-400 uppercase">
            Password
          </span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Create a strong password"
            autoComplete="current-password"
            required
            className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white transition outline-none placeholder:text-slate-500 focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="submit"
            disabled={loadingAction !== null}
            className="inline-flex items-center justify-center rounded-2xl bg-sky-400 px-5 py-3 font-medium text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
          >
            {loadingAction === 'signIn' ? 'Signing in...' : 'Sign in'}
          </button>

          <button
            type="button"
            onClick={() => void handleAction('signUp')}
            disabled={loadingAction !== null}
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-medium text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            {loadingAction === 'signUp' ? 'Creating...' : 'Create account'}
          </button>
        </div>
      </form>
    </div>
  )
}
