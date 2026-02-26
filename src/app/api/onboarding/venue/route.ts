// src/app/api/onboarding/venue/route.ts

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { getSession } from '@auth0/nextjs-auth0';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const user = session?.user;

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { name, capacity } = await req.json();

    // 1. Find the internal user by auth0Id
    const localUser = await prisma.user.findUnique({
      where: { auth0Id: user.sub },
    });

    if (!localUser) {
      return NextResponse.json({ error: 'User not synced' }, { status: 404 });
    }

    // 2. Create or Update the Venue profile
    const venueProfile = await prisma.venue.upsert({
      where: { userId: localUser.id },
      update: { name, capacity },
      create: {
        userId: localUser.id,
        name,
        capacity,
      },
    });

    return NextResponse.json({ success: true, venueProfile });
  } catch (error) {
    console.error('Venue Onboarding Error:', error);
    return NextResponse.json({ error: 'Failed to complete onboarding' }, { status: 500 });
  }
}
