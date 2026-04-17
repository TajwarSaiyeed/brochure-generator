type AccountBannerProps = {
  email?: string | null
  isSigningOut: boolean
  onSignOut: () => void
}

export default function AccountBanner({
  email,
  isSigningOut,
  onSignOut,
}: AccountBannerProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-4xl border border-white/10 bg-white/5 px-5 py-4 shadow-2xl shadow-slate-950/20 backdrop-blur-xl lg:col-span-2">
      <div>
        <p className="text-xs tracking-[0.32em] text-slate-400 uppercase">
          Authenticated workspace
        </p>
        <h2 className="mt-2 text-lg font-semibold text-white">
          Your account controls this generator session.
        </h2>
      </div>

      {email ? (
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-slate-300 sm:block">
            {email}
          </span>
          <button
            type="button"
            onClick={onSignOut}
            disabled={isSigningOut}
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:text-slate-500"
          >
            {isSigningOut ? 'Signing out...' : 'Sign out'}
          </button>
        </div>
      ) : null}
    </div>
  )
}
