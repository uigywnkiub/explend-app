import { type NextRequest, NextResponse, userAgent } from 'next/server'

import { auth } from '@/auth'

import type { TSession } from './app/lib/types'
import { ROUTE } from './config/constants/routes'

export default auth((req: NextRequest & { auth: TSession }) => {
  const url = req.nextUrl.clone()
  const { device } = userAgent(req)

  if (device.type === 'mobile') {
    url.pathname = ROUTE.MOBILE_TEMPORARILY_NOT_ALLOWED
    return NextResponse.rewrite(url)
  }

  if (!req.auth) {
    url.pathname = ROUTE.SIGNIN
    return NextResponse.rewrite(url)
  }

  if (req.nextUrl.pathname === ROUTE.SIGNIN) {
    url.pathname = ROUTE.HOME
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
