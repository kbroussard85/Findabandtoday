// src/app/api/gigs/route.ts
import { getSession } from '@auth0/nextjs-auth0';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { GigCreateSchema } from '@/lib/validations/gig';
import { sanitize } from '@/lib/utils/sanitizer';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { auth0Id: session.user.sub },
      include: {
        bandProfile: true,
        venueProfile: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const profileId = dbUser.role === 'BAND' ? dbUser.bandProfile?.id : dbUser.venueProfile?.id;

    if (!profileId) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const gigs = await prisma.gig.findMany({
      where: {
        OR: [
          { bandId: profileId },
          { venueId: profileId },
        ],
      },
      include: {
        band: {
          select: { name: true, id: true }
        },
        venue: {
          select: { name: true, id: true }
        },
        agreement: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json({ data: gigs, role: dbUser.role });
  } catch (error) {
    logger.error({ err: error }, 'Fetch Gigs Error:');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { auth0Id: session.user.sub },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    // SUBSCRIPTION GATE: Only paid users (Venue Command or Artist Biz) can initiate official offers
    if (!dbUser.isPaid && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ 
        error: 'Subscription Required', 
        message: 'Upgrade to PRO to send official booking offers.' 
      }, { status: 403 });
    }

    const body = await req.json();
    logger.info({ body }, '[DEBUG] Gig Payload:');
    
    const result = GigCreateSchema.safeParse(body);

    if (!result.success) {
      logger.error({ err: result.error.format() }, '[DEBUG] Validation Failed:');
      return NextResponse.json({ error: 'Invalid input', details: result.error.format() }, { status: 400 });
    }

    const { title, description, date, venueId, bandId, totalAmount } = result.data;

    const sanitizedTitle = sanitize(title);
    const sanitizedDescription = description ? sanitize(description) : undefined;

    const gig = await prisma.gig.create({
      data: {
        title: sanitizedTitle,
        description: sanitizedDescription,
        date: new Date(date),
        venueId,
        bandId: bandId || '',
        totalAmount,
        status: 'OFFER_SENT', // Default to offer sent status
      },
    });

    return NextResponse.json({ success: true, data: gig });
  } catch (error) {
    logger.error({ err: error }, 'Create Gig Error:');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
