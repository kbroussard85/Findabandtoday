import { stripe } from './client';
import prisma from '@/lib/prisma';
import { GigStatus, PayoutStatus, PaymentMethod } from '@prisma/client';
import { logger } from '@/lib/logger';

/**
 * FABT REVENUE MODEL CONSTANTS
 */
const PLATFORM_FEE_PERCENT = 0.05; // 5%
const PLATFORM_FEE_FLAT = 5.00;    // $5 flat fee for platform pay

/**
 * Handles the payout and commission logic based on the Payment Method.
 * This is the single source of truth for post-show financial processing.
 */
export async function triggerGigPayout(gigId: string) {
  if (!stripe) throw new Error('Stripe not configured');

  const gig = await prisma.gig.findUnique({
    where: { id: gigId },
    include: {
      band: { include: { user: true } },
      venue: { include: { user: true } },
    },
  });

  if (!gig) throw new Error('Gig not found');
  if (gig.status !== GigStatus.COMPLETED) {
    logger.warn(`[STRIPE-PAYOUT] Attempted payout for non-completed gig: ${gigId} (Status: ${gig.status})`);
    throw new Error('Gig is not marked as COMPLETED');
  }
  if (gig.payoutStatus === PayoutStatus.RELEASED_TO_BAND) {
    logger.info(`[STRIPE-PAYOUT] Gig ${gigId} already paid out.`);
    return { success: true, alreadyPaid: true };
  }

  const amount = Number(gig.totalAmount);
  // Calculate platform fee in cents to avoid rounding errors
  const platformFeeCents = Math.round(
    (amount * PLATFORM_FEE_PERCENT + (gig.paymentMethod === PaymentMethod.PLATFORM ? PLATFORM_FEE_FLAT : 0)) * 100
  );

  try {
    if (gig.paymentMethod === PaymentMethod.IN_PERSON) {
      // OPTION A: Venue paid in person. We bill the Band's card for the 5% commission.
      const bandCustomerId = gig.band.user.stripeCustomerId;
      if (!bandCustomerId) throw new Error('Band has no stripe customer ID for commission billing');
      
      logger.info(`[STRIPE-PAYOUT] Billing commission for In-Person gig ${gigId}: ${platformFeeCents} cents`);

      await stripe.paymentIntents.create({
        amount: platformFeeCents,
        currency: 'usd',
        customer: bandCustomerId,
        description: `FABT 5% Commission for In-Person Gig: ${gig.title}`,
        confirm: true,
        off_session: true,
        metadata: { gigId, type: 'COMMISSION' },
      });
      
    } else {
      // OPTION B: Platform Pay (Escrow). Deduct 5% + $5 fee and transfer the rest to the band.
      const destinationAccount = gig.band.user.stripeAccountId;
      if (!destinationAccount) throw new Error('Band has no Connect account for platform payout');

      const transferAmountCents = Math.round(amount * 100) - platformFeeCents;
      
      logger.info(`[STRIPE-PAYOUT] Transferring funds for Platform gig ${gigId}: ${transferAmountCents} cents to ${destinationAccount}`);

      await stripe.transfers.create(
        {
          amount: transferAmountCents,
          currency: 'usd',
          destination: destinationAccount,
          description: `Payout for Gig: ${gig.title}`,
          transfer_group: `gig-${gigId}`,
          metadata: { gigId },
        },
        { idempotencyKey: `payout-${gigId}` }
      );
    }

    // Update Gig record with final financial data
    await prisma.gig.update({
      where: { id: gigId },
      data: { 
        payoutStatus: PayoutStatus.RELEASED_TO_BAND,
        platformFee: platformFeeCents / 100
      },
    });

    logger.info(`[STRIPE-PAYOUT] Successfully processed financials for gig: ${gigId}`);
    return { success: true, method: gig.paymentMethod };
  } catch (error) {
    logger.error({ err: error }, `[STRIPE-PAYOUT-ERROR] Payout failed for gig ${gigId}:`);
    throw error;
  }
}
