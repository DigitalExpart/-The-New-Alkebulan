import { NextResponse, NextRequest } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Configure your allowed origins here or via env
const allowedOrigins = new Set(
  (process.env.NEXT_PUBLIC_ALLOWED_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)
)

// Optional: Upstash rate limit (gracefully disabled if env missing)
let ratelimit: Ratelimit | undefined
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, '1 m'), // 60 requests per minute
      analytics: true,
      prefix: 'mw',
    })
  }
} catch (_) {
  ratelimit = undefined
}

function setSecurityHeaders(response: NextResponse) {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '0')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=15552000; includeSubDomains; preload'
  )
  // CSP report-only to start; tighten later and remove 'unsafe-*'
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    `report-uri ${process.env.NEXT_PUBLIC_CSP_REPORT_URI || '/api/csp-report'}`,
  ].join('; ')
  response.headers.set('Content-Security-Policy-Report-Only', csp)
  return response
}

function handleCors(req: NextRequest, res: NextResponse) {
  const origin = req.headers.get('origin') || ''
  const isAllowed = allowedOrigins.has(origin)

  res.headers.set('Vary', 'Origin')
  if (isAllowed) {
    res.headers.set('Access-Control-Allow-Origin', origin)
    res.headers.set('Access-Control-Allow-Credentials', 'true')
  }
  res.headers.set(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  )
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  return res
}

export async function middleware(req: NextRequest) {
  const url = new URL(req.url)
  const origin = req.headers.get('origin') || ''
  const method = req.method.toUpperCase()

  // Block unknown origins for mutating requests; allow GET if needed
  const isAllowedOrigin = !origin || allowedOrigins.has(origin)
  const isMutating = method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS'

  // Preflight
  if (method === 'OPTIONS') {
    const preflight = NextResponse.json({}, { status: 204 })
    return handleCors(req, setSecurityHeaders(preflight))
  }

  if (isMutating && !isAllowedOrigin) {
    return NextResponse.json({ error: 'Origin not allowed' }, { status: 403 })
  }

  // Rate limit /api and auth-sensitive routes
  if (ratelimit && (url.pathname.startsWith('/api') || isMutating)) {
    const ip = req.ip || req.headers.get('x-forwarded-for') || '127.0.0.1'
    const key = `${ip}:${url.pathname}`
    const { success, limit, remaining, reset } = await ratelimit.limit(key)
    if (!success) {
      return NextResponse.json(
        { error: 'Too Many Requests' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(limit),
            'X-RateLimit-Remaining': String(remaining),
            'X-RateLimit-Reset': String(reset),
          },
        }
      )
    }
  }

  const res = NextResponse.next()
  handleCors(req, res)
  setSecurityHeaders(res)
  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
