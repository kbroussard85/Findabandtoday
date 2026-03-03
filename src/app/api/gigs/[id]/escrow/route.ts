import { getSession } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';
import { initializeBookingHold, captureBookingFee, releaseBookingHold } from '@/lib/stripe/escrow';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { action, amount } = await req.json();
    const { id: gigId } = await params;

    switch (action) {
      case 'HOLD':
        if (!amount) return NextResponse.json({ error: 'Amount required' }, { status: 400 });
        const clientSecret = await initializeBookingHold(gigId, amount);
        return NextResponse.json({ clientSecret });
      
      case 'CAPTURE':
        const intent = await captureBookingFee(gigId);
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
