import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { GigStatus } from '@prisma/client';
import { triggerGigPayout } from '@/lib/stripe/payouts';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  // Simple protection: check for a cron secret header
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Find all completed gigs that haven't been paid
    const pendingGigs = await prisma.gig.findMany({
      where: {
        status: GigStatus.COMPLETED,
        payoutStatus: 'PENDING',
        // And optionally check if it's been 24 hours since the show date
        date: {
          lte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      },
    });

    const results = [];

    // 2. Process payouts
    for (const gig of pendingGigs) {
      try {
        await triggerGigPayout(gig.id);
        results.push({ id: gig.id, status: 'SUCCESS' });
      } catch (err: any) {
        results.push({ id: gig.id, status: 'FAILED', error: err.message });
      }
    }

    return NextResponse.json({ processed: pendingGigs.length, results });
  } catch (error) {
    console.error('Cron Payout Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
