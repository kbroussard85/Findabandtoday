import { serve } from "@upstash/workflow/nextjs";
import prisma from "@/lib/prisma";
import { triggerGigPayout } from "@/lib/stripe/payouts";
import { GigStatus } from "@prisma/client";
import { logger } from "@/lib/logger";

interface PayoutWorkflowInput {
  gigId: string;
}

export const { POST } = serve<PayoutWorkflowInput>(async (context) => {
  const { gigId } = context.requestPayload;

  // 1. Initial validation
  const gig = await context.run("fetch-gig", async () => {
    return await prisma.gig.findUnique({
      where: { id: gigId },
      select: { id: true, date: true, status: true }
    });
  });

  if (!gig) {
    logger.error(`[WORKFLOW-PAYOUT] Gig not found: ${gigId}`);
    return;
  }

  // 2. Wait until gig ends + 24 hours
  // Assuming a standard gig duration of 4 hours if not specified, 
  // plus the 24-hour dispute hold.
  const payoutTime = new Date(gig.date).getTime() + (4 * 60 * 60 * 1000) + (24 * 60 * 60 * 1000);
  const waitSeconds = Math.max(0, Math.floor((payoutTime - Date.now()) / 1000));

  if (waitSeconds > 0) {
    await context.sleep("wait-for-dispute-window", waitSeconds);
  }

  // 3. Final Pre-Payout Check (Dispute Check)
  const readyGig = await context.run("final-dispute-check", async () => {
    const g = await prisma.gig.findUnique({
      where: { id: gigId },
      select: { status: true, payoutStatus: true }
    });

    if (!g) return null;
    
    // Check if it's disputed
    if (g.status === GigStatus.DISPUTED) {
      logger.warn(`[WORKFLOW-PAYOUT] Payout halted for gig ${gigId}: Status is DISPUTED`);
      return null;
    }

    // Check if it's already been paid or cancelled
    if (g.status === GigStatus.COMPLETED || g.status === GigStatus.CANCELLED) {
      logger.info(`[WORKFLOW-PAYOUT] Payout unnecessary for gig ${gigId}: Status is ${g.status}`);
      return null;
    }

    return g;
  });

  if (!readyGig) return;

  // 4. Trigger Payout
  await context.run("trigger-payout", async () => {
    // Before calling triggerGigPayout, we must ensure status is PAYOUT_PENDING 
    // or PAID_ESCROW as required by triggerGigPayout logic.
    // We'll update it to PAYOUT_PENDING here to represent the transition.
    await prisma.gig.update({
      where: { id: gigId },
      data: { status: GigStatus.PAYOUT_PENDING }
    });

    try {
      await triggerGigPayout(gigId);
      logger.info(`[WORKFLOW-PAYOUT] Payout successful for gig: ${gigId}`);
    } catch (error) {
      logger.error({ err: error }, `[WORKFLOW-PAYOUT] Payout execution failed for gig: ${gigId}`);
      throw error; // Let Upstash handle retries
    }
  });
});
