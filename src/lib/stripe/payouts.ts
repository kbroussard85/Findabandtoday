import { stripe } from './client';
import prisma from '@/lib/prisma';
import { GigStatus } from '@prisma/client';

/**
 * Triggers a transfer from the Platform account to a Connect account.
 */
export async function triggerGigPayout(gigId: string) {
  if (!stripe) throw new Error('Stripe not configured');

  const gig = await prisma.gig.findUnique({
    where: { id: gigId },
    include: {
      band: { include: { user: true } },
    },
  });

  if (!gig) throw new Error('Gig not found');
  if (gig.status !== GigStatus.COMPLETED) throw new Error('Gig is not marked as COMPLETED');
  if (gig.payoutStatus === 'PAID') throw new Error('Gig already paid');

  const destinationAccount = gig.band.user.stripeCustomerId;
  if (!destinationAccount) throw new Error('Band has no Connect account');

  // Calculate platform fee (e.g., 5%)
  const platformFee = gig.totalAmount * 0.05;
  const transferAmount = (gig.totalAmount - platformFee) * 100; // In cents

  try {
    const transfer = await stripe.transfers.create({
      amount: Math.round(transferAmount),
      currency: 'usd',
      destination: destinationAccount,
      description: `Payout for Gig: ${gig.title}`,
      metadata: { gigId },
    });

    // Update Gig record
    await prisma.gig.update({
      where: { id: gigId },
      data: { payoutStatus: 'PAID' },
    });

    return transfer;
  } catch (error) {
    console.error(`Transfer failed for gig ${gigId}:`, error);
    throw error;
  }
}
