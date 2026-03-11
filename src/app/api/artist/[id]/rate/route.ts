import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@auth0/nextjs-auth0';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: bandId } = await params;
    const { stars } = await req.json();

    if (typeof stars !== 'number' || stars < 1 || stars > 5) {
      return NextResponse.json({ error: 'Invalid rating' }, { status: 400 });
    }

    // Check if user is a VENUE
    const dbUser = await prisma.user.findUnique({
      where: { auth0Id: session.user.sub },
      include: { venueProfile: true }
    });

    if (!dbUser || dbUser.role !== 'VENUE' || !dbUser.venueProfile) {
      return NextResponse.json({ error: 'Only venues can rate artists' }, { status: 403 });
    }

    const rating = await prisma.rating.upsert({
      where: {
        bandId_venueId: {
          bandId,
          venueId: dbUser.venueProfile.id
        }
      },
      update: { stars },
      create: {
        bandId,
        venueId: dbUser.venueProfile.id,
        stars
      }
    });

    return NextResponse.json({ success: true, rating });
  } catch (error) {
    console.error('Rating Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
