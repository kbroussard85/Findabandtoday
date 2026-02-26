import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@auth0/nextjs-auth0';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const latParam = searchParams.get('lat');
  const lngParam = searchParams.get('lng');
  const radiusParam = searchParams.get('radius') || '50';
  const roleParam = searchParams.get('role') || 'BAND';

  if (!latParam || !lngParam) {
    return NextResponse.json({ error: 'Missing lat or lng' }, { status: 400 });
  }

  const lat = parseFloat(latParam);
  const lng = parseFloat(lngParam);
  const radiusMiles = parseFloat(radiusParam);

  if (isNaN(lat) || isNaN(lng) || isNaN(radiusMiles)) {
    return NextResponse.json({ error: 'Invalid coordinates or radius' }, { status: 400 });
  }

  // Get current user session to check for premium status
  const session = await getSession();
  let isPremium = false;

  if (session?.user) {
    const dbUser = await prisma.user.findUnique({
      where: { auth0Id: session.user.sub },
      select: { isPaid: true }
    });
    isPremium = dbUser?.isPaid || false;
  }

  // Convert miles to meters for PostGIS (1 mile = 1609.34 meters)
  const radiusInMeters = radiusMiles * 1609.34;

  try {
    let results: any[];
    if (roleParam.toUpperCase() === 'BAND') {
      results = await prisma.band.findNearby(lat, lng, radiusInMeters);
    } else {
      results = await prisma.venue.findNearby(lat, lng, radiusInMeters);
    }

    // GATING LOGIC: If not premium, strip sensitive data before sending
    const gatedResults = results.map(item => {
      const sanitized = { ...item };
      if (!isPremium) {
        // Strip sensitive fields
        delete sanitized.availability;
        delete sanitized.negotiationPrefs;
        // Obfuscate contact logic could go here if we had direct contact fields
      }
      return sanitized;
    });

    return NextResponse.json({ data: gatedResults });
  } catch (error) {
    console.error('Discovery API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch discovery results' }, { status: 500 });
  }
}
