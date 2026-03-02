import { getSession } from '@auth0/nextjs-auth0';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Manual fallback to sync a user if the Auth0 Action fails.
 */
export async function GET() {
  try {
    const session = await getSession();
    const user = session?.user;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Role is expected in user_metadata, but we fallback to BAND
    const role = user.role || 'BAND'; 
    const email = user.email;
    const auth0Id = user.sub;

    const isBand = role.toUpperCase() === 'BAND';

    const dbUser = await prisma.user.upsert({
      where: { auth0Id },
      update: { email }, 
      create: {
        auth0Id,
        email,
        role: isBand ? 'BAND' : 'VENUE',
        ...(isBand 
          ? { bandProfile: { create: { name: email.split('@')[0] } } } 
          : { venueProfile: { create: { name: email.split('@')[0] } } }
        )
      },
    });

    console.log(`[MANUAL-SYNC] Successfully synced user ${dbUser.id}`);
    
    // Redirect back to profile
    return NextResponse.redirect(new URL('/profile', process.env.AUTH0_BASE_URL));
  } catch (error) {
    console.error('Manual Sync Error:', error);
    return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 });
  }
}
