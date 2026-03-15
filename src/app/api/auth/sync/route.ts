// src/app/api/auth/sync/route.ts

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { AuthSyncSchema } from '@/lib/validations/auth';
import { logger } from '@/lib/logger';

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

    const body = await req.json();
    const result = AuthSyncSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input', details: result.error.format() }, { status: 400 });
    }

    const { auth0Id, email, role, name } = result.data;
    logger.info(`[SYNC] Attempting to sync user: ${email} with role: ${role}`);

    const isBand = role.toUpperCase() === 'BAND';

    const user = await prisma.user.upsert({
      where: { auth0Id },
      update: { email, name },
      create: {
        auth0Id,
        email,
        name: name || email.split('@')[0],
        role: isBand ? 'BAND' : 'VENUE',
        // Automatically create the linked profile record and owner membership
        ...(isBand
          ? {
            bandProfile: {
              create: {
                name: email.split('@')[0],
                members: {
                  create: {
                    role: 'OWNER',
                    user: { connect: { auth0Id } }
                  }
                }
              }
            }
          }
          : {
            venueProfile: {
              create: {
                name: email.split('@')[0],
                members: {
                  create: {
                    role: 'OWNER',
                    user: { connect: { auth0Id } }
                  }
                }
              }
            }
          }
        )
      },
    });

    logger.info(`[SYNC] Successfully synced user ${user.id} and created ${isBand ? 'Band' : 'Venue'} profile.`);
    return NextResponse.json({ success: true, user });
  } catch (error) {
    logger.error({ err: error }, 'Sync Error:');
    return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 });
  }
}
