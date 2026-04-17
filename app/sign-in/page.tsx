import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import SignInForm from './sign-in-form'

type SignInSearchParams = {
  callbackUrl?: string | string[]
}

function readCallbackUrl(value: string | string[] | undefined) {
  if (typeof value !== 'string') {
    return '/'
  }

  if (!value.startsWith('/') || value.startsWith('//')) {
    return '/'
  }

  return value
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<SignInSearchParams>
}) {
  const params = await searchParams
  const callbackUrl = readCallbackUrl(params.callbackUrl)

  let session = null

  try {
    session = await auth.api.getSession({
      headers: await headers(),
    })
  } catch {
    session = null
  }

  if (session?.user) {
    redirect(callbackUrl)
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr,0.95fr]">
      <aside className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(14,165,233,0.16),transparent_26%),linear-gradient(180deg,rgba(8,15,27,0.96),rgba(5,9,19,0.98))] px-6 py-10 lg:border-r lg:border-b-0 lg:px-10 xl:px-14">
        <div className="mx-auto flex h-full max-w-2xl flex-col justify-between gap-10">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium tracking-[0.24em] text-sky-100/80 uppercase backdrop-blur">
              Prisma + Better Auth + Docker
            </div>

            <h1 className="mt-6 max-w-xl text-5xl font-semibold tracking-[-0.06em] text-white sm:text-6xl xl:text-7xl">
              Sign in to run brochure generation on a real database.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              Sessions, brochure runs, and future product data now sit behind
              Prisma and Better Auth. The generator still stays Docker-native,
              MinIO-backed, and focused on free OpenRouter models.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                label: 'Auth',
                value: 'Email + password',
                detail: 'Better Auth manages sessions and cookies.',
              },
              {
                label: 'Database',
                value: 'Prisma 7',
                detail: 'A generated client keeps the schema type-safe.',
              },
              {
                label: 'Runtime',
                value: 'Docker-first',
                detail: 'The same stack runs locally and in containers.',
              },
            ].map((card) => (
              <article
                key={card.label}
                className="rounded-4xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-slate-950/20 backdrop-blur-xl"
              >
                <p className="text-xs tracking-[0.3em] text-slate-400 uppercase">
                  {card.label}
                </p>
                <h2 className="mt-3 text-lg font-semibold text-white">
                  {card.value}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {card.detail}
                </p>
              </article>
            ))}
          </div>
        </div>
      </aside>

      <section className="flex items-center justify-center px-6 py-10 sm:px-8 lg:px-10 xl:px-14">
        <div className="w-full max-w-xl">
          <SignInForm callbackUrl={callbackUrl} />
        </div>
      </section>
    </main>
  )
}
