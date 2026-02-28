import { getSession } from '@auth0/nextjs-auth0';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { transitionGigState } from '@/lib/negotiation/state-machine';
import { GigStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const user = session?.user;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, venueId, bandId, date, amount, initialStatus } = await req.json();

    const gig = await prisma.gig.create({
      data: {
        title,
        description,
        venueId,
        bandId,
        date: new Date(date),
        totalAmount: amount,
        status: GigStatus.DRAFT, // Always start as draft
      },
    });

    // If initialStatus is OFFER_SENT, transition immediately
    if (initialStatus === GigStatus.OFFER_SENT) {
      await transitionGigState(gig.id, GigStatus.OFFER_SENT, user.sub, 'Initial offer sent');
    }

    return NextResponse.json({ success: true, gig });
  } catch (error) {
    console.error('Gig Creation Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getSession();
    const user = session?.user;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { auth0Id: user.sub },
    });

    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const gigs = await prisma.gig.findMany({
      where: {
        OR: [
          { band: { userId: dbUser.id } },
          { venue: { userId: dbUser.id } },
        ],
      },
      include: {
        band: true,
        venue: true,
        offers: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
      },
      orderBy: { date: 'asc' },
    });

    return NextResponse.json({ data: gigs });
  } catch (error) {
    console.error('Gig Fetch Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
