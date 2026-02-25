export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

  // Convert miles to meters for PostGIS (1 mile = 1609.34 meters)
  const radiusInMeters = radiusMiles * 1609.34;

  try {
    let results;
    if (roleParam.toUpperCase() === 'BAND') {
      results = await prisma.band.findNearby(lat, lng, radiusInMeters);
    } else {
      results = await prisma.venue.findNearby(lat, lng, radiusInMeters);
    }

    return NextResponse.json({ data: results });
  } catch (error) {
    console.error('Discovery API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch discovery results' }, { status: 500 });
  }
}
