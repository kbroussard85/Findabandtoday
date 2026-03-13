import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Ensure it runs dynamically on cron trigger

export async function GET(req: Request) {
  try {
    // Basic security check - In Vercel, cron jobs are invoked with a specific header
    // process.env.CRON_SECRET should be set in your Vercel project settings
    const authHeader = req.headers.get('Authorization');
    const cronSecret = process.env.CRON_SECRET?.trim();
    if (authHeader !== `Bearer ${cronSecret}` && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update all pending gigs where expiresAt has passed
    const result = await prisma.gig.updateMany({
      where: {
        status: { in: ['DRAFT', 'SUBMISSION', 'REQUEST', 'PENDING_APPROVAL', 'OFFER_SENT', 'COUNTER_OFFER'] },
        expiresAt: {
          lt: new Date()
        },
        isActive: true
      },
      data: {
        status: 'CANCELLED',
        isActive: false
      }
    });

    console.log(`[CRON] Expired ${result.count} pending gigs.`);

    return NextResponse.json({ success: true, expiredCount: result.count });
  } catch (error) {
    console.error('[CRON ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
