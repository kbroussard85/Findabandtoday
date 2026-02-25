// src/app/api/onboarding/band/route.ts

import { getSession } from '@auth0/nextjs-auth0';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const user = session?.user;

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { name, searchRadius } = await req.json();

    // 1. Find the internal user by auth0Id
    const localUser = await prisma.user.findUnique({
      where: { auth0Id: user.sub },
    });

    if (!localUser) {
      return NextResponse.json({ error: 'User not synced' }, { status: 404 });
    }

    // 2. Create or Update the Band profile
    const bandProfile = await prisma.band.upsert({
      where: { userId: localUser.id },
      update: { name, searchRadius },
      create: {
        userId: localUser.id,
        name,
        searchRadius,
      },
    });

    return NextResponse.json({ success: true, bandProfile });
  } catch (error) {
    console.error('Band Onboarding Error:', error);
    return NextResponse.json({ error: 'Failed to complete onboarding' }, { status: 500 });
  }
}
