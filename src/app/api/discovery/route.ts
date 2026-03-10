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
  const url = new URL(req.url);
  console.log('[DISCOVERY_DEBUG] Request received:', url.search);

  try {
    const { searchParams } = url;
    const latParam = searchParams.get('lat');
    const lngParam = searchParams.get('lng');
    const radiusParam = searchParams.get('radius') || '50';
    const roleParam = searchParams.get('role') || 'BAND';
    const queryParam = searchParams.get('q');
    const genreParam = searchParams.get('genre');
    const limitParam = searchParams.get('limit') || '20';
    const offsetParam = searchParams.get('offset') || '0';

    if (!latParam || !lngParam) {
      console.error('[DISCOVERY_DEBUG] Missing coordinates');
      return NextResponse.json({ error: 'Missing lat or lng' }, { status: 400 });
    }

    const lat = parseFloat(latParam);
    const lng = parseFloat(lngParam);
    const radiusMiles = parseFloat(radiusParam);
    const limit = parseInt(limitParam);
    const offset = parseInt(offsetParam);

    console.log(`[DISCOVERY_DEBUG] Params: lat=${lat}, lng=${lng}, radius=${radiusMiles}, role=${roleParam}`);

    let isPremium = false;
    try {
      const session = await getSession();
      if (session?.user) {
        const dbUser = await prisma.user.findUnique({
          where: { auth0Id: session.user.sub },
          select: { isPaid: true }
        });
        isPremium = dbUser?.isPaid || false;
        console.log('[DISCOVERY_DEBUG] Session found, premium:', isPremium);
      }
    } catch {
      console.log('[DISCOVERY_DEBUG] No active session (expected for public visitors)');
    }

    const radiusInMeters = radiusMiles * 1609.34;

    let results: DiscoveryResult[] = [];

    try {
      if (roleParam.toUpperCase() === 'BAND') {
        console.log('[DISCOVERY_DEBUG] Querying Bands...');
        results = await prisma.band.findNearby(
          lat, 
          lng, 
          radiusInMeters, 
          queryParam || undefined, 
          genreParam || undefined,
          limit, 
          offset
        ) as DiscoveryResult[];
      } else {
        console.log('[DISCOVERY_DEBUG] Querying Venues...');
        results = await prisma.venue.findNearby(
          lat, 
          lng, 
          radiusInMeters, 
          queryParam || undefined, 
          genreParam || undefined,
          limit, 
          offset
        ) as DiscoveryResult[];
      }
      console.log(`[DISCOVERY_DEBUG] Found ${results.length} results`);
    } catch (dbError: unknown) {
      const dbMessage = dbError instanceof Error ? dbError.message : 'Database error';
      console.error('[DISCOVERY_DEBUG] DATABASE QUERY FAILED:', dbMessage);
      return NextResponse.json({ data: [], warning: 'Geospatial search unavailable' });
    }

    const gatedResults = results.map(item => {
      const sanitized = { ...item };
      if (!isPremium) {
        delete sanitized.availability;
        delete sanitized.negotiationPrefs;
      }
      return sanitized;
    });

    return NextResponse.json({ data: gatedResults });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[DISCOVERY_DEBUG] FATAL ERROR:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
