import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@auth0/nextjs-auth0';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const latParam = searchParams.get('lat');
    const lngParam = searchParams.get('lng');
    const radiusParam = searchParams.get('radius') || '50';
    const roleParam = searchParams.get('role') || 'BAND';
    const queryParam = searchParams.get('q');
    const genreParam = searchParams.get('genre');
    const limitParam = searchParams.get('limit') || '20';
    const offsetParam = searchParams.get('offset') || '0';

    if (!latParam || !lngParam) {
      return NextResponse.json({ error: 'Missing lat or lng' }, { status: 400 });
    }

    const lat = parseFloat(latParam);
    const lng = parseFloat(lngParam);
    const radiusMiles = parseFloat(radiusParam);
    const limit = parseInt(limitParam);
    const offset = parseInt(offsetParam);

    if (isNaN(lat) || isNaN(lng) || isNaN(radiusMiles) || isNaN(limit) || isNaN(offset)) {
      return NextResponse.json({ error: 'Invalid search parameters' }, { status: 400 });
    }

    // 1. SAFE SESSION CHECK: Don't let Auth0 failures block public discovery
    let isPremium = false;
    try {
      const session = await getSession();
      if (session?.user) {
        const dbUser = await prisma.user.findUnique({
          where: { auth0Id: session.user.sub },
          select: { isPaid: true }
        });
        isPremium = dbUser?.isPaid || false;
      }
    } catch (e) {
      // User is likely just not logged in, which is fine for discovery
      console.log('[DISCOVERY] Public request (no session)');
    }

    const radiusInMeters = radiusMiles * 1609.34;

    let results: Array<{
      id: string;
      name: string;
      bio?: string;
      media?: unknown;
      availability?: unknown;
      negotiationPrefs?: unknown;
      audioUrlPreview?: string;
    }>;

    // 2. Fetch using our optimized findNearby extension
    if (roleParam.toUpperCase() === 'BAND') {
      results = await prisma.band.findNearby(
        lat, 
        lng, 
        radiusInMeters, 
        queryParam || undefined, 
        genreParam || undefined,
        limit, 
        offset
      ) as typeof results;
    } else {
      results = await prisma.venue.findNearby(
        lat, 
        lng, 
        radiusInMeters, 
        queryParam || undefined, 
        genreParam || undefined,
        limit, 
        offset
      ) as typeof results;
    }

    // 3. GATING LOGIC: If not premium, strip sensitive data
    const gatedResults = results.map(item => {
      const sanitized = { ...item } as Record<string, unknown>;
      if (!isPremium) {
        delete sanitized.availability;
        delete sanitized.negotiationPrefs;
      }
      return sanitized;
    });

    return NextResponse.json({ data: gatedResults });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[DISCOVERY_API_FATAL]:', message);
    return NextResponse.json({ error: 'Failed to synchronize local scene' }, { status: 500 });
  }
}
