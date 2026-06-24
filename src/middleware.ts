import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Security headers and basic protection middleware
export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Content Security Policy — strict but allows our scripts/styles
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // needed for client-side crypto
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self'",
    "connect-src 'self' https://*.supabase.co https://api.resend.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')

  response.headers.set('Content-Security-Policy', csp)
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // HSTS — only in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  }

  return response
}

// Apply to all routes except static files
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo.svg|robots.txt).*)',
  ],
}
