// src/app/api/auth/sync/route.ts

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

/**
 * Endpoint called by Auth0 Action after a user signs up.
 * This ensures the user is mirrored in our local PostgreSQL database.
 */
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    const syncSecret = process.env.SYNC_SECRET;

    if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] !== syncSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { auth0Id, email, role } = await req.json();

    if (!auth0Id || !email || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const user = await prisma.user.upsert({
      where: { auth0Id },
      update: { email }, // Update email in case it changed
      create: {
        auth0Id,
        email,
        role: role.toUpperCase() === 'BAND' ? 'BAND' : 'VENUE',
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Sync Error:', error);
    return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 });
  }
}
