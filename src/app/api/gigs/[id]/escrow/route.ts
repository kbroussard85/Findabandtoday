import { getSession } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';
import { initializeBookingHold, captureBookingEscrow, releaseBookingHold } from '@/lib/stripe/escrow';
import prisma from '@/lib/prisma';

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
      console.warn(`Unauthorized escrow attempt: User ${session.user.sub} tried to ${action} on Gig ${gigId}`);
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    console.info(`Escrow Action: ${action} | Gig: ${gigId} | User: ${session.user.sub}`);

    switch (action) {
      case 'HOLD':
        if (!amount) return NextResponse.json({ error: 'Amount required' }, { status: 400 });
        const result = await initializeBookingHold(gigId, amount, method || 'PLATFORM');
        return NextResponse.json(result);
      
      case 'CAPTURE':
        const intent = await captureBookingEscrow(gigId);
        return NextResponse.json({ success: true, intentId: intent.id });

      case 'RELEASE':
        await releaseBookingHold(gigId);
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Escrow Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
