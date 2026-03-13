/* eslint-disable @typescript-eslint/no-explicit-any */
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
        await prisma.gig.update({ 
          where: { id: actualId }, 
          data: { status: 'REJECTED' } 
        });
      }
      // If it was just a match, we just ignore it (or we could track "ignored matches")
    } else {
      // VENUE CONFIRMED - Swipe Right
      if (isMatch) {
        // Create a NEW Gig from a Maximizer Match
        const band = await prisma.band.findUnique({ where: { id: actualId } });
        if (!band) throw new Error('Band not found');

        const newGig = await prisma.gig.create({
          data: {
            title: `New Booking Request: ${band.name}`,
            venueId: dbUser.venueProfile.id,
            bandId: band.id,
            date: new Date(), // Placeholder, venue would normally pick a date
            totalAmount: (band.negotiationPrefs as any)?.minRate || 500,
            status: 'ACCEPTED', // Venue immediately accepts the "match"
            engagementType: 'REQUEST'
          },
          include: { band: { include: { user: true } } }
        });

        console.log(`[SYNC] Created new gig from match: ${newGig.id}`);
        
        // Trigger AI Negotiator
        await runAINegotiator(newGig.id);

        // Trigger Email to Band
        const bandEmail = newGig.band?.user?.email;
        if (bandEmail) {
          console.log(`[MOCK EMAIL] Notifying band of match confirmation: ${bandEmail}`);
        }
      } else {
        // Update existing submission
        const engagement = await prisma.gig.update({ 
          where: { id: actualId }, 
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
