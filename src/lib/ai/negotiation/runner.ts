import prisma from "@/lib/prisma";
import { negotiationGraph, NegotiationState } from "./graph";
import { transitionGigState } from "@/lib/negotiation/state-machine";
import { GigStatus } from "@prisma/client";
import { runAINegotiator } from "@/app/actions/negotiator";
import { logger } from "@/lib/logger";

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

  // 1.5 Fetch Venue Agreement for AI Context
  const venueAgreement = await prisma.vaultAsset.findFirst({
    where: { ownerId: gig.venue.userId, assetType: 'agreement_template' },
    orderBy: { createdAt: 'desc' }
  });

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
    lastActor: 'VENUE', 
    turnCount: 0,
    venueAgreement: venueAgreement?.rawText || null,
  };

  // 4. Run Graph
  logger.info(`[AI-NEGOTIATION] Starting session for Gig: ${gigId}`);
  const finalState = await (negotiationGraph.invoke(initialState) as unknown) as NegotiationState;

  // 5. Update Database based on results
  if (finalState.status === 'ACCEPTED') {
    logger.info(`[AI-NEGOTIATION] Agreement reached: $${finalState.currentAmount}`);
    
    await prisma.gig.update({
      where: { id: gigId },
      data: { totalAmount: finalState.currentAmount }
    });

    await transitionGigState(
      gigId, 
      GigStatus.ACCEPTED, 
      initiatingActorId, 
      `AI Negotiation: Agreement reached at $${finalState.currentAmount}.`
    );

    // AUTO-TRIGGER: Document Pack & Confirmation
    // This generates the PDF and sets status to CONFIRMED/PAID_ESCROW
    await runAINegotiator(gigId);

  } else if (finalState.status === 'REJECTED') {
    logger.warn(`[AI-NEGOTIATION] Rejected for Gig: ${gigId}`);
    await transitionGigState(
      gigId, 
      GigStatus.REJECTED, 
      initiatingActorId, 
      "AI Negotiation: Could not reach agreement within bounds."
    );
  } else if (finalState.status === 'COUNTER_OFFER') {
    logger.info(`[AI-NEGOTIATION] Counter-offer proposed: $${finalState.currentAmount}`);
    await prisma.gig.update({
      where: { id: gigId },
      data: { totalAmount: finalState.currentAmount }
    });

    await transitionGigState(
        gigId, 
        GigStatus.COUNTER_OFFER, 
        initiatingActorId, 
        `AI Counter-Offer: $${finalState.currentAmount}`
      );
  }

  return finalState;
}
