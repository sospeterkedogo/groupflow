import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

// SIMPLE SLIDING WINDOW RATE LIMITER (In-Memory for current instance)
const rateLimitMap = new Map<string, { count: number, resetAt: number }>()
const LIMIT = 60 // requests
const WINDOW_MS = 60 * 1000 // 1 minute

export default async function proxy(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'anonymous'
  const now = Date.now()
  
  // Rate Limit Check
  const rateLimit = rateLimitMap.get(ip)
  if (!rateLimit || now > rateLimit.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS })
  } else {
    rateLimit.count++
    if (rateLimit.count > LIMIT) {
      return new NextResponse('Too Many Requests - Identity verification rate limit exceeded.', { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil((rateLimit.resetAt - now) / 1000).toString(),
          'X-RateLimit-Limit': LIMIT.toString(),
          'X-RateLimit-Remaining': '0'
        }
      })
    }
  }

  // Handle Supabase Session & Redirection Logic
  const response = await updateSession(request)
  const { pathname } = request.nextUrl

  // --- INSTITUTIONAL GUARD: SECRET GATEWAY PROTECTION ---
  // If attempting to access the secret terminal or admin dashboard
  if (pathname.startsWith('/terminal') || pathname.startsWith('/admin')) {
    const supabaseSession = request.cookies.get('sb-access-token')
    
    // If no session is detected in cookies, bounce immediately to preserve secrecy
    if (!supabaseSession) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Role verification happens in the Page components for deep-db validation, 
    // but we add a generic session-check here.
  }
  
  // Inject Headers for transparency
  response.headers.set('X-RateLimit-Limit', LIMIT.toString())
  response.headers.set('X-RateLimit-Remaining', (LIMIT - (rateLimit?.count || 1)).toString())
  
  return response
}

export const config = {
  matcher: [
    // Skip static assets, workflow internals, and other internals
    '/((?!_next/static|_next/image|favicon.ico|assets|favicon.png|\.well-known/workflow/|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
