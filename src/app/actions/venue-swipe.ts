'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getSession } from '@auth0/nextjs-auth0';
import { runAINegotiator } from './negotiator';

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

    console.log(`Swiped ${direction} on ${isMatch ? 'Match' : 'Engagement'}: ${actualId}`);

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
        const engagement = await prisma.gig.update({ 
          where: { 
            id: actualId,
            venueId: dbUser.venueProfile.id
          }, 
          data: { status: 'ACCEPTED' },
          include: { band: { include: { user: true } } }
        });

        // Trigger AI Negotiator
        await runAINegotiator(actualId);

        // Trigger Email to Band
        const bandEmail = engagement.band?.user?.email;
        if (bandEmail) {
          console.log(`[MOCK EMAIL] Sending confirmation to band: ${bandEmail}`);
        }
      }
    }

    revalidatePath('/dashboard/venue');
    return { success: true };
  } catch (error) {
    console.error('Error handling swipe:', error);
    throw new Error('Failed to update swipe action');
  }
}
