import prisma from "@/lib/prisma";
import { negotiationGraph, NegotiationState } from "./graph";
import { transitionGigState } from "@/lib/negotiation/state-machine";
import { GigStatus } from "@prisma/client";

interface NegotiationPrefs {
  minRate?: number;
  maxBudget?: number;
}

/**
 * Executes an AI-driven negotiation session for a specific gig.
 */
export async function runNegotiationSession(gigId: string, initiatingActorId: string) {
  // 1. Fetch Gig and Profiles
  const gig = await prisma.gig.findUnique({
    where: { id: gigId },
    include: {
      band: true,
      venue: true,
    }
  });

  if (!gig) throw new Error("Gig not found");

  // 2. Extract Preferences
  const bandPrefs = (gig.band.negotiationPrefs as unknown as NegotiationPrefs) || {};
  const venuePrefs = (gig.venue.negotiationPrefs as unknown as NegotiationPrefs) || {};

  const bandMinRate = bandPrefs.minRate || 200;
  const venueMaxBudget = venuePrefs.maxBudget || 1000;

  // 3. Initialize Graph State
  const initialState: NegotiationState = {
    gigId: gig.id,
    currentAmount: gig.totalAmount,
    status: 'OFFER_SENT',
    history: [],
    bandMinRate,
    venueMaxBudget,
    lastActor: 'VENUE', // Assume venue initiated for this example
    turnCount: 0,
  };

  // 4. Run Graph
  const finalState = await (negotiationGraph.invoke(initialState) as unknown) as NegotiationState;

  // 5. Update Database based on results
  if (finalState.status === 'ACCEPTED') {
    await transitionGigState(
      gigId, 
      GigStatus.ACCEPTED, 
      initiatingActorId, 
      "AI Negotiation: Agreement reached."
    );
    await prisma.gig.update({
      where: { id: gigId },
      data: { totalAmount: finalState.currentAmount }
    });
  } else if (finalState.status === 'REJECTED') {
    await transitionGigState(
      gigId, 
      GigStatus.REJECTED, 
      initiatingActorId, 
      "AI Negotiation: Could not reach agreement within bounds."
    );
  } else if (finalState.status === 'COUNTER_OFFER') {
    // Save the counter-offer
    await transitionGigState(
        gigId, 
        GigStatus.COUNTER_OFFER, 
        initiatingActorId, 
        `AI Counter-Offer: ${finalState.currentAmount}`
      );
      await prisma.gig.update({
        where: { id: gigId },
        data: { totalAmount: finalState.currentAmount }
      });
  }

  return finalState;
}
