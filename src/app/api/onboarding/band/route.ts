// src/app/api/onboarding/band/route.ts

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { getSession } from '@auth0/nextjs-auth0';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { BandOnboardingSchema } from '@/lib/validations/onboarding';
import { logger } from '@/lib/logger';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const user = session?.user;

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const result = BandOnboardingSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input', details: result.error.format() }, { status: 400 });
    }

    const { name, searchRadius } = result.data;

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
    logger.error({ err: error }, 'Band Onboarding Error:');
    return NextResponse.json({ error: 'Failed to complete onboarding' }, { status: 500 });
  }
}
