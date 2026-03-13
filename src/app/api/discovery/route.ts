import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@auth0/nextjs-auth0';
import { DiscoveryQuerySchema } from '@/lib/validations/discovery';

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
    const params = Object.fromEntries(searchParams.entries());
    const result = DiscoveryQuerySchema.safeParse(params);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid search parameters', details: result.error.format() }, { status: 400 });
    }

    const { lat, lng, radius: radiusMiles, role: roleParam, q: queryParam, genre: genreParam, limit, offset } = result.data;

    let dbUser = null;
    let isPremium = false;
    try {
      const session = await getSession();
      if (session?.user) {
        dbUser = await prisma.user.findUnique({
          where: { auth0Id: session.user.sub },
          select: { isPaid: true, role: true }
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
      // Only reveal average_rating to VENUE roles
      if (dbUser?.role !== 'VENUE') {
        delete (sanitized as any).average_rating;
      }

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
