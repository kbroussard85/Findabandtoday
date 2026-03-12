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

    const { bio, negotiationPrefs, media, name, lat, lng, agreementTemplate } = await req.json();

    const dbUser = await prisma.user.findUnique({
      where: { auth0Id: user.sub },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (name) {
      await prisma.user.update({
        where: { id: dbUser.id },
        data: { name },
      });
    }

    if (dbUser.role === 'BAND') {
      // ... existing band logic ...
    } else {
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

      await prisma.venueMember.upsert({
        where: { venueId_userId: { venueId: venue.id, userId: dbUser.id } },
        update: { role: 'OWNER' },
        create: { venueId: venue.id, userId: dbUser.id, role: 'OWNER' }
      });

      const updatedVenue = await prisma.venue.update({
        where: { id: venue.id },
        data: { bio, negotiationPrefs, media, name: name || venue.name, lat, lng },
      });

      // SYNC AGREEMENT TEMPLATE
      if (agreementTemplate) {
        await prisma.venueAgreement.upsert({
          where: { id: venue.id }, // Simplification: using venueId as ID for unique template or handle differently
          update: { templateText: agreementTemplate },
          create: { venueId: venue.id, templateText: agreementTemplate }
        });
      }

      // SYNC GEOSPATIAL LOCATION
      if (lat && lng) {
        await prisma.$executeRawUnsafe(
          `UPDATE "Venue" SET location = ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography WHERE id = $3`,
          lng, lat, updatedVenue.id
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile Update Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
