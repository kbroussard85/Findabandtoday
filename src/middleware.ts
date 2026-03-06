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

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.pathname;
  // @ts-expect-error - ip property exists on NextRequest in Vercel/Next.js environment
  const ip = req.ip ?? "127.0.0.1";

  try {
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
      const session = await getSession(req, NextResponse.next());
      const userId = session?.user?.sub ?? ip;
      
      let limiter = checkoutRateLimit;
      if (url.includes('/escrow')) {
        limiter = escrowRateLimit;
      }

      if (limiter) {
        const { success } = await limiter.limit(userId);
        if (!success) {
          return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
        }
      }
    }
  } catch (error) {
    console.error("Middleware processing error:", error);
    // Continue if ratelimiting fails, rather than crashing the whole request
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/discovery/:path*',
    '/api/auth/sync/:path*',
    '/api/checkout/:path*',
    '/api/gigs/:id/escrow'
  ],
};
