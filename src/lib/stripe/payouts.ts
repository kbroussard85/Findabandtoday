import { stripe } from './client';
import prisma from '@/lib/prisma';
import { GigStatus, PayoutStatus } from '@prisma/client';

/**
 * Handles the payout and commission logic based on the Payment Method.
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
  if (gig.status !== GigStatus.COMPLETED) throw new Error('Gig is not marked as COMPLETED');
  if (gig.payoutStatus === PayoutStatus.RELEASED_TO_BAND) throw new Error('Gig already paid');

  const destinationAccount = gig.band.user.stripeAccountId;
  if (!destinationAccount) throw new Error('Band has no Connect account');

  const bandCustomerId = gig.band.user.stripeCustomerId;
  const guarantee = gig.totalGuarantee || gig.totalAmount;
  const platformFee = guarantee * 0.05;

  try {
    if (gig.paymentMethod === 'IN_PERSON') {
      // Option A: Venue paid in person. We bill the Band's card for the 5% commission.
      if (!bandCustomerId) throw new Error('Band has no customer ID on file for off-session charge');
      
      await stripe.paymentIntents.create({
        amount: Math.round(platformFee * 100),
        currency: 'usd',
        customer: bandCustomerId,
        description: `FABT 5% Commission for In-Person Gig: ${gig.title}`,
        confirm: true,
        off_session: true,
        metadata: { gigId },
      });
      
    } else {
      // Option B: Platform Pay (Escrow). Deduct 5% + $5 fee and transfer the rest.
      const totalFee = platformFee + 5.00; 
      const transferAmount = (guarantee - totalFee) * 100; // In cents

      await stripe.transfers.create(
        {
          amount: Math.round(transferAmount),
          currency: 'usd',
          destination: destinationAccount,
          description: `Payout for Gig: ${gig.title}`,
          metadata: { gigId },
        },
        { idempotencyKey: `payout-${gigId}` }
      );
    }

    // Update Gig record
    await prisma.gig.update({
      where: { id: gigId },
      data: { payoutStatus: PayoutStatus.RELEASED_TO_BAND },
    });

    return { success: true, method: gig.paymentMethod };
  } catch (error) {
    console.error(`Payout failed for gig ${gigId}:`, error);
    throw error;
  }
}
