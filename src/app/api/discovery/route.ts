import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@auth0/nextjs-auth0';

interface DiscoveryResult {
  id: string;
  name: string;
  bio?: string;
  media?: unknown;
  availability?: unknown;
  negotiationPrefs?: unknown;
  audioUrlPreview?: string;
}

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

    const lat = latParam ? parseFloat(latParam) : 0;
    const lng = lngParam ? parseFloat(lngParam) : 0;
    const radiusMiles = parseFloat(radiusParam);
    const limit = parseInt(limitParam);
    const offset = parseInt(offsetParam);

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
    } catch {
      // Logged out
    }

    const radiusInMeters = radiusMiles * 1609.34;
    let results: DiscoveryResult[] = [];

    // 1. Primary Geospatial + Name Search
    try {
      if (roleParam.toUpperCase() === 'BAND') {
        results = await prisma.band.findNearby(
          lat, lng, radiusInMeters, queryParam || undefined, genreParam || undefined, limit, offset
        ) as DiscoveryResult[];
      } else {
        results = await prisma.venue.findNearby(
          lat, lng, radiusInMeters, queryParam || undefined, genreParam || undefined, limit, offset
        ) as DiscoveryResult[];
      }
    } catch (dbError) {
      console.error('[DISCOVERY_DEBUG] Geospatial query failed:', dbError);
    }

    // 2. SELF-REPAIR FALLBACK: If we still have no results but a name query is present, 
    // do a direct name lookup bypassing PostGIS entirely. This ensures "Ken Carl" is found.
    if (results.length === 0 && queryParam) {
      console.log('[DISCOVERY_DEBUG] No geospatial results. Running manual fallback for:', queryParam);
      if (roleParam.toUpperCase() === 'BAND') {
        results = await prisma.band.findMany({
          where: {
            OR: [
              { name: { contains: queryParam, mode: 'insensitive' } },
              { bio: { contains: queryParam, mode: 'insensitive' } }
            ]
          },
          take: limit,
          skip: offset
        }) as unknown as DiscoveryResult[];
      }
    }

    const gatedResults = results.map(item => {
      const sanitized = { ...item };
      /* eslint-disable @typescript-eslint/no-explicit-any */
      if (!isPremium) {
        delete (sanitized as any).availability;
        delete (sanitized as any).negotiationPrefs;
      }
      /* eslint-enable @typescript-eslint/no-explicit-any */
      return sanitized;
    });

    return NextResponse.json({ data: gatedResults });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[DISCOVERY_FATAL]:', message);
    return NextResponse.json({ error: 'Search unavailable' }, { status: 500 });
  }
}
