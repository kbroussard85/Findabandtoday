import { getSession } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { draftLiaisonOffer } from '@/lib/ai/agents/liaison';
import { GigStatus } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { recipientId, suggestedAmount, date, customMessage } = await req.json();

    if (!recipientId || !suggestedAmount || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Get sender's profile and role
    const sender = await prisma.user.findUnique({
      where: { auth0Id: session.user.sub },
      include: { bandProfile: true, venueProfile: true }
    });

    if (!sender) return NextResponse.json({ error: 'Sender profile not found' }, { status: 404 });

    const isBandSender = sender.role === 'BAND';
    const senderProfile = isBandSender ? sender.bandProfile : sender.venueProfile;

    if (!senderProfile) return NextResponse.json({ error: 'Sender profile details missing' }, { status: 400 });

    // 2. Get recipient's profile
    // We need to know if the recipient is a Band or a Venue.
    // Usually, a Band swipes on a Venue, or a Venue swipes on a Band.
    let recipientProfile;
    let bandId, venueId;

    if (isBandSender) {
      // Band is sender, recipient is Venue
      recipientProfile = await prisma.venue.findUnique({ where: { id: recipientId } });
      bandId = senderProfile.id;
      venueId = recipientId;
    } else {
      // Venue is sender, recipient is Band
      recipientProfile = await prisma.band.findUnique({ where: { id: recipientId } });
      venueId = senderProfile.id;
      bandId = recipientId;
    }

    if (!recipientProfile) return NextResponse.json({ error: 'Recipient profile not found' }, { status: 404 });

    // 3. Draft AI Liaison Offer
    const aiMessage = await draftLiaisonOffer({
      senderType: sender.role,
      senderProfile: {
        name: senderProfile.name,
        bio: senderProfile.bio,
        negotiationPrefs: senderProfile.negotiationPrefs as Record<string, unknown> | null
      },
      recipientProfile: {
        name: recipientProfile.name,
        bio: recipientProfile.bio
      },
      gigDetails: {
        date: new Date(date),
        suggestedAmount,
        message: customMessage
      }
    });

    // 4. Create Gig in DRAFT status
    const gig = await prisma.gig.create({
      data: {
        title: `Offer: ${senderProfile.name} x ${recipientProfile.name}`,
        description: aiMessage as string,
        bandId,
        venueId,
        status: GigStatus.DRAFT,
        date: new Date(date),
        totalAmount: suggestedAmount,
        history: {
          create: {
            fromStatus: GigStatus.DRAFT,
            toStatus: GigStatus.DRAFT,
            changedById: session.user.sub,
            changeReason: 'AI Liaison drafted initial offer.'
          }
        }
      }
    });

    return NextResponse.json({ success: true, gigId: gig.id, message: aiMessage });

  } catch (error) {
    console.error('AI Outreach Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
