// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0/edge';
import { 
  syncRateLimit, 
  discoveryRateLimit, 
  checkoutRateLimit, 
  escrowRateLimit 
} from '@/lib/ratelimit';
import { logger } from '@/lib/logger';

const PROTECTED_ROUTES = [
  '/profile',
  '/gig/create',
  '/api/artist',
  '/api/checkout',
  '/api/gigs' // For escrow in particular, but matches base
];

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.pathname;
  // @ts-expect-error - ip property exists on NextRequest in Vercel/Next.js environment
  const ip = req.ip ?? "127.0.0.1";
  const requestId = crypto.randomUUID();

  // 1. Authentication Check
  const isProtectedRoute = PROTECTED_ROUTES.some(route => url.startsWith(route));
  
  let session = null;
  if (isProtectedRoute || url.startsWith('/api/checkout') || url.includes('/escrow')) {
    session = await getSession(req, NextResponse.next());
  }

  if (isProtectedRoute && !session) {
    if (url.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/api/auth/login', req.url));
  }

  try {
    // 2. Rate Limiting Logic
    // Rate limit by IP for discovery
    if (url.startsWith('/api/discovery') && discoveryRateLimit) {
      const { success } = await discoveryRateLimit.limit(ip);
      if (!success) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
      }
    }

    // Rate limit for sync (IP-based as user might not have a profile yet)
    if (url.startsWith('/api/auth/sync') && syncRateLimit) {
      const { success } = await syncRateLimit.limit(ip);
      if (!success) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
      }
    }

    // Rate limit by user for authenticated routes
    if ((url.startsWith('/api/checkout') || url.includes('/escrow')) && (checkoutRateLimit || escrowRateLimit)) {
      const userId = session?.user?.sub ?? ip;
      
      let limiter = checkoutRateLimit;
      if (url.includes('/escrow')) {
        limiter = escrowRateLimit;
      }

      if (limiter) {
        const { success } = await limiter.limit(userId);
        if (!success) {
          logger.warn({ msg: 'Rate limit exceeded', ip, userId, url, requestId });
          return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
        }
      }
    }
  } catch (error) {
    logger.error({ msg: 'Middleware processing error', error, url, ip, requestId });
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-request-id', requestId);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    '/profile/:path*',
    '/gig/create/:path*',
    '/api/artist/:path*',
    '/api/discovery/:path*',
    '/api/auth/sync/:path*',
    '/api/checkout/:path*',
    '/api/gigs/:id/escrow'
  ],
};
