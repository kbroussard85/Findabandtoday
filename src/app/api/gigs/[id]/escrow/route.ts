import { getSession } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';
import { initializeBookingHold, captureBookingEscrow, releaseBookingHold } from '@/lib/stripe/escrow';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { action, amount, method } = await req.json();
    const { id: gigId } = await params;

    // Ownership Verification (IDOR Fix)
    const gig = await prisma.gig.findUnique({
      where: { id: gigId },
      include: { 
        band: { include: { user: true } }, 
        venue: { include: { user: true } } 
      }
    });

    if (!gig) {
      return NextResponse.json({ error: 'Gig not found' }, { status: 404 });
    }

    const isBandOwner = gig.band.user.auth0Id === session.user.sub;
    const isVenueOwner = gig.venue.user.auth0Id === session.user.sub;

    if (!isBandOwner && !isVenueOwner) {
      logger.warn(`Unauthorized escrow attempt: User ${session.user.sub} tried to ${action} on Gig ${gigId}`);
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    logger.info(`Escrow Action: ${action} | Gig: ${gigId} | User: ${session.user.sub}`);

    switch (action) {
      case 'HOLD':
        if (!isVenueOwner) return NextResponse.json({ error: 'Only venues can initialize a hold' }, { status: 403 });
        if (!amount) return NextResponse.json({ error: 'Amount required' }, { status: 400 });
        const holdResult = await initializeBookingHold(gigId, amount, method || 'PLATFORM');
        return NextResponse.json(holdResult);
      
      case 'CAPTURE':
        if (!isVenueOwner) return NextResponse.json({ error: 'Only venues can capture escrow' }, { status: 403 });
        const captureIntent = await captureBookingEscrow(gigId);
        return NextResponse.json({ success: true, intentId: captureIntent.id });

      case 'RELEASE':
        // Recommendation: RELEASE for Band (releasing funds back to venue)
        if (!isBandOwner) return NextResponse.json({ error: 'Only the artist can release/reject a hold' }, { status: 403 });
        await releaseBookingHold(gigId);
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    logger.error({ err: error }, 'Escrow Error:');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
