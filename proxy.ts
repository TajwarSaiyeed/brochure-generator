import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  let session = null

  try {
    session = await auth.api.getSession({
      headers: request.headers,
    })
  } catch {
    session = null
  }

  const isLoggedIn = !!session?.user

  const publicRoutes = ['/sign-in', '/api/auth']
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  )

  if (!isLoggedIn && !isPublicRoute) {
    const signInUrl = new URL('/sign-in', request.url)
    signInUrl.searchParams.set(
      'callbackUrl',
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    )

    return NextResponse.redirect(signInUrl)
  }

  if (isLoggedIn && pathname === '/sign-in') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
