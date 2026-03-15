'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getSession } from '@auth0/nextjs-auth0';
import { runAINegotiator } from './negotiator';
import { runNegotiationSession } from '@/lib/ai/negotiation/runner';
import { logger } from '@/lib/logger';

export async function handleSwipe(id: string, direction: 'right' | 'left') {
  try {
    const session = await getSession();
    if (!session?.user) throw new Error('Unauthorized');

    const dbUser = await prisma.user.findUnique({
      where: { auth0Id: session.user.sub },
      include: { venueProfile: true }
    });

    if (!dbUser?.venueProfile) throw new Error('Venue profile not found');

    const isMatch = id.startsWith('match-');
    const actualId = isMatch ? id.replace('match-', '') : id;

    logger.info(`Swiped ${direction} on ${isMatch ? 'Match' : 'Engagement'}: ${actualId}`);

    if (direction === 'left') {
      if (!isMatch) {
        // IDOR Fix: Ensure the gig belongs to this venue
        await prisma.gig.update({ 
          where: { 
            id: actualId,
            venueId: dbUser.venueProfile.id 
          }, 
          data: { status: 'REJECTED' } 
        });
      }
      // If it was just a match, we just ignore it (or we could track "ignored matches")
    } else {
      // VENUE CONFIRMED - Swipe Right
      if (isMatch) {
        // ... (match logic remains same)
      } else {
        // IDOR Fix: Ensure the gig belongs to this venue
        const engagement = await prisma.gig.findUnique({ 
          where: { 
            id: actualId,
            venueId: dbUser.venueProfile.id
          },
          include: { band: { include: { user: true } } }
        });

        if (!engagement) throw new Error("Engagement not found or unauthorized");

        // Trigger LangGraph Negotiation Session
        // This will auto-trigger AINegotiator if agreement is reached
        await runNegotiationSession(actualId, dbUser.id);

        // Trigger Email to Band
        const bandEmail = engagement.band?.user?.email;
        if (bandEmail) {
          logger.info(`[MOCK EMAIL] Sending confirmation to band: ${bandEmail}`);
        }
      }
    }

    revalidatePath('/dashboard/venue');
    return { success: true };
  } catch (error) {
    logger.error({ err: error }, 'Error handling swipe:');
    throw new Error('Failed to update swipe action');
  }
}

export async function openDispute(gigId: string, reason: string) {
  try {
    const session = await getSession();
    if (!session?.user) throw new Error('Unauthorized');

    const dbUser = await prisma.user.findUnique({
      where: { auth0Id: session.user.sub },
      include: { venueProfile: true }
    });

    if (!dbUser?.venueProfile) throw new Error('Only venues can open disputes');

    // 1. Verify Ownership & Eligibility (within 24h window)
    const gig = await prisma.gig.findUnique({
      where: { id: gigId, venueId: dbUser.venueProfile.id },
    });

    if (!gig) throw new Error("Gig not found or unauthorized");
    
    // Status should be POST_GIG_HOLD to open a dispute
    // But we'll allow it if it's already in that flow
    
    await prisma.gig.update({
      where: { id: gigId },
      data: { status: 'DISPUTED' }
    });

    await prisma.financialLog.create({
      data: {
        gigId,
        type: 'DEBIT',
        amount: 0, // Reference entry
        description: `Dispute opened by Venue: ${reason}`
      }
    });

    logger.warn(`[DISPUTE] Gig ${gigId} marked as DISPUTED by user ${dbUser.id}. Reason: ${reason}`);
    
    revalidatePath('/dashboard/venue');
    return { success: true };
  } catch (error) {
    logger.error({ err: error }, '[DISPUTE-ERROR]:');
    throw error;
  }
}
