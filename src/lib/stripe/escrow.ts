import { stripe } from './client';
import prisma from '../prisma';

/**
 * STEP 1: INITIALIZE ESCROW (THE HOLD)
 * Triggered when a Band/Venue clicks "Submit Offer"
 */
export async function initializeBookingHold(gigId: string, amount: number) {
  if (!stripe) throw new Error('Stripe not configured');

  const gig = await prisma.gig.findUnique({
    where: { id: gigId },
    include: {
      venue: {
        include: {
          user: true
        }
      }
    }
  });

  if (!gig || !gig.venue.user.stripeCustomerId) {
    throw new Error("Venue or stripe customer ID not found.");
  }

  // Calculate Fee: $50 Flat or 5% of Guarantee (whichever the logic dictates)
  const feeAmount = amount >= 1000 ? amount * 0.05 : 50;

  const paymentIntent = await stripe.paymentIntents.create(
    {
      amount: Math.round(feeAmount * 100), // Stripe uses cents
      currency: 'usd',
      customer: gig.venue.user.stripeCustomerId,
      capture_method: 'manual', // THIS IS THE ESCROW HOLD
      metadata: { gigId: gigId, type: 'BOOKING_DEPOSIT' },
    },
    { idempotencyKey: `hold-${gigId}` }
  );

  // Store the Intent ID in our DB to capture it later
  await prisma.gig.update({
    where: { id: gigId },
    data: {
      stripePaymentIntentId: paymentIntent.id,
      status: 'ESCROW_HOLD'
    }
  });

  return paymentIntent.client_secret;
}

/**
 * STEP 2: CAPTURE ESCROW (THE DEAL IS DONE)
 * Triggered when the Venue clicks "Accept"
 */
export async function captureBookingFee(gigId: string) {
  if (!stripe) throw new Error('Stripe not configured');

  const gig = await prisma.gig.findUnique({ where: { id: gigId } });

  if (!gig?.stripePaymentIntentId) throw new Error("No payment intent found.");

  const intent = await stripe.paymentIntents.capture(
    gig.stripePaymentIntentId,
    {},
    { idempotencyKey: `capture-${gigId}` }
  );

  await prisma.gig.update({
    where: { id: gigId },
    data: {
      status: 'CONFIRMED',
      depositPaid: true
    }
  });

  return intent;
}

/**
 * STEP 3: RELEASE HOLD (THE DEAL FAILED)
 * Triggered if the offer is declined or expires
 */
export async function releaseBookingHold(gigId: string) {
  if (!stripe) throw new Error('Stripe not configured');

  const gig = await prisma.gig.findUnique({ where: { id: gigId } });

  if (gig?.stripePaymentIntentId) {
    await stripe.paymentIntents.cancel(gig.stripePaymentIntentId);
    await prisma.gig.update({
      where: { id: gigId },
      data: { status: 'CANCELLED' }
    });
  }
}
