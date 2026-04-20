import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

// ─── TIERED RATE LIMITS ───────────────────────────────────────────────────────
// Each tier has its own bucket: auth brute-force gets tightest limits.

interface RateBucket { count: number; resetAt: number }

const globalBuckets = new Map<string, RateBucket>()   // 60 req/min per IP (all routes)
const authBuckets   = new Map<string, RateBucket>()   // 10 req/min per IP (auth routes)
const apiBuckets    = new Map<string, RateBucket>()   // 30 req/min per IP (API routes)
const adminBuckets  = new Map<string, RateBucket>()   // 5 req/min per IP (admin routes)

function checkRate(
  store: Map<string, RateBucket>,
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const entry = store.get(key)
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs }
  }
  entry.count++
  return {
    allowed: entry.count <= limit,
    remaining: Math.max(limit - entry.count, 0),
    resetAt: entry.resetAt,
  }
}

// ─── CSP NONCE-FREE POLICY ────────────────────────────────────────────────────
// Strict but compatible with Next.js inline scripts needed for hydration.

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://*.vercel-insights.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://othntbcrtmemavfsslrb.supabase.co https://*.githubusercontent.com https://lh3.googleusercontent.com https://images.unsplash.com",
  "font-src 'self' data:",
  "connect-src 'self' https://othntbcrtmemavfsslrb.supabase.co wss://othntbcrtmemavfsslrb.supabase.co https://api.openai.com https://api.stripe.com https://*.vercel-insights.com https://vitals.vercel-insights.com",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join('; ')

export default async function proxy(request: NextRequest) {
  const ip = (request.headers.get('x-forwarded-for') ?? 'anonymous').split(',')[0].trim()
  const { pathname } = request.nextUrl
  const isDev = process.env.NODE_ENV === 'development'

  if (!isDev) {
    // ── Admin: 5 req/min ──────────────────────────────────────────────────────
    if (pathname.startsWith('/api/admin') || pathname.startsWith('/admin')) {
      const rl = checkRate(adminBuckets, ip, 5, 60_000)
      if (!rl.allowed) {
        return new NextResponse('Too Many Requests', {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rl.resetAt - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
          },
        })
      }
    }

    // ── Auth routes: 10 req/min ───────────────────────────────────────────────
    else if (pathname.startsWith('/auth') || pathname.startsWith('/api/auth') || pathname.startsWith('/login')) {
      const rl = checkRate(authBuckets, ip, 10, 60_000)
      if (!rl.allowed) {
        return new NextResponse('Too Many Requests — authentication rate limit exceeded.', {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rl.resetAt - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '0',
          },
        })
      }
    }

    // ── General API: 30 req/min ───────────────────────────────────────────────
    else if (pathname.startsWith('/api')) {
      const rl = checkRate(apiBuckets, ip, 30, 60_000)
      if (!rl.allowed) {
        return new NextResponse('Too Many Requests', {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rl.resetAt - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': '30',
            'X-RateLimit-Remaining': '0',
          },
        })
      }
    }

    // ── Global: 120 req/min ───────────────────────────────────────────────────
    else {
      const rl = checkRate(globalBuckets, ip, 120, 60_000)
      if (!rl.allowed) {
        return new NextResponse('Too Many Requests', {
          status: 429,
          headers: { 'Retry-After': '60', 'X-RateLimit-Limit': '120', 'X-RateLimit-Remaining': '0' },
        })
      }
    }
  }

  // ── Block oversized request bodies early ─────────────────────────────────
  const contentLength = parseInt(request.headers.get('content-length') ?? '0', 10)
  if (contentLength > 500_000) {
    return new NextResponse('Payload Too Large', { status: 413 })
  }

  // ── Block TRACE/TRACK methods (XST attack vector) ─────────────────────────
  if (['TRACE', 'TRACK'].includes(request.method)) {
    return new NextResponse('Method Not Allowed', { status: 405 })
  }

  // ── Institutional guard: protect admin & terminal ─────────────────────────
  if (pathname.startsWith('/terminal') || pathname.startsWith('/admin')) {
    const supabaseSession = request.cookies.get('sb-access-token')
    if (!supabaseSession) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // ── Handle session refresh (Supabase) ─────────────────────────────────────
  const response = await updateSession(request)

  // ── Inject security headers on all responses ──────────────────────────────
  response.headers.set('Content-Security-Policy', CSP)
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()')
  response.headers.set('X-DNS-Prefetch-Control', 'off')
  response.headers.delete('X-Powered-By')

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|assets|favicon.png|\\.well-known/workflow/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

