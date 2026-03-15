import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query') || '';

    // Fetch future booked/confirmed gigs
    const gigs = await prisma.gig.findMany({
      where: {
        status: { in: ['BOOKED', 'CONFIRMED', 'ACCEPTED'] },
        date: { gte: new Date() },
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { band: { name: { contains: query, mode: 'insensitive' } } },
          { venue: { name: { contains: query, mode: 'insensitive' } } },
        ],
      },
      include: {
        band: {
          select: {
            id: true,
            name: true,
            media: true,
            socialLinks: true,
          }
        },
        venue: {
          select: {
            id: true,
            name: true,
            city: true,
            media: true,
          }
        }
      },
      orderBy: { date: 'asc' },
      take: 20,
    });

    // If lat/lng provided, we could sort by distance here if needed,
    // but for now, we'll return the chronological list.

    return NextResponse.json({ data: gigs });
  } catch (error) {
    logger.error({ err: error }, '[PUBLIC_EVENTS_ERROR]:');
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}
