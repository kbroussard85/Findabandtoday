import { getSession } from '@auth0/nextjs-auth0';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Manual fallback to sync a user if the Auth0 Action fails.
 */
export async function GET(req: Request) {
  const { origin } = new URL(req.url);
  
  try {
    console.log('[MANUAL-SYNC] Starting manual sync process...');
    const session = await getSession();
    const user = session?.user;

    if (!user) {
      console.warn('[MANUAL-SYNC] No session found during manual sync.');
      return NextResponse.json({ error: 'Unauthorized: No session found' }, { status: 401 });
    }

    const auth0Id = user.sub;
    const email = user.email;
    
    // Role is expected in user_metadata or app_metadata, but we fallback to BAND
    // Check multiple possible locations for role
    const role = user.role || user['https://fabt.vercel.app/role'] || 'BAND'; 
    
    console.log(`[MANUAL-SYNC] Syncing user: ${email} (${auth0Id}) with role: ${role}`);

    if (!email) {
      console.error('[MANUAL-SYNC] User has no email in Auth0 session.');
      return NextResponse.json({ error: 'User email missing from Auth0' }, { status: 400 });
    }

    const isBand = role.toUpperCase() === 'BAND';

    const dbUser = await prisma.user.upsert({
      where: { auth0Id },
      update: { email }, 
      create: {
        auth0Id,
        email,
        role: isBand ? 'BAND' : 'VENUE',
        ...(isBand 
          ? { 
              bandProfile: { 
                create: { 
                  name: email.split('@')[0],
                  members: {
                    create: {
                      role: 'OWNER',
                      // We need the userId here, but it's not created yet in the 'create' block.
                      // Actually, Prisma nested creates handles this if we use connect/create correctly.
                      // In our schema, BandMember has userId.
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

    console.log(`[MANUAL-SYNC] Successfully synced user ${dbUser.id}`);
    
    // Redirect back to profile using the request origin
    return NextResponse.redirect(new URL('/profile', origin));
  } catch (error: any) {
    console.error('Manual Sync Error:', error);
    
    // Provide more specific error feedback if it's a Prisma error
    if (error.code === 'P2002') {
      return NextResponse.json({ 
        error: 'Database conflict: A user with this ID or email already exists.',
        details: error.meta 
      }, { status: 409 });
    }

    return NextResponse.json({ 
      error: 'Failed to sync user', 
      message: error.message || 'Unknown error' 
    }, { status: 500 });
  }
}
