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

    const { gigId, amount, message, toStatus } = await req.json();

    // 1. Create the offer record
    const offer = await prisma.offer.create({
      data: {
        gigId,
        amount,
        message,
        createdById: user.sub,
      },
    });

    // 2. Transition the gig state
    const updatedGig = await transitionGigState(
      gigId, 
      toStatus as GigStatus, 
      user.sub, 
      message || 'New offer proposed'
    );

    return NextResponse.json({ success: true, offer, updatedGig });
  } catch (error) {
    console.error('Offer Creation Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
