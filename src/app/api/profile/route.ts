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
            }
          }
        },
        venueProfile: {
          include: {
            members: {
              include: { user: true }
            }
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

    const { bio, negotiationPrefs, media } = await req.json();

    const dbUser = await prisma.user.findUnique({
      where: { auth0Id: user.sub },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (dbUser.role === 'BAND') {
      const band = await prisma.band.findFirst({
        where: {
          members: {
            some: {
              userId: dbUser.id,
              role: { in: ['OWNER', 'MANAGER'] }
            }
          }
        }
      });

      if (!band) return NextResponse.json({ error: 'Not authorized to update this band' }, { status: 403 });

      await prisma.band.update({
        where: { id: band.id },
        data: { bio, negotiationPrefs, media },
      });
    } else {
      const venue = await prisma.venue.findFirst({
        where: {
          members: {
            some: {
              userId: dbUser.id,
              role: { in: ['OWNER', 'MANAGER'] }
            }
          }
        }
      });

      if (!venue) return NextResponse.json({ error: 'Not authorized to update this venue' }, { status: 403 });

      await prisma.venue.update({
        where: { id: venue.id },
        data: { bio, negotiationPrefs, media },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile Update Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
