import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@auth0/nextjs-auth0';
import { RatingSchema } from '@/lib/validations/profile';
import { logger } from '@/lib/logger';

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
    const body = await req.json();
    const result = RatingSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input', details: result.error.format() }, { status: 400 });
    }

    const { stars } = result.data;

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
    logger.error({ err: error }, 'Rating Error:');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
