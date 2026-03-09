import { getSession } from '@auth0/nextjs-auth0';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    const user = session?.user;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { auth0Id: user.sub },
      include: {
        bandProfile: {
          include: {
            members: {
              include: { user: true }
            },
            availabilities: true
          }
        },
        venueProfile: {
          include: {
            members: {
              include: { user: true }
            },
            availabilities: true
          }
        },
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ data: dbUser });
  } catch (error) {
    console.error('Profile Fetch Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const user = session?.user;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bio, negotiationPrefs, media, name } = await req.json();

    const dbUser = await prisma.user.findUnique({
      where: { auth0Id: user.sub },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update the base User record with the new name if provided
    if (name) {
      await prisma.user.update({
        where: { id: dbUser.id },
        data: { name },
      });
    }
    // - [x] Fix Stripe Checkout Server Action Error <!-- id: 11 -->
    // - [x] Refine UpgradeButton Error Handling <!-- id: 12 -->
    // - [x] Debug "Invalid API Key" Error (Added Logs) <!-- id: 13 -->
    // - [x] Transition Stripe to Live Mode (Stayed in Test Mode) <!-- id: 14 -->
    // - [x] Sync Stripe Test Mode Keys to Vercel <!-- id: 15 -->

    if (dbUser.role === 'BAND') {
      // Find or Create the Band Profile
      let band = await prisma.band.findUnique({
        where: { userId: dbUser.id }
      });

      if (!band) {
        band = await prisma.band.create({
          data: {
            userId: dbUser.id,
            name: name || user.name || 'New Artist',
          }
        });
      }

      // CRITICAL: Ensure the user is a member/owner of their own band
      await prisma.bandMember.upsert({
        where: {
          bandId_userId: {
            bandId: band.id,
            userId: dbUser.id
          }
        },
        update: { role: 'OWNER' },
        create: {
          bandId: band.id,
          userId: dbUser.id,
          role: 'OWNER'
        }
      });

      await prisma.band.update({
        where: { id: band.id },
        data: { bio, negotiationPrefs, media, name: name || band.name },
      });
    } else {
      // Find or Create the Venue Profile
      let venue = await prisma.venue.findUnique({
        where: { userId: dbUser.id }
      });

      if (!venue) {
        venue = await prisma.venue.create({
          data: {
            userId: dbUser.id,
            name: name || user.name || 'New Venue',
          }
        });
      }

      // CRITICAL: Ensure the user is a member/owner of their own venue
      await prisma.venueMember.upsert({
        where: {
          venueId_userId: {
            venueId: venue.id,
            userId: dbUser.id
          }
        },
        update: { role: 'OWNER' },
        create: {
          venueId: venue.id,
          userId: dbUser.id,
          role: 'OWNER'
        }
      });

      await prisma.venue.update({
        where: { id: venue.id },
        data: { bio, negotiationPrefs, media, name: name || venue.name },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile Update Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
